const BaseTool = require('./BaseTool');
const ProductModel = require('../../models/Product');

class GetProductDetailsTool extends BaseTool {
  constructor() {
    super(
      'get_product_details',
      'Get detailed information about a specific product by its ID',
      {
        type: 'object',
        properties: {
          productId: {
            type: 'integer',
            description: 'The unique identifier of the product'
          }
        },
        required: ['productId']
      }
    );
  }

  async execute(args) {
    try {
      const { productId } = args;
      
      // Get product by ID
      const product = await ProductModel.findById(productId);
      
      if (!product) {
        return { error: 'Product not found' };
      }
      
      return product;
    } catch (error) {
      console.error('Error in get_product_details tool:', error);
      return { error: 'Failed to get product details' };
    }
  }
}

module.exports = GetProductDetailsTool;