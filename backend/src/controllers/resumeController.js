const admin = require('firebase-admin');
const storageService = require('../services/storageService');
const visionService = require('../services/visionService');
const llmService = require('../services/llmService');

const resumeController = {
  /**
   * Upload resume to local storage
   */
  async uploadResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const userId = req.user.uid;
      const { filePath, fileName, originalName } = await storageService.saveFile(
        req.file.buffer,
        req.file.originalname,
        userId,
        'resumes'
      );

      // Extract text from resume
      const extractedText = await visionService.extractText(
        req.file.buffer,
        req.file.mimetype
      );

      // Store upload info in Firestore
      const db = admin.firestore();
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('resume_uploads')
        .add({
          fileName: req.file.originalname,
          filePath,
          extractedText,
          mimeType: req.file.mimetype,
          size: req.file.size,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.json({
        success: true,
        data: {
          id: docRef.id,
          fileName: req.file.originalname,
          filePath,
          extractedText: extractedText.substring(0, 500) + '...', // Preview
        },
      });
    } catch (error) {
      console.error('Upload resume error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Analyze resume using Gemini
   */
  async analyzeResume(req, res) {
    try {
      const { resumeId, resumeText } = req.body;
      const userId = req.user.uid;
      const db = admin.firestore();

      let textToAnalyze = resumeText;

      // If resumeId is provided, fetch the extracted text from Firestore
      if (resumeId && !resumeText) {
        const doc = await db
          .collection('users')
          .doc(userId)
          .collection('resume_uploads')
          .doc(resumeId)
          .get();

        if (!doc.exists) {
          return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        textToAnalyze = doc.data().extractedText;
      }

      if (!textToAnalyze) {
        return res.status(400).json({ success: false, error: 'No resume text provided' });
      }

      // Analyze resume using Gemini
      const analysis = await llmService.analyzeResume(textToAnalyze);

      // Store analysis in Firestore
      const analysisRef = await db
        .collection('users')
        .doc(userId)
        .collection('resume_history')
        .add({
          resumeId: resumeId || null,
          analysis,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.json({
        success: true,
        data: {
          id: analysisRef.id,
          analysis,
        },
      });
    } catch (error) {
      console.error('Analyze resume error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = resumeController;
