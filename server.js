require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;

// â”€â”€ MIDDLEWARE â”€â”€
app.use(cors());
app.use(express.json());

// â”€â”€ SUPABASE â”€â”€
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("âŒ SUPABASE_URL and SUPABASE_ANON_KEY must be set.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// â”€â”€ JWT CONFIG â”€â”€
const JWT_SECRET     = process.env.JWT_SECRET     || 'forever27-secret-change-this';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'forever27';

// â”€â”€ MULTER â”€â”€
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// â”€â”€ AUTH MIDDLEWARE â”€â”€
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ROUTES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ BASE â”€â”€
app.get('/', (req, res) => {
  res.status(200).send('ðŸš€ Forever 27 API is running!');
});

// â”€â”€ ADMIN LOGIN â”€â”€
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
    console.log(`âœ… Admin login: ${username}`);
    return res.json({ token });
  }

  // Delay to prevent brute force timing attacks
  setTimeout(() => {
    res.status(401).json({ message: 'Incorrect username or password.' });
  }, 400);
});

// â”€â”€ VERIFY TOKEN â”€â”€
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.admin.username });
});

// â”€â”€ GET GIFT BY ID â”€â”€
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

// â”€â”€ VALIDATE GIFT ID â”€â”€
app.get('/api/validate', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ isValid: false });
  const { data, error } = await supabase
    .from('gifts').select('id').eq('id', id).single();
  return res.json({ isValid: !error && !!data });
});

// â”€â”€ ADMIN BATCH INSERT (protected) â”€â”€
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

// â”€â”€ STATUS SYNC â”€â”€
app.post('/api/gifts/status', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Missing ID array.' });
  }
  try {
    let { data, error } = await supabase
      .from('gifts').select('id, status, upload_count').in('id', ids);

    if (error) {
      // Most likely cause: upload_count column doesn't exist yet on this table.
      // Don't fail the whole status check over it â€” retry without it.
      console.warn('âš ï¸ /api/gifts/status: full select failed, retrying without upload_count:', error.message);
      const fallback = await supabase
        .from('gifts').select('id, status').in('id', ids);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;

    const statuses = {};
    const uploadCounts = {};
    (data || []).forEach(row => {
      statuses[row.id] = row.status;
      uploadCounts[row.id] = row.upload_count || 0;
    });
    res.status(200).json({ statuses, uploadCounts });
  } catch (error) {
    console.error('âŒ /api/gifts/status failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€ VIDEO UPLOAD â”€â”€
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const { giftId, message, gifterName } = req.body;
    const file = req.file;

    if (!giftId || !file) {
      return res.status(400).json({ error: 'Missing gift ID or video file.' });
    }

    // Check gift exists and enforce upload limit
    const { data: existing, error: lookupErr } = await supabase
      .from('gifts').select('id, upload_count').eq('id', giftId).single();
    if (lookupErr || !existing) {
      return res.status(400).json({ error: 'Invalid Gift ID.' });
    }

    const MAX_UPLOADS = 3;
    const uploadCount = existing.upload_count || 0;
    if (uploadCount >= MAX_UPLOADS) {
      return res.status(403).json({
        error: 'Upload limit reached.',
        upload_count: uploadCount,
        max_uploads: MAX_UPLOADS
      });
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

    // Update DB row â€” increment upload_count
    const newCount = (existing.upload_count || 0) + 1;
    const { error: dbError } = await supabase
      .from('gifts')
      .update({
        video_url: urlData.publicUrl,
        message: message || '',
        gifter_name: gifterName || '',
        status: 'uploaded',
        upload_count: newCount
      })
      .eq('id', giftId);
    if (dbError) throw dbError;

    res.status(200).json({
      success: true,
      video_url: urlData.publicUrl,
      upload_count: newCount,
      max_uploads: 3
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€ MARK AS VIEWED â”€â”€
app.post('/api/gift/:id/view', async (req, res) => {
  try {
    await supabase.from('gifts').update({ status: 'viewed' }).eq('id', req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ DELETE VIDEO ONLY (protected) â”€â”€
app.delete('/api/gift/:id/video', requireAuth, async (req, res) => {
  const giftId = req.params.id;
  try {
    // 1. Fetch current record
    const { data, error: fetchErr } = await supabase
      .from('gifts')
      .select('video_url, status')
      .eq('id', giftId)
      .single();

    if (fetchErr || !data) {
      return res.status(404).json({ message: 'Gift not found.' });
    }

    if (!data.video_url) {
      return res.status(400).json({ message: 'No video attached to this card.' });
    }

    // 2. Extract the file path inside the storage bucket from the public URL
    // Supabase URL format: https://<project>.supabase.co/storage/v1/object/public/videos/<filePath>
    const marker = '/object/public/videos/';
    const markerIdx = data.video_url.indexOf(marker);
    let filePath = null;

    if (markerIdx !== -1) {
      filePath = decodeURIComponent(data.video_url.slice(markerIdx + marker.length));
    }

    if (filePath) {
      // 3. Delete file from Supabase Storage bucket "videos"
      const { error: storageErr } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (storageErr) {
        console.error(`Storage delete failed for "${filePath}":`, storageErr.message);
        // Don't return error â€” still clear the DB below
      } else {
        console.log(`ðŸ—‘ï¸ Storage file deleted: ${filePath}`);
      }
    } else {
      console.warn('Could not parse file path from URL:', data.video_url);
    }

    // 4. Clear video fields, reset status and upload_count to pending
    const { error: dbErr } = await supabase
      .from('gifts')
      .update({ video_url: null, message: null, gifter_name: null, status: 'pending', upload_count: 0 })
      .eq('id', giftId);

    if (dbErr) throw dbErr;

    console.log(`âœ… Video cleared from DB for card: ${giftId}`);
    res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ message: err.message });
  }
});

// â”€â”€ DELETE GIFT (protected) â€” also deletes its video from storage â”€â”€
app.delete('/api/gift/:id', requireAuth, async (req, res) => {
  const giftId = req.params.id;
  if (!giftId) return res.status(400).json({ error: 'No ID provided.' });
  try {
    // Fetch video_url first so we can delete from storage too
    const { data } = await supabase
      .from('gifts').select('video_url').eq('id', giftId).single();

    if (data && data.video_url) {
      const marker = '/object/public/videos/';
      const markerIdx = data.video_url.indexOf(marker);
      if (markerIdx !== -1) {
        const filePath = decodeURIComponent(data.video_url.slice(markerIdx + marker.length));
        const { error: storageErr } = await supabase.storage.from('videos').remove([filePath]);
        if (storageErr) console.warn('Storage delete on card delete failed:', storageErr.message);
        else console.log(`ðŸ—‘ï¸ Storage file deleted with card: ${filePath}`);
      }
    }

    const { error } = await supabase.from('gifts').delete().eq('id', giftId);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET ALL CARD IDs (protected) â”€â”€
// admin.html calls this on load so ALL browsers see the same cards from DB
app.get('/api/admin/cards', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('id')
      .order('id', { ascending: false });

    if (error) throw error;

    const ids = (data || []).map(row => row.id);
    res.json({ ids });
  } catch (err) {
    console.error('Failed to fetch card list:', err);
    res.status(500).json({ message: err.message });
  }
});

// â”€â”€ PURGE ORPHANED STORAGE FILES (protected) â”€â”€
// Deletes all files in the storage bucket that have no matching DB record
app.delete('/api/admin/purge-storage', requireAuth, async (req, res) => {
  try {
    // 1. List all files in the videos/ folder of the bucket
    const { data: files, error: listErr } = await supabase.storage
      .from('videos')
      .list('videos', { limit: 1000 });

    if (listErr) throw listErr;
    if (!files || files.length === 0) {
      return res.json({ deleted: 0, message: 'Storage is already empty.' });
    }

    // 2. Get all gift IDs from DB
    const { data: gifts, error: dbErr } = await supabase
      .from('gifts').select('id, video_url');
    if (dbErr) throw dbErr;

    const activeUrls = new Set((gifts || []).map(g => g.video_url).filter(Boolean));

    // 3. Find orphaned files (in storage but not referenced in any DB row)
    const orphans = files.filter(file => {
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(`videos/${file.name}`);
      return !activeUrls.has(urlData.publicUrl);
    });

    if (orphans.length === 0) {
      return res.json({ deleted: 0, message: 'No orphaned files found.' });
    }

    // 4. Delete orphaned files
    const orphanPaths = orphans.map(f => `videos/${f.name}`);
    const { error: delErr } = await supabase.storage.from('videos').remove(orphanPaths);
    if (delErr) throw delErr;

    console.log(`ðŸ§¹ Purged ${orphans.length} orphaned storage file(s).`);
    res.json({ deleted: orphans.length, files: orphanPaths });
  } catch (err) {
    console.error('Purge storage error:', err);
    res.status(500).json({ message: err.message });
  }
});

// â”€â”€ START SERVER â”€â”€
app.listen(PORT, () => {
  console.log(`ðŸš€ Forever 27 API running on port ${PORT}`);
});

// Self-ping to prevent Render sleep
setInterval(() => {
  fetch('https://videogift-backend-3.onrender.com/').catch(() => {});
}, 14 * 60 * 1000);
