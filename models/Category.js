const db = require('../utils/init-db');

class CategoryModel {
  static async create(categoryData) {
    return new Promise((resolve, reject) => {
      const { name, description } = categoryData;
      const stmt = db.getDb().prepare(
        `INSERT INTO categories
         (name, description)
         VALUES (?, ?)`
      );
      stmt.run([name, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...categoryData });
        }
      });
      stmt.finalize();
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        'SELECT * FROM categories ORDER BY name ASC',
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
        'SELECT * FROM categories WHERE id = ?',
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

  static async findByName(name) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        'SELECT * FROM categories WHERE name = ?',
        [name],
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

  static async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      const stmt = db.getDb().prepare(
        `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
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
      // Check if any products are associated with this category
      db.getDb().get(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row.count > 0) {
            // Don't allow deletion if products are associated with this category
            reject(new Error('Cannot delete category with associated products'));
          } else {
            const stmt = db.getDb().prepare(
              'DELETE FROM categories WHERE id = ?'
            );
            stmt.run([id], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.changes > 0);
              }
            });
            stmt.finalize();
          }
        }
      );
    });
  }
}

module.exports = CategoryModel;