/**
 * Base class for all AI tools
 */
class BaseTool {
  /**
   * Constructor for the tool
   * @param {string} name - Name of the tool
   * @param {string} description - Description of what the tool does
   * @param {Object} parameters - Schema defining the parameters for the tool
   */
  constructor(name, description, parameters) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  /**
   * Execute the tool with given arguments
   * @param {Object} args - Arguments for the tool
   * @returns {Promise<any>} - Result of the tool execution
   */
  async execute(args) {
    throw new Error(`Method 'execute' must be implemented in subclass: ${this.constructor.name}`);
  }

  /**
   * Get the OpenAI function definition for this tool
   * @returns {Object} - OpenAI function definition
   */
  getFunctionDefinition() {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters
      }
    };
  }
}

module.exports = BaseTool;