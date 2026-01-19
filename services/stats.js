const db = require('../utils/init-db');

class StatsService {
  // Get dashboard statistics
  static async getDashboardStats(userId) {
    try {
      // Query to get total products (since there's only one seller, get all products)
      const { count: totalProducts } = await db.getDb()
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Query to get total orders for all products (paid cart sessions)
      const { count: totalOrders } = await db.getDb()
        .from('cart_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid');

      // Query to get total revenue for all products
      // Calculate revenue by summing up the total of each paid cart session
      const { data: paidSessions, error: sessionsError } = await db.getDb()
        .from('cart_sessions')
        .select(`
          id,
          cart_items (*, products (price))
        `)
        .eq('status', 'paid');

      let totalRevenue = 0;
      if (!sessionsError && paidSessions) {
        for (const session of paidSessions) {
          const cartItems = session.cart_items || [];
          for (const item of cartItems) {
            const product = item.products;
            totalRevenue += (product.price || 0) * item.quantity;
          }
        }
      }

      return {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: parseFloat(totalRevenue).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Get recent activity for the dashboard
  static async getRecentActivity(userId, limit = 10) {
    try {
      // Get recent paid cart sessions (orders)
      const { data: orderActivity, error: orderError } = await db.getDb()
        .from('cart_sessions')
        .select(`
          'order' as type,
          CONCAT('Order paid with transaction: ', transaction_id) as description,
          created_at as timestamp
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(Math.floor(limit / 2)); // Limit to half to make room for product updates

      if (orderError) {
        console.error('Error getting order activity:', orderError);
        throw orderError;
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
      const allActivities = [...orderActivity, ...productActivity];
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