<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forever 27 | Event Invitations</title>
  <meta name="theme-color" content="#c9933a">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    :root {
      --ink: #0d0d0d;
      --paper: #faf7f2;
      --gold: #c9933a;
      --gold-light: #e8b86d;
      --cream: #f0ead8;
      --muted: #7a7060;
      --success-bg: #e8f5e9;
      --success-text: #2e7d32;
      --pending-bg: #fff3e0;
      --pending-text: #ef6c00;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: var(--paper);
      color: var(--ink);
      font-family: 'DM Sans', sans-serif;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .dashboard { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 8px; }
    .logo span { color: var(--gold); font-style: italic; }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.6rem; margin-bottom: 8px; }
    .header-links { margin-top: 12px; display: flex; gap: 10px; justify-content: center; }

    .card-section {
      background: #ffffff; border: 1px solid var(--cream);
      border-radius: 12px; padding: 30px; margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.01);
    }
    h2 { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }

    .btn {
      padding: 12px 24px; background: var(--gold); color: #ffffff;
      border: none; border-radius: 6px; font-weight: 500; cursor: pointer;
      transition: background 0.2s; font-family: 'DM Sans', sans-serif;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    }
    .btn:hover { background: var(--gold-light); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: var(--cream); color: var(--ink); }
    .btn-secondary:hover { background: #e5dec9; }

    .notice-box {
      background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px;
      padding: 12px 16px; font-size: 0.85rem; color: #2e7d32; margin-bottom: 16px;
    }
    .notice-box.warn { background: #fff3e0; border-color: #ffcc80; color: #ef6c00; }

    .form-group input[type="text"] { flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid var(--cream); border-radius: 6px; background: var(--paper); font-family: 'DM Sans', sans-serif; }
    .form-group { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    input[type="text"], input[type="number"] {
      padding: 12px 16px; border: 1px solid var(--cream);
      border-radius: 6px; background: var(--paper); font-size: 0.95rem; outline: none;
    }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(13,13,13,0.55);
      display: none; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
    }
    .modal-overlay.open { display: flex; }
    .modal-box {
      background: #fff; border-radius: 14px; padding: 26px 24px;
      width: 100%; max-width: 400px; position: relative;
    }
    .modal-box h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 4px; }
    .modal-box .modal-subtitle { font-size: 0.8rem; color: var(--muted); margin-bottom: 18px; }
    .modal-box label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 6px; }
    .modal-box .form-field { margin-bottom: 14px; }
    .modal-box input[type="text"], .modal-box input[type="date"], .modal-box textarea {
      width: 100%; padding: 10px 14px; border: 1px solid var(--cream);
      border-radius: 8px; background: var(--paper); font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem; outline: none;
    }
    .modal-box textarea { resize: vertical; min-height: 60px; }
    .modal-actions { display: flex; gap: 8px; margin-top: 18px; }
    .modal-actions .btn { flex: 1; padding: 10px; font-size: 0.88rem; }
    .modal-close { position: absolute; top: 16px; right: 16px; background: var(--cream); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: var(--muted); font-size: 1rem; }
    .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-top: 20px; }
    .qr-card { background: #fff; border: 1px solid var(--cream); border-radius: 12px; padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 12px rgba(0,0,0,0.01); }
    .qr-container { width: 160px; height: 160px; background: var(--paper); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border-radius: 8px; padding: 10px; }
    .qr-title { font-weight: 700; font-size: 1rem; margin-bottom: 4px; word-break: break-word; }
    .qr-card .ev-meta { margin-bottom: 10px; }
    .qr-card .ev-acts { justify-content: center; margin-top: auto; }
    .cd-badge { display:inline-block; padding:3px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px; background:#f5f5f5; color:#9e9e9e; }
    .cd-badge.marked { background:#e3ecfb; color:#2c4a8f; }
    .cd-badge.created { background:var(--success-bg); color:var(--success-text); }
    .cd-badge.sold { background:#fff8e1; color:#7a6020; }
    .card-actions { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; width:100%; margin-top:auto; }
    .card-actions .btn { padding:8px 12px; font-size:0.82rem; }
    .cd-id { font-family:monospace; font-weight:700; font-size:1.05rem; letter-spacing:0.05em; margin-bottom:6px; }
    .view-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
    .filter-btn { padding: 6px 14px; border: 1px solid var(--cream); border-radius: 20px; background: #fff; color: var(--muted); font-size: 0.8rem; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; }
    .filter-btn.active { background: var(--gold); color: #fff; border-color: var(--gold); }
    .ev-row { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding:14px 0; border-bottom:1px solid var(--cream); }
    .ev-row:last-child { border-bottom:none; }
    .ev-title { font-weight:500; }
    .ev-meta { font-size:0.8rem; color:var(--muted); }
    .ev-acts { display:flex; gap:6px; flex-wrap:wrap; }
    .ev-acts .btn { font-size:0.78rem; padding:6px 12px; }
    .ev-badge { display:inline-block; padding:1px 9px; border-radius:10px; font-size:0.72rem; background:var(--success-bg); color:var(--success-text); margin-left:6px; }
    .ev-badge.disabled { background:#fde8e8; color:#a12a2a; }
    #ev-modal-body img.ev-qr { width:220px; height:220px; display:block; margin:12px auto; }
    #ev-modal-body code { display:block; word-break:break-all; font-size:0.75rem; margin:8px 0; color:var(--muted); }
    #ev-modal-body select, #ev-modal-body input[type="number"] { width:100%; padding:10px 14px; border:1px solid var(--cream); border-radius:8px; background:var(--paper); font-family:'DM Sans',sans-serif; font-size:0.9rem; }
    #ev-modal-body ul { padding-left:18px; margin-top:10px; }
    #ev-modal-body .ev-f input:not([type="checkbox"]):not([type="file"]), #ev-modal-body .ev-f select, #ev-modal-body .ev-f textarea { width:100%; padding:9px 12px; border:1px solid var(--cream); border-radius:8px; background:var(--paper); font-family:'DM Sans',sans-serif; font-size:0.88rem; }
    #ev-modal-body .ev-f { margin-bottom:12px; } #ev-modal-body .ev-f label { display:block; font-size:0.8rem; font-weight:500; margin-bottom:5px; }
    #ev-modal-body .ev-thumb { max-width:100%; max-height:110px; border-radius:6px; display:block; margin-bottom:6px; }
    #ev-edit-form { max-height:70vh; overflow-y:auto; padding-right:4px; }
  </style>
</head>
<body>

<script>
  // Auth guard: same login/session as admin.html (full admin accounts only).
  const SESSION_KEY = 'f27_admin_auth';
  const BACKEND_API_BASE = localStorage.getItem('videogift_api_url') || 'https://videogift-backend-3.onrender.com';
  function getSession() { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  function getAuthToken() {
    const s = getSession();
    return (s && s.token && s.expires > Date.now()) ? s.token : null;
  }
  function authHeaders(extra = {}) {
    const token = getAuthToken();
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}), ...extra };
  }
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, { ...options, headers: authHeaders(options.headers || {}) });
    if (res.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.replace('login.html');
      throw new Error('Session expired.');
    }
    return res;
  }
  (async function authGuard() {
    const token = getAuthToken();
    if (!token) { window.location.replace('login.html'); return; }
    try {
      const res = await fetch(`${BACKEND_API_BASE}/api/admin/verify`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { sessionStorage.removeItem(SESSION_KEY); window.location.replace('login.html'); return; }
      const data = await res.json().catch(() => ({}));
      if (data.role && data.role !== 'admin') window.location.replace('postcards.html');
    } catch (err) {
      console.warn('Token verification skipped: backend unreachable.');
    }
  })();
</script>

<div class="dashboard">
  <div class="header">
    <div class="logo">Forever<span>27</span></div>
    <h1>🎉 Event Invitations</h1>
    <div class="header-links">
      <button class="btn btn-secondary" style="font-size:0.8rem; padding:8px 18px;" onclick="window.location.href='admin.html'">← Back to Dashboard</button>
    </div>
  </div>

  <div class="card-section" id="cards-section">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <h2>🔳 Card QR codes: pick one to create an event</h2>
      <button class="btn btn-secondary" onclick="loadCardQrs()">🔄 Refresh</button>
    </div>
    <div class="form-group"><input type="text" id="cd-search" placeholder="Search card code" oninput="renderCardQrs(true)"></div>
    <div class="view-toggle" id="cd-filters">
      <button class="filter-btn active" data-f="available">Available <span></span></button>
      <button class="filter-btn" data-f="marked">Event cards, no event yet <span></span></button>
      <button class="filter-btn" data-f="created">Event created <span></span></button>
      <button class="filter-btn" data-f="all">All <span></span></button>
    </div>
    <div class="ev-meta" id="cd-msg" role="status">Loading…</div>
    <div class="qr-grid" id="cd-grid"></div>
    <div style="text-align:center;margin-top:18px;"><button class="btn btn-secondary" id="cd-more" style="display:none;" onclick="showMoreCards()">Show more</button></div>
  </div>

  <div class="card-section" id="events-section">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <h2>🎉 Event Invitations</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.open('create-event.html','_blank')">➕ New Event</button>
        <button class="btn btn-secondary" onclick="loadEvents()">🔄 Refresh</button>
      </div>
    </div>
    <div class="form-group"><input type="text" id="ev-search" placeholder="Search title, host or venue" oninput="renderEvents()"><select id="ev-type" onchange="renderEvents()" aria-label="Filter by type" style="padding:12px 16px;border:1px solid var(--cream);border-radius:6px;background:var(--paper);"><option value="">All types</option><option value="seminar">Seminar</option><option value="wedding">Wedding</option><option value="birthday">Birthday</option><option value="church">Church / religious</option><option value="memorial">Memorial</option><option value="general">Other</option></select></div>
    <div class="view-toggle"><button class="filter-btn active" id="vw-grid" onclick="setEvView('grid')">🔳 QR codes</button><button class="filter-btn" id="vw-list" onclick="setEvView('list')">☰ List</button></div>
    <div class="ev-meta" id="ev-msg" role="status">Loading…</div>
    <div id="ev-list"></div>
</div>

<div class="modal-overlay" id="ev-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="closeEvModal()">✕</button>
    <div id="ev-modal-body"></div>
  </div>
</div>

<script>
// ===== Card QR codes (same cards as the admin dashboard) =====
(function () {
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const base = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
  const watchUrl = id => base + 'watch.html?id=' + id;
  let ids = [], buyers = {}, evCards = new Set(), evByCard = {}, filter = 'available', shown = 60, lastLoad = 0;

  const isSold = id => { const b = buyers[id]; return !!(b && (b.buyerName || b.buyerContact || b.buyerNote || (b.price !== null && b.price !== undefined))); };
  const stateOf = id => evByCard[id] ? 'created' : evCards.has(id) ? 'marked' : 'available';
  const sorted = a => [...a].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));

  window.loadCardQrs = async function () {
    $('cd-msg').textContent = 'Loading…'; lastLoad = Date.now();
    try {
      const r = await apiFetch(BACKEND_API_BASE + '/api/admin/cards');
      if (!r.ok) throw new Error('Could not load cards.');
      const d = await r.json();
      ids = sorted(d.ids || []); buyers = d.buyers || {}; evCards = new Set(d.eventCards || []); evByCard = d.eventsByCard || {};
      renderCardQrs(true);
    } catch (x) { $('cd-msg').textContent = x.message; }
  };

  function visible() {
    const q = $('cd-search').value.trim().toLowerCase();
    return ids.filter(id => (filter === 'all' || stateOf(id) === filter) && (!q || id.toLowerCase().includes(q)));
  }
  window.renderCardQrs = function (reset) {
    if (reset) shown = 60;
    document.querySelectorAll('#cd-filters button').forEach(b => {
      const f = b.dataset.f;
      b.classList.toggle('active', f === filter);
      b.lastElementChild.textContent = '(' + (f === 'all' ? ids.length : ids.filter(id => stateOf(id) === f).length) + ')';
    });
    const list = visible(), grid = $('cd-grid'), page = list.slice(0, shown);
    $('cd-msg').textContent = list.length + ' of ' + ids.length + ' cards';
    $('cd-more').style.display = list.length > shown ? '' : 'none';
    grid.innerHTML = page.map(id => {
      const st = stateOf(id);
      const badge = st === 'created' ? '<span class="cd-badge created">✅ Event created</span>' : st === 'marked' ? '<span class="cd-badge marked">🎉 Event card</span>' : '<span class="cd-badge">Available</span>';
      const acts = st === 'created'
        ? `<button class="btn btn-secondary" data-act="view">✅ Event created · View</button>`
        : st === 'marked'
        ? `<button class="btn btn-secondary" data-act="create">🎉 Create Event</button><button class="btn btn-secondary" data-act="unmark">✕ Unmark</button>`
        : `<button class="btn btn-secondary" data-act="use">🎉 Use for Event</button>`;
      return `<div class="qr-card" data-id="${esc(id)}">
        <div class="qr-container" id="cq-${esc(id)}"></div>
        <div class="cd-id">${esc(id)}</div>
        <div>${badge}${isSold(id) ? ' <span class="cd-badge sold">🧾 Sold</span>' : ''}</div>
        <div class="card-actions">${acts}</div></div>`;
    }).join('');
    page.forEach(id => new QRCode($('cq-' + id), { text: watchUrl(id), width: 140, height: 140, correctLevel: QRCode.CorrectLevel.M }));
  };
  window.showMoreCards = () => { shown += 60; renderCardQrs(false); };

  // Marks/unmarks a card as an event card. A printed card answers 409 + locked:true; confirm before forcing.
  async function setEventCard(id, enable) {
    const send = async force => {
      const res = await apiFetch(BACKEND_API_BASE + '/api/gift/' + id + '/event-card', { method: 'PATCH', body: JSON.stringify({ enabled: enable, force }) });
      return { res, data: await res.json().catch(() => ({})) };
    };
    let { res, data } = await send(false);
    if (res.status === 409 && data.locked) {
      const when = data.printedAt && !isNaN(new Date(data.printedAt)) ? ' on ' + new Date(data.printedAt).toLocaleDateString() : '';
      if (!confirm('\uD83D\uDD12 Card ' + id + ' is already printed' + when + (data.design ? ' (design: ' + data.design + ')' : '') + ' and locked.\n\nThe QR on the physical card was made for that print. Use it for an event anyway?')) return false;
      ({ res, data } = await send(true));
    }
    if (!res.ok) throw new Error(data.error || 'Server error');
    if (enable) evCards.add(id); else evCards.delete(id);
    renderCardQrs(false);
    return true;
  }
  const createUrl = id => 'create-event.html?code=' + encodeURIComponent(id);

  $('cd-grid').addEventListener('click', async ev => {
    const b = ev.target.closest('button[data-act]'); if (!b) return;
    const id = b.closest('.qr-card').dataset.id, act = b.dataset.act;
    if (act === 'create') return void window.open(createUrl(id), '_blank');
    if (act === 'view') return void window.open(new URL('event.html', location.href).href + '?e=' + encodeURIComponent(evByCard[id]), '_blank');
    if (act === 'unmark') { if (!confirm('Unmark ' + id + ' as an event card?')) return; try { await setEventCard(id, false); } catch (x) { alert('Could not update card: ' + x.message); } return; }
    if (act === 'use') {
      const win = window.open('', '_blank'); // open first so the popup is not blocked
      try {
        const done = await setEventCard(id, true);
        if (done && win) win.location.href = createUrl(id); else if (win) win.close();
      } catch (x) { if (win) win.close(); alert('Could not use this card for an event: ' + x.message); }
    }
  });
  $('cd-filters').addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (b) { filter = b.dataset.f; renderCardQrs(true); } });

  // Coming back from the create-event tab: pick up the new event without a manual reload
  const refresh = () => { if (!document.hidden && Date.now() - lastLoad > 5000) { loadCardQrs(); if (window.loadEvents) loadEvents(); } };
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', refresh);
  loadCardQrs();
})();
</script>
<script>
// ===== Event invitations (admin) — uses this page's existing login session =====
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const evLink = slug => { const u = new URL('event.html', location.href); u.search = '?e=' + slug; return u.href; };
  let events = [];

  async function evApi(path, opt) {
    const r = await apiFetch(BACKEND_API_BASE + path, opt || {});
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || d.message || ('Request failed (' + r.status + ')'));
    return d;
  }
  function qrDataUrl(text, size) {
    const box = document.createElement('div');
    new QRCode(box, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.H });
    const c = box.querySelector('canvas');
    return c ? c.toDataURL('image/png') : box.querySelector('img').src;
  }
  const say = t => { $('ev-msg').textContent = t; };
  function openModal(html) { $('ev-modal-body').innerHTML = html; $('ev-modal').classList.add('open'); }
  window.closeEvModal = () => $('ev-modal').classList.remove('open');

  function evMeta(e) {
    const dl = normDays(e.days).sort((a, b) => a.date.localeCompare(b.date));
    const pd = d => { const [y, m, dd] = d.date.split('-').map(Number); return new Date(y, m - 1, dd); };
    let t = e.type, when = e.event_date ? new Date(e.event_date).toLocaleDateString() : '';
    if (e.type === 'seminar' && dl.length) {
      t = '🎓 seminar · ' + dl.length + (dl.length === 1 ? ' day' : ' days');
      when = dl.length === 1 ? pd(dl[0]).toLocaleDateString() : pd(dl[0]).toLocaleDateString() + ' to ' + pd(dl[dl.length - 1]).toLocaleDateString();
    }
    return esc(t) + (e.host_names ? ' · ' + esc(e.host_names) : '') + (when ? ' · ' + esc(when) : '');
  }
  let evView = 'grid';
  window.setEvView = v => { evView = v; $('vw-grid').classList.toggle('active', v === 'grid'); $('vw-list').classList.toggle('active', v === 'list'); renderEvents(); };
  const evButtons = e => `
          <button class="btn btn-secondary" data-act="edit">✏️ Edit</button>
          <button class="btn btn-secondary" data-act="qr">QR</button>
          <button class="btn btn-secondary" data-act="copy">Copy link</button>
          <button class="btn btn-secondary" data-act="hostlink">🔑 Host edit link</button>
          <button class="btn btn-secondary" data-act="print">🖨️ Print cards</button>
          <button class="btn btn-secondary" data-act="replies">Replies</button>
          <button class="btn btn-secondary" data-act="toggle">${e.status === 'live' ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-secondary" data-act="delete" style="color:#a12a2a;">Delete</button>`;
  function renderQrGrid(list, box) {
    box.innerHTML = '<div class="qr-grid">' + list.map((e, i) => `
      <div class="qr-card">
        <div class="qr-container" id="ev-qr-${i}"></div>
        <div class="qr-title">${esc(e.title)}<span class="ev-badge ${esc(e.status)}">${esc(e.status)}</span></div>
        <div class="ev-meta">${evMeta(e)} · ${e.replies} replies, ${e.coming} coming${e.gift_id ? ' · code ' + esc(e.gift_id) : ''}</div>
        <div class="ev-acts" data-slug="${esc(e.slug)}">${evButtons(e)}</div>
      </div>`).join('') + '</div>';
    list.forEach((e, i) => new QRCode($('ev-qr-' + i), { text: evLink(e.slug), width: 140, height: 140, correctLevel: QRCode.CorrectLevel.H }));
  }
  window.renderEvents = function () {
    const q = $('ev-search').value.toLowerCase(), box = $('ev-list');
    const tf = $('ev-type').value;
    const list = events.filter(e => (!tf || e.type === tf) && [e.title, e.host_names, e.venue].join(' ').toLowerCase().includes(q));
    if (evView === 'grid') { if (list.length) renderQrGrid(list, box); else box.innerHTML = ''; return; }
    box.innerHTML = list.map(e => `
      <div class="ev-row">
        <div>
          <div class="ev-title">${esc(e.title)}<span class="ev-badge ${esc(e.status)}">${esc(e.status)}</span></div>
          <div class="ev-meta">${evMeta(e)} · ${e.replies} replies, ${e.coming} coming${e.gift_id ? ' · code ' + esc(e.gift_id) : ''}</div>${e.type === 'seminar' && normDays(e.days).length ? '<div class="ev-meta">' + normDays(e.days).map(d => esc(d.title)).join(' | ') + '</div>' : ''}
        </div>
        <div class="ev-acts" data-slug="${esc(e.slug)}">
          <button class="btn btn-secondary" data-act="edit">✏️ Edit</button>
          <button class="btn btn-secondary" data-act="qr">QR</button>
          <button class="btn btn-secondary" data-act="copy">Copy link</button>
          <button class="btn btn-secondary" data-act="hostlink">🔑 Host edit link</button>
          <button class="btn btn-secondary" data-act="print">🖨️ Print cards</button>
          <button class="btn btn-secondary" data-act="replies">Replies</button>
          <button class="btn btn-secondary" data-act="toggle">${e.status === 'live' ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-secondary" data-act="delete" style="color:#a12a2a;">Delete</button>
        </div>
      </div>`).join('');
    if (!list.length) box.innerHTML = '';
  };

  window.loadEvents = async function () {
    say('Loading…');
    try {
      events = await evApi('/api/admin/events');
      say(events.length ? events.length + ' events' : 'No events yet.');
      renderEvents();
    } catch (x) { say(x.message); }
  };

  function showQR(e) {
    const url = evLink(e.slug), img = qrDataUrl(url, 400);
    openModal(`<h3>${esc(e.title)}</h3><div class="modal-subtitle">Invitation QR code</div>
      <img class="ev-qr" src="${img}" alt="QR code"><code>${esc(url)}</code>
      <div class="modal-actions"><a class="btn" download="qr-${esc(e.slug)}.png" href="${img}" style="text-align:center;text-decoration:none;">Download PNG</a></div>`);
  }
  async function showReplies(e) {
    try {
      const rows = await evApi('/api/admin/events/' + e.slug + '/rsvps');
      openModal(`<h3>${esc(e.title)}</h3><div class="modal-subtitle">Guest replies</div><ul>` +
        (rows.length ? rows.map(r => `<li>${esc(r.guest_name)}: ${r.attending ? 'coming (' + (r.guests || 1) + ')' : 'not coming'}</li>`).join('') : '<li>No replies yet.</li>') + '</ul>');
    } catch (x) { say(x.message); }
  }
  function printOptions(e) {
    openModal(`<h3>Print invitation cards</h3><div class="modal-subtitle">${esc(e.title)}</div>
      <div class="form-field"><label for="ev-qty">Number of cards</label><input type="number" id="ev-qty" min="1" max="500" value="4"></div>
      <div class="form-field"><label for="ev-lay">Layout</label><select id="ev-lay"><option value="card">Card, A6 (4 per A4 page)</option><option value="tag">Small tag, 90×55 mm (10 per page)</option></select></div>
      <div class="modal-actions"><button class="btn" id="ev-go-print">Open print view</button></div>`);
    $('ev-go-print').onclick = () => printCards(e, Math.min(Math.max(parseInt($('ev-qty').value) || 1, 1), 500), $('ev-lay').value);
  }
  function printCards(e, n, layout) {
    if (e.status !== 'live') { alert('This event is disabled. Enable it before printing so the QR codes work.'); return; }
    const url = evLink(e.slug), img = qrDataUrl(url, 400), tag = layout === 'tag';
    const dl = normDays(e.days).sort((a, b) => a.date.localeCompare(b.date));
    const pd = d => { const [y, m, dd] = d.date.split('-').map(Number); return new Date(y, m - 1, dd); };
    const when = dl.length
      ? (dl.length === 1 ? pd(dl[0]).toLocaleDateString([], { dateStyle: 'long' }) : pd(dl[0]).toLocaleDateString([], { day: 'numeric', month: 'long' }) + ' to ' + pd(dl[dl.length - 1]).toLocaleDateString([], { dateStyle: 'long' }))
      : (e.event_date ? new Date(e.event_date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) : '');
    const one = tag
      ? `<div class="card ${esc(e.type)} tag"><img src="${img}" alt=""><div><h2>${esc(e.title)}</h2>${when ? `<p>${esc(when)}</p>` : ''}<p class="scan">Scan for photo, video and details</p><small>${esc(url)}</small></div></div>`
      : `<div class="card ${esc(e.type)}"><h2>${esc(e.title)}</h2>${e.host_names ? `<p>${esc(e.host_names)}</p>` : ''}${when ? `<p>${esc(when)}</p>` : ''}${e.venue ? `<p>${esc(e.venue)}</p>` : ''}<img src="${img}" alt=""><p class="scan">Scan to see your invitation</p><small>${esc(url)}</small></div>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { alert('Please allow pop-ups to print.'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print invitation cards</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=DM+Sans:wght@400;500&family=Noto+Sans+Ethiopic:wght@400;600&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0} *{box-sizing:border-box} body{margin:0;font-family:'DM Sans','Noto Sans Ethiopic',sans-serif;color:#123c40}
.sheet{display:grid;grid-template-columns:repeat(2,${tag ? '90mm' : '105mm'});justify-content:center}
.card{width:105mm;height:148mm;padding:9mm;display:flex;flex-direction:column;align-items:center;text-align:center;border:.2mm dashed #bbb;overflow:hidden;break-inside:avoid}
.card.tag{width:90mm;height:55mm;padding:4mm;flex-direction:row;gap:4mm;text-align:left}
h2{font:700 19pt/1.1 'Fraunces','Noto Sans Ethiopic',serif;margin:4mm 0 2mm} .tag h2{font-size:12pt;margin:0 0 1mm}
p{margin:0 0 1.5mm;font-size:10pt} .card img{width:52mm;height:52mm;margin:auto 0 2mm} .tag img{width:38mm;height:38mm;margin:0;flex:none}
small{font-size:7.5pt;word-break:break-all;opacity:.8} .scan{font-size:9pt;font-weight:500}
.wedding{border-top:3mm solid #b08d57}.birthday{border-top:3mm solid #1f3fbf}.church{border-top:3mm solid #2f6b52}.memorial{border-top:3mm solid #555}.general{border-top:3mm solid #0f5257}.seminar{border-top:3mm solid #2c4a8f}
</style></head><body><div class="sheet">${one.repeat(n)}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},600)}<\/script></body></html>`);
    w.document.close();
  }
  function normDays(v) {
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = []; } }
    return Array.isArray(v) ? v.filter(d => d && d.date) : [];
  }
  function addDayRow(d) {
    d = d || {};
    const r = document.createElement('div');
    r.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed #ddd;';
    r.innerHTML = '<input type="date" class="dd-date"><input type="time" class="dd-time"><input type="text" class="dd-title" maxlength="120" placeholder="Title for this day" style="grid-column:1/-1;"><button type="button" class="btn btn-secondary" style="justify-self:start;">Remove</button>';
    r.querySelector('.dd-date').value = d.date || ''; r.querySelector('.dd-time').value = d.time || ''; r.querySelector('.dd-title').value = d.title || '';
    r.querySelector('button').onclick = () => r.remove();
    $('ev-days').append(r);
  }
  function readDayRows() {
    return Array.from($('ev-days').children).map(r => ({ date: r.querySelector('.dd-date').value, time: r.querySelector('.dd-time').value, title: r.querySelector('.dd-title').value.trim() }));
  }
  function showEdit(e) {
    const loc = d => { if (!d) return ''; const t = new Date(d); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 16); };
    const types = ['wedding', 'birthday', 'seminar', 'church', 'memorial', 'general'];
    const photos = (e.photo_urls && e.photo_urls.length) ? e.photo_urls : (e.photo_url ? [e.photo_url] : []);
    openModal(`<h3>Edit event</h3><div class="modal-subtitle">The QR code and link stay the same.</div>
      <form id="ev-edit-form">
        <div class="ev-f"><label>Type</label><select name="type">${types.map(t => `<option value="${t}"${t === e.type ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="ev-f"><label>Title</label><input type="text" name="title" required maxlength="120" value="${esc(e.title)}"></div>
        <div class="ev-f"><label>Hosts</label><input type="text" name="host_names" maxlength="120" value="${esc(e.host_names)}"></div>
        <div class="ev-f"><label>Date and time</label><input type="datetime-local" name="event_date" value="${loc(e.event_date)}"></div>
        <div class="ev-f" id="ev-days-wrap" style="display:none;"><label>Seminar days (date, time, title). You can rename titles any time.</label><div id="ev-days"></div><button type="button" class="btn btn-secondary" id="ev-add-day">➕ Add day</button></div>
        <div class="ev-f"><label>Venue</label><input type="text" name="venue" maxlength="200" value="${esc(e.venue)}"></div>
        <div class="ev-f"><label>Map link</label><input type="url" name="map_url" value="${esc(e.map_url)}"></div>
        <div class="ev-f"><label>Message</label><textarea name="message" maxlength="1000">${esc(e.message)}</textarea></div>
        <div class="ev-f"><label><input type="checkbox" name="rsvp_enabled" ${e.rsvp_enabled ? 'checked' : ''}> Allow guest replies (RSVP)</label></div>
        <div class="ev-f"><label>Photos (up to 3, shown as a slideshow)</label>${photos.map(u => `<div><img class="ev-thumb" src="${esc(u)}" alt=""><label><input type="checkbox" class="ev-rm-photo" value="${esc(u)}"> Remove this photo</label></div>`).join('') || '<small>No photos yet.</small>'}<input type="file" name="photo" multiple accept="image/jpeg,image/png,image/webp"></div>
        <div class="ev-f"><label>Video</label>${e.video_url ? `<video class="ev-thumb" src="${esc(e.video_url)}" controls preload="metadata"></video><label><input type="checkbox" name="remove_video"> Remove current video</label>` : '<small>No video yet.</small>'}<input type="file" name="video" accept="video/mp4,video/quicktime,video/webm"></div>
        <div class="modal-actions"><button class="btn" type="submit" id="ev-save">Save changes</button></div>
        <div class="ev-meta" id="ev-save-msg" role="status"></div>
      </form>`);
    const syncDays = () => { $('ev-days-wrap').style.display = $('ev-edit-form').type.value === 'seminar' ? '' : 'none'; };
    normDays(e.days).forEach(addDayRow);
    if (e.type === 'seminar' && !$('ev-days').children.length) addDayRow();
    $('ev-edit-form').type.onchange = () => { syncDays(); if ($('ev-edit-form').type.value === 'seminar' && !$('ev-days').children.length) addDayRow(); };
    $('ev-add-day').onclick = () => { if ($('ev-days').children.length < 14) addDayRow(); };
    syncDays();
    $('ev-edit-form').onsubmit = async ev => {
      ev.preventDefault();
      const f = ev.target, fd = new FormData();
      ['type', 'title', 'host_names', 'venue', 'map_url', 'message'].forEach(k => fd.set(k, f[k].value));
      fd.set('event_date', f.event_date.value ? new Date(f.event_date.value).toISOString() : '');
      fd.set('rsvp_enabled', f.rsvp_enabled.checked ? 'true' : 'false');
      if (f.type.value === 'seminar') {
        const days = readDayRows();
        if (!days.length || days.some(d => !d.date || !d.title)) { $('ev-save-msg').textContent = 'Each seminar day needs a date and a title.'; return; }
        days.sort((a, b) => a.date.localeCompare(b.date));
        fd.set('days', JSON.stringify(days));
      } else if (f.type.value === 'wedding') fd.set('days', JSON.stringify(normDays(e.days)));
      else fd.set('days', '[]');
      if (f.remove_video && f.remove_video.checked) fd.set('remove_video', '1');
      const removed = Array.from(document.querySelectorAll('.ev-rm-photo')).filter(c => c.checked).map(c => c.value);
      const keep = photos.filter(u => !removed.includes(u)), added = Array.from(f.photo.files);
      if (keep.length + added.length > 3) { $('ev-save-msg').textContent = 'Maximum 3 photos. Remove one first or choose fewer files.'; return; }
      fd.set('keep_photos', JSON.stringify(keep)); added.forEach(x => fd.append('photo', x));
      if (f.video.files[0]) fd.set('video', f.video.files[0]);
      $('ev-save').disabled = true; $('ev-save-msg').textContent = 'Saving…';
      try {
        const r = await fetch(BACKEND_API_BASE + '/api/admin/events/' + e.slug + '/edit', { method: 'POST', headers: { Authorization: 'Bearer ' + getAuthToken() }, body: fd });
        if (r.status === 401) { sessionStorage.removeItem(SESSION_KEY); location.replace('login.html'); return; }
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || ('Save failed (' + r.status + ').'));
        closeEvModal(); say('Event updated.'); loadEvents();
      } catch (x) { $('ev-save-msg').textContent = x.message; $('ev-save').disabled = false; }
    };
  }

  async function toggle(e) {
    const next = e.status === 'live' ? 'disabled' : 'live';
    if (next === 'disabled' && !confirm('Disable this event? Its QR code will show "not found" until you enable it again.')) return;
    try { await evApi('/api/admin/events/' + e.slug, { method: 'PATCH', body: JSON.stringify({ status: next }) }); e.status = next; say('Status set to ' + next + '.'); renderEvents(); }
    catch (x) { say(x.message); }
  }
  async function del(e) {
    if (!confirm('Delete "' + e.title + '" and its photo and video? Printed QR codes will stop working. This cannot be undone.')) return;
    try { await evApi('/api/admin/events/' + e.slug, { method: 'DELETE' }); events = events.filter(x => x !== e); say('Event deleted.'); renderEvents(); }
    catch (x) { say(x.message); }
  }

  $('ev-list').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-act]'); if (!b) return;
    const e = events.find(x => x.slug === b.parentElement.dataset.slug); if (!e) return;
    ({ edit: showEdit, qr: showQR, print: printOptions, replies: showReplies, toggle: toggle, delete: del,
       copy: e => navigator.clipboard.writeText(evLink(e.slug)).then(() => say('Link copied.')),
       hostlink: async e => {
         try {
           const d = await evApi('/api/admin/events/' + e.slug + '/edit-link');
           const u = new URL('edit-event.html', location.href); u.search = '?e=' + e.slug; u.hash = 'k=' + d.edit_token;
           await navigator.clipboard.writeText(u.href);
           say('Host edit link copied. Send it only to the host of "' + e.title + '".');
         } catch (x) { say(x.message); }
       } })[b.dataset.act](e);
  });

  loadEvents();
})();
</script>
</body>
</html>
