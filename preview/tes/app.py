# =============================================================================
# Real-ESRGAN Image Upscaler (Gradio)  --  jalankan dengan:  python app.py
# =============================================================================
# INSTALASI DEPENDENSI
#   1) Install PyTorch sesuai GPU/CUDA Anda (lihat https://pytorch.org/get-started/locally/)
#   2) pip install gradio opencv-python pillow numpy
#   3) pip install basicsr facexlib gfpgan realesrgan
#      (Jika build basicsr gagal: pip install -U setuptools wheel, lalu
#       pip install basicsr --no-build-isolation)
#
# CATATAN BOBOT
#   - Bobot (.pth) diunduh OTOMATIS ke folder `weights/` saat pertama kali
#     sebuah model dipakai. Butuh koneksi internet pada saat itu.
#   - Model realesr-general-x4v3 juga memakai realesr-general-wdn-x4v3.pth
#     (untuk mengatur denoise_strength), yang diunduh otomatis bila perlu.
#   - face_enhance memakai GFPGANv1.3.pth (diunduh ke `weights/`). Library
#     facexlib akan mengunduh model deteksi wajahnya sendiri (ke folder
#     `gfpgan/weights/` di direktori kerja) pada pemakaian pertama.
#
# KEBUTUHAN VRAM (perkiraan kasar, fp16)
#   - tile=0 pada gambar ~1MP : sekitar 4-6 GB VRAM untuk model RRDB (23 blok).
#   - tile=400 : sekitar 2-3 GB. tile=128/256 : lebih hemat lagi (lebih lambat).
#   - Jika muncul "CUDA out of memory": turunkan tile (mis. 256 atau 128),
#     matikan fp32, kecilkan outscale, atau perkecil gambar input.
#   - Tanpa GPU (CPU) tetap jalan, tetapi lambat; presisi otomatis fp32.
# =============================================================================

import gc
import os
import sys
import time
import types
import urllib.request
from collections import OrderedDict

# --- Shim kompatibilitas ----------------------------------------------------
# basicsr lama mengimpor `torchvision.transforms.functional_tensor` yang sudah
# dihapus di torchvision >= 0.17. Kita buat modul pengganti agar import tidak gagal.
try:
    import torchvision.transforms.functional_tensor  # noqa: F401
except ImportError:
    from torchvision.transforms import functional as _F
    _m = types.ModuleType("torchvision.transforms.functional_tensor")
    _m.rgb_to_grayscale = _F.rgb_to_grayscale
    sys.modules["torchvision.transforms.functional_tensor"] = _m

import cv2
import gradio as gr
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

# =============================================================================
# Konfigurasi dasar
# =============================================================================
WEIGHTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights")
os.makedirs(WEIGHTS_DIR, exist_ok=True)

# Batas piksel output agar tidak membuat RAM/VRAM meledak (~150 megapiksel).
MAX_OUTPUT_PIXELS = 150_000_000

GFPGAN_FILE = "GFPGANv1.3.pth"
GFPGAN_URL = "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth"

GENERAL_KEY = "realesr-general-x4v3"
GENERAL_WDN_FILE = "realesr-general-wdn-x4v3.pth"
GENERAL_WDN_URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-wdn-x4v3.pth"
FACE_KEY = "RealESRGAN_x4plus"

# URL rilis resmi Real-ESRGAN (tag rilis berbeda untuk tiap model).
MODELS = {
    "RealESRGAN_x4plus": dict(
        label="RealESRGAN_x4plus (foto umum)",
        arch="rrdb", num_block=23, scale=4,
        file="RealESRGAN_x4plus.pth",
        url="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
    ),
    "realesr-general-x4v3": dict(
        label="realesr-general-x4v3 (cepat, anti-noise)",
        arch="srvgg", scale=4,
        file="realesr-general-x4v3.pth",
        url="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth",
    ),
    "RealESRNet_x4plus": dict(
        label="RealESRNet_x4plus (halus, tanpa GAN)",
        arch="rrdb", num_block=23, scale=4,
        file="RealESRNet_x4plus.pth",
        url="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth",
    ),
    "RealESRGAN_x2plus": dict(
        label="RealESRGAN_x2plus (pembesaran 2x)",
        arch="rrdb", num_block=23, scale=2,
        file="RealESRGAN_x2plus.pth",
        url="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
    ),
    "RealESRGAN_x4plus_anime_6B": dict(
        label="RealESRGAN_x4plus_anime_6B (anime)",
        arch="rrdb", num_block=6, scale=4,
        file="RealESRGAN_x4plus_anime_6B.pth",
        url="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
    ),
}
DEFAULT_MODEL = "RealESRGAN_x4plus"


# =============================================================================
# Arsitektur SRVGGNetCompact (sesuai repo resmi Real-ESRGAN / basicsr)
# =============================================================================
class SRVGGNetCompact(nn.Module):
    """Jaringan VGG-style ringkas untuk super-resolution (dipakai general-x4v3).

    Nama atribut (`body`, `upsampler`) HARUS sama dengan repo resmi agar
    state_dict dari file .pth bisa dimuat dengan strict=True.
    """

    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=16,
                 upscale=4, act_type="prelu"):
        super().__init__()
        self.num_in_ch = num_in_ch
        self.num_out_ch = num_out_ch
        self.num_feat = num_feat
        self.num_conv = num_conv
        self.upscale = upscale
        self.act_type = act_type

        self.body = nn.ModuleList()
        # konvolusi pertama
        self.body.append(nn.Conv2d(num_in_ch, num_feat, 3, 1, 1))
        self.body.append(self._make_act(act_type, num_feat))
        # num_conv blok (konvolusi + aktivasi)
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1))
            self.body.append(self._make_act(act_type, num_feat))
        # konvolusi terakhir: keluarkan upscale^2 * num_out_ch kanal untuk PixelShuffle
        self.body.append(nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(upscale)

    @staticmethod
    def _make_act(act_type, num_feat):
        if act_type == "relu":
            return nn.ReLU(inplace=True)
        if act_type == "prelu":
            return nn.PReLU(num_parameters=num_feat)
        if act_type == "leakyrelu":
            return nn.LeakyReLU(negative_slope=0.1, inplace=True)
        raise ValueError(f"act_type tidak dikenal: {act_type}")

    def forward(self, x):
        out = x
        for layer in self.body:
            out = layer(out)
        out = self.upsampler(out)
        # koneksi residual: tambahkan gambar input yang di-upscale (nearest)
        base = F.interpolate(x, scale_factor=self.upscale, mode="nearest")
        return out + base


# =============================================================================
# Unduhan bobot otomatis
# =============================================================================
class WeightDownloadError(RuntimeError):
    pass


def ensure_weight(filename: str, url: str) -> str:
    """Pastikan file bobot ada di weights/. Jika tidak, unduh (dengan progress konsol)."""
    path = os.path.join(WEIGHTS_DIR, filename)
    if os.path.isfile(path) and os.path.getsize(path) > 0:
        return path

    print(f"[Unduh] {filename} tidak ditemukan. Mengunduh dari:\n        {url}")
    tmp_path = path + ".part"  # unduh ke file sementara agar tidak ada file setengah jadi
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp, open(tmp_path, "wb") as f:
            total = int(resp.headers.get("Content-Length", 0))
            done, last_pct = 0, -1
            while True:
                chunk = resp.read(1024 * 256)
                if not chunk:
                    break
                f.write(chunk)
                done += len(chunk)
                if total:
                    pct = int(done * 100 / total)
                    if pct != last_pct and pct % 5 == 0:  # cetak tiap 5%
                        print(f"[Unduh] {filename}: {pct}% ({done / 1e6:.1f}/{total / 1e6:.1f} MB)")
                        last_pct = pct
        os.replace(tmp_path, path)
        print(f"[Unduh] Selesai: {path}")
        return path
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        raise WeightDownloadError(
            f"Gagal mengunduh bobot '{filename}': {e}\n"
            f"Periksa koneksi internet, atau unduh manual dari:\n{url}\n"
            f"lalu letakkan di folder: {WEIGHTS_DIR}"
        ) from e


# =============================================================================
# Cache upsampler
# =============================================================================
# Kunci dasar: (nama_model, tile, fp32). Saya tambahkan tile_pad dan
# denoise_strength (khusus general-x4v3) karena keduanya ikut menentukan objek
# upsampler (denoise memadukan bobot saat model dimuat). LRU kecil (maks 2)
# supaya VRAM tidak menumpuk saat pengguna sering berganti model.
_UPSAMPLER_CACHE: "OrderedDict[tuple, RealESRGANer]" = OrderedDict()
_CACHE_MAX = 2
_FACE_CACHE: dict = {"key": None, "obj": None}  # satu slot untuk GFPGAN


def _free_memory():
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def reset_caches():
    """Kosongkan semua cache (dipanggil setelah OOM)."""
    _UPSAMPLER_CACHE.clear()
    _FACE_CACHE["key"], _FACE_CACHE["obj"] = None, None
    _free_memory()


def build_model(cfg: dict) -> nn.Module:
    if cfg["arch"] == "srvgg":
        # Parameter sesuai spesifikasi general-x4v3
        return SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64,
                               num_conv=32, upscale=4, act_type="prelu")
    return RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64,
                   num_block=cfg["num_block"], num_grow_ch=32, scale=cfg["scale"])


def get_upsampler(model_key: str, tile: int, tile_pad: int, half: bool,
                  denoise_strength):
    """Ambil upsampler dari cache, atau buat baru bila kuncinya belum ada."""
    cfg = MODELS[model_key]

    # --- Penanganan denoise (hanya realesr-general-x4v3) ---
    # CLI `-dn` setara dengan dni_weight di API. Bila dn != 1, dua bobot
    # (general + wdn) diinterpolasi: [dn, 1-dn]. Bila dn == 1, pakai model biasa.
    use_dni = (model_key == GENERAL_KEY and denoise_strength is not None
               and abs(float(denoise_strength) - 1.0) > 1e-6)
    dn_key = round(float(denoise_strength), 2) if use_dni else None

    key = (model_key, int(tile), (not half), int(tile_pad), dn_key)
    if key in _UPSAMPLER_CACHE:
        _UPSAMPLER_CACHE.move_to_end(key)
        return _UPSAMPLER_CACHE[key], key

    # Pastikan bobot tersedia (unduh otomatis jika belum ada)
    model_path = ensure_weight(cfg["file"], cfg["url"])
    dni_weight = None
    if use_dni:
        wdn_path = ensure_weight(GENERAL_WDN_FILE, GENERAL_WDN_URL)
        model_path = [model_path, wdn_path]
        dni_weight = [float(denoise_strength), 1.0 - float(denoise_strength)]

    print(f"[Model] Memuat {model_key} (tile={tile}, half={half}, dn={dn_key}) ...")
    upsampler = RealESRGANer(
        scale=cfg["scale"],
        model_path=model_path,
        dni_weight=dni_weight,
        model=build_model(cfg),
        tile=int(tile),
        tile_pad=int(tile_pad),
        pre_pad=0,
        half=half,
    )
    _UPSAMPLER_CACHE[key] = upsampler
    while len(_UPSAMPLER_CACHE) > _CACHE_MAX:  # buang yang paling lama tak dipakai
        _UPSAMPLER_CACHE.popitem(last=False)
        _free_memory()
    return upsampler, key


def get_face_enhancer(upsampler_key: tuple, upsampler: RealESRGANer, outscale: float):
    """Buat/ambil GFPGANer. `upscale` GFPGAN harus = outscale, jadi masuk kunci cache."""
    try:
        from gfpgan import GFPGANer
    except ImportError as e:
        raise RuntimeError("Paket 'gfpgan' belum terpasang. Jalankan: pip install gfpgan") from e

    fkey = (upsampler_key, round(float(outscale), 3))
    if _FACE_CACHE["key"] == fkey:
        return _FACE_CACHE["obj"]

    gfpgan_path = ensure_weight(GFPGAN_FILE, GFPGAN_URL)
    print("[Model] Memuat GFPGAN ...")
    enhancer = GFPGANer(
        model_path=gfpgan_path,
        upscale=outscale,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=upsampler,  # latar belakang tetap di-upscale oleh Real-ESRGAN
    )
    _FACE_CACHE["key"], _FACE_CACHE["obj"] = fkey, enhancer
    return enhancer


# =============================================================================
# Inference
# =============================================================================
def upscale_image(input_img, model_key, outscale, tile, tile_pad, fp32,
                  denoise_strength, face_enhance, progress=gr.Progress()):
    """Fungsi utama untuk tombol. Return: (gambar_output_atau_None, teks_status)."""
    # --- Validasi input ---
    if input_img is None:
        return None, "⚠️ Belum ada gambar. Unggah gambar terlebih dahulu."
    if model_key not in MODELS:
        return None, f"⚠️ Model tidak dikenal: {model_key}"

    t0 = time.time()
    try:
        cfg = MODELS[model_key]
        outscale = float(outscale)
        tile = int(tile)
        tile_pad = int(tile_pad)

        # Presisi: half hanya bermakna di GPU. fp32 dicentang => half=False.
        half = (not fp32) and torch.cuda.is_available()

        # --- Konversi warna: PIL (RGB) -> numpy -> BGR (format yang diharapkan Real-ESRGAN/OpenCV) ---
        pil_in = input_img if isinstance(input_img, Image.Image) else Image.fromarray(input_img)
        w, h = pil_in.size
        alpha = None
        if pil_in.mode in ("RGBA", "LA") or "transparency" in pil_in.info:
            rgba = pil_in.convert("RGBA")
            alpha = rgba.getchannel("A")  # alpha di-upscale terpisah (Lanczos) lalu ditempel lagi
            pil_rgb = rgba.convert("RGB")
        else:
            pil_rgb = pil_in.convert("RGB")
        img_bgr = cv2.cvtColor(np.array(pil_rgb), cv2.COLOR_RGB2BGR)

        # Guard ukuran output
        out_w, out_h = int(round(w * outscale)), int(round(h * outscale))
        if out_w * out_h > MAX_OUTPUT_PIXELS:
            return None, (f"⚠️ Ukuran output {out_w}x{out_h} terlalu besar "
                          f"(> {MAX_OUTPUT_PIXELS / 1e6:.0f} MP). Turunkan skala output "
                          f"atau perkecil gambar input.")

        # --- Siapkan upsampler (cache + unduh bobot otomatis) ---
        progress(0.1, desc="Menyiapkan model (unduh bobot bila perlu) ...")
        dn = float(denoise_strength) if model_key == GENERAL_KEY else None  # denoise hanya utk general-x4v3
        upsampler, ukey = get_upsampler(model_key, tile, tile_pad, half, dn)

        # --- Inference ---
        progress(0.4, desc="Memproses gambar ...")
        use_face = bool(face_enhance) and model_key == FACE_KEY
        if use_face:
            enhancer = get_face_enhancer(ukey, upsampler, outscale)
            # GFPGANer.enhance mengembalikan (cropped_faces, restored_faces, output_img)
            _, _, out_bgr = enhancer.enhance(img_bgr, has_aligned=False,
                                             only_center_face=False, paste_back=True)
        else:
            # outscale != skala native => RealESRGANer melakukan resize LANCZOS4 ke target
            out_bgr, _ = upsampler.enhance(img_bgr, outscale=outscale)

        if out_bgr is None:
            return None, "❌ Pemrosesan tidak menghasilkan gambar (mungkin tidak ada wajah/terjadi kegagalan internal)."

        # --- Konversi balik: BGR -> RGB -> PIL (cegah warna tertukar) ---
        out_rgb = cv2.cvtColor(out_bgr, cv2.COLOR_BGR2RGB)
        pil_out = Image.fromarray(out_rgb)
        if alpha is not None:
            alpha_up = alpha.resize(pil_out.size, Image.LANCZOS)
            pil_out = pil_out.convert("RGBA")
            pil_out.putalpha(alpha_up)

        elapsed = time.time() - t0
        ow, oh = pil_out.size
        device = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"
        extra = f", denoise={dn:.2f}" if dn is not None else ""
        extra += ", face_enhance=ON" if use_face else ""
        status = (f"✅ Selesai dalam {elapsed:.1f} dtk\n"
                  f"Dimensi: {w}x{h} → {ow}x{oh}\n"
                  f"Model: {cfg['label']} | skala native {cfg['scale']}x | outscale {outscale:g}x\n"
                  f"Tile: {tile} (pad {tile_pad}) | presisi: {'fp16' if half else 'fp32'} | perangkat: {device}{extra}")
        return pil_out, status

    except WeightDownloadError as e:
        return None, f"❌ {e}"
    except RuntimeError as e:
        msg = str(e)
        if "out of memory" in msg.lower():
            reset_caches()  # bebaskan VRAM agar percobaan berikutnya punya peluang
            return None, ("❌ VRAM habis (CUDA out of memory).\n"
                          "Saran: turunkan nilai Tile (mis. 256 atau 128), kecilkan skala output, "
                          "atau perkecil gambar input. Mematikan opsi fp32 juga menghemat memori.")
        return None, f"❌ Terjadi kesalahan runtime: {msg}"
    except Exception as e:  # tangkap apa pun agar UI tidak crash
        return None, f"❌ Terjadi kesalahan: {type(e).__name__}: {e}"


# =============================================================================
# UI Gradio
# =============================================================================
def on_model_change(model_key):
    """Visibilitas dinamis: denoise hanya utk general-x4v3, face_enhance hanya utk x4plus."""
    return (gr.update(visible=(model_key == GENERAL_KEY)),
            gr.update(visible=(model_key == FACE_KEY)))


def build_ui():
    with gr.Blocks(title="Real-ESRGAN Upscaler") as demo:
        gr.Markdown("# 🖼️ Real-ESRGAN Image Upscaler\n"
                    "Unggah gambar beresolusi rendah, pilih model, lalu klik **Mulai Pemrosesan**.")
        with gr.Row():
            # ---------------- Kolom kiri: input + kontrol ----------------
            with gr.Column():
                input_img = gr.Image(label="Gambar Input", type="pil", image_mode="RGBA")
                model_dd = gr.Dropdown(
                    choices=[(c["label"], k) for k, c in MODELS.items()],  # (label UI, nilai internal)
                    value=DEFAULT_MODEL,
                    label="Model Super-Resolution",
                    info="Pilih model sesuai jenis gambar (foto, anime, dll.).",
                )
                outscale = gr.Slider(
                    0.5, 8.0, value=4.0, step=0.1, label="Skala Output (outscale)",
                    info="Skala akhir bebas. Model upscale native dulu, lalu di-resize LANCZOS4 ke target.",
                )
                denoise = gr.Slider(
                    0.0, 1.0, value=0.5, step=0.05, label="Denoise Strength",
                    info="0 = pertahankan noise/detail, 1 = denoise kuat. Hanya untuk realesr-general-x4v3.",
                    visible=False,
                )
                face = gr.Checkbox(
                    value=False, label="Face Enhance (GFPGAN)",
                    info="Perbaiki wajah dengan GFPGAN. Hanya untuk RealESRGAN_x4plus.",
                    visible=True,
                )
                tile = gr.Dropdown(
                    choices=[0, 128, 256, 400, 512], value=400, label="Tile",
                    info="0 = nonaktif (butuh VRAM besar). Nilai kecil (128/256) menghemat VRAM tetapi lebih lambat.",
                )
                tile_pad = gr.Slider(
                    0, 64, value=10, step=1, label="Tile Pad",
                    info="Padding antar-tile untuk mengurangi garis sambungan. Default 10.",
                )
                fp32 = gr.Checkbox(
                    value=False, label="Gunakan fp32 (presisi penuh)",
                    info="Tidak dicentang = fp16 (lebih cepat, hemat VRAM). Centang jika hasil berartefak/hitam.",
                )
                run_btn = gr.Button("Mulai Pemrosesan", variant="primary")

            # ---------------- Kolom kanan: output + status ----------------
            with gr.Column():
                output_img = gr.Image(label="Hasil", type="pil", format="png")
                status = gr.Textbox(label="Status", lines=6, interactive=False,
                                    placeholder="Status proses akan tampil di sini.")

        # Event: ubah visibilitas kontrol saat model diganti
        model_dd.change(on_model_change, inputs=model_dd, outputs=[denoise, face])
        run_btn.click(
            upscale_image,
            inputs=[input_img, model_dd, outscale, tile, tile_pad, fp32, denoise, face],
            outputs=[output_img, status],
        )
    return demo


if __name__ == "__main__":
    print(f"[Info] Perangkat: {'CUDA - ' + torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"[Info] Folder bobot: {WEIGHTS_DIR}")
    build_ui().queue().launch()
