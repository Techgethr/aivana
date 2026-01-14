const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath = './database/aivana.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'seller',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        stock_quantity INTEGER DEFAULT 0,
        category_id INTEGER,
        image_url TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        eth_transaction_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Categories table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conversations table (for AI agent interactions)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT NOT NULL,
        message TEXT NOT NULL,
        sender_type TEXT NOT NULL, -- 'user' or 'ai'
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');

    // Insert sample data if tables are empty
    this.insertSampleData();
  }

  insertSampleData() {
    // Check if users table is empty
    this.db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
      if (err) {
        console.error('Error checking users table:', err);
        return;
      }

      if (row.count === 0) {
        // Insert sample admin user (password is 'password123' hashed)
        this.db.run(`
          INSERT INTO users (username, email, password_hash, role)
          VALUES ('admin', 'admin@aivana.com', '$2a$10$8K1p/aY4L.oVw55p1Uu0TOJtntIG1ejYqwHKNBzz89LiVK52qXeVm', 'admin')
        `);

        // Insert sample seller user (password is 'password123' hashed)
        this.db.run(`
          INSERT INTO users (username, email, password_hash, role)
          VALUES ('seller1', 'seller1@aivana.com', '$2a$10$8K1p/aY4L.oVw55p1Uu0TOJtntIG1ejYqwHKNBzz89LiVK52qXeVm', 'seller')
        `);

        console.log('Sample users inserted');

        // Wait a bit for users to be inserted, then add categories and products
        setTimeout(() => {
          this.insertSampleCategories();
        }, 500);
      }
    });
  }

  insertSampleCategories() {
    // Insert sample categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Home', description: 'Home and kitchen products' },
      { name: 'Books', description: 'Books and educational materials' },
      { name: 'Sports', description: 'Sports and outdoor equipment' },
      { name: 'Beauty', description: 'Beauty and personal care products' }
    ];

    // Check if categories table is empty
    this.db.get('SELECT COUNT(*) as count FROM categories', [], (err, row) => {
      if (err) {
        console.error('Error checking categories table:', err);
        return;
      }

      if (row.count === 0) {
        categories.forEach(category => {
          this.db.run(`
            INSERT INTO categories (name, description)
            VALUES (?, ?)
          `, [category.name, category.description]);
        });

        console.log('Sample categories inserted');
      }
    });

    // Wait a bit for categories to be inserted, then add products
    setTimeout(() => {
      this.insertSampleProducts();
    }, 500);
  }

  insertSampleProducts() {
    // Check if products table is empty
    this.db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
      if (err) {
        console.error('Error checking products table:', err);
        return;
      }

      if (row.count === 0) {
        // Insert sample products
        const products = [
          {
            seller_id: 2, // seller1
            name: 'Wireless Bluetooth Headphones',
            description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
            price: 129.99,
            currency: 'USD',
            stock_quantity: 50,
            category_name: 'Electronics',
            image_url: 'https://placehold.co/300x300?text=Headphones'
          },
          {
            seller_id: 2,
            name: 'Smart Fitness Watch',
            description: 'Track your heart rate, sleep, and workouts with this advanced smartwatch.',
            price: 199.99,
            currency: 'USD',
            stock_quantity: 30,
            category_name: 'Electronics',
            image_url: 'https://placehold.co/300x300?text=Watch'
          },
          {
            seller_id: 2,
            name: 'Organic Cotton T-Shirt',
            description: 'Comfortable and eco-friendly t-shirt made from 100% organic cotton.',
            price: 24.99,
            currency: 'USD',
            stock_quantity: 100,
            category_name: 'Clothing',
            image_url: 'https://placehold.co/300x300?text=T-Shirt'
          },
          {
            seller_id: 2,
            name: 'Stainless Steel Water Bottle',
            description: 'Keep your drinks hot or cold for hours with this durable water bottle.',
            price: 29.99,
            currency: 'USD',
            stock_quantity: 75,
            category_name: 'Home',
            image_url: 'https://placehold.co/300x300?text=Bottle'
          }
        ];

        // For each product, get the category ID based on the category name
        products.forEach(product => {
          this.db.get(`
            SELECT id FROM categories WHERE name = ?
          `, [product.category_name], (err, categoryRow) => {
            if (err) {
              console.error('Error getting category ID:', err);
              return;
            }

            let categoryId = categoryRow ? categoryRow.id : null;

            this.db.run(`
              INSERT INTO products (seller_id, name, description, price, currency, stock_quantity, category_id, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              product.seller_id,
              product.name,
              product.description,
              product.price,
              product.currency,
              product.stock_quantity,
              categoryId,
              product.image_url
            ]);
          });
        });

        console.log('Sample products inserted');
      }
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
}

module.exports = Database;