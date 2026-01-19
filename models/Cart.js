const db = require('../utils/init-db');
const CartSessionModel = require('./CartSession');
const ProductModel = require('./Product');

class CartModel {
  /**
   * Add a product to the shopping cart
   * @param {string} sessionId - The session identifier
   * @param {number} productId - The product ID
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<Object>} - The cart item added
   */
  static async addToCart(sessionId, productId, quantity = 1) {
    try {
      // Ensure the cart session exists
      const cartSession = await CartSessionModel.getOrCreateSession(sessionId);
      
      // Check if the product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item already exists in cart for this session
      const { data: existingItem, error: existingError } = await db.getDb()
        .from('cart_items')
        .select('*')
        .eq('cart_session_id', cartSession.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // If item exists, update the quantity
        const newQuantity = existingItem.quantity + quantity;
        const { data, error } = await db.getDb()
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('cart_session_id', cartSession.id)
          .eq('product_id', productId)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        // Also return the product details
        return {
          ...data,
          product: product
        };
      } else {
        // If item doesn't exist, insert new record
        const { data, error } = await db.getDb()
          .from('cart_items')
          .insert([{
            cart_session_id: cartSession.id,
            product_id: productId,
            quantity: quantity
          }])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        // Also return the product details
        return {
          ...data,
          product: product
        };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Remove a product from the shopping cart
   * @param {string} sessionId - The session identifier
   * @param {number} productId - The product ID to remove
   * @returns {Promise<boolean>} - True if successful
   */
  static async removeFromCart(sessionId, productId) {
    try {
      // Get the cart session
      const cartSession = await CartSessionModel.getSession(sessionId);
      if (!cartSession) {
        // If session doesn't exist, nothing to remove
        return true;
      }

      const { data, error } = await db.getDb()
        .from('cart_items')
        .delete()
        .eq('cart_session_id', cartSession.id)
        .eq('product_id', productId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Get all items in the shopping cart for a session
   * @param {string} sessionId - The session identifier
   * @returns {Promise<Array>} - Array of cart items with product details
   */
  static async getCart(sessionId) {
    try {
      // Get the cart session
      const cartSession = await CartSessionModel.getSession(sessionId);
      if (!cartSession) {
        return []; // Return empty array if session doesn't exist
      }

      const { data, error } = await db.getDb()
        .from('cart_items')
        .select(`
          *,
          products (*, categories ( name ))
        `)
        .eq('cart_session_id', cartSession.id)
        .order('added_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  /**
   * Clear the entire shopping cart for a session
   * @param {string} sessionId - The session identifier
   * @returns {Promise<boolean>} - True if successful
   */
  static async clearCart(sessionId) {
    try {
      // Get the cart session
      const cartSession = await CartSessionModel.getSession(sessionId);
      if (!cartSession) {
        // If session doesn't exist, nothing to clear
        return true;
      }

      const { data, error } = await db.getDb()
        .from('cart_items')
        .delete()
        .eq('cart_session_id', cartSession.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Update the quantity of a product in the cart
   * @param {string} sessionId - The session identifier
   * @param {number} productId - The product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} - Updated cart item
   */
  static async updateCartItem(sessionId, productId, quantity) {
    try {
      // Get the cart session
      const cartSession = await CartSessionModel.getSession(sessionId);
      if (!cartSession) {
        // If session doesn't exist, nothing to update
        return null;
      }

      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        return await this.removeFromCart(sessionId, productId);
      }

      const { data, error } = await db.getDb()
        .from('cart_items')
        .update({ quantity })
        .eq('cart_session_id', cartSession.id)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  /**
   * Get the total cost of items in the cart
   * @param {string} sessionId - The session identifier
   * @returns {Promise<number>} - Total cost
   */
  static async getCartTotal(sessionId) {
    try {
      const cartItems = await this.getCart(sessionId);
      
      if (!cartItems || cartItems.length === 0) {
        return 0;
      }

      const total = cartItems.reduce((sum, item) => {
        const itemTotal = (item.products.price || 0) * item.quantity;
        return sum + itemTotal;
      }, 0);

      return total;
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

module.exports = CartModel;