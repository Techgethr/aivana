const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models
const UserModel = require('../models/User');
const ProductModel = require('../models/Product');
const TransactionModel = require('../models/Transaction');

// Import services
const AIAgent = require('../ai_agent/agent');
const EthereumService = require('../blockchain/ethereum');
const StatsService = require('../services/stats');
const aiAgent = new AIAgent();
const ethereumService = new EthereumService();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
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
    if (userId) {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      validatedUserId = userId;
    }
    
    // Process the message with the AI agent
    const result = await aiAgent.processMessage(message, validatedUserId, sessionId);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history
router.get('/ai/conversation/:sessionId', authenticateToken, async (req, res) => {
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
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't return sensitive information like password hash
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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

// Get user's products (requires authentication)
router.get('/products/my', authenticateToken, async (req, res) => {
  try {
    const products = await ProductModel.findBySeller(req.user.id);
    res.json(products);
  } catch (error) {
    console.error('Error getting user products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new product (requires authentication)
router.post('/products', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, currency, stock_quantity, category, image_url } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock_quantity are required' });
    }
    
    const productData = {
      seller_id: req.user.id,
      name,
      description: description || '',
      price: parseFloat(price),
      currency: currency || 'USD',
      stock_quantity: parseInt(stock_quantity),
      category: category || '',
      image_url: image_url || ''
    };
    
    const newProduct = await ProductModel.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a product (requires authentication and ownership)
router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }
    
    const { name, description, price, currency, stock_quantity, category, image_url, status } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency) updateData.currency = currency;
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (category) updateData.category = category;
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

// Delete a product (requires authentication and ownership)
router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }
    
    const success = await ProductModel.delete(productId);
    
    if (success) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const db = require('../utils/init-db');
    const categories = await new Promise((resolve, reject) => {
      db.getDb().all(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" AND status = "active"',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => row.category));
          }
        }
      );
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await TransactionModel.findByBuyer(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Removed transaction verification endpoint as per requirements
// Full transaction functionality will be implemented later

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await StatsService.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const activity = await StatsService.getRecentActivity(req.user.id);
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

// Login route
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Registration route
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      username,
      email,
      password_hash
    };

    const newUser = await UserModel.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't return password hash
    const { password_hash: pwdHash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;