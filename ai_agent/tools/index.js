// Export all available tools
const SearchProductsTool = require('./SearchProductsTool');
const GetProductDetailsTool = require('./GetProductDetailsTool');
const GetCategoriesTool = require('./GetCategoriesTool');
const AddToCartTool = require('./AddToCartTool');
const RemoveFromCartTool = require('./RemoveFromCartTool');
const ViewCartTool = require('./ViewCartTool');
const UpdateCartSessionTool = require('./UpdateCartSessionTool');

// Add more tools as they are created

module.exports = {
  SearchProductsTool,
  GetProductDetailsTool,
  GetCategoriesTool,
  AddToCartTool,
  RemoveFromCartTool,
  ViewCartTool,
  UpdateCartSessionTool
};