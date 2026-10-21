/**
 * storage.js — DATA LAYER (satu-satunya modul yang boleh menyentuh localStorage)
 *
 * >>> Ganti isi modul ini dengan fetch ke API kalau mau pakai backend
 * >>> (Google Sheets + Apps Script). Selama nama fungsi, argumen, dan bentuk
 * >>> return value di bawah tetap sama, UI (app.js) tidak perlu diubah.
 *
 * KONTRAK (semua async / return Promise, error = Promise reject dengan Error berpesan jelas):
 *   listClients()                  -> Client[]
 *   getClient(id)                  -> Client
 *   createClient(data)             -> Client
 *   updateClient(id, data)         -> Client
 *   deleteClient(id)               -> void   (ikut menghapus order & log milik klien)
 *   listOrders(clientId)           -> Order[]  (terbaru dulu)
 *   createOrder(data)              -> Order
 *   updateOrder(id, data)          -> Order
 *   deleteOrder(id)                -> void   (log yang terkait order tidak dihapus, order_id jadi null)
 *   listLogs(clientId, filter)     -> Log[]    (terbaru dulu; filter: { type?, order_id? })
 *   createLog(data)                -> Log
 *   updateLog(id, data)            -> Log
 *   deleteLog(id)                  -> void
 *   exportAll()                    -> object   (seluruh data, siap di-JSON.stringify)
 *   importAll(json)                -> {clients, orders, logs} jumlah data (MENGGANTI semua data)
 *   isEmpty()                      -> boolean  (dipakai untuk memutuskan perlu seed atau tidak)
 *
 * DATA MODEL (tanggal berformat "YYYY-MM-DD", created_at berformat ISO 8601):
 *   Client: id, fiverr_username, name, country, timezone, first_contact, notes, created_at
 *   Order : id, client_id, fiverr_order_id, gig, order_date, value (number), currency, scope,
 *           delivery_item, preview_link, status (in_progress|delivered|completed|cancelled),
 *           revisions (int), rating (1-5 / null), pricing_note, created_at
 *   Log   : id, client_id, order_id (opsional / null), type (chat|meeting|delivery|revision|note),
 *           date, content, reference_link, meta (object bebas; meeting: {action_items[], recording_link}),
 *           created_at
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'freelance_logbook_v2';
  const LOG_TYPES = ['chat', 'meeting', 'delivery', 'revision', 'note'];
  const ORDER_STATUS = ['in_progress', 'delivered', 'completed', 'cancelled'];

  // Daftar field yang boleh disimpan (whitelist) — field lain dibuang.
  const CLIENT_FIELDS = ['fiverr_username', 'name', 'country', 'timezone', 'first_contact', 'notes'];
  const ORDER_FIELDS = ['client_id', 'fiverr_order_id', 'gig', 'order_date', 'value', 'currency', 'scope',
    'delivery_item', 'preview_link', 'status', 'revisions', 'rating', 'pricing_note'];
  const LOG_FIELDS = ['client_id', 'order_id', 'type', 'date', 'content', 'reference_link', 'meta'];

  // ---------- Helper umum ----------
  const nowIso = () => new Date().toISOString();
  const str = (v) => (v == null ? '' : String(v).trim());
  const pick = (src, fields) => {
    const out = {};
    fields.forEach((f) => { if (src && src[f] !== undefined) out[f] = src[f]; });
    return out;
  };
  function today() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  function uuid() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') return global.crypto.randomUUID();
    // Cadangan kalau crypto.randomUUID tidak tersedia (mis. konteks tidak aman)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 3) | 8).toString(16);
    });
  }

  // ---------- Baca / tulis localStorage ----------
  function load() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { clients: [], orders: [], logs: [] };
      const db = JSON.parse(raw);
      return { clients: db.clients || [], orders: db.orders || [], logs: db.logs || [] };
    } catch (e) {
      throw new Error('Gagal membaca data lokal (data rusak?): ' + e.message);
    }
  }
  function save(db) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      throw new Error('Gagal menyimpan data (penyimpanan browser penuh/diblokir?): ' + e.message);
    }
  }

  // ---------- Normalisasi + validasi per entitas ----------
  function normClient(r) {
    const c = {
      fiverr_username: str(r.fiverr_username).replace(/^@/, ''),
      name: str(r.name),
      country: str(r.country),
      timezone: str(r.timezone),
      first_contact: str(r.first_contact) || today(),
      notes: r.notes == null ? '' : String(r.notes),
    };
    if (!c.fiverr_username && !c.name) throw new Error('Isi minimal username Fiverr atau nama klien.');
    return c;
  }

  function normOrder(r, db) {
    if (!db.clients.some((c) => c.id === r.client_id)) throw new Error('Klien untuk order ini tidak ditemukan.');
    const value = Number(r.value || 0);
    if (!Number.isFinite(value) || value < 0) throw new Error('Nilai order harus angka >= 0.');
    const status = str(r.status) || 'in_progress';
    if (!ORDER_STATUS.includes(status)) throw new Error('Status order tidak valid: ' + status);
    const rating = r.rating === '' || r.rating == null ? null : Number(r.rating);
    if (rating !== null && !(rating >= 1 && rating <= 5)) throw new Error('Rating harus 1-5 atau kosong.');
    const o = {
      client_id: r.client_id,
      fiverr_order_id: str(r.fiverr_order_id),
      gig: str(r.gig),
      order_date: str(r.order_date) || today(),
      value,
      currency: str(r.currency) || 'USD',
      scope: r.scope == null ? '' : String(r.scope),
      delivery_item: r.delivery_item == null ? '' : String(r.delivery_item),
      preview_link: str(r.preview_link),
      status,
      revisions: Math.max(0, parseInt(r.revisions, 10) || 0),
      rating,
      pricing_note: r.pricing_note == null ? '' : String(r.pricing_note),
    };
    if (!o.gig) throw new Error('Nama gig / judul order wajib diisi.');
    return o;
  }

  function normLog(r, db) {
    if (!db.clients.some((c) => c.id === r.client_id)) throw new Error('Klien untuk log ini tidak ditemukan.');
    const type = str(r.type);
    if (!LOG_TYPES.includes(type)) throw new Error('Tipe log tidak valid: ' + type);
    const orderId = r.order_id ? r.order_id : null;
    if (orderId) {
      const ord = db.orders.find((o) => o.id === orderId);
      if (!ord || ord.client_id !== r.client_id) throw new Error('Order yang dipilih tidak ditemukan pada klien ini.');
    }
    const meta = r.meta == null ? {} : r.meta;
    if (typeof meta !== 'object' || Array.isArray(meta)) throw new Error('meta harus berupa object.');
    const l = {
      client_id: r.client_id,
      order_id: orderId,
      type,
      date: str(r.date) || today(),
      content: r.content == null ? '' : String(r.content),
      reference_link: str(r.reference_link),
      meta,
    };
    if (!l.content.trim()) throw new Error('Isi log (content) wajib diisi.');
    return l;
  }

  // ---------- CRUD generik ----------
  function createIn(table, fields, norm, data) {
    const db = load();
    const rec = norm(pick(data, fields), db);
    rec.id = uuid();
    rec.created_at = nowIso();
    db[table].push(rec);
    save(db);
    return rec;
  }
  function updateIn(table, fields, norm, id, data) {
    const db = load();
    const idx = db[table].findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('Data tidak ditemukan (' + table + ': ' + id + ').');
    const old = db[table][idx];
    const rec = norm(Object.assign({}, pick(old, fields), pick(data, fields)), db);
    rec.id = old.id;
    rec.created_at = old.created_at;
    db[table][idx] = rec;
    save(db);
    return rec;
  }
  const byDateDesc = (key) => (a, b) =>
    String(b[key] || '').localeCompare(String(a[key] || '')) || String(b.created_at).localeCompare(String(a.created_at));

  // ---------- API publik ----------
  const api = {
    // Klien
    async listClients() {
      const label = (c) => (c.name || c.fiverr_username || '').toLowerCase();
      return load().clients.sort((a, b) => label(a).localeCompare(label(b)));
    },
    async getClient(id) {
      const c = load().clients.find((x) => x.id === id);
      if (!c) throw new Error('Klien tidak ditemukan: ' + id);
      return c;
    },
    async createClient(data) { return createIn('clients', CLIENT_FIELDS, normClient, data); },
    async updateClient(id, data) { return updateIn('clients', CLIENT_FIELDS, normClient, id, data); },
    async deleteClient(id) {
      const db = load();
      if (!db.clients.some((c) => c.id === id)) throw new Error('Klien tidak ditemukan: ' + id);
      db.clients = db.clients.filter((c) => c.id !== id);
      db.orders = db.orders.filter((o) => o.client_id !== id);
      db.logs = db.logs.filter((l) => l.client_id !== id);
      save(db);
    },

    // Order
    async listOrders(clientId) {
      return load().orders.filter((o) => o.client_id === clientId).sort(byDateDesc('order_date'));
    },
    async createOrder(data) { return createIn('orders', ORDER_FIELDS, normOrder, data); },
    async updateOrder(id, data) { return updateIn('orders', ORDER_FIELDS, normOrder, id, data); },
    async deleteOrder(id) {
      const db = load();
      if (!db.orders.some((o) => o.id === id)) throw new Error('Order tidak ditemukan: ' + id);
      db.orders = db.orders.filter((o) => o.id !== id);
      db.logs.forEach((l) => { if (l.order_id === id) l.order_id = null; }); // log tetap ada
      save(db);
    },

    // Log
    async listLogs(clientId, filter) {
      const f = filter || {};
      return load().logs
        .filter((l) => l.client_id === clientId)
        .filter((l) => !f.type || l.type === f.type)
        .filter((l) => !f.order_id || l.order_id === f.order_id)
        .sort(byDateDesc('date'));
    },
    async createLog(data) { return createIn('logs', LOG_FIELDS, normLog, data); },
    async updateLog(id, data) { return updateIn('logs', LOG_FIELDS, normLog, id, data); },
    async deleteLog(id) {
      const db = load();
      if (!db.logs.some((l) => l.id === id)) throw new Error('Log tidak ditemukan: ' + id);
      db.logs = db.logs.filter((l) => l.id !== id);
      save(db);
    },

    // Backup / restore
    async exportAll() {
      const db = load();
      return { app: 'freelance-logbook', version: 1, exported_at: nowIso(), clients: db.clients, orders: db.orders, logs: db.logs };
    },
    async importAll(json) {
      let data = json;
      if (typeof json === 'string') {
        try { data = JSON.parse(json); } catch (e) { throw new Error('File bukan JSON yang valid: ' + e.message); }
      }
      if (!data || !Array.isArray(data.clients) || !Array.isArray(data.orders) || !Array.isArray(data.logs)) {
        throw new Error('Format salah: harus berisi array "clients", "orders", dan "logs".');
      }
      const all = [].concat(data.clients, data.orders, data.logs);
      if (all.some((r) => !r || typeof r.id !== 'string')) throw new Error('Format salah: setiap data harus punya "id" (string).');
      save({ clients: data.clients, orders: data.orders, logs: data.logs });
      return { clients: data.clients.length, orders: data.orders.length, logs: data.logs.length };
    },

    // Tambahan: cek data kosong (untuk seed)
    async isEmpty() { return load().clients.length === 0; },
  };

  global.LogbookStorage = api;
})(window);
