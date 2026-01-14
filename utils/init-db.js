const Database = require('../database/db');

// Initialize the database
const db = new Database();

// Export the database instance
module.exports = db;