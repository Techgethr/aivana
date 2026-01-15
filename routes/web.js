const express = require('express');
const router = express.Router();

// Import models
const ProductModel = require('../models/Product');

// Home page
router.get('/', async (req, res) => {
  try {
    // Get featured products (latest or most popular)
    const products = await ProductModel.findAll();
    const featuredProducts = products.slice(0, 6); // Get first 6 products as featured
    
    res.render('index', { featuredProducts });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('index', { featuredProducts: [] });
  }
});

// Products page (public)
router.get('/products', async (req, res) => {
  try {
    res.render('products_public');
  } catch (error) {
    console.error('Error loading products page:', error);
    res.status(500).render('products_public', { products: [] });
  }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Manage products page
router.get('/dashboard/products', (req, res) => {
  res.render('products_manage');
});

// Manage categories page
router.get('/dashboard/categories', (req, res) => {
  res.render('categories_manage');
});

// Product detail page
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const ProductModel = require('../models/Product');

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    res.render('product_detail', { product });
  } catch (error) {
    console.error('Error loading product details:', error);
    res.status(500).render('error', { message: 'Error loading product details' });
  }
});


module.exports = router;