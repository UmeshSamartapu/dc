// server/server.js
require('dotenv').config(); // Loads environment variables from a .env file
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
// Suppress the Mongoose 7 strictQuery deprecation warning
mongoose.set('strictQuery', true);

// The connection string is now loaded from the .env file
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas and Models ---

// 1. File Schema
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// 2. Note Schema (New)
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);


// --- File Upload Logic with Multer ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
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
const LOCK_SCREEN_PASSWORD = "password123";
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === LOCK_SCREEN_PASSWORD) {
    res.status(200).json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

// 2. File Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: 'Please upload a file.' });
    const newFile = new File({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
    });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).send({ message: 'Error uploading file.' });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching files.' });
  }
});


// 3. Note Routes (New)
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }
        const newNote = new Note({ title, content });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: 'Error creating note.' });
    }
});

app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes.' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found.' });
        }
        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note.' });
    }
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
