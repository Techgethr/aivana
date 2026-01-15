const db = require('../utils/init-db');

class UserModel {
  static async create(userData) {
    const { data, error } = await db.getDb()
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await db.getDb()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await db.getDb()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await db.getDb()
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id) {
    const { data, error } = await db.getDb()
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  }
}

module.exports = UserModel;