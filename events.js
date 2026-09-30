// events.js — invitation events API. Mount from server.js (see bottom of this file).
const crypto = require('crypto');

module.exports = function ({ express, multer, supabase, r2, PutObjectCommand, DeleteObjectCommand, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE, requireAuth, requireAdmin }) {
  const router = express.Router();
  const TYPES = ['wedding', 'birthday', 'church', 'memorial', 'general'];

  const up = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, f, cb) => {
      const ok = (f.fieldname === 'photo' && /^image\/(jpeg|png|webp)$/.test(f.mimetype)) ||
                 (f.fieldname === 'video' && /^video\/(mp4|quicktime|webm)$/.test(f.mimetype));
      cb(ok ? null : new Error('INVALID_FILE_TYPE'), ok);
    }
  }).fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

  async function putFile(f, slug) {
    const ext = (f.originalname.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `events/${slug}-${f.fieldname}-${Date.now()}.${ext}`;
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
        const slug = crypto.randomBytes(9).toString('base64url');
        const edit_token = crypto.randomBytes(24).toString('base64url');
        const type = TYPES.includes(b.type) ? b.type : 'general';
        const files = req.files || {};
        const row = {
          slug, edit_token, type,
          title: b.title.trim().slice(0, 120),
          host_names: (b.host_names || '').slice(0, 120),
          event_date: b.event_date ? new Date(b.event_date).toISOString() : null,
          venue: (b.venue || '').slice(0, 200),
          map_url: /^https?:\/\//.test(b.map_url || '') ? b.map_url : null,
          message: (b.message || '').slice(0, 1000),
          photo_url: files.photo ? await putFile(files.photo[0], slug) : null,
          video_url: files.video ? await putFile(files.video[0], slug) : null,
          rsvp_enabled: type !== 'memorial' && b.rsvp_enabled !== 'false'
        };
        const { error } = await supabase.from('events').insert(row);
        if (error) throw error;
        res.json({ slug, edit_token });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  });

  // Public event data (no edit_token, no id)
  router.get('/e/:slug', async (req, res) => {
    const { data, error } = await supabase.from('events')
      .select('slug,type,title,host_names,event_date,venue,map_url,message,photo_url,video_url,rsvp_enabled,status')
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
      .select('id,slug,type,title,host_names,event_date,venue,map_url,message,rsvp_enabled,status,photo_url,video_url,created_at')
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
    const { data: ev } = await supabase.from('events').select('photo_url,video_url').eq('slug', req.params.slug).single();
    if (!ev) return res.status(404).json({ error: 'Event not found.' });
    for (const u of [ev.photo_url, ev.video_url]) {
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
        if (b.rsvp_enabled !== undefined || upd.type) upd.rsvp_enabled = (upd.type || ev.type) !== 'memorial' && (b.rsvp_enabled === undefined ? ev.rsvp_enabled : b.rsvp_enabled === 'true');
        if (files.photo) { upd.photo_url = await putFile(files.photo[0], ev.slug); await dropFile(ev.photo_url); }
        else if (b.remove_photo === '1') { upd.photo_url = null; await dropFile(ev.photo_url); }
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
app.use('/api', require('./events')({ express, multer, supabase, r2, PutObjectCommand, DeleteObjectCommand, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE, requireAuth, requireAdmin }));
*/
