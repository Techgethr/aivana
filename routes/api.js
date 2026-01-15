const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models
const UserModel = require('../models/User');
const ProductModel = require('../models/Product');
const TransactionModel = require('../models/Transaction');
const CategoryModel = require('../models/Category');

// Import services
const AIAgent = require('../ai_agent/agent');
const EthereumService = require('../blockchain/ethereum');
const StatsService = require('../services/stats');
const aiAgent = new AIAgent();
const ethereumService = new EthereumService();

// Single seller ID for the platform
const SINGLE_SELLER_ID = 1; // Using the ID of the first user in the DB

// Mock middleware to bypass authentication during development
const authenticateToken = (req, res, next) => {
  // In development mode, we'll use the single seller ID
  req.user = { id: SINGLE_SELLER_ID };
  next();
};

// Alternative middleware that completely bypasses authentication
const bypassAuth = (req, res, next) => {
  // Assign the single seller ID to req.user to satisfy route handlers that expect it
  req.user = { id: SINGLE_SELLER_ID };
  next();
};

// Public API routes (for AI agent access)

// Endpoint for AI agent to process user queries
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }
    
    // If userId is provided, validate it
    let validatedUserId = null;
    // if (userId) {
    //   const user = await UserModel.findById(userId);
    //   if (!user) {
    //     return res.status(404).json({ error: 'User not found' });
    //   }
    //   validatedUserId = userId;
    // }
    
    // Process the message with the AI agent
    const result = await aiAgent.processMessage(message, validatedUserId, sessionId);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history
router.get('/ai/conversation/:sessionId', bypassAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const history = await aiAgent.getConversationHistory(sessionId);

    res.json(history);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected API routes (require authentication)

// Get user profile
router.get('/profile', bypassAuth, async (req, res) => {
  try {
    // Return a fixed seller profile since there's only one seller
    const sellerProfile = {
      id: req.user.id,
      username: 'Main Seller',
      email: 'seller@aivana.com',
      role: 'seller'
    };
    res.json(sellerProfile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products (public endpoint)
router.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let products = await ProductModel.findAll();
    
    // Apply filters if provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        (p.description && p.description.toLowerCase().includes(lowerSearch)) ||
        (p.category && p.category.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (category) {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products (since there's only one seller)
router.get('/products/my', bypassAuth, async (req, res) => {
  try {
    const products = await ProductModel.findBySeller(req.user.id);
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new product (requires authentication)
router.post('/products', bypassAuth, async (req, res) => {
  try {
    const { name, description, price, currency, stock_quantity, category_id, image_url } = req.body;

    // Validate required fields
    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock_quantity are required' });
    }

    const productData = {
      name,
      description: description || '',
      price: parseFloat(price),
      currency: currency || 'USDC',
      stock_quantity: parseInt(stock_quantity),
      category_id: category_id || null,
      image_url: image_url || ''
    };

    const newProduct = await ProductModel.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a product (requires authentication)
router.put('/products/:id', bypassAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, currency, stock_quantity, category_id, image_url, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency) updateData.currency = currency;
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (image_url) updateData.image_url = image_url;
    if (status) updateData.status = status;

    const success = await ProductModel.update(productId, updateData);

    if (success) {
      const updatedProduct = await ProductModel.findById(productId);
      res.json(updatedProduct);
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive a product (requires authentication)
router.delete('/products/:id', bypassAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const success = await ProductModel.delete(productId);

    if (success) {
      res.json({ message: 'Product archived successfully' });
    } else {
      res.status(500).json({ error: 'Failed to archive product' });
    }
  } catch (error) {
    console.error('Error archiving product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories (requires authentication)
router.get('/categories/all', bypassAuth, async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error getting all categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new category (requires authentication)
router.post('/categories', bypassAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if category with this name already exists
    const existingCategory = await CategoryModel.findByName(name);
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const categoryData = {
      name,
      description: description || ''
    };

    const newCategory = await CategoryModel.create(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a category (requires authentication)
router.put('/categories/:id', bypassAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, description } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const success = await CategoryModel.update(categoryId, updateData);

    if (success) {
      const updatedCategory = await CategoryModel.findById(categoryId);
      res.json(updatedCategory);
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a category (requires authentication)
router.delete('/categories/:id', bypassAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const success = await CategoryModel.delete(categoryId);

    if (success) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's transactions
router.get('/transactions', bypassAuth, async (req, res) => {
  try {
    // Get all transactions (since there's only one seller, we might want to show all transactions)
    const db = require('../utils/init-db');
    const transactions = await new Promise((resolve, reject) => {
      db.getDb().all(
        `SELECT t.*, u.username as buyer_name, p.name as product_name
         FROM transactions t
         JOIN users u ON t.buyer_id = u.id
         JOIN products p ON t.product_id = p.id`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Removed transaction verification endpoint as per requirements
// Full transaction functionality will be implemented later

// Get dashboard stats
router.get('/stats', bypassAuth, async (req, res) => {
  try {
    // Get stats for the single seller (using a fixed ID)
    const stats = await StatsService.getDashboardStats(1); // Using the first user ID
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/activity', bypassAuth, async (req, res) => {
  try {
    // Get activity for the single seller (using a fixed ID)
    const activity = await StatsService.getRecentActivity(1); // Using the first user ID
    res.json(activity);
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current ETH/USD conversion rate
router.get('/rates/eth-usd', async (req, res) => {
  try {
    // In a real implementation, this would come from a live exchange rate API
    // For this demo, we'll return a fixed rate
    const ethToUsdRate = 2500; // $2500 per ETH

    res.json({
      rate: ethToUsdRate,
      timestamp: new Date().toISOString(),
      source: 'demo_rate'
    });
  } catch (error) {
    console.error('Error getting rates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Removed transaction creation endpoint as per requirements
// Full transaction functionality will be implemented later

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;