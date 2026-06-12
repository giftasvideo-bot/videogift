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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB Max Video Size Limit
});

// ── ROUTE 1: BASE INDEX ──
app.get('/', (req, res) => {
  res.status(200).send('🚀 VideoGift API Backend is active and cruising smoothly!');
});

// ── ROUTE 2: LOOKUP GIFT STATUS ──
app.get('/api/gift/:id', async (req, res) => {
  const giftId = req.params.id;
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Gift record ID not found.' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE 3: ADMIN BATCH GENERATION INSERT ──
app.post('/api/admin/batch-insert', async (req, res) => {
  const { cards } = req.body; 
  if (!cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }

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

// ── ROUTE 4: ADMIN STATUS TRACKING SYNC ──
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

// ── ROUTE 5: USER VIDEO UPLOAD AND ATTACHMENT ──
app.post('/api/upload', upload.single('video'), async (req, res) => {
    const { giftId, message } = req.body;
    
    // 1. SECURITY GATE: Validate ID exists in database before touching the file
    const { data, error: dbError } = await supabase
        .from('gifts')
        .select('id')
        .eq('id', giftId)
        .single();

    // If ID is not found or error occurred, stop everything!
    if (dbError || !data) {
        return res.status(400).json({ error: 'Invalid or unauthorized Gift ID.' });
    }

    // 2. If it passed, NOW proceed with your existing upload logic...
    // (Proceed to upload to Supabase Storage and update the row)
});

  try {
    const fileExtension = file.originalname.split('.').pop() || 'mp4';
    const fileName = `${giftId}-${Date.now()}.${fileExtension}`;
    const filePath = `videos/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('videos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (storageError) throw storageError;

    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const publicVideoUrl = urlData.publicUrl;

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

// ── ROUTE 6: ADMIN CARD ROW DELETION ──
app.delete('/api/gift/:id?', async (req, res) => {
  const giftId = req.params.id || req.query.id || req.body.id;

  if (!giftId) {
    return res.status(400).json({ error: 'Deletion failed: No valid Card ID provided.' });
  }

  try {
    console.log(`🗑️ Admin requested deletion for Card ID: ${giftId}`);
    
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);

    if (error) throw error;
    
    res.status(200).json({ success: true, message: `Card entry ${giftId} wiped clean from database.` });
  } catch (err) {
    console.error('Database Deletion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── INITIALIZE NETWORK LISTENER ENGINE ──
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` 🚀 Server cruising smoothly on port: ${PORT}   `);
  console.log(`=================================================`);
});
// Self-ping every 14 minutes to prevent sleep
setInterval(() => {
  fetch(`https://videogift-backend-3.onrender.com/`)
    .catch(() => {});
}, 14 * 60 * 1000);
app.get('/api/validate', async (req, res) => {
    const { id } = req.query;

    if (!id) return res.json({ isValid: false });

    // Query your Supabase table 'gifts'
    const { data, error } = await supabase
        .from('gifts')
        .select('id')
        .eq('id', id)
        .single();

    // If there is an error or no data, the ID is invalid
    if (error || !data) {
        return res.json({ isValid: false });
    }

    // If we found the record, it's valid
    return res.json({ isValid: true });
});