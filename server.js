require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 10000;

// -- MIDDLEWARE --
app.use(cors());
app.use(express.json());

// -- SUPABASE -- (database only — video files now live on Cloudflare R2, see below)
// IMPORTANT: this backend performs privileged writes (insert/update/delete)
// on behalf of the admin. If your `gifts` table has Row Level Security (RLS)
// enabled — which is the Supabase default — the anon key will be blocked
// from those operations and every write will fail with a 500. The service
// role key bypasses RLS and is meant to live only in server-side env vars
// like this one (never ship it to the frontend).
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("? SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// -- CLOUDFLARE R2 (video file storage) --
// R2 is S3-compatible, so we talk to it with the standard AWS S3 SDK, just
// pointed at Cloudflare's endpoint instead of AWS. Only the DATABASE lives
// on Supabase now — actual video files live here.
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'videogift';
// Public base URL for serving files back out (e.g. your r2.dev Public
// Development URL, or a custom domain connected to the bucket). No
// trailing slash. Example: https://pub-xxxxxxxx.r2.dev
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL_BASE) {
  console.error("? R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_PUBLIC_URL_BASE must all be set.");
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

// -- JWT CONFIG --
const JWT_SECRET     = process.env.JWT_SECRET     || 'forever27-secret-change-this';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'forever27';

// -- MULTER --
const MAX_FILE_SIZE_MB = 150;
const ALLOWED_VIDEO_MIMETYPES = new Set([
  'video/mp4',
  'video/quicktime',   // .mov
  'video/x-msvideo',   // .avi
  'video/webm',
  'video/3gpp',        // common on some Android phones
  'video/x-matroska'   // .mkv
]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'webm', '3gp', 'mkv']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }, // 150MB
  fileFilter: (req, file, cb) => {
    // Reject anything that isn't actually a video, even if the client-side
    // <input accept="video/*"> was bypassed or the mimetype was spoofed.
    const mimetypeOk = file.mimetype && file.mimetype.startsWith('video/');
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    const extensionOk = ALLOWED_VIDEO_EXTENSIONS.has(ext);

    if (!mimetypeOk || !extensionOk) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

// -- AUTH MIDDLEWARE --
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

// ----------------------------------------
// ROUTES
// ----------------------------------------

// -- BASE --
app.get('/', (req, res) => {
  res.status(200).send('?? Forever 27 API is running!');
});

// -- ADMIN LOGIN --
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
    console.log(`? Admin login: ${username}`);
    return res.json({ token });
  }

  // Delay to prevent brute force timing attacks
  setTimeout(() => {
    res.status(401).json({ message: 'Incorrect username or password.' });
  }, 400);
});

// -- VERIFY TOKEN --
app.get('/api/admin/verify', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.admin.username });
});

// -- GET GIFT BY ID --
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

// -- VALIDATE GIFT ID --
app.get('/api/validate', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ isValid: false });
  const { data, error } = await supabase
    .from('gifts').select('id').eq('id', id).single();
  return res.json({ isValid: !error && !!data });
});

// -- ADMIN BATCH INSERT (protected) --
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

// -- STATUS SYNC --
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
      // Don't fail the whole status check over it — retry without it.
      console.warn('?? /api/gifts/status: full select failed, retrying without upload_count:', error.message);
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
    console.error('? /api/gifts/status failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// -- VIDEO UPLOAD --
app.post('/api/upload', (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `Video file is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB. Please compress your video and try again.`
      });
    }
    if (err && err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        error: 'That file doesn\'t look like a supported video. Please upload an MP4, MOV, AVI, WEBM, 3GP, or MKV file.'
      });
    }
    if (err) return res.status(500).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { giftId, message, gifterName } = req.body;
    const file = req.file;

    if (!giftId || !file) {
      return res.status(400).json({ error: 'Missing gift ID or video file.' });
    }

    // Check gift exists and enforce upload limit
    const { data: existing, error: lookupErr } = await supabase
      .from('gifts').select('id, upload_count, status, video_url').eq('id', giftId).single();
    if (lookupErr || !existing) {
      return res.status(400).json({ error: 'Invalid Gift ID.' });
    }

    // Lock uploads once the receiver has viewed the gift
    if (existing.status === 'viewed') {
      return res.status(403).json({
        error: 'This gift has already been viewed by the recipient and can no longer be changed.',
        locked_reason: 'viewed'
      });
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

    // Upload to Cloudflare R2
    const ext = (file.originalname.split('.').pop() || 'mp4').toLowerCase();
    const filePath = `videos/${giftId}-${Date.now()}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: '3600'
    }));

    const publicUrl = `${R2_PUBLIC_URL_BASE}/${filePath}`;

    // Update DB row — increment upload_count
    const newCount = (existing.upload_count || 0) + 1;
    const { error: dbError } = await supabase
      .from('gifts')
      .update({
        video_url: publicUrl,
        message: message || '',
        gifter_name: gifterName || '',
        status: 'uploaded',
        upload_count: newCount
      })
      .eq('id', giftId);
    if (dbError) throw dbError;

    // Clean up the previous video file in R2 now that the new one is safely
    // uploaded and the DB row points at it. Without this, every re-upload
    // (2nd/3rd chance) leaves the old file behind as permanent dead weight
    // in storage instead of the new video actually replacing it.
    if (existing.video_url) {
      const marker = '/videos/';
      const markerIdx = existing.video_url.indexOf(marker);
      if (markerIdx !== -1) {
        const oldFilePath = 'videos/' + decodeURIComponent(existing.video_url.slice(markerIdx + marker.length));
        try {
          await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: oldFilePath }));
          console.log(`ðŸ—‘ï¸ Replaced old R2 file on re-upload: ${oldFilePath}`);
        } catch (storageErr) {
          // Don't fail the request over cleanup ï¿½ the new video is already
          // live and correct either way, this is just housekeeping.
          console.error(`Failed to delete old R2 file "${oldFilePath}" on re-upload:`, storageErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      video_url: publicUrl,
      upload_count: newCount,
      max_uploads: 3
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// -- MARK AS VIEWED --
app.post('/api/gift/:id/view', async (req, res) => {
  try {
    const giftId = req.params.id;

    // Only seal a card as "viewed" if it actually has a video attached.
    // Without this check, a card can be marked viewed with nothing uploaded
    // (e.g. a stale/duplicate call after the video was deleted), which then
    // shows the recipient a permanent "already opened" screen for a gift
    // that was never actually given, and blocks admin from resetting it
    // via the normal Delete Video flow.
    const { data: existing, error: lookupErr } = await supabase
      .from('gifts')
      .select('status, video_url')
      .eq('id', giftId)
      .single();

    if (lookupErr || !existing) {
      return res.status(404).json({ error: 'Gift not found.' });
    }

    if (!existing.video_url) {
      // Nothing to seal — silently no-op rather than erroring, since the
      // recipient-facing page calls this opportunistically on load.
      return res.status(200).json({ success: true, sealed: false, reason: 'no_video' });
    }

    if (existing.status !== 'viewed') {
      await supabase.from('gifts').update({ status: 'viewed' }).eq('id', giftId);
    }

    res.status(200).json({ success: true, sealed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- DELETE VIDEO ONLY (protected) --
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

    // If there's no video_url, there's nothing to delete from storage —
    // but the card may still be stuck with status: 'viewed' from the
    // inconsistent state this endpoint exists partly to recover from.
    // Always fall through and reset the DB row rather than hard-erroring,
    // so this button reliably works as an admin "reset this card" action.
    if (!data.video_url) {
      const { error: resetErr } = await supabase
        .from('gifts')
        .update({ status: 'pending', upload_count: 0 })
        .eq('id', giftId);
      if (resetErr) throw resetErr;

      console.log(`?? Reset stuck card (no video was attached): ${giftId}`);
      return res.status(200).json({ ok: true, note: 'No video was attached; card status reset anyway.' });
    }

    // 2. Extract the object key inside the R2 bucket from the public URL
    // R2 public URL format: <R2_PUBLIC_URL_BASE>/videos/<filePath>
    const marker = '/videos/';
    const markerIdx = data.video_url.indexOf(marker);
    let filePath = null;

    if (markerIdx !== -1) {
      filePath = 'videos/' + decodeURIComponent(data.video_url.slice(markerIdx + marker.length));
    }

    if (filePath) {
      // 3. Delete file from Cloudflare R2
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: filePath }));
        console.log(`??? R2 file deleted: ${filePath}`);
      } catch (storageErr) {
        console.error(`R2 delete failed for "${filePath}":`, storageErr.message);
        // Don't return error — still clear the DB below
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

    console.log(`? Video cleared from DB for card: ${giftId}`);
    res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ message: err.message });
  }
});

// -- DELETE GIFT (protected) — also deletes its video from storage --
app.delete('/api/gift/:id', requireAuth, async (req, res) => {
  const giftId = req.params.id;
  if (!giftId) return res.status(400).json({ error: 'No ID provided.' });
  try {
    // Fetch video_url first so we can delete from storage too
    const { data } = await supabase
      .from('gifts').select('video_url').eq('id', giftId).single();

    if (data && data.video_url) {
      const marker = '/videos/';
      const markerIdx = data.video_url.indexOf(marker);
      if (markerIdx !== -1) {
        const filePath = 'videos/' + decodeURIComponent(data.video_url.slice(markerIdx + marker.length));
        try {
          await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: filePath }));
          console.log(`??? R2 file deleted with card: ${filePath}`);
        } catch (storageErr) {
          console.warn('R2 delete on card delete failed:', storageErr.message);
        }
      }
    }

    const { error } = await supabase.from('gifts').delete().eq('id', giftId);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- GET ALL CARD IDs (protected) --
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

// -- PURGE ORPHANED STORAGE FILES (protected) --
// Deletes all files in the R2 bucket that have no matching DB record
app.delete('/api/admin/purge-storage', requireAuth, async (req, res) => {
  try {
    // 1. List all files in the videos/ prefix of the R2 bucket
    const listResult = await r2.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'videos/',
      MaxKeys: 1000
    }));
    const files = listResult.Contents || [];

    if (files.length === 0) {
      return res.json({ deleted: 0, message: 'Storage is already empty.' });
    }

    // 2. Get all gift IDs from DB
    const { data: gifts, error: dbErr } = await supabase
      .from('gifts').select('id, video_url');
    if (dbErr) throw dbErr;

    const activeUrls = new Set((gifts || []).map(g => g.video_url).filter(Boolean));

    // 3. Find orphaned files (in storage but not referenced in any DB row)
    const orphans = files.filter(file => {
      const publicUrl = `${R2_PUBLIC_URL_BASE}/${file.Key}`;
      return !activeUrls.has(publicUrl);
    });

    if (orphans.length === 0) {
      return res.json({ deleted: 0, message: 'No orphaned files found.' });
    }

    // 4. Delete orphaned files (up to 1000 per request, well within our cap above)
    const orphanPaths = orphans.map(f => f.Key);
    await r2.send(new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: { Objects: orphanPaths.map(Key => ({ Key })) }
    }));

    console.log(`?? Purged ${orphans.length} orphaned storage file(s).`);
    res.json({ deleted: orphans.length, files: orphanPaths });
  } catch (err) {
    console.error('Purge storage error:', err);
    res.status(500).json({ message: err.message });
  }
});

// -- START SERVER --
app.listen(PORT, () => {
  console.log(`?? Forever 27 API running on port ${PORT}`);
});

// Self-ping to prevent Render sleep
setInterval(() => {
  fetch('https://videogift-backend-3.onrender.com/').catch(() => {});
}, 14 * 60 * 1000);