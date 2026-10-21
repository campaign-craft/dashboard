/**
 * app.js — logika UI.
 * Aturan: file ini TIDAK BOLEH menyentuh localStorage secara langsung.
 * Semua data lewat window.LogbookStorage (storage.js).
 */
(function () {
  'use strict';

  // ===== KONFIGURASI AI IMPORT (opsional) =====
  // GANTI nilai di bawah dengan URL Cloudflare Worker kamu setelah deploy ai-proxy-worker.js.
  // PENTING: API key DeepSeek TIDAK BOLEH ditaruh di file ini (atau file frontend mana pun).
  // Key disimpan sebagai secret di Worker (DEEPSEEK_API_KEY); di sini cuma URL proxy-nya.
  const AI_PROXY_URL = 'https://GANTI-DENGAN-URL-WORKER-KAMU.workers.dev';
  const AI_TIMEOUT_MS = 60000;   // batas tunggu respons proxy
  const AI_MAX_CHARS = 50000;    // harus sama dengan batas di ai-proxy-worker.js

  const S = window.LogbookStorage;
  const $ = (sel) => document.querySelector(sel);

  const TYPE_LABEL = { order: 'Order', chat: 'Chat', meeting: 'Meeting', delivery: 'Delivery', revision: 'Revisi', note: 'Catatan' };
  const STATUS_LABEL = { in_progress: 'Dikerjakan', delivered: 'Terkirim', completed: 'Selesai', cancelled: 'Dibatalkan' };
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'IDR'];

  // status: 'loading' | 'ready' | 'error' (untuk panel kanan)
  const state = { clients: [], selectedId: null, orders: [], logs: [], search: '', filter: 'all', status: 'loading', error: '' };

  // ---------- Helper tampilan ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function safeUrl(u) {
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch (e) { return null; }
  }
  function link(u, label) {
    const h = safeUrl(u);
    return h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener noreferrer">' + esc(label || u) + '</a>' : esc(u || '');
  }
  function money(v, cur) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 2 }).format(v || 0); }
    catch (e) { return (cur || '') + ' ' + (v || 0); }
  }
  function fmtDate(d) {
    if (!d) return '–';
    const x = new Date(d.length === 10 ? d + 'T00:00:00' : d);
    return isNaN(x) ? d : x.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function todayStr() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  const clientLabel = (c) => c.name || '@' + c.fiverr_username;
  const orderLabel = (o) => o.gig + (o.fiverr_order_id ? ' (#' + o.fiverr_order_id + ')' : '');
  let toastTimer;
  function toast(msg, isErr) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 3500);
  }
  // Jalankan aksi async; error ditampilkan sebagai toast
  async function guard(fn) {
    try { return await fn(); } catch (e) { console.error(e); toast(e.message || String(e), true); }
  }

  // ---------- Muat data ----------
  async function loadDetail(id, silent) {
    state.selectedId = id;
    if (!silent) { state.status = 'loading'; state.error = ''; renderDetail(); }
    renderSidebar();
    try {
      const res = await Promise.all([S.listOrders(id), S.listLogs(id)]);
      if (state.selectedId !== id) return; // user sudah pindah klien
      state.orders = res[0]; state.logs = res[1]; state.status = 'ready';
    } catch (e) {
      state.status = 'error'; state.error = e.message;
    }
    renderDetail();
  }

  async function reloadAll(selectId) {
    try {
      state.clients = await S.listClients();
    } catch (e) {
      state.status = 'error'; state.error = e.message; renderSidebar(); renderDetail(); return;
    }
    let id = selectId || state.selectedId;
    if (!state.clients.some((c) => c.id === id)) id = state.clients.length ? state.clients[0].id : null;
    if (id) { await loadDetail(id, id === state.selectedId); return; }
    state.selectedId = null; state.orders = []; state.logs = []; state.status = 'ready';
    renderSidebar(); renderDetail();
  }

  // ---------- Render sidebar ----------
  function renderSidebar() {
    const q = state.search.trim().toLowerCase();
    const list = state.clients.filter((c) => !q || [c.name, c.fiverr_username, c.country].join(' ').toLowerCase().includes(q));
    const box = $('#client-list');
    if (!list.length) {
      box.innerHTML = '<p class="state">' + (state.clients.length ? 'Tidak ada klien yang cocok.' : 'Belum ada klien.') + '</p>';
      return;
    }
    box.innerHTML = list.map((c) =>
      '<button type="button" class="client-item' + (c.id === state.selectedId ? ' active' : '') + '" data-action="select-client" data-id="' + esc(c.id) + '">' +
      '<span class="avatar">' + esc(clientLabel(c).replace('@', '').charAt(0).toUpperCase()) + '</span>' +
      '<span><span class="name">' + esc(clientLabel(c)) + '</span><small>@' + esc(c.fiverr_username) + (c.country ? ' · ' + esc(c.country) : '') + '</small></span></button>'
    ).join('');
  }

  // ---------- Render detail ----------
  function summarize() {
    const active = state.orders.filter((o) => o.status !== 'cancelled'); // order batal tidak dihitung nilainya
    const by = {};
    active.forEach((o) => { const c = o.currency || 'USD'; by[c] = by[c] || { sum: 0, n: 0 }; by[c].sum += Number(o.value) || 0; by[c].n++; });
    const cur = Object.keys(by);
    return {
      count: state.orders.length,
      total: cur.map((c) => money(by[c].sum, c)).join(' + ') || '–',
      avg: cur.map((c) => money(by[c].sum / by[c].n, c)).join(' + ') || '–',
      last: state.orders[0] || null, // listOrders sudah urut terbaru
    };
  }

  function timelineItems() {
    const items = state.orders.map((o) => ({ kind: 'order', type: 'order', date: o.order_date || '', created_at: o.created_at || '', o: o }))
      .concat(state.logs.map((l) => ({ kind: 'log', type: l.type, date: l.date || '', created_at: l.created_at || '', l: l })));
    items.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
    return state.filter === 'all' ? items : items.filter((i) => i.type === state.filter);
  }

  function orderCard(o) {
    const rows = [
      ['Scope', esc(o.scope)], ['Delivery', esc(o.delivery_item)], ['Preview', o.preview_link ? link(o.preview_link) : ''],
      ['Revisi', String(o.revisions || 0)], ['Rating', o.rating ? '★'.repeat(o.rating) + ' (' + o.rating + '/5)' : ''],
      ['Catatan harga', esc(o.pricing_note)],
    ].filter((r) => r[1]);
    return '<article class="order-card"><div class="card-head"><h3>' + esc(orderLabel(o)) + '</h3>' +
      '<span class="badge s-' + esc(o.status) + '">' + esc(STATUS_LABEL[o.status] || o.status) + '</span>' +
      '<span class="spacer"></span><span class="price">' + esc(money(o.value, o.currency)) + '</span></div>' +
      '<div class="muted">' + esc(fmtDate(o.order_date)) + '</div>' +
      '<dl class="kv">' + rows.map((r) => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('') + '</dl>' +
      '<div class="entry-head" style="margin-top:8px"><span class="spacer"></span>' +
      '<button class="link" data-action="edit-order" data-id="' + esc(o.id) + '">Edit</button>' +
      '<button class="link danger" data-action="delete-order" data-id="' + esc(o.id) + '">Hapus</button></div></article>';
  }

  function entryHtml(it) {
    if (it.kind === 'order') {
      const o = it.o;
      return '<article class="entry"><div class="entry-head"><span class="badge t-order">Order</span><span class="muted">' + esc(fmtDate(o.order_date)) + '</span>' +
        '<span>' + esc(orderLabel(o)) + '</span><span class="spacer"></span><span class="price">' + esc(money(o.value, o.currency)) + '</span></div></article>';
    }
    const l = it.l;
    const ord = l.order_id ? state.orders.find((o) => o.id === l.order_id) : null;
    const long = (l.content || '').length > 400;
    const meta = l.meta || {};
    let metaHtml = '';
    if (Array.isArray(meta.action_items) && meta.action_items.length) {
      metaHtml += '<div>Action items:<ul>' + meta.action_items.map((a) => '<li>' + esc(a) + '</li>').join('') + '</ul></div>';
    }
    if (meta.recording_link) metaHtml += '<div>Rekaman: ' + link(meta.recording_link) + '</div>';
    if (l.reference_link) metaHtml += '<div>Referensi: ' + link(l.reference_link) + '</div>';
    return '<article class="entry"><div class="entry-head"><span class="badge t-' + esc(l.type) + '">' + esc(TYPE_LABEL[l.type] || l.type) + '</span>' +
      '<span class="muted">' + esc(fmtDate(l.date)) + '</span>' + (ord ? '<span class="muted">· ' + esc(orderLabel(ord)) + '</span>' : '') +
      '<span class="spacer"></span><button class="link" data-action="edit-log" data-id="' + esc(l.id) + '">Edit</button>' +
      '<button class="link danger" data-action="delete-log" data-id="' + esc(l.id) + '">Hapus</button></div>' +
      '<div class="entry-body' + (long ? ' clamp' : '') + '">' + esc(l.content) + '</div>' +
      (long ? '<button class="link" data-action="toggle">Tampilkan semua</button>' : '') +
      (metaHtml ? '<div class="entry-meta">' + metaHtml + '</div>' : '') + '</article>';
  }

  function renderDetail() {
    const box = $('#detail');
    if (state.status === 'loading') { box.innerHTML = '<p class="state">Memuat data…</p>'; return; }
    if (state.status === 'error') {
      box.innerHTML = '<div class="state error"><p>Terjadi kesalahan: ' + esc(state.error) + '</p><button class="btn" data-action="retry">Coba lagi</button></div>';
      return;
    }
    const c = state.clients.find((x) => x.id === state.selectedId);
    if (!c) {
      box.innerHTML = '<div class="state"><p>' + (state.clients.length ? 'Pilih klien di sidebar.' : 'Belum ada klien. Mulai dengan menambahkan klien pertama.') +
        '</p><button class="btn primary" data-action="add-client">Tambah klien</button></div>';
      return;
    }
    const sm = summarize();
    const last = sm.last;
    const items = timelineItems();
    const filters = ['all', 'order', 'chat', 'meeting', 'delivery', 'revision', 'note'];

    box.innerHTML = '<div class="detail-inner">' +
      '<div class="profile-head"><div><h1>' + esc(clientLabel(c)) + '</h1></div><span class="spacer"></span>' +
      '<button class="btn" data-action="edit-client">Edit</button><button class="btn danger" data-action="delete-client">Hapus</button></div>' +
      '<div class="chips"><span class="chip">@' + esc(c.fiverr_username || '-') + '</span>' +
      (c.country ? '<span class="chip">' + esc(c.country) + '</span>' : '') + (c.timezone ? '<span class="chip">' + esc(c.timezone) + '</span>' : '') +
      '<span class="chip">Kontak pertama: ' + esc(fmtDate(c.first_contact)) + '</span></div>' +

      '<section><div class="section-head"><h2>Ringkasan</h2></div><div class="stats">' +
      '<div class="stat"><div class="label">Total order</div><div class="val">' + sm.count + '</div></div>' +
      '<div class="stat"><div class="label">Total nilai</div><div class="val">' + esc(sm.total) + '</div><div class="sub">tidak termasuk order batal</div></div>' +
      '<div class="stat"><div class="label">Rata-rata nilai</div><div class="val">' + esc(sm.avg) + '</div></div>' +
      '<div class="stat"><div class="label">Order terakhir</div><div class="val">' + (last ? esc(money(last.value, last.currency)) : '–') + '</div>' +
      '<div class="sub">' + (last ? esc(last.gig) + ', ' + esc(fmtDate(last.order_date)) : 'Belum ada order') + '</div></div></div>' +
      (last && last.pricing_note ? '<div class="notes-box"><strong>Catatan harga terakhir:</strong> ' + esc(last.pricing_note) + '</div>' : '') +
      (c.notes ? '<div class="notes-box"><strong>Catatan klien:</strong> ' + esc(c.notes) + '</div>' : '') + '</section>' +

      '<section><div class="section-head"><h2>Order</h2><span class="spacer"></span><button class="btn" data-action="ai-import">Import dari chat (AI)</button><button class="btn" data-action="add-order">Tambah order</button></div>' +
      (state.orders.length ? state.orders.map(orderCard).join('') : '<p class="empty-inline">Belum ada order untuk klien ini.</p>') + '</section>' +

      '<section><div class="section-head"><h2>Timeline</h2><span class="spacer"></span><button class="btn" data-action="add-log">Tambah log</button></div>' +
      '<div class="filters">' + filters.map((f) => '<button class="filter' + (state.filter === f ? ' active' : '') + '" data-action="filter" data-type="' + f + '">' +
        (f === 'all' ? 'Semua' : TYPE_LABEL[f]) + '</button>').join('') + '</div>' +
      (items.length ? items.map(entryHtml).join('') : '<p class="empty-inline">Belum ada entri' + (state.filter === 'all' ? '' : ' untuk filter ini') + '.</p>') +
      '</section></div>';
  }

  // ---------- Modal form generik ----------
  function fieldHtml(f, v) {
    const val = v[f.name] != null ? v[f.name] : (f.def != null ? f.def : '');
    const req = f.required ? ' required' : '';
    let input;
    if (f.type === 'textarea') {
      input = '<textarea name="' + f.name + '" rows="' + (f.rows || 3) + '"' + req + '>' + esc(val) + '</textarea>';
    } else if (f.type === 'select') {
      input = '<select name="' + f.name + '">' + f.options.map((o) => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
    } else {
      input = '<input type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + esc(val) + '"' + req + (f.step ? ' step="' + f.step + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + '>';
    }
    return '<label class="field' + (f.wide ? ' wide' : '') + '" data-name="' + f.name + '"><span>' + esc(f.label) + (f.required ? ' *' : '') + '</span>' + input + '</label>';
  }

  function openForm(cfg) {
    const dlg = $('#modal');
    const values = cfg.values || {};
    // cfg.intro (opsional) = potongan HTML yang SUDAH di-escape, ditampilkan di bawah judul
    dlg.innerHTML = '<form class="modal-form"><h2>' + esc(cfg.title) + '</h2>' + (cfg.intro || '') + '<div class="form-grid">' +
      cfg.fields.map((f) => fieldHtml(f, values)).join('') + '</div><p class="form-error" role="alert" hidden></p>' +
      '<div class="modal-actions"><button type="button" class="btn" data-close>Batal</button><button type="submit" class="btn primary">' + esc(cfg.submitLabel || 'Simpan') + '</button></div></form>';
    const form = dlg.querySelector('form');
    const errBox = form.querySelector('.form-error');
    const collect = () => Object.fromEntries(new FormData(form).entries());

    // Tampilkan/sembunyikan field bersyarat (showIf); field tersembunyi di-disable agar tidak ikut terkirim
    const sync = () => {
      const v = collect();
      cfg.fields.forEach((f) => {
        if (!f.showIf) return;
        const show = f.showIf(v);
        const lab = form.querySelector('[data-name="' + f.name + '"]');
        lab.hidden = !show;
        lab.querySelector('[name]').disabled = !show;
      });
    };
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);
    sync();

    form.querySelector('[data-close]').addEventListener('click', () => dlg.close());
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const idleLabel = btn.textContent;
      btn.disabled = true; errBox.hidden = true;
      if (cfg.loadingLabel) btn.textContent = cfg.loadingLabel;
      try {
        const r = await cfg.onSubmit(collect());
        if (r !== false) dlg.close(); // onSubmit boleh return false kalau sudah mengurus dialog sendiri
      }
      catch (ex) { errBox.textContent = ex.message || String(ex); errBox.hidden = false; }
      finally { btn.disabled = false; btn.textContent = idleLabel; }
    });
    dlg.showModal();
  }

  // ---------- Form: klien, order, log ----------
  function clientForm(existing) {
    openForm({
      title: existing ? 'Edit klien' : 'Tambah klien',
      values: existing || { first_contact: todayStr() },
      fields: [
        { name: 'fiverr_username', label: 'Username Fiverr', required: true },
        { name: 'name', label: 'Nama' },
        { name: 'country', label: 'Negara' },
        { name: 'timezone', label: 'Timezone (mis. Europe/London)' },
        { name: 'first_contact', label: 'Kontak pertama', type: 'date' },
        { name: 'notes', label: 'Catatan', type: 'textarea', rows: 5, wide: true },
      ],
      onSubmit: async (v) => {
        const saved = existing ? await S.updateClient(existing.id, v) : await S.createClient(v);
        await reloadAll(saved.id);
        toast('Klien disimpan');
      },
    });
  }

  // prefill (opsional): nilai tambahan yang menimpa default/existing, mis. hasil AI Import
  function orderForm(existing, prefill) {
    openForm({
      title: existing ? 'Edit order' : 'Tambah order',
      values: Object.assign({}, existing || { order_date: todayStr(), currency: 'USD', status: 'in_progress', revisions: 0 }, prefill || {}),
      fields: [
        { name: 'gig', label: 'Gig / judul order', required: true, wide: true },
        { name: 'fiverr_order_id', label: 'Fiverr order ID' },
        { name: 'order_date', label: 'Tanggal order', type: 'date' },
        { name: 'value', label: 'Nilai', type: 'number', step: '0.01', min: 0, required: true },
        { name: 'currency', label: 'Mata uang', type: 'select', options: CURRENCIES.map((c) => [c, c]) },
        { name: 'status', label: 'Status', type: 'select', options: Object.keys(STATUS_LABEL).map((k) => [k, STATUS_LABEL[k]]) },
        { name: 'revisions', label: 'Jumlah revisi', type: 'number', min: 0 },
        { name: 'rating', label: 'Rating', type: 'select', options: [['', '–'], [5, '5'], [4, '4'], [3, '3'], [2, '2'], [1, '1']] },
        { name: 'preview_link', label: 'Preview link', type: 'url' },
        { name: 'scope', label: 'Scope', type: 'textarea', wide: true },
        { name: 'delivery_item', label: 'Delivery item', type: 'textarea', wide: true },
        { name: 'pricing_note', label: 'Catatan harga (untuk order berikutnya)', type: 'textarea', wide: true },
      ],
      onSubmit: async (v) => {
        const data = Object.assign({}, v, { client_id: state.selectedId });
        if (existing) await S.updateOrder(existing.id, data); else await S.createOrder(data);
        await reloadAll();
        toast('Order disimpan');
      },
    });
  }

  function logForm(existing) {
    const meta = (existing && existing.meta) || {};
    const values = existing
      ? Object.assign({}, existing, { order_id: existing.order_id || '', action_items: (meta.action_items || []).join('\n'), recording_link: meta.recording_link || '' })
      : { type: 'chat', date: todayStr(), order_id: '' };
    const isMeeting = (v) => v.type === 'meeting';
    openForm({
      title: existing ? 'Edit log' : 'Tambah log',
      values: values,
      fields: [
        { name: 'type', label: 'Tipe', type: 'select', options: ['chat', 'meeting', 'delivery', 'revision', 'note'].map((t) => [t, TYPE_LABEL[t]]) },
        { name: 'date', label: 'Tanggal', type: 'date' },
        { name: 'order_id', label: 'Order terkait (opsional)', type: 'select', wide: true,
          options: [['', 'Tanpa order']].concat(state.orders.map((o) => [o.id, orderLabel(o)])) },
        { name: 'content', label: 'Isi (paste chat / notulen di sini)', type: 'textarea', rows: 9, required: true, wide: true },
        { name: 'reference_link', label: 'Link referensi', type: 'url', wide: true },
        { name: 'action_items', label: 'Action items (satu per baris)', type: 'textarea', wide: true, showIf: isMeeting },
        { name: 'recording_link', label: 'Link rekaman meeting', type: 'url', wide: true, showIf: isMeeting },
      ],
      onSubmit: async (v) => {
        const m = Object.assign({}, meta); // pertahankan meta lain yang sudah ada
        if (v.type === 'meeting') {
          m.action_items = (v.action_items || '').split('\n').map((s) => s.trim()).filter(Boolean);
          m.recording_link = (v.recording_link || '').trim();
        }
        const data = { client_id: state.selectedId, order_id: v.order_id || null, type: v.type, date: v.date, content: v.content, reference_link: v.reference_link, meta: m };
        if (existing) await S.updateLog(existing.id, data); else await S.createLog(data);
        await reloadAll();
        toast('Log disimpan');
      },
    });
  }

  // ---------- AI Import ----------
  const AI_ORDER_FIELDS = ['gig', 'value', 'currency', 'scope', 'delivery_item', 'status', 'revisions',
    'pricing_note', 'order_date', 'fiverr_order_id', 'preview_link', 'rating'];

  // Panggil proxy. context = { client: {name, fiverr_username, country}, order: existingOrder | null }
  // Return: object hasil ekstraksi (field "data" dari proxy). Lempar Error berpesan jelas kalau gagal.
  async function callAiExtract(chatText, context) {
    if (!AI_PROXY_URL || AI_PROXY_URL.indexOf('GANTI-DENGAN') !== -1) {
      throw new Error('AI_PROXY_URL di app.js belum diisi. Deploy ai-proxy-worker.js dulu, lalu isi URL Worker-nya (lihat README).');
    }
    const ctx = context || {};
    const cl = ctx.client || {};
    const body = JSON.stringify({
      chat_text: chatText,
      client: { name: cl.name || '', fiverr_username: cl.fiverr_username || '', country: cl.country || '' },
      order: ctx.order || null,
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
    let res, text;
    try {
      res = await fetch(AI_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, signal: ctrl.signal });
      text = await res.text();
    } catch (e) {
      if (e && e.name === 'AbortError') throw new Error('Proxy AI tidak merespons dalam ' + (AI_TIMEOUT_MS / 1000) + ' detik. Coba lagi.');
      throw new Error('Tidak bisa terhubung ke proxy AI: ' + (e && e.message ? e.message : e));
    } finally {
      clearTimeout(timer);
    }
    let json;
    try { json = JSON.parse(text); } catch (e) { throw new Error('Proxy mengembalikan respons tidak valid'); }
    if (!json || typeof json !== 'object') throw new Error('Proxy mengembalikan respons tidak valid');
    if (json.ok === false) throw new Error(json.error || 'Proxy AI mengembalikan error');
    if (json.ok !== true) throw new Error('Proxy mengembalikan respons tidak valid');
    return json.data;
  }

  // Validasi hasil AI dan ubah jadi values untuk orderForm. Field tak dikenal diabaikan,
  // field kosong (""/null/0) dilewati supaya tidak menimpa default atau data order yang sedang diedit.
  function aiToOrderValues(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('AI tidak mengembalikan JSON valid');
    if (typeof data.gig !== 'string' || !data.gig.trim()) throw new Error('AI tidak menemukan judul order (gig) di chat. Coba paste chat yang lebih lengkap.');
    const out = {};
    AI_ORDER_FIELDS.forEach((k) => {
      const v = data[k];
      if (v === undefined || v === null || v === '') return;
      switch (k) {
        case 'gig': out.gig = v.trim(); break;
        case 'value': { const n = Number(v); if (Number.isFinite(n) && n > 0) out.value = n; break; }
        case 'revisions': { const n = parseInt(v, 10); if (Number.isFinite(n) && n > 0) out.revisions = n; break; }
        case 'rating': { const n = parseInt(v, 10); if (n >= 1 && n <= 5) out.rating = n; break; }
        case 'currency': { const c = String(v).trim().toUpperCase(); if (CURRENCIES.includes(c)) out.currency = c; break; }
        case 'status': out.status = Object.prototype.hasOwnProperty.call(STATUS_LABEL, v) ? v : 'in_progress'; break;
        case 'order_date': if (/^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) out.order_date = String(v).trim(); break;
        default: out[k] = String(v); // scope, delivery_item, pricing_note, fiverr_order_id, preview_link
      }
    });
    return out;
  }

  function aiImportForm(existingOrder) {
    const client = state.clients.find((c) => c.id === state.selectedId);
    if (!client) { toast('Pilih klien dulu.', true); return; }
    const intro = '<p class="muted">Klien: <strong>' + esc(clientLabel(client)) + '</strong>' +
      (existingOrder ? '<br>Order yang diedit: <strong>' + esc(orderLabel(existingOrder)) + '</strong>' : '') +
      '<br>Hasil AI tidak langsung disimpan; kamu akan diminta memeriksanya di form order dulu.</p>';
    openForm({
      title: 'Import order dari chat (AI)',
      intro: intro,
      submitLabel: 'Extract dengan AI',
      loadingLabel: 'Mengekstrak…',
      values: {},
      fields: [
        { name: 'chat_text', label: 'Paste histori chat Fiverr', type: 'textarea', rows: 12, required: true, wide: true },
      ],
      onSubmit: async (v) => {
        const chat = (v.chat_text || '').trim();
        if (!chat) throw new Error('Histori chat wajib diisi.');
        if (chat.length > AI_MAX_CHARS) throw new Error('Chat terlalu panjang (' + chat.length + ' karakter, maks ' + AI_MAX_CHARS + '). Potong dulu.');
        const data = await callAiExtract(chat, { client: client, order: existingOrder || null });
        const prefill = aiToOrderValues(data);
        const dlg = $('#modal');
        if (!dlg.open) return false; // user menutup form saat menunggu; jangan buka form order tiba-tiba
        dlg.close();
        orderForm(existingOrder, prefill);
        toast('Hasil AI dimuat, periksa sebelum simpan');
        return false; // dialog sudah diganti form order, jangan ditutup lagi oleh openForm
      },
    });
  }

  // ---------- Event ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const id = el.dataset.id;
    const client = state.clients.find((c) => c.id === state.selectedId);
    switch (el.dataset.action) {
      case 'select-client': if (id !== state.selectedId) { state.filter = 'all'; loadDetail(id); } break;
      case 'add-client': clientForm(null); break;
      case 'edit-client': if (client) clientForm(client); break;
      case 'delete-client':
        if (client && confirm('Hapus klien "' + clientLabel(client) + '" beserta semua order dan lognya? Tindakan ini tidak bisa dibatalkan.')) {
          guard(async () => { await S.deleteClient(client.id); await reloadAll(); toast('Klien dihapus'); });
        }
        break;
      case 'add-order': orderForm(null); break;
      case 'ai-import': aiImportForm(null); break;
      case 'edit-order': orderForm(state.orders.find((o) => o.id === id)); break;
      case 'delete-order':
        if (confirm('Hapus order ini? Log yang terkait tetap disimpan.')) guard(async () => { await S.deleteOrder(id); await reloadAll(); toast('Order dihapus'); });
        break;
      case 'add-log': logForm(null); break;
      case 'edit-log': logForm(state.logs.find((l) => l.id === id)); break;
      case 'delete-log':
        if (confirm('Hapus log ini?')) guard(async () => { await S.deleteLog(id); await reloadAll(); toast('Log dihapus'); });
        break;
      case 'filter': state.filter = el.dataset.type; renderDetail(); break;
      case 'toggle': {
        const body = el.previousElementSibling;
        const clamped = body.classList.toggle('clamp');
        el.textContent = clamped ? 'Tampilkan semua' : 'Ringkas';
        break;
      }
      case 'retry': reloadAll(); break;
    }
  });

  $('#search').addEventListener('input', (e) => { state.search = e.target.value; renderSidebar(); });
  $('#btn-add-client').addEventListener('click', () => clientForm(null));
  $('#modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }); // klik backdrop = tutup

  // Export: unduh JSON
  $('#btn-export').addEventListener('click', () => guard(async () => {
    const data = await S.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logbook-' + todayStr() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Export berhasil');
  }));

  // Import: pilih file JSON, menggantikan semua data
  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Import akan MENGGANTI semua data saat ini dengan isi file. Lanjutkan? (Disarankan export dulu sebagai backup.)')) return;
    guard(async () => {
      const res = await S.importAll(await file.text());
      state.selectedId = null; state.filter = 'all';
      await reloadAll();
      toast('Import berhasil: ' + res.clients + ' klien, ' + res.orders + ' order, ' + res.logs + ' log');
    });
  });

  // ---------- Mulai ----------
  async function init() {
    renderDetail(); // tampilkan state loading
    try {
      if (await S.isEmpty() && window.SEED_DATA) await S.importAll(window.SEED_DATA); // isi data contoh bila kosong
    } catch (e) { console.error(e); }
    await reloadAll();
  }
  init();
})();
