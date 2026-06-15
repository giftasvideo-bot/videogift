require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// ── SUPABASE ──
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── JWT CONFIG ──
const JWT_SECRET     = process.env.JWT_SECRET     || 'forever27-secret-change-this';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'forever27';

// ── MULTER ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// ── AUTH MIDDLEWARE ──
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired. Please sign in again.' });
  }
}

// ════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════

// ── BASE ──
app.get('/', (req, res) => {
  res.status(200).send('🚀 Forever 27 API is running!');
});

// ── ADMIN LOGIN ──
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required.' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log(`✅ Admin login: ${username}`);
    return res.json({ token });
  }

  // Delay to prevent brute force timing attacks
  setTimeout(() => {
    res.status(401).json({ message: 'Incorrect username or password.' });
  }, 400);
});

// ── VERIFY TOKEN ──
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.admin.username });
});

// ── GET GIFT BY ID ──
app.get('/api/gift/:id', async (req, res) => {
  const giftId = req.params.id;
  try {
    const { data, error } = await supabase
      .from('gifts').select('*').eq('id', giftId).single();
    if (error || !data) return res.status(404).json({ error: 'Gift not found.' });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VALIDATE GIFT ID ──
app.get('/api/validate', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ isValid: false });
  const { data, error } = await supabase
    .from('gifts').select('id').eq('id', id).single();
  return res.json({ isValid: !error && !!data });
});

// ── ADMIN BATCH INSERT (protected) ──
app.post('/api/admin/batch-insert', requireAuth, async (req, res) => {
  const { cards } = req.body;
  if (!cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }
  const rows = cards.map(id => ({ id, status: 'pending', video_url: null, message: null }));
  try {
    const { error } = await supabase.from('gifts').insert(rows);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── STATUS SYNC ──
app.post('/api/gifts/status', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Missing ID array.' });
  }
  try {
    const { data, error } = await supabase
      .from('gifts').select('id, status').in('id', ids);
    if (error) throw error;
    const statuses = {};
    data.forEach(row => { statuses[row.id] = row.status; });
    res.status(200).json({ statuses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── VIDEO UPLOAD ──
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const { giftId, message } = req.body;
    const file = req.file;

    if (!giftId || !file) {
      return res.status(400).json({ error: 'Missing gift ID or video file.' });
    }

    // Check gift exists
    const { data: existing, error: lookupErr } = await supabase
      .from('gifts').select('id').eq('id', giftId).single();
    if (lookupErr || !existing) {
      return res.status(400).json({ error: 'Invalid Gift ID.' });
    }

    // Upload to Supabase Storage
    const ext = (file.originalname.split('.').pop() || 'mp4').toLowerCase();
    const filePath = `videos/${giftId}-${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from('videos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });
    if (storageError) throw storageError;

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);

    // Update DB row
    const { error: dbError } = await supabase
      .from('gifts')
      .update({ video_url: urlData.publicUrl, message: message || '', status: 'uploaded' })
      .eq('id', giftId);
    if (dbError) throw dbError;

    res.status(200).json({ success: true, video_url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── MARK AS VIEWED ──
app.post('/api/gift/:id/view', async (req, res) => {
  try {
    await supabase.from('gifts').update({ status: 'viewed' }).eq('id', req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE GIFT (protected) ──
app.delete('/api/gift/:id', requireAuth, async (req, res) => {
  const giftId = req.params.id;
  if (!giftId) return res.status(400).json({ error: 'No ID provided.' });
  try {
    const { error } = await supabase.from('gifts').delete().eq('id', giftId);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`🚀 Forever 27 API running on port ${PORT}`);
});

// Self-ping to prevent Render sleep
setInterval(() => {
  fetch('https://videogift-backend-3.onrender.com/').catch(() => {});
}, 14 * 60 * 1000);
