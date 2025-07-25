const mysql = require('mysql2/promise');
const dbConfig = require('./db.config');

async function updateSchema() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Create subjects table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL,
        faculty_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES users(id)
      )
    `);

    // Add subject_id and duration columns to classes table if they don't exist
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM classes
    `);
    
    const hasSubjectId = columns.some(col => col.Field === 'subject_id');
    const hasDuration = columns.some(col => col.Field === 'duration');
    
    if (!hasSubjectId) {
      await connection.execute(`
        ALTER TABLE classes
        ADD COLUMN subject_id INT,
        ADD FOREIGN KEY (subject_id) REFERENCES subjects(id)
      `);
      console.log('Added subject_id column to classes table');
    }
    
    if (!hasDuration) {
      await connection.execute(`
        ALTER TABLE classes
        ADD COLUMN duration INT NOT NULL DEFAULT 60
      `);
      console.log('Added duration column to classes table');
    }

    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await connection.end();
  }
}

updateSchema(); 