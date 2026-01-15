const OpenAI = require('openai');
const ProductModel = require('../models/Product');
const { registerAllTools } = require('./toolRegistry');
require('dotenv').config();

class AIAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize tools registry
    this.tools = {};

    // Register all available tools
    this.registerAllTools();

    // Generate system prompt based on registered tools
    this.systemPrompt = this.generateSystemPrompt();
  }

  /**
   * Register a new tool with the agent
   * @param {BaseTool} tool - The tool to register
   */
  registerTool(tool) {
    this.tools[tool.name] = tool;
  }

  /**
   * Register all available tools using the tool registry
   */
  registerAllTools() {
    registerAllTools(this);
  }

  /**
   * Get all registered tool definitions for OpenAI
   * @returns {Array} - Array of tool definitions
   */
  getToolDefinitions() {
    return Object.values(this.tools).map(tool => tool.getFunctionDefinition());
  }

  /**
   * Generate system prompt based on available tools
   * @returns {string} - System prompt for the AI
   */
  generateSystemPrompt() {
    const toolNames = Object.keys(this.tools).join(', ');
    
    return `
You are Aivana, an AI sales assistant for an e-commerce marketplace. Your role is to help customers find products, answer questions about items, and guide them through purchases. Be friendly, helpful, and professional.

Guidelines:
1. Always be truthful about product availability and pricing
2. If asked about specific products, use the available tools to search or get details
3. Guide users toward making purchases when appropriate
4. If a user wants to buy a product, collect necessary information and facilitate the purchase
5. Keep conversations focused on products and sales
6. If asked about technical details of the platform, politely redirect to relevant help resources

All the prices are in USDC.

Available functions: ${toolNames}. Use these functions when appropriate to assist users.
    `;
  }

  async processMessage(userMessage, userId, sessionId) {
    try {
      // Save user message to conversation history
      await this.saveConversation(userId, sessionId, userMessage, 'user');

      // Prepare context for AI
      let context = '';

      // Call OpenAI API with tools
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: context + userMessage }
        ],
        tools: this.getToolDefinitions(),
        tool_choice: "auto", // Auto-select which tool to use
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message;

      // Handle tool calls if present
      let aiResponse = response.content;
      let toolResults = [];

      if (response.tool_calls) {
        for (const toolCall of response.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          // Execute the tool
          if (this.tools[functionName]) {
            const result = await this.tools[functionName].execute(functionArgs);
            
            // Format result for AI
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify(result)
            });
          } else {
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify({ error: `Unknown tool: ${functionName}` })
            });
          }
        }

        // If there were tool calls, get the final response from the AI
        if (toolResults.length > 0) {
          const secondResponse = await this.openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: "system", content: this.systemPrompt },
              { role: "user", content: userMessage },
              { role: "assistant", content: response.content, tool_calls: response.tool_calls },
              ...toolResults
            ],
            temperature: 0.7,
            max_tokens: 500
          });

          aiResponse = secondResponse.choices[0].message.content;
        }
      }

      // Save AI response to conversation history
      await this.saveConversation(userId, sessionId, aiResponse, 'ai');

      // Return response along with any tool results
      return {
        response: aiResponse,
        toolResults: toolResults
      };
    } catch (error) {
      console.error('Error processing AI message:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        toolResults: []
      };
    }
  }


  async saveConversation(userId, sessionId, message, senderType) {
    try {
      const db = require('../database/db');
      const { error } = await db.getDb()
        .from('conversations')
        .insert([{
          user_id: userId,
          session_id: sessionId,
          message: message,
          sender_type: senderType
        }]);

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const db = require('../database/db');
      const { data, error } = await db.getDb()
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting conversation history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }
}

module.exports = AIAgent;