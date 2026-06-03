const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Setup connection to your Supabase Database
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Allow your GitHub frontend to safely send files to this server
app.use(cors());
app.use(express.json());

// Configure temporary storage for uploaded videos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 } // 60MB file limit
});

// A simple test route to make sure the server is awake
app.get('/api/gift/test', (req, res) => {
  res.json({ status: "Server is wide awake and active!" });
});

// THE MAIN UPLOAD ROUTE (Matches your upload.html perfectly)
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const { giftId, message } = req.body;
    const file = req.file;

    if (!giftId) return res.status(400).json({ error: "Missing Gift ID" });
    if (!file) return res.status(400).json({ error: "No video file uploaded" });

    // 1. Upload video file to Supabase Storage Bucket named 'videos'
    const fileName = `${giftId}-${Date.now()}.mp4`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('videos')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (storageError) throw storageError;

    // 2. Grab the public anonymous direct video download link
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    const videoUrl = urlData.publicUrl;

    // 3. Save the video link and written message directly into your tracking table
    const { error: dbError } = await supabase
      .from('gifts') 
      .update({ video_url: videoUrl, message: message, status: 'sealed' })
      .eq('id', giftId);

    if (dbError) throw dbError;

    res.json({ success: true, videoUrl });

  } catch (error) {
    console.error("Server processing error:", error);
    res.status(500).json({ error: error.message || "Internal server crash" });
  }
});

// Live route for watch.html to read the video and message
app.get('/api/gift/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Gift record not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server cruising smoothly on port ${port}`);
});