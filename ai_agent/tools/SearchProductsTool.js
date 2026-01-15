const BaseTool = require('./BaseTool');
const ProductModel = require('../../models/Product');

class SearchProductsTool extends BaseTool {
  constructor() {
    super(
      'search_products',
      'Search for products based on a query string',
      {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to find products'
          }
        },
        required: ['query']
      }
    );
  }

  async execute(args) {
    try {
      const { query } = args;
      
      // Get all products
      const allProducts = await ProductModel.findAll();

      // Filter products based on query (simple text matching)
      const lowerQuery = query.toLowerCase();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
        (product.category_name && product.category_name.toLowerCase().includes(lowerQuery))
      );

      // Return top 5 matching products
      return filteredProducts.slice(0, 5);
    } catch (error) {
      console.error('Error in search_products tool:', error);
      return { error: 'Failed to search products' };
    }
  }
}

module.exports = SearchProductsTool;