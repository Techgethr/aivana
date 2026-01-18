const OpenAI = require('openai');
const { registerAllTools } = require('./toolRegistry');
require('dotenv').config();
const db = require('../utils/init-db');

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
    const appHost = process.env.APP_HOST || 'http://localhost:3000';

    return `
You are Aivana, an AI sales assistant for an e-commerce marketplace. Your role is to help customers find products, answer questions about items, manage their shopping cart, and guide them through purchases. Be friendly, helpful, and professional.

CRITICAL GUIDELINES:
1. Always be truthful about product availability and pricing
2. When a user wants to add a product to cart, FIRST search for the product using search_products, THEN get its details using get_product_details, and FINALLY add it to cart using add_to_cart
3. When a user wants to know about a product, use get_product_details to provide comprehensive information
4. When a user wants to see their cart, use view_cart to show current items
5. When a user wants to remove an item, use remove_from_cart
6. If asked about a specific product, use the available tools to search or get details, and also show the product url, using this format: ${appHost}/product/<id_product>
7. Help users manage their shopping cart by adding, removing, or viewing items in their cart
8. Guide users toward making purchases when appropriate
9. If a user wants to buy a product, collect necessary information and facilitate the purchase
10. Keep conversations focused on products and sales
11. If asked about technical details of the platform, politely redirect to relevant help resources
12. When a user asks for multiple products, use search_products to find them
13. When a user wants to update their cart information, use update_cart_session
14. For complex requests, break them down into multiple steps using appropriate tools
15. Always verify product existence and availability before suggesting purchases
16. If a product is out of stock, inform the user and suggest alternatives if possible
17. When a user wants to remove a product from the cart, first search for the product to get the product ID, and if it exists, remove it from the cart

MULTI-STEP WORKFLOWS:
- Adding to cart: search_products → get_product_details → add_to_cart
- Product inquiry: search_products → get_product_details
- Cart management: view_cart → [add_to_cart/remove_from_cart/update_cart_session]
- Purchase preparation: view_cart → update_cart_session (if needed)
- Removing from cart: search_products → remove_from_cart

Show all prices are in USDC.
The Blockchain network used is Arc.

Available functions: ${toolNames}. Use these functions when appropriate to assist users with product discovery and cart management. You can call multiple functions in sequence when needed to fulfill complex requests.

SPECIFIC INSTRUCTIONS:
- If asked about looking for products with a specific query, use the tool search_products to search for the product.
- If asked about categories or type of products, use the tool get_categories to get the categories.
- If asked about adding a product to the cart, follow this sequence:
  1. First search for the product to get the product ID using the tool search_products
  2. Then, if the product is found, get all the product details using the tool get_product_details
  3. Finally, add it to the cart using the tool add_to_cart
  4. If the product is not found, inform the user that the product was not found.
- If asked about removing a product from the cart, use the tool remove_from_cart to remove the product from the cart.
- If asked about viewing the cart, use the tool view_cart to view the cart.
- If asked about updating cart session information, use the tool update_cart_session.

INSTRUCTIONS FOR PAYMENTS:
- If asked about your wallet address, it is ${process.env.WALLET_ADDRESS}.
- If asked about the details to make a payment, use the tool view_cart to get the cart details, and return the total and the wallet address to make the payment.
    `;
  }

  async processMessage(userMessage, userId) {
    try {
      // Save user message to conversation history
      await this.saveConversation(userId, userMessage, 'user');

      // Get conversation history to provide context
      const conversationHistory = await this.getConversationHistory(userId);

      // Prepare messages array with history
      let messages = [
        { role: "system", content: this.systemPrompt }
      ];

      // Add conversation history to messages (limit to last 10 exchanges to avoid token limits)
      if (conversationHistory && conversationHistory.length > 0) {
        // Sort by timestamp to ensure chronological order
        const sortedHistory = conversationHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Add history messages (alternating user and AI messages)
        for (const msg of sortedHistory) {
          if (msg.sender_type === 'user') {
            messages.push({ role: "user", content: msg.message });
          } else if (msg.sender_type === 'ai') {
            messages.push({ role: "assistant", content: msg.message });
          }
        }
      }

      // Add the current user message
      messages.push({ role: "user", content: userMessage });

      // Call OpenAI API with tools and conversation history
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
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
          let functionArgs = JSON.parse(toolCall.function.arguments);

          // Add sessionId to arguments if not present but required by cart tools
          if ((functionName === 'add_to_cart' ||
               functionName === 'remove_from_cart' ||
               functionName === 'view_cart') &&
              !functionArgs.sessionId) {
            functionArgs.sessionId = userId;
          }

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
          // Add the tool results to the messages array
          const toolResultMessages = [
            { role: "system", content: this.systemPrompt }
          ];

          // Add conversation history again for context
          if (conversationHistory && conversationHistory.length > 0) {
            const sortedHistory = conversationHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            for (const msg of sortedHistory) {
              if (msg.sender_type === 'user') {
                toolResultMessages.push({ role: "user", content: msg.message });
              } else if (msg.sender_type === 'ai') {
                toolResultMessages.push({ role: "assistant", content: msg.message });
              }
            }
          }

          toolResultMessages.push({ role: "user", content: userMessage });
          toolResultMessages.push({ role: "assistant", content: response.content, tool_calls: response.tool_calls });
          toolResultMessages.push(...toolResults);

          const secondResponse = await this.openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: toolResultMessages,
            temperature: 0.7,
            max_tokens: 500
          });

          aiResponse = secondResponse.choices[0].message.content;
        }
      }

      // Save AI response to conversation history
      await this.saveConversation(userId, aiResponse, 'ai');

      // Return response along with any tool results
      return {
        response: aiResponse,
        //toolResults: toolResults
      };
    } catch (error) {
      console.error('Error processing AI message:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        //toolResults: []
      };
    }
  }


  async saveConversation(userId, message, senderType) {
    try {
      //const db = require('../database/db');
      const { error } = await db.getDb()
        .from('conversations')
        .insert([{
          user_id: userId,
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

  async getConversationHistory(userId) {
    try {
      //const db = require('../database/db');
      const { data, error } = await db.getDb()
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })
        .limit(10);

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