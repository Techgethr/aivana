const OpenAI = require('openai');
//const ConversationModel = require('../models/Conversation');
const ProductModel = require('../models/Product');
require('dotenv').config();

class AIAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.systemPrompt = `
You are Aivana, an AI sales assistant for an e-commerce marketplace. Your role is to help customers find products, answer questions about items, and guide them through purchases. Be friendly, helpful, and professional.

Guidelines:
1. Always be truthful about product availability and pricing
2. If asked about specific products, search the product database
3. Guide users toward making purchases when appropriate
4. If a user wants to buy a product, collect necessary information and facilitate the purchase
5. Keep conversations focused on products and sales
6. If asked about technical details of the platform, politely redirect to relevant help resources

Available functions:
- search_products(query): Search for products based on user query
- get_product_details(productId): Get detailed information about a specific product
    `;
  }

  async processMessage(userMessage, userId, sessionId) {
    try {
      // Save user message to conversation history
      await this.saveConversation(userId, sessionId, userMessage, 'user');
      
      // Get relevant products based on user message
      const relevantProducts = await this.searchProducts(userMessage);
      
      // Prepare context for AI
      let context = '';
      if (relevantProducts.length > 0) {
        context = `Relevant products found: ${JSON.stringify(relevantProducts, null, 2)}. `;
      }
      
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: context + userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Save AI response to conversation history
      await this.saveConversation(userId, sessionId, aiResponse, 'ai');
      
      return {
        response: aiResponse,
        products: relevantProducts
      };
    } catch (error) {
      console.error('Error processing AI message:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        products: []
      };
    }
  }

  async searchProducts(query) {
    try {
      // Simple search implementation - in a real app, this would be more sophisticated
      const allProducts = await ProductModel.findAll();
      
      // Filter products based on query (simple text matching)
      const lowerQuery = query.toLowerCase();
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
        (product.category && product.category.toLowerCase().includes(lowerQuery))
      );
      
      // Return top 5 matching products
      return filteredProducts.slice(0, 5);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getProductDetails(productId) {
    try {
      return await ProductModel.findById(productId);
    } catch (error) {
      console.error('Error getting product details:', error);
      return null;
    }
  }

  async saveConversation(userId, sessionId, message, senderType) {
    try {
      const db = require('../database/db');
      const stmt = db.getDb().prepare(
        'INSERT INTO conversations (user_id, session_id, message, sender_type) VALUES (?, ?, ?, ?)'
      );
      stmt.run([userId, sessionId, message, senderType]);
      stmt.finalize();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const db = require('../database/db');
      return new Promise((resolve, reject) => {
        db.getDb().all(
          'SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp ASC',
          [sessionId],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }
}

module.exports = AIAgent;