const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const auth = require('../middleware/auth');

// Get all subjects for the logged-in faculty
router.get('/subjects', auth, async (req, res) => {
  try {
    const [subjects] = await db.query(
      'SELECT * FROM subjects WHERE faculty_id = ?',
      [req.user.id]
    );
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Add a new subject
router.post('/subjects', auth, async (req, res) => {
  try {
    const { name, code } = req.body;
    
    // Check if subject code already exists
    const [existingSubjects] = await db.query(
      'SELECT * FROM subjects WHERE code = ?',
      [code]
    );
    
    if (existingSubjects.length > 0) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    // Insert new subject
    const [result] = await db.query(
      'INSERT INTO subjects (name, code, faculty_id) VALUES (?, ?, ?)',
      [name, code, req.user.id]
    );

    res.status(201).json({
      message: 'Subject added successfully',
      subjectId: result.insertId
    });
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ message: 'Error adding subject' });
  }
});

// Delete a subject
router.delete('/subjects/:id', auth, async (req, res) => {
  try {
    const subjectId = req.params.id;

    // Check if subject belongs to the faculty
    const [subjects] = await db.query(
      'SELECT * FROM subjects WHERE id = ? AND faculty_id = ?',
      [subjectId, req.user.id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Delete the subject
    await db.query('DELETE FROM subjects WHERE id = ?', [subjectId]);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

module.exports = router; 