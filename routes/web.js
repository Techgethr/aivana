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

// Dashboard route (requires authentication in a real app)
router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Manage products page (requires authentication in a real app)
router.get('/dashboard/products', (req, res) => {
  res.render('products_manage');
});

// Login page
router.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - Aivana</title>
      <link rel="stylesheet" href="/static/css/style.css">
    </head>
    <body>
      <header>
        <nav>
          <div class="logo">AIVANA</div>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/login" class="active">Login</a></li>
          </ul>
        </nav>
      </header>
      
      <main style="max-width: 500px; margin: 2rem auto; padding: 2rem;">
        <h1>Login</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="btn-primary">Login</button>
        </form>
        <p style="margin-top: 1rem;"><a href="/register">Don't have an account? Register here</a></p>
      </main>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              localStorage.setItem('token', data.token);
              alert('Login successful!');
              window.location.href = '/dashboard';
            } else {
              alert(data.error || 'Login failed');
            }
          } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Registration page
router.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Register - Aivana</title>
      <link rel="stylesheet" href="/static/css/style.css">
    </head>
    <body>
      <header>
        <nav>
          <div class="logo">AIVANA</div>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </nav>
      </header>
      
      <main style="max-width: 500px; margin: 2rem auto; padding: 2rem;">
        <h1>Register</h1>
        <form id="registerForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="btn-primary">Register</button>
        </form>
        <p style="margin-top: 1rem;"><a href="/login">Already have an account? Login here</a></p>
      </main>
      
      <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const username = document.getElementById('username').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              localStorage.setItem('token', data.token);
              alert('Registration successful!');
              window.location.href = '/dashboard';
            } else {
              alert(data.error || 'Registration failed');
            }
          } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Logout
router.get('/logout', (req, res) => {
  // In a real app, you would invalidate the token
  res.redirect('/');
});

module.exports = router;