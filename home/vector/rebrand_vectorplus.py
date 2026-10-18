#!/usr/bin/env python3
"""Rebrand Vektora -> Vectorplus (nama, palet Adobe-clean terang/gelap, font, ikon). Tidak mengubah fitur.
Pemakaian: python3 rebrand_vectorplus.py vektora-full.html rebrand.css SourceSans3-latin.woff2 vectorplus.html"""
import sys,re,base64
src,css,font,dst=sys.argv[1:5]
h=open(src,encoding='utf-8').read()
css=open(css,encoding='utf-8').read()
b64=base64.b64encode(open(font,'rb').read()).decode()
ff=("@font-face{font-family:'Source Sans 3';font-style:normal;font-weight:200 900;font-display:swap;"
    "src:url(data:font/woff2;base64,%s) format('woff2')}"%b64)
css=css.replace('/*FONTFACE*/',ff)
assert h.count('</head>')==1 and '<div class="brand">' in h

LOGO=('<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect class="vp-bg" width="32" height="32" rx="8" fill="#1473e6"/>'
 '<path d="M8.5 20.5C8.5 13 13 10 22 10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'
 '<rect x="6.2" y="19" width="4.6" height="4.6" rx=".8" fill="#fff"/><rect x="20" y="7.8" width="4.6" height="4.6" rx=".8" fill="#fff"/>'
 '<path d="M23 18v7M19.5 21.5h7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>')
h=re.sub(r'<div class="brand">.*?</div>',lambda m:'<div class="brand">'+LOGO+'<span class="vp-word">Vector<span class="vp-plus">plus</span></span></div>',h,count=1,flags=re.S)

# ikon favicon
fav=("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'%3E%3Crect width='32' height='32' rx='8' fill='%231473e6'/%3E"
 "%3Cpath d='M8.5 20.5C8.5 13 13 10 22 10' stroke='%23fff' stroke-width='2.2' stroke-linecap='round'/%3E%3Crect x='6.2' y='19' width='4.6' height='4.6' rx='.8' fill='%23fff'/%3E"
 "%3Crect x='20' y='7.8' width='4.6' height='4.6' rx='.8' fill='%23fff'/%3E%3Cpath d='M23 18v7M19.5 21.5h7' stroke='%23fff' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E")
h,n=re.subn(r'<link rel="icon" href="[^"]*">','<link rel="icon" href="%s">'%fav,h,count=1); assert n==1
h=h.replace('<meta name="theme-color" content="#17624d">','<meta name="theme-color" content="#ffffff">')

# ilustrasi
h=h.replace('<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="12" width="56" height="56" rx="8"/><circle cx="30" cy="30" r="5"/><path d="m13 58 18-17 12 11 10-10 15 16"/></svg>',
 '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="14" width="56" height="52" rx="6"/><circle cx="29" cy="31" r="5"/><path d="m12 56 17-16 12 11 10-10 17 15"/></svg>')
h=h.replace('<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 58C18 18 62 18 62 58M10 26h60"/><rect x="14" y="54" width="8" height="8"/><rect x="58" y="54" width="8" height="8"/><circle cx="40" cy="28" r="4"/><circle cx="10" cy="26" r="3"/><circle cx="70" cy="26" r="3"/></svg>',
 '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 60C16 30 38 22 64 20"/><path d="M16 60 28 38M64 20 52 38" stroke-dasharray="2 3"/><rect x="12" y="56" width="8" height="8" rx="1.5"/><rect x="60" y="16" width="8" height="8" rx="1.5"/><circle cx="28" cy="38" r="3"/><circle cx="52" cy="38" r="3"/></svg>')
h=h.replace('stroke-width="1.4" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M4 14v6h16v-6"/>','stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m-4.5 4.5L12 4l4.5 4.5M4.5 14.5V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4.5"/>')

h=re.sub(r'<script async src="/\.netlify/scripts/hud[^>]*>\s*</script>','',h)
# sisa teks demo yang tak relevan di versi penuh
h=re.sub(r'<p class="demoNote">.*?</p>','',h,count=1,flags=re.S)
h=h.replace("'Versi demo · hasil tidak bisa diunduh'","'Hasil siap diunduh'")
h=re.sub(r'<link rel="apple-touch-icon"[^>]*>','',h)
# teks nama & glif
h=h.replace('↓ Unduh ','Unduh ').replace('Tutup ✕','Tutup')
h=h.replace('vektora-hasil','vectorplus-hasil')
h=h.replace('Vektora','Vectorplus').replace('VEKTORA','VECTORPLUS')
h=h.replace("<title>Vectorplus</title>","<title>Vectorplus</title>")
# gambar contoh
h=h.replace("x.fillStyle='#17624d'","x.fillStyle='#1473e6'").replace("x.fillStyle='#dfaa43'","x.fillStyle='#ffb000'").replace("x.fillStyle='#d77b60'","x.fillStyle='#eb4a4a'")

# default terang (gelap hanya bila pengguna memilih; mengikuti pilihan tersimpan)
boot=("<script>(function(){try{var d=document.documentElement;if(d.dataset.theme)return;"
      "var t=localStorage.getItem('vektora-tema');d.dataset.theme=(t==='dark')?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();</script>")
h=h.replace('</head>',boot+'<style id="vpBrand">\n'+css+'\n</style></head>')
open(dst,'w',encoding='utf-8').write(h)
print('OK',dst,len(h),'byte; sisa "ektora":',len(re.findall('ektora',h)))
