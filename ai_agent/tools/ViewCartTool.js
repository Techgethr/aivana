const BaseTool = require('./BaseTool');
const CartModel = require('../../models/Cart');
const CartSessionModel = require('../../models/CartSession');

class ViewCartTool extends BaseTool {
  constructor() {
    super(
      'view_cart',
      'View the contents of the shopping cart for the current session',
      {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The session identifier'
          }
        },
        required: ['sessionId']
      }
    );
  }

  async execute(args) {
    try {
      const { sessionId } = args;

      // Get cart contents
      const cartItems = await CartModel.getCart(sessionId);

      // Calculate total
      const total = await CartModel.getCartTotal(sessionId);

      // Get session information
      const sessionInfo = await CartSessionModel.getSession(sessionId);

      return {
        cartItems: cartItems,
        total: total,
        itemCount: cartItems ? cartItems.length : 0,
        sessionInfo: sessionInfo
      };
    } catch (error) {
      console.error('Error in view_cart tool:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ViewCartTool;