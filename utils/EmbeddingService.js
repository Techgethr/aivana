const OpenAI = require('openai');
require('dotenv').config();

class EmbeddingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate embeddings for a text
   * @param {string} text - The text to generate embeddings for
   * @returns {Promise<Array>} - The embedding vector
   */
  async generateEmbeddings(text) {
    try {
      // Ensure text is not empty
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      // Limit text length to avoid token limits
      const maxTokens = 8000; // Leave some room for OpenAI's limits
      let processedText = text.substring(0, maxTokens);

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: processedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Compare similarity between two embedding vectors
   * @param {Array} vec1 - First embedding vector
   * @param {Array} vec2 - Second embedding vector
   * @returns {number} - Cosine similarity score
   */
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += Math.pow(vec1[i], 2);
      magnitude2 += Math.pow(vec2[i], 2);
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}

module.exports = EmbeddingService;