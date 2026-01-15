const db = require('../utils/init-db');

class ProductModel {
  static async create(productData) {
    const { data, error } = await db.getDb()
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findAll() {
    let query = db.getDb()
      .from('products')
      .select(`
        *,
        categories(name) as category_name
      `)
      .neq('status', 'archived');

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await db.getDb()
      .from('products')
      .select(`
        *,
        categories(name) as category_name
      `)
      .eq('id', id)
      .neq('status', 'archived')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findBySeller(sellerId) {
    // Since there's only one seller now, return all active products
    const { data, error } = await db.getDb()
      .from('products')
      .select(`
        *,
        categories(name) as category_name
      `)
      .neq('status', 'archived');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await db.getDb()
      .from('products')
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
    // Instead of deleting, archive the product by changing its status
    const { data, error } = await db.getDb()
      .from('products')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  }
}

module.exports = ProductModel;