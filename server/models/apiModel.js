const { Pool } = require('pg');

const PG_URI =
  'postgres://mlrfcjpy:v9DtEqGPJJ3KKX8GbUm2gMEQE8UsRmmA@stampy.db.elephantsql.com/mlrfcjpy';

// create a new pool using the connection string above
const pool = new Pool({
  connectionString: PG_URI,
  max: 4, // Defaults to 10 which will overrun the elephantsql
});

// Schema for the database can be found below:

// Export an object that contains a property called query,
// which is a function that returns the invocation of pool.query() after logging the query.
// This will be required in the controllers to be the access point to the database.
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  // Added this method in order to ensure I am checking out the client and performing theses connections async without violating total concurrent connections.
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
