const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Middleware to verify JWT token and check if user is faculty
const verifyFacultyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate a unique QR code for a class
const generateQRCode = (classId, subjectId, timestamp) => {
  const data = {
    classId,
    subjectId,
    timestamp,
    random: crypto.randomBytes(16).toString('hex')
  };
  return JSON.stringify(data);
};

// Generate a unique class code
const generateUniqueCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get active QR code for the faculty
router.get('/active', verifyFacultyToken, async (req, res) => {
  try {
    const [classes] = await db.execute(
      `SELECT * FROM classes 
       WHERE faculty_id = ? AND is_active = true
       ORDER BY scheduled_time DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (classes.length === 0) {
      return res.json(null);
    }

    res.json(classes[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching active QR code' });
  }
});

// Get all subjects for the faculty
router.get('/subjects', verifyFacultyToken, async (req, res) => {
  try {
    const [subjects] = await db.execute(
      `SELECT * FROM subjects WHERE faculty_id = ? ORDER BY name`,
      [req.user.id]
    );
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Create a new class
router.post('/', verifyFacultyToken, async (req, res) => {
  try {
    const { subjectId, sectionName, department, scheduledTime, duration, description } = req.body;
    
    // Generate a unique code for the class
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const [result] = await db.execute(
      `INSERT INTO classes (subject_id, section_name, department, scheduled_time, duration, description, faculty_id, unique_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [subjectId, sectionName, department, scheduledTime, duration, description, req.user.id, uniqueCode]
    );

    res.status(201).json({
      message: 'Class created successfully',
      classId: result.insertId,
      uniqueCode
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Error creating class' });
  }
});

// Get all classes for the faculty
router.get('/list', verifyFacultyToken, async (req, res) => {
  try {
    const [classes] = await db.execute(
      `SELECT * FROM classes 
       WHERE faculty_id = ?
       ORDER BY scheduled_time DESC`,
      [req.user.id]
    );

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching classes' });
  }
});

// Get attendance for a specific class
router.get('/:classId/attendance', verifyFacultyToken, async (req, res) => {
  try {
    const [attendance] = await db.execute(
      `SELECT a.*, u.name as student_name, u.email as student_email
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.class_id = ?
       ORDER BY a.timestamp DESC`,
      [req.params.classId]
    );

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

// Update attendance status
router.put('/:classId/attendance/:studentId', verifyFacultyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { classId, studentId } = req.params;

    await db.execute(
      `UPDATE attendance 
       SET status = ?
       WHERE class_id = ? AND student_id = ?`,
      [status, classId, studentId]
    );

    res.json({ message: 'Attendance status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating attendance status' });
  }
});

// Deactivate QR code for a class
router.put('/:classId/deactivate', verifyFacultyToken, async (req, res) => {
  try {
    await db.execute(
      'UPDATE classes SET is_active = false WHERE id = ?',
      [req.params.classId]
    );

    res.json({ message: 'Class deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deactivating class' });
  }
});

// Join a class using unique code
router.post('/join', async (req, res) => {
  try {
    const { uniqueCode } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Only students can join classes' });
    }

    // Find the class with the unique code
    const [classes] = await db.execute(
      `SELECT * FROM classes 
       WHERE unique_code = ? AND is_active = true`,
      [uniqueCode]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Invalid class code or class is not active' });
    }

    const classData = classes[0];

    // Check if student is already enrolled in this class
    const [enrollments] = await db.execute(
      `SELECT * FROM student_subjects 
       WHERE student_id = ? AND subject_name = ?`,
      [decoded.id, classData.subject_name]
    );

    if (enrollments.length === 0) {
      // Enroll student in the subject
      await db.execute(
        `INSERT INTO student_subjects (student_id, subject_name)
         VALUES (?, ?)`,
        [decoded.id, classData.subject_name]
      );
    }

    // Record attendance
    await db.execute(
      `INSERT INTO attendance (class_id, student_id, status)
       VALUES (?, ?, 'present')`,
      [classData.id, decoded.id]
    );

    // Get all classes the student is enrolled in
    const [studentClasses] = await db.execute(
      `SELECT DISTINCT c.* 
       FROM classes c
       JOIN student_subjects ss ON c.subject_name = ss.subject_name
       WHERE ss.student_id = ?
       ORDER BY c.scheduled_time DESC`,
      [decoded.id]
    );

    res.json({ 
      message: 'Successfully joined the class',
      joinedClass: classData,
      studentClasses: studentClasses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error joining class' });
  }
});

// Get classes for a student
router.get('/student-classes', async (req, res) => {
  try {
    console.log('Fetching student classes...');
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (decoded.role !== 'student') {
      console.log('User is not a student');
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    // Get all classes the student is enrolled in
    console.log('Fetching classes for student ID:', decoded.id);
    const [studentClasses] = await db.execute(
      `SELECT DISTINCT c.* 
       FROM classes c
       JOIN student_subjects ss ON c.subject_name = ss.subject_name
       WHERE ss.student_id = ?
       ORDER BY c.scheduled_time DESC`,
      [decoded.id]
    );
    
    console.log('Found student classes:', studentClasses);
    res.json(studentClasses);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Error fetching student classes', error: error.message });
  }
});

// Get list of students who joined a class
router.get('/:classId/students', verifyFacultyToken, async (req, res) => {
  try {
    // First verify that the class belongs to the faculty
    const [classInfo] = await db.execute(
      `SELECT * FROM classes WHERE id = ? AND faculty_id = ?`,
      [req.params.classId, req.user.id]
    );

    if (classInfo.length === 0) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    // Get all students who have marked attendance for this class
    const [students] = await db.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        a.status,
        a.created_at as attendance_time,
        (SELECT COUNT(*) FROM attendance a2 WHERE a2.student_id = u.id AND a2.class_id = ?) as attendance_count
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.class_id = ?
       ORDER BY u.name, a.created_at DESC`,
      [req.params.classId, req.params.classId]
    );

    // Get class details
    const classDetails = classInfo[0];

    res.json({
      classInfo: {
        id: classDetails.id,
        subjectName: classDetails.subject_name,
        sectionName: classDetails.section_name,
        department: classDetails.department,
        scheduledTime: classDetails.scheduled_time,
        isActive: classDetails.is_active
      },
      students: students.map(student => ({
        ...student,
        attendance_time: student.attendance_time ? new Date(student.attendance_time).toISOString() : null
      }))
    });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ 
      message: 'Error fetching class students',
      error: error.message 
    });
  }
});

// Delete a class
router.delete('/:classId', verifyFacultyToken, async (req, res) => {
  try {
    // Verify that the class belongs to the faculty
    const [classes] = await db.execute(
      `SELECT id FROM classes WHERE id = ? AND faculty_id = ?`,
      [req.params.classId, req.user.id]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Delete all attendance records for this class first
    await db.execute(
      `DELETE FROM attendance WHERE class_id = ?`,
      [req.params.classId]
    );

    // Delete the class
    await db.execute(
      `DELETE FROM classes WHERE id = ?`,
      [req.params.classId]
    );

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Error deleting class' });
  }
});

module.exports = router; 