const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const jwt = require('jsonwebtoken');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify admin or faculty role
const verifyAdminOrFaculty = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied. Admin or faculty only.' });
  }
  next();
};

// Get attendance records with filters
router.get('/records', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    const { startDate, endDate, subjectId, studentId } = req.query;
    let query = `
      SELECT a.*, 
             u.name as student_name,
             s.name as subject_name,
             c.scheduled_time
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(c.scheduled_time) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(c.scheduled_time) <= ?';
      params.push(endDate);
    }

    if (subjectId) {
      query += ' AND c.subject_id = ?';
      params.push(subjectId);
    }

    if (studentId) {
      query += ' AND a.student_id = ?';
      params.push(studentId);
    }

    // If user is faculty, only show records for their subjects
    if (req.user.role === 'faculty') {
      query += ' AND s.faculty_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY c.scheduled_time DESC';

    const [records] = await db.execute(query, params);
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get all subjects (for faculty, only their subjects)
router.get('/subjects', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    let query = 'SELECT * FROM subjects';
    const params = [];

    if (req.user.role === 'faculty') {
      query += ' WHERE faculty_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY name';

    const [subjects] = await db.execute(query, params);
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Get all students
router.get('/students', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    const [students] = await db.execute(
      'SELECT id, name FROM users WHERE role = "student" ORDER BY name'
    );
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Update attendance record
router.put('/records/:id', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    const { status, location, remarks } = req.body;
    const recordId = req.params.id;

    // Check if user has permission to edit this record
    const [record] = await db.execute(
      `SELECT c.*, s.faculty_id
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       WHERE a.id = ?`,
      [recordId]
    );

    if (record.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (req.user.role === 'faculty' && record[0].faculty_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.execute(
      `UPDATE attendance 
       SET status = ?, location = ?, remarks = ?
       WHERE id = ?`,
      [status, location, remarks, recordId]
    );

    res.json({ message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating attendance record' });
  }
});

// Delete attendance record
router.delete('/records/:id', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    const recordId = req.params.id;

    // Check if user has permission to delete this record
    const [record] = await db.execute(
      `SELECT c.*, s.faculty_id
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       JOIN subjects s ON c.subject_id = s.id
       WHERE a.id = ?`,
      [recordId]
    );

    if (record.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (req.user.role === 'faculty' && record[0].faculty_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.execute('DELETE FROM attendance WHERE id = ?', [recordId]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting attendance record' });
  }
});

// Export attendance records to CSV
router.get('/export', verifyToken, verifyAdminOrFaculty, async (req, res) => {
  try {
    const { startDate, endDate, subjectId, studentId } = req.query;
    let query = `
      SELECT 
        a.timestamp,
        u.name as student_name,
        s.name as subject_name,
        a.status,
        a.location,
        a.remarks
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(c.scheduled_time) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(c.scheduled_time) <= ?';
      params.push(endDate);
    }

    if (subjectId) {
      query += ' AND c.subject_id = ?';
      params.push(subjectId);
    }

    if (studentId) {
      query += ' AND a.student_id = ?';
      params.push(studentId);
    }

    if (req.user.role === 'faculty') {
      query += ' AND s.faculty_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY c.scheduled_time DESC';

    const [records] = await db.execute(query, params);

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: 'attendance_records.csv',
      header: [
        { id: 'timestamp', title: 'Date & Time' },
        { id: 'student_name', title: 'Student Name' },
        { id: 'subject_name', title: 'Subject' },
        { id: 'status', title: 'Status' },
        { id: 'location', title: 'Location' },
        { id: 'remarks', title: 'Remarks' }
      ]
    });

    // Write records to CSV
    await csvWriter.writeRecords(records);

    // Send file
    res.download('attendance_records.csv', 'attendance_records.csv', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up: delete the file after sending
      require('fs').unlink('attendance_records.csv', (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting attendance records' });
  }
});

// Get student's attendance history
router.get('/student-history', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    const { startDate, endDate, subjectName } = req.query;
    let query = `
      SELECT 
        a.*,
        c.subject_name,
        c.section_name,
        c.department,
        c.scheduled_time,
        u.name as faculty_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON c.faculty_id = u.id
      WHERE a.student_id = ?
    `;
    const params = [req.user.id];

    if (startDate) {
      query += ' AND DATE(c.scheduled_time) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(c.scheduled_time) <= ?';
      params.push(endDate);
    }

    if (subjectName) {
      query += ' AND c.subject_name = ?';
      params.push(subjectName);
    }

    query += ' ORDER BY c.scheduled_time DESC';

    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const [records] = await db.execute(query, params);
    console.log('Query results:', records);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ 
      message: 'Error fetching attendance history',
      error: error.message 
    });
  }
});

// Mark attendance using QR code
router.post('/mark', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark attendance' });
    }

    const { qrCodeData } = req.body;
    if (!qrCodeData) {
      return res.status(400).json({ message: 'QR code data is required' });
    }

    // Parse the QR code data
    const classData = JSON.parse(qrCodeData);
    
    // Verify the class exists and is active
    const [classes] = await db.execute(
      `SELECT * FROM classes 
       WHERE id = ? AND is_active = true`,
      [classData.classId]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Invalid class or class is not active' });
    }

    const classInfo = classes[0];

    // Check if student is already enrolled in this class
    const [enrollments] = await db.execute(
      `SELECT * FROM student_subjects 
       WHERE student_id = ? AND subject_name = ?`,
      [req.user.id, classInfo.subject_name]
    );

    if (enrollments.length === 0) {
      // Enroll student in the subject
      await db.execute(
        `INSERT INTO student_subjects (student_id, subject_name)
         VALUES (?, ?)`,
        [req.user.id, classInfo.subject_name]
      );
    }

    // Record attendance without checking for existing records
    await db.execute(
      `INSERT INTO attendance (class_id, student_id, status, timestamp)
       VALUES (?, ?, 'present', NOW())`,
      [classInfo.id, req.user.id]
    );

    res.json({ 
      message: 'Attendance marked successfully',
      classInfo: {
        subjectName: classInfo.subject_name,
        sectionName: classInfo.section_name,
        department: classInfo.department,
        scheduledTime: classInfo.scheduled_time
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance' });
  }
});

module.exports = router; 