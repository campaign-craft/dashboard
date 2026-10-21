/**
 * ai-proxy-worker.js — Cloudflare Worker: proxy antara Logbook (frontend) dan DeepSeek API.
 *
 * Kenapa ada proxy: API key DeepSeek tidak boleh ada di frontend. Key disimpan sebagai secret
 * Worker (env.DEEPSEEK_API_KEY), frontend cuma tahu URL Worker ini.
 *
 * Deploy (ringkas, detail di README bagian "AI Import (opsional)"):
 *   npx wrangler deploy ai-proxy-worker.js --name logbook-ai-proxy --compatibility-date 2024-09-01
 *   npx wrangler secret put DEEPSEEK_API_KEY --name logbook-ai-proxy
 *
 * Request  : POST  { chat_text, client: {name, fiverr_username, country}, order: {...} | null }
 * Response : { ok: true, data: {...} }  atau  { ok: false, error: "..." }
 */

// CORS: '*' = semua origin boleh memanggil Worker ini (termasuk halaman file://, yang mengirim Origin "null").
// Untuk membatasi, ganti dengan origin tertentu, mis. 'https://logbook.example.com'.
// Kalau kamu tetap membuka app via file://, origin yang dikirim browser adalah 'null' (string),
// jadi pembatasan ke origin tertentu akan memblokir file://.
const ALLOWED_ORIGIN = '*';

const MAX_CHAT_CHARS = 50000;      // harus sama dengan AI_MAX_CHARS di app.js
const MAX_BODY_CHARS = 200000;     // batas kasar ukuran body mentah (chat + konteks order)
const UPSTREAM_TIMEOUT_MS = 55000; // lebih pendek dari timeout 60 detik di frontend
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

const SYSTEM_PROMPT = [
  'Kamu adalah asisten yang mengekstrak data order freelance dari histori chat Fiverr.',
  'Balas HANYA dengan satu objek JSON valid, tanpa teks lain, tanpa markdown, tanpa penjelasan.',
  '',
  'Skema JSON (semua key harus ada):',
  '{',
  '  "gig": string,             // judul/ringkasan order singkat dan jelas',
  '  "value": number,           // total nilai order (angka saja, tanpa simbol mata uang)',
  '  "currency": string,        // kode mata uang 3 huruf: USD, EUR, GBP, CAD, AUD, atau IDR',
  '  "scope": string,           // ruang lingkup pekerjaan yang disepakati',
  '  "delivery_item": string,   // apa saja yang dikirim/diserahkan',
  '  "status": string,          // salah satu: "in_progress", "delivered", "completed", "cancelled"',
  '  "revisions": number,       // jumlah ronde revisi yang terjadi (bilangan bulat)',
  '  "pricing_note": string,    // catatan harga: rincian, kutipan awal vs akhir, extra, rush, pelajaran untuk harga berikutnya',
  '  "order_date": string,      // format YYYY-MM-DD',
  '  "fiverr_order_id": string, // ID order Fiverr kalau disebut',
  '  "preview_link": string,    // URL preview/delivery kalau ada',
  '  "rating": number           // 1-5 kalau klien memberi rating, selain itu 0',
  '}',
  '',
  'Aturan:',
  '- Gunakan hanya informasi yang benar-benar ada di chat. JANGAN mengarang.',
  '- Kalau informasi tidak ada di chat, isi string dengan "" dan angka dengan 0.',
  '- "status": pakai "in_progress" kalau belum ada tanda selesai/terkirim.',
  '- Tulis isi teks (scope, delivery_item, pricing_note) dalam bahasa Indonesia, ringkas dan faktual.',
  '- Kalau ada konteks order yang sedang diedit, anggap chat adalah pembaruan untuk order itu, dan jangan mengubah hal yang tidak disebut di chat.',
  '- Tanggal selalu YYYY-MM-DD. Kalau tanggal tidak jelas, isi "".',
].join('\n');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, corsHeaders()),
  });
}

const fail = (status, error) => json({ ok: false, error: error }, status);

// Potong string konteks supaya prompt tidak membengkak
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

function buildUserPrompt(chatText, client, order) {
  const c = client && typeof client === 'object' ? client : {};
  const lines = [
    'KONTEKS KLIEN:',
    'Nama: ' + clip(c.name, 200),
    'Username Fiverr: ' + clip(c.fiverr_username, 200),
    'Negara: ' + clip(c.country, 200),
    '',
  ];
  if (order && typeof order === 'object') {
    lines.push('ORDER YANG SEDANG DIEDIT (data saat ini, dalam JSON):');
    lines.push(clip(JSON.stringify(order), 4000));
    lines.push('');
  }
  lines.push('HISTORI CHAT:');
  lines.push(chatText);
  lines.push('');
  lines.push('Ekstrak data order dari chat di atas dan balas dalam format JSON sesuai skema.');
  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'POST') return fail(405, 'Method tidak diizinkan, gunakan POST');
    if (!env || !env.DEEPSEEK_API_KEY) return fail(500, 'Proxy belum dikonfigurasi (DEEPSEEK_API_KEY belum di-set)');

    // ---- Validasi body ----
    let raw;
    try { raw = await request.text(); } catch (e) { return fail(400, 'Body tidak bisa dibaca'); }
    if (raw.length > MAX_BODY_CHARS) return fail(413, 'Body terlalu besar');
    let body;
    try { body = JSON.parse(raw); } catch (e) { return fail(400, 'Body bukan JSON valid'); }
    if (!body || typeof body !== 'object') return fail(400, 'Body bukan JSON valid');
    if (typeof body.chat_text !== 'string' || !body.chat_text.trim()) return fail(400, 'chat_text wajib berupa teks tidak kosong');
    if (body.chat_text.length > MAX_CHAT_CHARS) return fail(400, 'chat_text terlalu panjang (maks ' + MAX_CHAT_CHARS + ' karakter)');

    // ---- Panggil DeepSeek ----
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
    let upstream;
    try {
      upstream = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(body.chat_text, body.client, body.order) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: ctrl.signal,
      });
    } catch (e) {
      return fail(502, e && e.name === 'AbortError' ? 'DeepSeek tidak merespons tepat waktu' : 'Gagal menghubungi DeepSeek');
    } finally {
      clearTimeout(timer);
    }

    // Jangan teruskan isi error upstream ke klien (bisa memuat detail akun); cukup kode status.
    if (!upstream.ok) return fail(502, 'DeepSeek mengembalikan error (HTTP ' + upstream.status + ')');

    let result;
    try { result = await upstream.json(); } catch (e) { return fail(502, 'AI tidak mengembalikan JSON valid'); }

    // JSON mode DeepSeek kadang mengembalikan content kosong
    const content = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
    if (typeof content !== 'string' || !content.trim()) return fail(502, 'AI tidak mengembalikan JSON valid');

    let parsed;
    try { parsed = JSON.parse(content); } catch (e) { return fail(502, 'AI tidak mengembalikan JSON valid'); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(502, 'AI tidak mengembalikan JSON valid');

    return json({ ok: true, data: parsed }, 200);
  },
};
