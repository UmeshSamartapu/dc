// server/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MongoDB Connection ---
mongoose.set('strictQuery', true);
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas and Models ---
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// --- File Upload Logic ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- API Routes ---

// 1. Authentication Route
// The password is now read from an environment variable for better security
const LOCK_SCREEN_PASSWORD = process.env.LOCK_SCREEN_PASSWORD || "password123";

app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === LOCK_SCREEN_PASSWORD) {
    res.status(200).json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

// (Other API routes for files and notes remain here...)
app.post('/api/upload', upload.single('file'), async (req, res) => { /* ... */ });
app.get('/api/files', async (req, res) => { /* ... */ });
app.post('/api/notes', async (req, res) => { /* ... */ });
app.get('/api/notes', async (req, res) => { /* ... */ });
app.delete('/api/notes/:id', async (req, res) => { /* ... */ });


// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
