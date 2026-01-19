const db = require('../utils/init-db');
const EmbeddingService = require('../utils/EmbeddingService');

class ProductModel {
  static async create(productData) {
    // Generate embeddings for the product description if it exists
    if (productData.description) {
      const embeddingService = new EmbeddingService();
      try {
        const embedding = await embeddingService.generateEmbeddings(productData.description);
        productData.description_embedding = embedding;
      } catch (error) {
        console.error('Error generating embeddings for product:', error);
        // Continue without embedding if it fails
      }
    }

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
        category:category_id(name)
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
        category:category_id(name)
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
        category:category_id(name)
      `)
      .neq('status', 'archived');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id, updateData) {
    // Generate embeddings for the product description if it's being updated
    if (updateData.description) {
      const embeddingService = new EmbeddingService();
      try {
        const embedding = await embeddingService.generateEmbeddings(updateData.description);
        updateData.description_embedding = embedding;
      } catch (error) {
        console.error('Error generating embeddings for product update:', error);
        // Continue without embedding if it fails
      }
    }

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

  static async findByCategory(categoryId) {
    const { data, error } = await db.getDb()
      .from('products')
      .select(`
        *,
        category:category_id(name)
      `)
      .eq('category_id', categoryId)
      .neq('status', 'archived');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Find products by semantic similarity to a query
   * @param {string} query - The search query
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Array of similar products
   */
  static async findBySemanticSimilarity(query, limit = 5) {
    const embeddingService = new EmbeddingService();

    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbeddings(query);

      // Convert the embedding array to a string format for Supabase
      const embeddingString = `[${queryEmbedding.join(',')}]`;

      // Use Supabase's custom function for vector similarity search
      // This requires the custom function to be created in the database
      const { data, error } = await db.getDb()
        .rpc('get_similar_products', {
          query_embedding: embeddingString,
          limit_count: limit
        });

      if (error) {
        console.error('Error in semantic search:', error);
        // Fallback to regular search if RPC fails
        console.log('Falling back to regular search...');
        return await ProductModel.findAll(); // Return all products as fallback
      }

      return data;
    } catch (error) {
      console.error('Error in semantic search:', error);
      // Fallback to regular search if embeddings fail
      console.log('Falling back to regular search...');
      return await ProductModel.findAll(); // Return all products as fallback
    }
  }
}

module.exports = ProductModel;