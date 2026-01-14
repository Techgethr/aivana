const db = require('../database/db');

class TransactionModel {
  static async create(transactionData) {
    return new Promise((resolve, reject) => {
      const { buyer_id, product_id, quantity, total_price, currency } = transactionData;
      const stmt = db.getDb().prepare(
        `INSERT INTO transactions 
         (buyer_id, product_id, quantity, total_price, currency) 
         VALUES (?, ?, ?, ?, ?)`
      );
      stmt.run([buyer_id, product_id, quantity, total_price, currency], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...transactionData, status: 'pending' });
        }
      });
      stmt.finalize();
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        `SELECT t.*, u.username as buyer_name, p.name as product_name 
         FROM transactions t 
         JOIN users u ON t.buyer_id = u.id 
         JOIN products p ON t.product_id = p.id 
         WHERE t.id = ?`,
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

  static async findByBuyer(buyerId) {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        `SELECT t.*, p.name as product_name, p.image_url 
         FROM transactions t 
         JOIN products p ON t.product_id = p.id 
         WHERE t.buyer_id = ? 
         ORDER BY t.created_at DESC`,
        [buyerId],
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

  static async updateStatus(id, status, ethTransactionHash = null) {
    return new Promise((resolve, reject) => {
      let stmt;
      if (ethTransactionHash) {
        stmt = db.getDb().prepare(
          'UPDATE transactions SET status = ?, eth_transaction_hash = ? WHERE id = ?'
        );
        stmt.run([status, ethTransactionHash, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      } else {
        stmt = db.getDb().prepare(
          'UPDATE transactions SET status = ? WHERE id = ?'
        );
        stmt.run([status, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      }
      stmt.finalize();
    });
  }
}

module.exports = TransactionModel;