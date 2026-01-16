const BaseTool = require('./BaseTool');
const CartSessionModel = require('../../models/CartSession');

class UpdateCartSessionTool extends BaseTool {
  constructor() {
    super(
      'update_cart_session',
      'Update information for the shopping cart session (like buyer name, shipping address, etc.)',
      {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The session identifier'
          },
          buyerName: {
            type: 'string',
            description: 'The buyer\'s name'
          },
          shippingAddress: {
            type: 'string',
            description: 'The shipping address'
          },
          notes: {
            type: 'string',
            description: 'Any additional notes for the order'
          }
        },
        required: ['sessionId']
      }
    );
  }

  async execute(args) {
    try {
      const { sessionId, buyerName, shippingAddress, notes } = args;
      
      const updateData = {};
      if (buyerName !== undefined) updateData.buyer_name = buyerName;
      if (shippingAddress !== undefined) updateData.shipping_address = shippingAddress;
      if (notes !== undefined) updateData.notes = notes;
      
      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'No fields to update'
        };
      }
      
      // Update the cart session
      const result = await CartSessionModel.updateSession(sessionId, updateData);
      
      return {
        success: true,
        message: 'Cart session updated successfully',
        sessionInfo: result
      };
    } catch (error) {
      console.error('Error in update_cart_session tool:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = UpdateCartSessionTool;