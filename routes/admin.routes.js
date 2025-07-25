const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const csv = require('csv-writer').createObjectCsvWriter;

// Middleware to verify JWT token and check if user is admin
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create new user
router.post('/users', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user
router.put('/users/:userId', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const { userId } = req.params;

    await db.execute(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/users/:userId', verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as totalStudents,
        (SELECT COUNT(*) FROM subjects) as totalSubjects,
        (SELECT COUNT(*) FROM attendance WHERE status = 'present') as totalPresent,
        (SELECT COUNT(*) FROM attendance WHERE status = 'absent') as totalAbsent
    `);
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Generate attendance report
router.get('/report', verifyAdminToken, async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;

    let query = `
      SELECT 
        u.name as student_name,
        u.email as student_email,
        s.name as subject_name,
        s.code as subject_code,
        c.scheduled_time as class_time,
        a.timestamp as attendance_time,
        a.status
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(a.timestamp) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(a.timestamp) <= ?';
      params.push(endDate);
    }

    if (subjectId) {
      query += ' AND a.subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY a.timestamp DESC';

    const [attendance] = await db.execute(query, params);

    // Generate CSV
    const csvWriter = csvWriter({
      path: 'attendance_report.csv',
      header: [
        { id: 'student_name', title: 'Student Name' },
        { id: 'student_email', title: 'Student Email' },
        { id: 'subject_name', title: 'Subject' },
        { id: 'subject_code', title: 'Subject Code' },
        { id: 'class_time', title: 'Class Time' },
        { id: 'attendance_time', title: 'Attendance Time' },
        { id: 'status', title: 'Status' }
      ]
    });

    await csvWriter.writeRecords(attendance);

    res.download('attendance_report.csv', 'attendance_report.csv');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await db.query('SELECT * FROM subjects');
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

module.exports = router; 