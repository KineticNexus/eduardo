const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user in request
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to restrict access to admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  }
  next();
};

/**
 * @route   GET api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT api/users/:id
 * @desc    Update user
 * @access  Private (User can update own profile, admin can update any)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is updating their own profile or is an admin
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user fields
    const { name, email } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;

    // Only admin can change role
    if (req.body.role && req.user.role === 'admin') {
      user.role = req.body.role;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   DELETE api/users/:id
 * @desc    Delete user
 * @access  Private (User can delete own profile, admin can delete any)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is deleting their own profile or is an admin
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this user' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();

    res.json({
      success: true,
      msg: 'User deleted'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;