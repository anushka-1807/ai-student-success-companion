require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');

const resumeController = require('./controllers/resumeController');
const notesController = require('./controllers/notesController');
const sgpaController = require('./controllers/sgpaController');
const authMiddleware = require('./middleware/authMiddleware');

// Initialize Firebase Admin
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
// Handle different formats of private key in .env
if (privateKey) {
  // Remove surrounding quotes if present
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
}
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Trust proxy for Render
app.set('trust proxy', 1);

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/mp4',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Student Success Companion API is running' });
});

// Resume Analyzer Routes
app.post('/api/upload-resume', authMiddleware, upload.single('resume'), resumeController.uploadResume);
app.post('/api/analyze-resume', authMiddleware, resumeController.analyzeResume);

// Notes Generator Routes
app.post('/api/generate-notes', authMiddleware, upload.single('file'), notesController.generateNotes);

// SGPA Calculator Routes
app.post('/api/calculate-sgpa', authMiddleware, sgpaController.calculateSGPA);

// History Routes
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const db = admin.firestore();
    const userId = req.user.uid;
    const { type } = req.query; // 'resume', 'notes', or 'sgpa'

    let collection = 'history';
    if (type) {
      collection = `${type}_history`;
    }

    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection(collection)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: error.message });
  }
  res.status(500).json({ success: false, error: error.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
