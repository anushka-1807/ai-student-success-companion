const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Use /tmp for Render (ephemeral storage) or local uploads folder
const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.NODE_ENV === 'production' ? '/tmp/uploads' : './uploads');

// Ensure upload directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storageService = {
  /**
   * Save a file to local storage
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} fileName - Original file name
   * @param {string} userId - User ID for organizing files
   * @param {string} folder - Folder name (resumes, notes, etc.)
   * @returns {Promise<{filePath: string, fileName: string}>}
   */
  async saveFile(fileBuffer, fileName, userId, folder = 'uploads') {
    try {
      const userDir = path.join(UPLOAD_DIR, folder, userId);
      ensureDir(userDir);

      const ext = path.extname(fileName);
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = path.join(userDir, uniqueName);

      await fs.promises.writeFile(filePath, fileBuffer);

      return {
        filePath,
        fileName: uniqueName,
        originalName: fileName,
      };
    } catch (error) {
      console.error('Storage save error:', error);
      throw new Error('Failed to save file');
    }
  },

  /**
   * Read a file from local storage
   * @param {string} filePath - The file path
   * @returns {Promise<Buffer>}
   */
  async readFile(filePath) {
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error('Storage read error:', error);
      throw new Error('Failed to read file');
    }
  },

  /**
   * Delete a file from local storage
   * @param {string} filePath - The file path
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Storage delete error:', error);
      throw new Error('Failed to delete file');
    }
  },

  /**
   * Get file stats
   * @param {string} filePath - The file path
   * @returns {Promise<fs.Stats>}
   */
  async getFileStats(filePath) {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error('Storage stats error:', error);
      throw new Error('Failed to get file stats');
    }
  },
};

module.exports = storageService;
