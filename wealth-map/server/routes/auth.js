const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Models
const User = require('../models/User');
const Company = require('../models/Company');

// Middleware
const auth = require('../middleware/auth');

// Config
const config = require('../config/config');

// @route   POST api/auth/register-company
// @desc    Register a new company and admin user
// @access  Public
router.post(
  '/register-company',
  [
    check('companyName', 'Company name is required').not().isEmpty(),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, firstName, lastName, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Check if company already exists
      let company = await Company.findOne({ name: companyName });
      if (company) {
        return res.status(400).json({ msg: 'Company already exists' });
      }

      // Create new company
      company = new Company({
        name: companyName,
        // Other company details can be added here
      });

      await company.save();

      // Create new user
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: 'admin',
        company: company._id
      });

      await user.save();

      // Update company with admin reference
      company.admin = user._id;
      await company.save();

      // Create and return JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          company: user.company
        }
      };

      jwt.sign(
        payload,
        config.jwtSecret || 'wealthmapsecret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email }).populate('company', 'name logo isActive');
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ msg: 'Account is deactivated' });
      }

      // Check if company is active
      if (!user.company.isActive) {
        return res.status(403).json({ msg: 'Company account is deactivated' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Create and return JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          company: user.company._id
        }
      };

      jwt.sign(
        payload,
        config.jwtSecret || 'wealthmapsecret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: user.getProfile()
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('company', 'name logo isActive dataAccessPreferences');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/invite
// @desc    Invite a new employee
// @access  Private (Admin only)
router.post(
  '/invite',
  [
    auth,
    [
      check('email', 'Please include a valid email').isEmail(),
      check('role', 'Role is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, role, firstName, lastName } = req.body;

      // Check if user is admin
      const admin = await User.findById(req.user.id);
      if (admin.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to invite users' });
      }

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create new user
      user = new User({
        email,
        firstName: firstName || 'New',
        lastName: lastName || 'User',
        password: tempPassword,
        role,
        company: admin.company,
        isActive: true
      });

      await user.save();

      // TODO: Send invitation email with temporary password

      res.json({ msg: 'Invitation sent successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'Please enter a new password with 8 or more characters').isLength({ min: 8 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await User.findById(req.user.id);
      
      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
