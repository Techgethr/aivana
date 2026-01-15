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

      // Try semantic search first
      try {
        const semanticResults = await ProductModel.findBySemanticSimilarity(query, 5);
        if (semanticResults && semanticResults.length > 0) {
          return semanticResults;
        }
      } catch (semanticError) {
        console.warn('Semantic search failed, falling back to regular search:', semanticError.message);
      }

      // Fallback to regular search
      const allProducts = await ProductModel.findAll();

      // Filter products based on query (simple text matching)
      const lowerQuery = query.toLowerCase();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
        (product.category.name && product.category.name.toLowerCase().includes(lowerQuery))
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