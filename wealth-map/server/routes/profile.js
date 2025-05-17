const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Models
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Middleware
const auth = require('../middleware/auth');
const mfaAuth = require('../middleware/mfaAuth');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('company', 'name logo isActive');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/',
  [
    auth,
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      notificationPreferences
    } = req.body;
    
    try {
      // Get user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Check if email is being changed and if it's already in use
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ msg: 'Email already in use' });
        }
      }
      
      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      if (phone) user.phone = phone;
      if (jobTitle) user.jobTitle = jobTitle;
      
      // Update notification preferences if provided
      if (notificationPreferences) {
        user.notificationPreferences = {
          ...user.notificationPreferences,
          ...notificationPreferences
        };
      }
      
      await user.save();
      
      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_profile_updated',
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();
      
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/profile/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    try {
      // Get user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      // Update security settings
      user.securitySettings = {
        ...user.securitySettings,
        lastPasswordChange: new Date()
      };
      
      await user.save();
      
      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_password_changed',
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();
      
      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { theme, language, dashboardLayout, defaultView } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user preferences
    user.preferences = {
      ...user.preferences,
      ...(theme && { theme }),
      ...(language && { language }),
      ...(dashboardLayout && { dashboardLayout }),
      ...(defaultView && { defaultView })
    };
    
    await user.save();
    
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
