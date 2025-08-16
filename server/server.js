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
// (Your File and Note schemas remain here, unchanged)
const fileSchema = new mongoose.Schema({ /* ... */ });
const File = mongoose.model('File', fileSchema);
const noteSchema = new mongoose.Schema({ /* ... */ });
const Note = mongoose.model('Note', noteSchema);

// --- File Upload Logic ---
// (Your Multer configuration remains here, unchanged)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); }
const storage = multer.diskStorage({ /* ... */ });
const upload = multer({ storage: storage });

// --- API Routes ---
// (All your /api routes for auth, files, and notes remain here, unchanged)
app.post('/api/auth', (req, res) => { /* ... */ });
app.post('/api/upload', upload.single('file'), async (req, res) => { /* ... */ });
app.get('/api/files', async (req, res) => { /* ... */ });
app.post('/api/notes', async (req, res) => { /* ... */ });
app.get('/api/notes', async (req, res) => { /* ... */ });
app.delete('/api/notes/:id', async (req, res) => { /* ... */ });


// --- Serve Frontend ---
// This section is new and should be placed after your API routes
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
