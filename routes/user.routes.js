const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, name, email, phone, role 
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Verify password
router.post('/verify-password', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    const [users] = await db.execute(
      `SELECT password FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, users[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({ verified: true });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ message: 'Error verifying password' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if email is already taken by another user
    const [existingUsers] = await db.execute(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Update user profile
    await db.execute(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [name, email, phone, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user's current password
    const [users] = await db.execute(
      `SELECT password FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

module.exports = router; 