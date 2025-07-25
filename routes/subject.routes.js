const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../db.config');
const { verifyToken } = require('../middleware/auth');

// Get all subjects for a faculty
router.get('/', verifyToken, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [subjects] = await connection.execute(
      'SELECT * FROM subjects WHERE faculty_id = ? ORDER BY name',
      [req.user.id]
    );
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  } finally {
    await connection.end();
  }
});

// Create a new subject
router.post('/', verifyToken, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { name, code } = req.body;
    
    // Check if subject code already exists
    const [existing] = await connection.execute(
      'SELECT id FROM subjects WHERE code = ?',
      [code]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    
    const [result] = await connection.execute(
      'INSERT INTO subjects (name, code, faculty_id) VALUES (?, ?, ?)',
      [name, code, req.user.id]
    );
    
    res.status(201).json({
      message: 'Subject created successfully',
      subjectId: result.insertId
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Error creating subject' });
  } finally {
    await connection.end();
  }
});

// Update a subject
router.put('/:id', verifyToken, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { name, code } = req.body;
    const subjectId = req.params.id;
    
    // Verify subject belongs to faculty
    const [subject] = await connection.execute(
      'SELECT id FROM subjects WHERE id = ? AND faculty_id = ?',
      [subjectId, req.user.id]
    );
    
    if (subject.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if new code conflicts with existing subjects
    const [existing] = await connection.execute(
      'SELECT id FROM subjects WHERE code = ? AND id != ?',
      [code, subjectId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    
    await connection.execute(
      'UPDATE subjects SET name = ?, code = ? WHERE id = ?',
      [name, code, subjectId]
    );
    
    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Error updating subject' });
  } finally {
    await connection.end();
  }
});

// Delete a subject
router.delete('/:id', verifyToken, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const subjectId = req.params.id;
    
    // Verify subject belongs to faculty
    const [subject] = await connection.execute(
      'SELECT id FROM subjects WHERE id = ? AND faculty_id = ?',
      [subjectId, req.user.id]
    );
    
    if (subject.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if subject is being used in any classes
    const [classes] = await connection.execute(
      'SELECT id FROM classes WHERE subject_id = ?',
      [subjectId]
    );
    
    if (classes.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete subject as it is being used in one or more classes' 
      });
    }
    
    await connection.execute(
      'DELETE FROM subjects WHERE id = ?',
      [subjectId]
    );
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Error deleting subject' });
  } finally {
    await connection.end();
  }
});

module.exports = router; 