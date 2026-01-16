const BaseTool = require('./BaseTool');
const CartModel = require('../../models/Cart');

class RemoveFromCartTool extends BaseTool {
  constructor() {
    super(
      'remove_from_cart',
      'Remove a product from the shopping cart for the current session',
      {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The session identifier'
          },
          productId: {
            type: 'integer',
            description: 'The ID of the product to remove from cart'
          }
        },
        required: ['sessionId', 'productId']
      }
    );
  }

  async execute(args) {
    try {
      const { sessionId, productId } = args;

      // Remove item from cart
      const success = await CartModel.removeFromCart(sessionId, productId);

      if (success) {
        return {
          success: true,
          message: 'Product removed from cart successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to remove product from cart'
        };
      }
    } catch (error) {
      console.error('Error in remove_from_cart tool:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = RemoveFromCartTool;