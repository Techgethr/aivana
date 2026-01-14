const db = require('../utils/init-db');

class ProductModel {
  static async create(productData) {
    return new Promise((resolve, reject) => {
      const { seller_id, name, description, price, currency, stock_quantity, category, image_url } = productData;
      const stmt = db.getDb().prepare(
        `INSERT INTO products 
         (seller_id, name, description, price, currency, stock_quantity, category, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run([seller_id, name, description, price, currency, stock_quantity, category, image_url], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...productData });
        }
      });
      stmt.finalize();
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        `SELECT p.*, u.username as seller_name 
         FROM products p 
         JOIN users u ON p.seller_id = u.id 
         WHERE p.status = 'active'`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        `SELECT p.*, u.username as seller_name 
         FROM products p 
         JOIN users u ON p.seller_id = u.id 
         WHERE p.id = ? AND p.status = 'active'`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static async findBySeller(sellerId) {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        'SELECT * FROM products WHERE seller_id = ?',
        [sellerId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      const stmt = db.getDb().prepare(
        `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      );
      
      stmt.run([...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
      stmt.finalize();
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const stmt = db.getDb().prepare(
        'UPDATE products SET status = ? WHERE id = ?'
      );
      stmt.run(['deleted', id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
      stmt.finalize();
    });
  }
}

module.exports = ProductModel;