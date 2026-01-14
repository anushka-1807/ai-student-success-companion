const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper function to retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 10000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

const llmService = {
  /**
   * Analyze a resume and return structured feedback
   * @param {string} resumeText - The extracted resume text
   * @returns {Promise<Object>}
   */
  async analyzeResume(resumeText) {
    try {
      // Using Groq with Mixtral model
      // Truncate text to prevent token limit issues
      const truncatedText = resumeText.length > 3000 ? resumeText.substring(0, 3000) + '...' : resumeText;

      const prompt = `You are an expert resume analyst. Analyze the following resume and provide detailed feedback in JSON format.

Resume Text:
${truncatedText}

Provide your analysis in the following JSON structure (return ONLY valid JSON, no markdown):
{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "format": <number 0-100>,
    "clarity": <number 0-100>,
    "achievements": <number 0-100>,
    "skills": <number 0-100>,
    "keywords": <number 0-100>
  },
  "keywordRecommendations": [
    "<keyword1>",
    "<keyword2>",
    ...
  ],
  "sectionFeedback": {
    "summary": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    },
    "experience": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    },
    "education": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    },
    "skills": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    },
    "projects": {
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    }
  },
  "strengths": ["<strength1>", "<strength2>"],
  "areasForImprovement": ["<area1>", "<area2>"],
  "overallFeedback": "<comprehensive summary of the resume>"
}`;

      const result = await retryWithBackoff(async () => {
        return await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
          max_tokens: 2048
        });
      });
      const text = result.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse resume analysis');
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  },

  /**
   * Generate notes from extracted text
   * @param {string} text - The extracted text from notes
   * @returns {Promise<Object>}
   */
  async generateNotes(text) {
    try {
      // Using Groq with Mixtral model
      // Truncate text to prevent token limit issues
      const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;

      const prompt = `You are an expert study assistant. Analyze the following content and generate comprehensive study notes in JSON format.

Content:
${truncatedText}

Provide your notes in the following JSON structure (return ONLY valid JSON, no markdown):
{
  "title": "<inferred title of the content>",
  "summary": "<comprehensive summary of the content in 2-3 paragraphs>",
  "keyPoints": [
    {
      "point": "<key point>",
      "explanation": "<brief explanation>"
    }
  ],
  "definitions": [
    {
      "term": "<term>",
      "definition": "<definition>"
    }
  ],
  "concepts": [
    {
      "concept": "<concept name>",
      "description": "<description>",
      "examples": ["<example1>", "<example2>"]
    }
  ],
  "quizQuestions": [
    {
      "question": "<question>",
      "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
      "correctAnswer": <index 0-3>,
      "explanation": "<why this is correct>"
    }
  ],
  "flashcards": [
    {
      "front": "<question or term>",
      "back": "<answer or definition>"
    }
  ],
  "studyTips": ["<tip1>", "<tip2>"]
}`;

      const result = await retryWithBackoff(async () => {
        return await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
          max_tokens: 2048
        });
      });
      const responseText = result.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse notes');
    } catch (error) {
      console.error('Notes generation error:', error);
      throw new Error('Failed to generate notes');
    }
  },

  /**
   * Generic prompt to Gemini
   * @param {string} prompt - The prompt to send
   * @returns {Promise<string>}
   */
  async generateContent(prompt) {
    try {
      const result = await retryWithBackoff(async () => {
        return await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
          max_tokens: 2048
        });
      });
      return result.choices[0].message.content;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content');
    }
  },
};

module.exports = llmService;
