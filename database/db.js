const supabase = require('./supabase');

class Database {
  constructor() {
    // Initialize Supabase client
    this.supabase = supabase;
    console.log('Connected to Supabase database');
  }

  getDb() {
    return this.supabase;
  }

  close() {
    // Supabase doesn't require explicit closing like SQLite connections
    console.log('Supabase connection remains available');
  }
}

module.exports = Database;