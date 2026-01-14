const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

const visionService = {
  /**
   * Extract text from an image using Tesseract.js (free OCR)
   * @param {Buffer} imageBuffer - The image buffer
   * @returns {Promise<string>}
   */
  async extractTextFromImage(imageBuffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: () => {}, // Suppress logs
      });
      return text || '';
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      throw new Error('Failed to extract text from image');
    }
  },

  /**
   * Extract text from a PDF file
   * @param {Buffer} pdfBuffer - The PDF buffer
   * @returns {Promise<string>}
   */
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text || '';
    } catch (error) {
      console.error('PDF parse error:', error);
      // Fallback to Vision OCR for scanned PDFs
      try {
        return await this.extractTextFromImage(pdfBuffer);
      } catch (visionError) {
        throw new Error('Failed to extract text from PDF');
      }
    }
  },

  /**
   * Extract text from a DOCX file
   * @param {Buffer} docxBuffer - The DOCX buffer
   * @returns {Promise<string>}
   */
  async extractTextFromDOCX(docxBuffer) {
    try {
      // Simple DOCX text extraction using regex
      // For production, consider using mammoth or docx library
      const content = docxBuffer.toString('utf-8');
      
      // Extract text between XML tags
      const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        return textMatches
          .map(match => match.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // If no matches, return raw text content
      return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('DOCX parse error:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  },

  /**
   * Extract text from a PPT/PPTX file
   * @param {Buffer} pptBuffer - The PPT buffer
   * @returns {Promise<string>}
   */
  async extractTextFromPPT(pptBuffer) {
    try {
      // Simple PPTX text extraction
      const content = pptBuffer.toString('utf-8');
      
      // Extract text from PPTX XML
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
      if (textMatches) {
        return textMatches
          .map(match => match.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('PPT parse error:', error);
      throw new Error('Failed to extract text from PPT');
    }
  },

  /**
   * Detect file type and extract text accordingly
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} mimeType - The MIME type of the file
   * @returns {Promise<string>}
   */
  async extractText(fileBuffer, mimeType) {
    switch (mimeType) {
      case 'application/pdf':
        return this.extractTextFromPDF(fileBuffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractTextFromDOCX(fileBuffer);
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return this.extractTextFromPPT(fileBuffer);
      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
        return this.extractTextFromImage(fileBuffer);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  },
};

module.exports = visionService;
