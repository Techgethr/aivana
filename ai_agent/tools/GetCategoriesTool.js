const BaseTool = require('./BaseTool');
const CategoryModel = require('../../models/Category');

class GetCategoriesTool extends BaseTool {
  constructor() {
    super(
      'get_categories',
      'Get the list of available product categories',
      {
        type: 'object',
        properties: {},
        required: []
      }
    );
  }

  async execute(args) {
    try {
      // Get all categories
      const categories = await CategoryModel.findAll();
      
      // Return just the names and basic info
      return categories.map(category => ({
        name: category.name,
        description: category.description
      }));
    } catch (error) {
      console.error('Error in get_categories tool:', error);
      return { error: 'Failed to get categories' };
    }
  }
}

module.exports = GetCategoriesTool;