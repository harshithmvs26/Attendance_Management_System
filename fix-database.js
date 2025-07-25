const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to database successfully!');

    // Check if classes table exists
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    if (!tableNames.includes('classes')) {
      console.log('Classes table does not exist. Creating it...');
      await connection.execute(`
        CREATE TABLE classes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          faculty_id INT NOT NULL,
          subject_name VARCHAR(100) NOT NULL,
          section_name VARCHAR(50) NOT NULL,
          department VARCHAR(100) NOT NULL,
          unique_code VARCHAR(20) UNIQUE NOT NULL,
          scheduled_time DATETIME NOT NULL,
          qr_code_data TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          date DATE NOT NULL DEFAULT (CURRENT_DATE),
          start_time TIME NOT NULL DEFAULT '09:00:00',
          end_time TIME NOT NULL DEFAULT '17:00:00',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (faculty_id) REFERENCES users(id)
        )
      `);
      console.log('Classes table created successfully!');
    } else {
      console.log('Classes table exists. Checking columns...');
      
      // Check if faculty_id column exists
      const [columns] = await connection.execute('SHOW COLUMNS FROM classes');
      const columnNames = columns.map(column => column.Field);
      
      if (!columnNames.includes('faculty_id')) {
        console.log('faculty_id column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN faculty_id INT NOT NULL');
        console.log('faculty_id column added successfully!');
      } else {
        console.log('faculty_id column already exists.');
      }
      
      // Check if subject_name column exists
      if (!columnNames.includes('subject_name')) {
        console.log('subject_name column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN subject_name VARCHAR(100) NOT NULL');
        console.log('subject_name column added successfully!');
      } else {
        console.log('subject_name column already exists.');
      }
      
      // Check if is_active column exists
      if (!columnNames.includes('is_active')) {
        console.log('is_active column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN is_active BOOLEAN DEFAULT true');
        console.log('is_active column added successfully!');
      } else {
        console.log('is_active column already exists.');
      }
      
      // Check if section_name column exists
      if (!columnNames.includes('section_name')) {
        console.log('section_name column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN section_name VARCHAR(50) NOT NULL');
        console.log('section_name column added successfully!');
      } else {
        console.log('section_name column already exists.');
      }
      
      // Check if department column exists
      if (!columnNames.includes('department')) {
        console.log('department column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN department VARCHAR(100) NOT NULL');
        console.log('department column added successfully!');
      } else {
        console.log('department column already exists.');
      }
      
      // Check if unique_code column exists
      if (!columnNames.includes('unique_code')) {
        console.log('unique_code column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN unique_code VARCHAR(20) UNIQUE NOT NULL');
        console.log('unique_code column added successfully!');
      } else {
        console.log('unique_code column already exists.');
      }
      
      // Check if scheduled_time column exists
      if (!columnNames.includes('scheduled_time')) {
        console.log('scheduled_time column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN scheduled_time DATETIME NOT NULL');
        console.log('scheduled_time column added successfully!');
      } else {
        console.log('scheduled_time column already exists.');
      }
      
      // Check if qr_code_data column exists
      if (!columnNames.includes('qr_code_data')) {
        console.log('qr_code_data column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN qr_code_data TEXT NOT NULL');
        console.log('qr_code_data column added successfully!');
      } else {
        console.log('qr_code_data column already exists.');
      }
      
      // Check if date column exists and handle it
      if (columnNames.includes('date')) {
        console.log('date column exists. Adding default value...');
        try {
          await connection.execute(`
            ALTER TABLE classes 
            MODIFY date DATE NOT NULL DEFAULT (CURRENT_DATE)
          `);
          console.log('Added default value to date column');
        } catch (error) {
          console.log('Error adding default value to date column:', error.message);
        }
      } else {
        console.log('date column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN date DATE NOT NULL DEFAULT (CURRENT_DATE)');
        console.log('date column added successfully!');
      }
      
      // Check if start_time column exists and handle it
      if (columnNames.includes('start_time')) {
        console.log('start_time column exists. Adding default value...');
        try {
          await connection.execute(`
            ALTER TABLE classes 
            MODIFY start_time TIME NOT NULL DEFAULT '09:00:00'
          `);
          console.log('Added default value to start_time column');
        } catch (error) {
          console.log('Error adding default value to start_time column:', error.message);
        }
      } else {
        console.log('start_time column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN start_time TIME NOT NULL DEFAULT \'09:00:00\'');
        console.log('start_time column added successfully!');
      }
      
      // Check if end_time column exists and handle it
      if (columnNames.includes('end_time')) {
        console.log('end_time column exists. Adding default value...');
        try {
          await connection.execute(`
            ALTER TABLE classes 
            MODIFY end_time TIME NOT NULL DEFAULT '17:00:00'
          `);
          console.log('Added default value to end_time column');
        } catch (error) {
          console.log('Error adding default value to end_time column:', error.message);
        }
      } else {
        console.log('end_time column does not exist. Adding it...');
        await connection.execute('ALTER TABLE classes ADD COLUMN end_time TIME NOT NULL DEFAULT \'17:00:00\'');
        console.log('end_time column added successfully!');
      }
      
      // Check if subject_id column exists and handle it
      if (columnNames.includes('subject_id')) {
        console.log('subject_id column exists. Making it nullable...');
        try {
          // First, try to drop the foreign key constraint if it exists
          await connection.execute(`
            ALTER TABLE classes 
            DROP FOREIGN KEY classes_ibfk_2
          `);
          console.log('Dropped foreign key constraint for subject_id');
        } catch (error) {
          console.log('No foreign key constraint found for subject_id or error dropping it:', error.message);
        }
        
        // Make the column nullable
        await connection.execute(`
          ALTER TABLE classes 
          MODIFY subject_id INT NULL
        `);
        console.log('Made subject_id column nullable');
      }
    }
    
    // Check if student_subjects table exists
    if (!tableNames.includes('student_subjects')) {
      console.log('student_subjects table does not exist. Creating it...');
      await connection.execute(`
        CREATE TABLE student_subjects (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          subject_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      console.log('student_subjects table created successfully!');
    } else {
      console.log('student_subjects table exists. Checking columns...');
      
      // Check if subject_name column exists
      const [columns] = await connection.execute('SHOW COLUMNS FROM student_subjects');
      const columnNames = columns.map(column => column.Field);
      
      if (!columnNames.includes('subject_name')) {
        console.log('subject_name column does not exist. Adding it...');
        await connection.execute('ALTER TABLE student_subjects ADD COLUMN subject_name VARCHAR(100) NOT NULL');
        console.log('subject_name column added successfully!');
      } else {
        console.log('subject_name column already exists.');
      }
      
      // Check if subject_id column exists and handle it
      if (columnNames.includes('subject_id')) {
        console.log('subject_id column exists in student_subjects. Making it nullable...');
        try {
          // First, try to drop the foreign key constraint if it exists
          await connection.execute(`
            ALTER TABLE student_subjects 
            DROP FOREIGN KEY student_subjects_ibfk_2
          `);
          console.log('Dropped foreign key constraint for subject_id in student_subjects');
        } catch (error) {
          console.log('No foreign key constraint found for subject_id in student_subjects or error dropping it:', error.message);
        }
        
        // Make the column nullable
        await connection.execute(`
          ALTER TABLE student_subjects 
          MODIFY subject_id INT NULL
        `);
        console.log('Made subject_id column nullable in student_subjects');
      }
    }
    
    // Check if phone column exists
    if (!columnNames.includes('phone')) {
      console.log('phone column does not exist. Adding it...');
      await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
      console.log('phone column added successfully!');
    } else {
      console.log('phone column already exists.');
    }
    
    console.log('Database structure check and fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await connection.end();
  }
}

fixDatabase(); 