/**
 * Utility function to register all available tools with an AI agent
 * @param {AIAgent} agent - The AI agent to register tools with
 */
function registerAllTools(agent) {
  const { SearchProductsTool, GetProductDetailsTool } = require('./tools');
  
  // Register all known tools
  agent.registerTool(new SearchProductsTool());
  agent.registerTool(new GetProductDetailsTool());
  
  // Add more tools here as they are created
  // Example:
  // agent.registerTool(new AnotherTool());
}

module.exports = {
  registerAllTools
};