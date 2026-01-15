const db = require('../utils/init-db');

class CategoryModel {
  static async create(categoryData) {
    const { data, error } = await db.getDb()
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findAll() {
    const { data, error } = await db.getDb()
      .from('categories')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await db.getDb()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findByName(name) {
    const { data, error } = await db.getDb()
      .from('categories')
      .select('*')
      .ilike('name', name)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await db.getDb()
      .from('categories')
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
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  }
}

module.exports = CategoryModel;