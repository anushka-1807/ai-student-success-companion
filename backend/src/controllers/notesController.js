const admin = require('firebase-admin');
const storageService = require('../services/storageService');
const visionService = require('../services/visionService');
const speechService = require('../services/speechService');
const llmService = require('../services/llmService');

const notesController = {
  /**
   * Generate notes from uploaded file (audio, PDF, PPT, or image)
   */
  async generateNotes(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const userId = req.user.uid;
      const { buffer, mimetype, originalname, size } = req.file;

      // Save file to local storage
      const { filePath } = await storageService.saveFile(
        buffer,
        originalname,
        userId,
        'notes'
      );

      let extractedText = '';

      // Extract text based on file type
      if (speechService.isAudioFile(mimetype)) {
        // Audio file - use Speech-to-Text
        extractedText = await speechService.transcribeAudio(buffer, mimetype);
      } else {
        // Document or image - use Vision/PDF parser
        extractedText = await visionService.extractText(buffer, mimetype);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Could not extract text from the uploaded file',
        });
      }

      // Generate notes using Gemini
      const notes = await llmService.generateNotes(extractedText);

      // Store in Firestore
      const db = admin.firestore();
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('notes_history')
        .add({
          fileName: originalname,
          filePath,
          mimeType: mimetype,
          size,
          extractedText,
          notes,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.json({
        success: true,
        data: {
          id: docRef.id,
          fileName: originalname,
          notes,
        },
      });
    } catch (error) {
      console.error('Generate notes error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = notesController;
