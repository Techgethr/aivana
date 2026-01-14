const db = require('../utils/init-db');

class StatsService {
  // Get dashboard statistics
  static async getDashboardStats(userId) {
    return new Promise((resolve, reject) => {
      // Query to get total products (since there's only one seller, get all products)
      const totalProductsQuery = 'SELECT COUNT(*) as count FROM products';

      // Query to get total orders for all products
      const totalOrdersQuery = `
        SELECT COUNT(*) as count
        FROM transactions t
        JOIN products p ON t.product_id = p.id
      `;

      // Query to get total revenue for all products
      const totalRevenueQuery = `
        SELECT SUM(total_price) as revenue
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.status = 'completed'
      `;

      // Execute all queries in parallel using nested callbacks
      let completedQueries = 0;
      let results = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
      };

      // Total products query
      db.getDb().get(totalProductsQuery, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        results.totalProducts = row.count || 0;
        completedQueries++;

        if (completedQueries === 3) {
          resolve(results);
        }
      });

      // Total orders query
      db.getDb().get(totalOrdersQuery, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        results.totalOrders = row.count || 0;
        completedQueries++;

        if (completedQueries === 3) {
          resolve(results);
        }
      });

      // Total revenue query
      db.getDb().get(totalRevenueQuery, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        results.totalRevenue = parseFloat(row.revenue || 0).toFixed(2);
        completedQueries++;

        if (completedQueries === 3) {
          resolve(results);
        }
      });
    });
  }

  // Get recent activity for the dashboard
  static async getRecentActivity(userId, limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          'order' as type,
          'New order placed' as description,
          t.created_at as timestamp
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.status = 'completed'

        UNION ALL

        SELECT
          'product' as type,
          'Product updated: ' || name as description,
          updated_at as timestamp
        FROM products

        ORDER BY timestamp DESC
        LIMIT ?
      `;

      db.getDb().all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = StatsService;