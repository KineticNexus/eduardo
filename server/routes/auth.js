const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @route   POST api/auth/register
 * @desc    Register a user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password
      });

      // Save user to database
      await user.save();

      // Create JWT token
      const token = user.getSignedJwtToken();

      res.status(201).json({
        success: true,
        token
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      // Create JWT token
      const token = user.getSignedJwtToken();

      res.json({
        success: true,
        token
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

/**
 * @route   GET api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // Check for auth token
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;