const db = require('../utils/init-db');

class TransactionModel {
  static async create(transactionData) {
    const { data, error } = await db.getDb()
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findAll() {
    const { data, error } = await db.getDb()
      .from('transactions')
      .select(`
        *,
        users(username as buyer_name),
        products(name as product_name)
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findByBuyer(buyerId) {
    const { data, error } = await db.getDb()
      .from('transactions')
      .select(`
        *,
        products(name as product_name)
      `)
      .eq('buyer_id', buyerId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await db.getDb()
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await db.getDb()
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  }

  static async delete(id) {
    const { data, error } = await db.getDb()
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  }
}

module.exports = TransactionModel;