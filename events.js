// events.js — invitation events API. Mount from server.js (see bottom of this file).
const crypto = require('crypto');

module.exports = function ({ express, multer, supabase, r2, PutObjectCommand, DeleteObjectCommand, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE, requireAuth, requireAdmin, verifyToken }) {
  const router = express.Router();
  const TYPES = ['wedding', 'birthday', 'seminar', 'church', 'memorial', 'general'];

  // Seminar days: [{ date:'YYYY-MM-DD', time:'HH:MM' | '', title }] - returns cleaned, date-sorted array, or null if invalid
  function parseDays(raw) {
    let a = raw;
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch { return null; } }
    if (!Array.isArray(a) || a.length > 14) return null;
    const out = [];
    for (const d of a) {
      if (!d || typeof d.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || isNaN(new Date(d.date + 'T00:00:00Z'))) return null;
      const time = typeof d.time === 'string' ? d.time : '';
      if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
      const title = typeof d.title === 'string' ? d.title.trim().slice(0, 120) : '';
      if (!title) return null;
      out.push({ date: d.date, time, title });
    }
    return out.sort((x, y) => x.date.localeCompare(y.date) || x.time.localeCompare(y.time));
  }

  const up = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, f, cb) => {
      const ok = (f.fieldname === 'photo' && /^image\/(jpeg|png|webp)$/.test(f.mimetype)) ||
                 (f.fieldname === 'video' && /^video\/(mp4|quicktime|webm)$/.test(f.mimetype));
      cb(ok ? null : new Error('INVALID_FILE_TYPE'), ok);
    }
  }).fields([{ name: 'photo', maxCount: 3 }, { name: 'video', maxCount: 1 }]);

  // ---------- Card codes: one sold "event" card = one event ----------
  const isAdminReq = req => {
    try { const t = (req.headers.authorization || '').replace(/^Bearer /, ''); return !!(t && verifyToken && verifyToken(t).role === 'admin'); }
    catch { return false; }
  };
  // Small per-IP throttle so codes can't be guessed in bulk (20 tries / 10 min)
  const hits = new Map(), scanHits = new Map();
  const throttled = (req, max = 20, store = hits) => {
    const ip = ((req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip || '').trim(), now = Date.now();
    const h = (store.get(ip) || []).filter(t => now - t < 600000); h.push(now); store.set(ip, h);
    if (store.size > 5000) store.clear();
    return h.length > max;
  };
  async function checkCode(raw) {
    const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return { status: 400, error: 'Enter the code printed on your event card.' };
    const { data: g } = await supabase.from('gifts').select('id,sold_at,product_type').eq('id', code).single();
    if (!g) return { status: 404, error: 'That code was not found. Please check the code on your card.' };
    // An admin marks a card as an event card (product_type 'event'). No buyer details or sale record needed.
    if (g.product_type !== 'event') return { status: 403, error: 'This card has not been activated as an event invitation card yet. Please contact the shop.' };
    const { data: used } = await supabase.from('events').select('slug').eq('gift_id', code).maybeSingle();
    if (used) return { status: 409, error: 'This card has already been used for an event.' };
    return { code };
  }
  // Lets the create page check a code before the host uploads photos and video
  router.post('/event-code/check', async (req, res) => {
    if (throttled(req)) return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    const r = await checkCode(req.body && req.body.code);
    if (r.error) return res.status(r.status).json({ error: r.error });
    res.json({ valid: true });
  });

  // What should scanning this card do? Used by event.html and by watch.html / upload.html.
  //   none    -> not a sold event card (normal gift behaviour)
  //   ready   -> sold as an event card, no event created yet (show "create your invitation")
  //   created -> event exists (show it)
  // Reveals nothing else about the card. Higher limit than code entry because a whole venue can scan from one IP.
  router.get('/event-code/:code/status', async (req, res) => {
    if (throttled(req, 300, scanHits)) return res.status(429).json({ error: 'Too many requests.' });
    const code = String(req.params.code || '').trim().toUpperCase();
    const { data: g } = await supabase.from('gifts').select('id,sold_at,product_type').eq('id', code).single();
    if (!g || g.product_type !== 'event') return res.json({ state: 'none' });
    const { data: ev } = await supabase.from('events').select('slug').eq('gift_id', code).maybeSingle();
    res.json(ev ? { state: 'created', slug: ev.slug } : { state: 'ready' });
  });

  async function putFile(f, slug) {
    const ext = (f.originalname.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `events/${slug}-${f.fieldname}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: f.buffer, ContentType: f.mimetype }));
    return `${R2_PUBLIC_URL_BASE}/${key}`;
  }

  // Create event -> returns public slug + secret edit token
  router.post('/events', (req, res) => {
    up(req, res, async (err) => {
      if (err) return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50 MB).' : 'Unsupported file type.' });
      try {
        const b = req.body || {};
        if (!b.title || !b.title.trim()) return res.status(400).json({ error: 'Title is required.' });
        // Hosts need a sold event-card code. Admin sessions may skip it (or attach one).
        let gift_id = null;
        if (!isAdminReq(req) || (b.code && String(b.code).trim())) {
          if (throttled(req)) return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
          const c = await checkCode(b.code);
          if (c.error) return res.status(c.status).json({ error: c.error });
          gift_id = c.code;
        }
        const slug = crypto.randomBytes(9).toString('base64url');
        const edit_token = crypto.randomBytes(24).toString('base64url');
        const type = TYPES.includes(b.type) ? b.type : 'general';
        let days = [];
        if (type === 'seminar') {
          days = parseDays(b.days);
          if (!days || !days.length) return res.status(400).json({ error: 'Add at least one seminar day, each with a date and a title (max 14 days).' });
        }
        const files = req.files || {};
        const row = {
          slug, edit_token, type, gift_id,
          title: b.title.trim().slice(0, 120),
          host_names: (b.host_names || '').slice(0, 120),
          event_date: b.event_date ? new Date(b.event_date).toISOString() : null,
          venue: (b.venue || '').slice(0, 200),
          map_url: /^https?:\/\//.test(b.map_url || '') ? b.map_url : null,
          message: (b.message || '').slice(0, 1000),
          days,
          photo_urls: [],
          photo_url: null,
          video_url: files.video ? await putFile(files.video[0], slug) : null,
          rsvp_enabled: type !== 'memorial' && b.rsvp_enabled !== 'false'
        };
        if (files.photo) {
          for (const f of files.photo.slice(0, 3)) row.photo_urls.push(await putFile(f, slug));
          row.photo_url = row.photo_urls[0] || null;
        }
        const { error } = await supabase.from('events').insert(row);
        if (error) {
          for (const u of [...row.photo_urls, row.video_url]) await dropFile(u);
          if (error.code === '23505') return res.status(409).json({ error: 'This card has already been used for an event.' });
          throw error;
        }
        res.json({ slug, edit_token });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  });

  // Public event data (no edit_token, no id)
  router.get('/e/:slug', async (req, res) => {
    const { data, error } = await supabase.from('events')
      .select('slug,type,title,host_names,event_date,venue,map_url,message,days,photo_url,photo_urls,video_url,rsvp_enabled,status')
      .eq('slug', req.params.slug).single();
    if (error || !data || data.status !== 'live') return res.status(404).json({ error: 'Event not found.' });
    res.json(data);
  });

  // Guest RSVP
  router.post('/e/:slug/rsvp', async (req, res) => {
    const { name, attending, guests } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
    const { data: ev } = await supabase.from('events').select('id,rsvp_enabled,status').eq('slug', req.params.slug).single();
    if (!ev || ev.status !== 'live' || !ev.rsvp_enabled) return res.status(404).json({ error: 'RSVP not available.' });
    const { error } = await supabase.from('event_rsvps').insert({
      event_id: ev.id, guest_name: name.trim().slice(0, 100),
      attending: !!attending, guests: Math.min(Math.max(parseInt(guests) || 1, 1), 20)
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Host views RSVPs (secret token in header)
  router.get('/events/:slug/rsvps', async (req, res) => {
    const { data: ev } = await supabase.from('events').select('id,edit_token').eq('slug', req.params.slug).single();
    const t = req.headers['x-edit-token'] || '';
    if (!ev || t.length !== ev.edit_token.length || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(ev.edit_token)))
      return res.status(403).json({ error: 'Not allowed.' });
    const { data } = await supabase.from('event_rsvps').select('guest_name,attending,guests,created_at').eq('event_id', ev.id).order('created_at');
    res.json(data || []);
  });

  // ---------- ADMIN / STAFF ----------
  // List all events with reply counts (admin + postcard staff can read)
  router.get('/admin/events', requireAuth, async (req, res) => {
    const { data, error } = await supabase.from('events')
      .select('id,slug,type,title,host_names,event_date,venue,map_url,message,days,gift_id,rsvp_enabled,status,photo_url,photo_urls,video_url,created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const { data: rs } = await supabase.from('event_rsvps').select('event_id,attending,guests');
    const counts = {};
    (rs || []).forEach(r => { const c = counts[r.event_id] || (counts[r.event_id] = { replies: 0, coming: 0 });
      c.replies++; if (r.attending) c.coming += r.guests || 1; });
    res.json((data || []).map(({ id, ...e }) => ({ ...e, ...(counts[id] || { replies: 0, coming: 0 }) })));
  });

  // Turn a QR link on or off (status: live | disabled) - admin only
  router.patch('/admin/events/:slug', requireAuth, requireAdmin, async (req, res) => {
    const status = req.body && req.body.status;
    if (!['live', 'disabled'].includes(status)) return res.status(400).json({ error: 'Status must be live or disabled.' });
    const { error } = await supabase.from('events').update({ status }).eq('slug', req.params.slug);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, status });
  });

  // See replies for any event - admin only
  router.get('/admin/events/:slug/rsvps', requireAuth, requireAdmin, async (req, res) => {
    const { data: ev } = await supabase.from('events').select('id').eq('slug', req.params.slug).single();
    if (!ev) return res.status(404).json({ error: 'Event not found.' });
    const { data } = await supabase.from('event_rsvps').select('guest_name,attending,guests,created_at').eq('event_id', ev.id).order('created_at');
    res.json(data || []);
  });

  // Delete event + its files - admin only
  router.delete('/admin/events/:slug', requireAuth, requireAdmin, async (req, res) => {
    const { data: ev } = await supabase.from('events').select('photo_url,photo_urls,video_url').eq('slug', req.params.slug).single();
    if (!ev) return res.status(404).json({ error: 'Event not found.' });
    const allPhotos = (ev.photo_urls && ev.photo_urls.length) ? ev.photo_urls : (ev.photo_url ? [ev.photo_url] : []);
    for (const u of [...allPhotos, ev.video_url]) {
      if (!u || !u.startsWith(R2_PUBLIC_URL_BASE + '/')) continue;
      try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: decodeURIComponent(u.slice(R2_PUBLIC_URL_BASE.length + 1)) })); }
      catch (e) { console.error('R2 delete failed:', e.message); }
    }
    const { error } = await supabase.from('events').delete().eq('slug', req.params.slug);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Edit event details / replace media - admin only (multipart form)
  const r2Key = u => (u && u.startsWith(R2_PUBLIC_URL_BASE + '/')) ? decodeURIComponent(u.slice(R2_PUBLIC_URL_BASE.length + 1)) : null;
  async function dropFile(u) {
    const Key = r2Key(u); if (!Key) return;
    try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key })); } catch (e) { console.error('R2 delete failed:', e.message); }
  }
  router.post('/admin/events/:slug/edit', requireAuth, requireAdmin, (req, res) => {
    up(req, res, async (err) => {
      if (err) return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50 MB).' : 'Unsupported file type.' });
      try {
        const { data: ev } = await supabase.from('events').select('*').eq('slug', req.params.slug).single();
        if (!ev) return res.status(404).json({ error: 'Event not found.' });
        const b = req.body || {}, files = req.files || {}, upd = {};
        if (b.title !== undefined) { if (!b.title.trim()) return res.status(400).json({ error: 'Title is required.' }); upd.title = b.title.trim().slice(0, 120); }
        if (b.type !== undefined && TYPES.includes(b.type)) upd.type = b.type;
        if (b.host_names !== undefined) upd.host_names = b.host_names.slice(0, 120);
        if (b.venue !== undefined) upd.venue = b.venue.slice(0, 200);
        if (b.message !== undefined) upd.message = b.message.slice(0, 1000);
        if (b.map_url !== undefined) upd.map_url = /^https?:\/\//.test(b.map_url) ? b.map_url : null;
        if (b.event_date !== undefined) upd.event_date = b.event_date ? new Date(b.event_date).toISOString() : null;
        const finalType = upd.type || ev.type;
        if (finalType !== 'seminar') { if (ev.days && ev.days.length) upd.days = []; }
        else if (b.days !== undefined) {
          const days = parseDays(b.days);
          if (!days || !days.length) return res.status(400).json({ error: 'Each seminar day needs a valid date and a title (max 14 days).' });
          upd.days = days;
        } else if (!ev.days || !ev.days.length) return res.status(400).json({ error: 'Add at least one seminar day.' });
        if (b.rsvp_enabled !== undefined || upd.type) upd.rsvp_enabled = (upd.type || ev.type) !== 'memorial' && (b.rsvp_enabled === undefined ? ev.rsvp_enabled : b.rsvp_enabled === 'true');
        if (files.photo || b.keep_photos !== undefined) {
          const existing = (ev.photo_urls && ev.photo_urls.length) ? ev.photo_urls : (ev.photo_url ? [ev.photo_url] : []);
          let keep = existing;
          if (b.keep_photos !== undefined) {
            try { const k = JSON.parse(b.keep_photos); keep = existing.filter(u => k.includes(u)); }
            catch { return res.status(400).json({ error: 'Invalid photo list.' }); }
          }
          const added = files.photo || [];
          if (keep.length + added.length > 3) return res.status(400).json({ error: 'Maximum 3 photos per event.' });
          const fresh = [];
          for (const f of added) fresh.push(await putFile(f, ev.slug));
          for (const u of existing) if (!keep.includes(u)) await dropFile(u);
          const all = keep.concat(fresh);
          upd.photo_urls = all; upd.photo_url = all[0] || null;
        }
        if (files.video) { upd.video_url = await putFile(files.video[0], ev.slug); await dropFile(ev.video_url); }
        else if (b.remove_video === '1') { upd.video_url = null; await dropFile(ev.video_url); }
        const { error } = await supabase.from('events').update(upd).eq('slug', ev.slug);
        if (error) throw error;
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  });

  return router;
};

/* In server.js, after the R2 client (`r2`) is created, add:

const { PutObjectCommand } = require('@aws-sdk/client-s3'); // already imported at top
app.use('/api', require('./events')({ express, multer, supabase, r2, PutObjectCommand, DeleteObjectCommand, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE, requireAuth, requireAdmin, verifyToken: t => jwt.verify(t, JWT_SECRET) }));
*/
