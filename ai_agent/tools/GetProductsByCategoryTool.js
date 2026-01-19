const BaseTool = require('./BaseTool');
const ProductModel = require('../../models/Product');
const CategoryModel = require('../../models/Category');

class GetProductsByCategoryTool extends BaseTool {
  constructor() {
    super();
    this.name = 'get_products_by_category';
    this.description = 'Get products by category when user asks about product types. First searches for the category and then returns the first 10 products in that category.';
    this.parameters = {
      type: 'object',
      properties: {
        category_query: {
          type: 'string',
          description: 'The category name or query to search for products'
        }
      },
      required: ['category_query']
    };
  }

  async execute(args) {
    try {
      const { category_query } = args;

      // First, search for the category
      const categories = await CategoryModel.findAll();
      
      // Find a matching category (case-insensitive search)
      let matchedCategory = null;
      for (const category of categories) {
        if (category.name.toLowerCase().includes(category_query.toLowerCase())) {
          matchedCategory = category;
          break;
        }
      }

      // If no category is found, return an appropriate message
      if (!matchedCategory) {
        return {
          message: `No category found matching "${category_query}". Available categories: ${categories.map(c => c.name).join(', ')}`,
          category_found: false,
          products: []
        };
      }

      // If category is found, get the first 10 products in that category
      const products = await ProductModel.findByCategory(matchedCategory.id);
      const limitedProducts = products.slice(0, 10); // Limit to first 10 products

      return {
        message: `Found ${limitedProducts.length} products in the "${matchedCategory.name}" category.`,
        category_found: true,
        category_name: matchedCategory.name,
        category_id: matchedCategory.id,
        products: limitedProducts,
        total_products_in_category: products.length
      };
    } catch (error) {
      console.error('Error in GetProductsByCategoryTool:', error);
      return {
        error: `An error occurred while searching for products in category "${args.category_query}": ${error.message}`
      };
    }
  }
}

module.exports = GetProductsByCategoryTool;