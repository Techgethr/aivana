// Test script to verify Supabase integration
console.log('Testing Supabase integration...');

// Check if Supabase client is available
try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✓ Supabase client library is available');
} catch (error) {
  console.error('✗ Failed to import Supabase client:', error.message);
}

// Check if environment variables are set
const envVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

let allEnvVarsSet = true;
envVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠ Environment variable ${varName} is not set`);
    allEnvVarsSet = false;
  } else {
    console.log(`✓ Environment variable ${varName} is set`);
  }
});

if (allEnvVarsSet) {
  console.log('✓ All required environment variables are set');
} else {
  console.log('⚠ Some environment variables are missing - please check your .env file');
}

// Test importing the updated modules
try {
  const supabase = require('./database/supabase');
  console.log('✓ Supabase configuration module loads correctly');
} catch (error) {
  console.error('✗ Failed to load Supabase configuration:', error.message);
}

try {
  const db = require('./database/db');
  console.log('✓ Database module loads correctly');
} catch (error) {
  console.error('✗ Failed to load database module:', error.message);
}

try {
  const ProductModel = require('./models/Product');
  console.log('✓ Product model loads correctly');
} catch (error) {
  console.error('✗ Failed to load Product model:', error.message);
}

try {
  const CategoryModel = require('./models/Category');
  console.log('✓ Category model loads correctly');
} catch (error) {
  console.error('✗ Failed to load Category model:', error.message);
}

try {
  const UserModel = require('./models/User');
  console.log('✓ User model loads correctly');
} catch (error) {
  console.error('✗ Failed to load User model:', error.message);
}

try {
  const TransactionModel = require('./models/Transaction');
  console.log('✓ Transaction model loads correctly');
} catch (error) {
  console.error('✗ Failed to load Transaction model:', error.message);
}

try {
  const AIAgent = require('./ai_agent/agent');
  console.log('✓ AI Agent loads correctly');
} catch (error) {
  console.error('✗ Failed to load AI Agent:', error.message);
}

try {
  const StatsService = require('./services/stats');
  console.log('✓ Stats service loads correctly');
} catch (error) {
  console.error('✗ Failed to load Stats service:', error.message);
}

console.log('\nSupabase migration verification complete!');
console.log('Note: This is only a structural verification. Actual database connectivity depends on your Supabase project setup.');