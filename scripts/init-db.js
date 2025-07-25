const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Create connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Executed:', statement.slice(0, 50) + '...');
      } catch (err) {
        console.error('Error executing statement:', statement);
        console.error('Error details:', err);
        throw err;
      }
    }

    console.log('Database initialized successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 