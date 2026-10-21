# =============================================================================
# Server web untuk UI HTML (index.html) -- memakai logika inti dari app.py
# Jalankan:  python server.py   lalu buka  http://127.0.0.1:8000
# Letakkan app.py, server.py, dan index.html di folder yang sama.
# Dependensi tambahan: tidak ada (fastapi/uvicorn/python-multipart sudah ikut
# terpasang bersama gradio). Jika belum: pip install fastapi uvicorn python-multipart
# =============================================================================
import base64
import io
import os
import threading

import torch
import uvicorn
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image, ImageOps

import app as core  # app.py: model, cache upsampler, unduh bobot, upscale_image()

HERE = os.path.dirname(os.path.abspath(__file__))
api = FastAPI(title="Real-ESRGAN Web API")
# CORS longgar karena server hanya di localhost; memungkinkan index.html dibuka langsung dari file.
api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Satu inference pada satu waktu agar VRAM tidak berebut dan cache upsampler aman.
_lock = threading.Lock()


@api.get("/")
def index():
    return FileResponse(os.path.join(HERE, "index.html"))


@api.get("/api/models")
def models():
    return {
        "default": core.DEFAULT_MODEL,
        "general_key": core.GENERAL_KEY,  # model yang memakai denoise_strength
        "face_key": core.FACE_KEY,        # model yang mendukung face_enhance
        "cuda": torch.cuda.is_available(),
        "models": [{"key": k, "label": c["label"], "scale": c["scale"]} for k, c in core.MODELS.items()],
    }


# Endpoint sinkron (def, bukan async def): FastAPI menjalankannya di threadpool,
# jadi inference yang lama tidak memblokir server.
@api.post("/api/upscale")
def upscale(
    file: UploadFile = File(...),
    model: str = Form(...),
    outscale: float = Form(4.0),
    tile: int = Form(400),
    tile_pad: int = Form(10),
    fp32: bool = Form(False),
    denoise: float = Form(0.5),
    face: bool = Form(False),
):
    try:
        img = Image.open(file.file)
        img.load()
        img = ImageOps.exif_transpose(img)  # hormati rotasi EXIF dari kamera/ponsel
    except Exception:
        return JSONResponse({"ok": False, "status": "❌ File bukan gambar yang valid."}, status_code=400)

    with _lock:
        out, status = core.upscale_image(
            img, model, outscale, tile, tile_pad, fp32, denoise, face,
            progress=lambda *a, **k: None,  # callback progress Gradio tidak dipakai di sini
        )
    if out is None:
        return {"ok": False, "status": status}

    buf = io.BytesIO()
    out.save(buf, format="PNG")
    data = base64.b64encode(buf.getvalue()).decode()
    return {"ok": True, "status": status, "image": "data:image/png;base64," + data}


if __name__ == "__main__":
    print("[Info] Buka http://127.0.0.1:8000 di browser")
    uvicorn.run(api, host="127.0.0.1", port=8000)
