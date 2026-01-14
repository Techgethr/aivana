const db = require('../database/db');

class UserModel {
  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password_hash } = userData;
      const stmt = db.getDb().prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      );
      stmt.run([username, email, password_hash], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...userData });
        }
      });
      stmt.finalize();
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        'SELECT * FROM users WHERE email = ?',
        [email],
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

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        'SELECT * FROM users WHERE id = ?',
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
}

module.exports = UserModel;