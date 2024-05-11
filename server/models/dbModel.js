require('dotenv').config();
const { Pool } = require('pg');

// create a new pool using the connection string above
const pool = new Pool({
  connectionString: process.env.PG_URI,
  max: 4, // Defaults to 10 which will overrun the elephantsql
});

// Log database connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Error connecting to PostgreSQL database:', err);
});

// For testing (to reset database before/after each test)
async function resetDatabase() {
  await pool.query('DELETE FROM subscriptions;');
  await pool.query('DELETE FROM users;');
}

// Export an object that contains a property called query,
// which is a function that returns the invocation of pool.query() after logging the query.
// Required in the controllers to be the access point to the database.
module.exports = {
  resetDatabase,
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  // Added this method in order to ensure we're checking out the client and performing theses connections async without violating total concurrent connections.
  // Sources:
  // https://node-postgres.com/features/pooling
  // https://node-postgres.com/apis/pool
  checkoutQuery: async (text, params, callback) => {
    const client = await pool.connect();
    const res = await client.query(text, params, callback);
    client.release();
    return res;
  },
};
