const BaseTool = require('./BaseTool');
const ProductModel = require('../../models/Product');

class GetProductDetailsTool extends BaseTool {
  constructor() {
    super(
      'get_product_details',
      'Get detailed information about a product based on a description or query using semantic search',
      {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Description or query to find the product (e.g., "wireless headphones with noise cancellation")'
          }
        },
        required: ['query']
      }
    );
  }

  async execute(args) {
    try {
      const { query } = args;

      // Use semantic search to find the most relevant product
      const products = await ProductModel.findBySemanticSimilarity(query, 1);

      if (!products || products.length === 0) {
        return { error: 'No product found matching your description' };
      }

      // Return the first (most relevant) product
      return products[0];
    } catch (error) {
      console.error('Error in get_product_details tool:', error);
      return { error: 'Failed to get product details' };
    }
  }
}

module.exports = GetProductDetailsTool;