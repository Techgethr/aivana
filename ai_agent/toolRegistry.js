/**
 * Utility function to register all available tools with an AI agent
 * @param {AIAgent} agent - The AI agent to register tools with
 */
function registerAllTools(agent) {
  const { SearchProductsTool, GetProductDetailsTool, GetCategoriesTool, AddToCartTool, RemoveFromCartTool, ViewCartTool, UpdateCartSessionTool, VerifyPaymentTool, GetProductsByCategoryTool } = require('./tools');

  // Register all known tools
  agent.registerTool(new SearchProductsTool());
  agent.registerTool(new GetProductDetailsTool());
  agent.registerTool(new GetCategoriesTool());
  agent.registerTool(new AddToCartTool());
  agent.registerTool(new RemoveFromCartTool());
  agent.registerTool(new ViewCartTool());
  agent.registerTool(new UpdateCartSessionTool());
  agent.registerTool(new VerifyPaymentTool());
  agent.registerTool(new GetProductsByCategoryTool());

  // Add more tools here as they are created
  // Example:
  // agent.registerTool(new AnotherTool());
}

module.exports = {
  registerAllTools
};