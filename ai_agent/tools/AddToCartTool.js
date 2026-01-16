const BaseTool = require('./BaseTool');
const CartModel = require('../../models/Cart');

class AddToCartTool extends BaseTool {
  constructor() {
    super(
      'add_to_cart',
      'Add a product to the shopping cart for the current session',
      {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The session identifier'
          },
          productId: {
            type: 'integer',
            description: 'The ID of the product to add to cart'
          },
          quantity: {
            type: 'integer',
            description: 'The quantity to add (default: 1)',
            default: 1
          }
        },
        required: ['sessionId', 'productId']
      }
    );
  }

  async execute(args) {
    try {
      const { sessionId, productId, quantity = 1 } = args;

      // Add item to cart
      const result = await CartModel.addToCart(sessionId, productId, quantity);

      return {
        success: true,
        message: `Added ${quantity} of product to cart successfully`,
        cartItem: result
      };
    } catch (error) {
      console.error('Error in add_to_cart tool:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AddToCartTool;