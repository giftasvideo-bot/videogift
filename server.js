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
app.post('/api/gifts/status', async (req, res