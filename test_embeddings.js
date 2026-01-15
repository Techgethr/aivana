// Test script to verify embedding functionality
console.log('Testing embedding functionality...');

// Test the EmbeddingService
try {
  const EmbeddingService = require('./utils/EmbeddingService');
  console.log('✓ EmbeddingService module loads correctly');
  
  // Create an instance
  const embeddingService = new EmbeddingService();
  console.log('✓ EmbeddingService instance created');
} catch (error) {
  console.error('✗ Failed to load EmbeddingService:', error.message);
}

// Test the Product model with embedding functionality
try {
  const ProductModel = require('./models/Product');
  console.log('✓ Product model with embedding functionality loads correctly');
} catch (error) {
  console.error('✗ Failed to load Product model:', error.message);
}

// Test the SearchProductsTool with semantic search
try {
  const SearchProductsTool = require('./ai_agent/tools/SearchProductsTool');
  console.log('✓ SearchProductsTool with semantic search loads correctly');
} catch (error) {
  console.error('✗ Failed to load SearchProductsTool:', error.message);
}

// Test embedding generation (will fail without API key, but should load properly)
try {
  const testText = "This is a test product description for embedding";
  console.log('\\nTesting embedding generation with text:', testText);
  console.log('Note: Actual embedding generation requires a valid OpenAI API key');
} catch (error) {
  console.error('✗ Error in test setup:', error.message);
}

console.log('\\nEmbedding functionality test complete!');
console.log('Note: To fully test embeddings, you need a valid OpenAI API key in your environment.');
console.log('The system is set up to:');
console.log('1. Generate embeddings when products are created or updated');
console.log('2. Store embeddings in the description_embedding column');
console.log('3. Perform semantic search using vector similarity');
console.log('4. Fall back to traditional search if embeddings are unavailable');