const db = require('../utils/init-db');

class StatsService {
  // Get dashboard statistics
  static async getDashboardStats(userId) {
    try {
      // Query to get total products (since there's only one seller, get all products)
      const { count: totalProducts } = await db.getDb()
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Query to get total orders for all products
      const { count: totalOrders } = await db.getDb()
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Query to get total revenue for all products
      const { data: revenueData, error: revenueError } = await db.getDb()
        .from('transactions')
        .select('SUM(total_price) as revenue')
        .eq('status', 'completed');

      let totalRevenue = 0;
      if (!revenueError && revenueData && revenueData[0]) {
        totalRevenue = parseFloat(revenueData[0].revenue || 0).toFixed(2);
      }

      return {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Get recent activity for the dashboard
  static async getRecentActivity(userId, limit = 10) {
    try {
      // Get recent transactions
      const { data: transactionActivity, error: transactionError } = await db.getDb()
        .from('transactions')
        .select(`
          'order' as type,
          'New order placed' as description,
          created_at as timestamp
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(Math.floor(limit / 2)); // Limit to half to make room for product updates

      if (transactionError) {
        console.error('Error getting transaction activity:', transactionError);
        throw transactionError;
      }

      // Get recent product updates
      const { data: productActivity, error: productError } = await db.getDb()
        .from('products')
        .select(`
          'product' as type,
          CONCAT('Product updated: ', name) as description,
          updated_at as timestamp
        `)
        .order('updated_at', { ascending: false })
        .limit(Math.ceil(limit / 2));

      if (productError) {
        console.error('Error getting product activity:', productError);
        throw productError;
      }

      // Combine and sort activities by timestamp
      const allActivities = [...transactionActivity, ...productActivity];
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Return the first 'limit' items
      return allActivities.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }
}

module.exports = StatsService;