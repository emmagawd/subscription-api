const { Pool } = require('pg');

// Assuming you're using environment variables to store your database credentials
require('dotenv').config(); // Ensure your .env file contains the necessary DB connection strings

const pool = new Pool({
  connectionString: process.env.PG_URI, // Replace PG_URI with your actual environment variable for DB connection string
});

async function testDbConnection() {
  try {
    // Replace the table_name and column_name with actual table and column names from your database
    const result = await pool.query('SELECT * FROM users LIMIT 1;'); // A simple query to fetch the first row of a table
    console.log('Connection Test Successful:', result.rows);
  } catch (err) {
    console.error('Connection Test Failed:', err);
  } finally {
    await pool.end(); // Closes the database connection
  }
}

testDbConnection();
