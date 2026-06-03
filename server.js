require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// ── SUPABASE CONFIGURATION ──
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in Environment Variables.");
  process.exit(1);
}

// Initialize the Supabase Client securely using the standard library
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configure Multer for temporary memory buffer file storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB Max Video Size Limit
});

// ── ROUTE 1: BASE PLACEHOLDER INDEX ──
app.get('/', (req, res) => {
  res.status(200).send('🚀 VideoGift API Backend is active and cruising smoothly!');
});

// ── ROUTE 2: LOOKUP GIFT ROW STATUS (Used by watch.html & upload.html) ──
app.get('/api/gift/:id', async (req, res) => {
  const giftId = req.params.id;
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Gift record ID not found in database.' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE 3: ADMIN BATCH GENERATION INSERT (Used by admin.html) ──
app.post('/api/admin/batch-insert', async (req, res) => {
  const { cards } = req.body; 
  if (!cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'Invalid data format provided.' });
  }

  // Create empty placeholder rows to register IDs ahead of time
  const rows = cards.map(id => ({ 
    id: id, 
    status: 'pending',
    video_url: null,
    message: null
  }));

  try {
    const { error } = await supabase.from('gifts').insert(rows);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'IDs registered safely inside database.' });
  } catch (error) {
    console.error('Database Admin Insert Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── ROUTE 4: ADMIN STATUS TRACKING SYNC (Used by admin.html) ──
// FIXED LINE 83 TYPO HERE:
app.post('/api/gifts/status', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Missing or invalid ID array.' });
  }

  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('id, status')
      .in('id', ids);

    if (error) throw error;

    // Build key-value map response structured for the admin script layout
    const statuses = {};
    data.forEach(row => {
      statuses[row.id] = row.status;
    });

    res.status(200).json({ statuses });
  } catch (error) {
    console.error('Status sync lookup failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── ROUTE 5: USER VIDEO UPLOAD AND ATTACHMENT (Used by upload.html) ──
app.post('/api/upload', upload.single('video'), async (req, res) => {
  const { giftId, message } = req.body;
  const file = req.file;

  if (!giftId) {
    return res.status(400).json({ error: 'Missing target Gift ID.' });
  }
  if (!file) {
    return res.status(400).json({ error: 'No video media file attached.' });
  }

  try {
    // 1. Generate a unique name for the file path inside your Supabase Storage bucket
    const fileExtension = file.originalname.split('.').pop() || 'mp4';
    const fileName = `${giftId}-${Date.now()}.${fileExtension}`;
    const filePath = `videos/${fileName}`;

    // 2. Upload file to Supabase Storage Bucket (Assumes bucket name is 'videos')
    const { error: storageError } = await supabase.storage
      .from('videos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (storageError) throw storageError;

    // 3. Construct the official Public URL link path for your video
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const publicVideoUrl = urlData.publicUrl;

    // 4. Use .update() instead of .insert() to update the pre-existing row ID matching the admin pre-generation
    const { error: dbError } = await supabase
      .from('gifts')
      .update({
        video_url: publicVideoUrl,
        message: message || '',
        status: 'uploaded'
      })
      .eq('id', giftId); 

    if (dbError) throw dbError;

    res.status(200).json({ 
      success: true, 
      message: 'Gift sealed and database row updated successfully!',
      video_url: publicVideoUrl
    });

  } catch (error) {
    console.error('Upload Process Crash Error:', error);
    res.status(500).json({ error: error.message || 'Internal pipeline processing breakdown.' });
  }
});

// ── ROUTE 6: ADMIN CARD ROW DELETION (Used by admin.html) ──
app.delete('/api/gift/:id', async (req, res) => {
  const giftId = req.params.id;
  try {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Card entry wiped clean.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INITIALIZE NETWORK LISTENER ENGINE ──
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` 🚀 Server cruising smoothly on port: ${PORT}