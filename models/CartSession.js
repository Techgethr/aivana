const db = require('../utils/init-db');

class CartSessionModel {
  /**
   * Create or get a cart session
   * @param {string} sessionId - The session identifier
   * @param {Object} buyerInfo - Optional buyer information (name, address, etc.)
   * @returns {Promise<Object>} - The cart session
   */
  static async getOrCreateSession(sessionId, buyerInfo = {}) {
    try {
      // Try to get existing session
      const { data: existingSession, error: existingError } = await db.getDb()
        .from('cart_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        // Update session if buyer info is provided
        if (buyerInfo.buyer_name || buyerInfo.shipping_address || buyerInfo.notes) {
          const updateData = {};
          if (buyerInfo.buyer_name) updateData.buyer_name = buyerInfo.buyer_name;
          if (buyerInfo.shipping_address) updateData.shipping_address = buyerInfo.shipping_address;
          if (buyerInfo.notes) updateData.notes = buyerInfo.notes;

          const { data, error } = await db.getDb()
            .from('cart_sessions')
            .update(updateData)
            .eq('session_id', sessionId)
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }

          return data;
        }
        return existingSession;
      } else {
        // Create new session
        const { data, error } = await db.getDb()
          .from('cart_sessions')
          .insert([{
            session_id: sessionId,
            buyer_name: buyerInfo.buyer_name || null,
            shipping_address: buyerInfo.shipping_address || null,
            notes: buyerInfo.notes || null
          }])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data;
      }
    } catch (error) {
      console.error('Error getting/creating cart session:', error);
      throw error;
    }
  }

  /**
   * Update cart session information
   * @param {string} sessionId - The session identifier
   * @param {Object} updateData - Data to update (buyer_name, shipping_address, notes)
   * @returns {Promise<Object>} - Updated cart session
   */
  static async updateSession(sessionId, updateData) {
    try {
      const { data, error } = await db.getDb()
        .from('cart_sessions')
        .update(updateData)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error updating cart session:', error);
      throw error;
    }
  }

  /**
   * Get cart session information
   * @param {string} sessionId - The session identifier
   * @returns {Promise<Object>} - Cart session information
   */
  static async getSession(sessionId) {
    try {
      const { data, error } = await db.getDb()
        .from('cart_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error getting cart session:', error);
      throw error;
    }
  }

  /**
   * Delete a cart session and all associated items
   * @param {string} sessionId - The session identifier
   * @returns {Promise<boolean>} - True if successful
   */
  static async deleteSession(sessionId) {
    try {
      const { error } = await db.getDb()
        .from('cart_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error deleting cart session:', error);
      throw error;
    }
  }
}

module.exports = CartSessionModel;