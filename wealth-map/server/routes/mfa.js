const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Models
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Middleware
const auth = require('../middleware/auth');

// @route   POST api/mfa/setup
// @desc    Setup MFA for a user
// @access  Private
router.post('/setup', auth, async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `WealthMap:${user.email}`
    });
    
    // Save secret to user
    user.securitySettings = {
      ...user.securitySettings,
      mfaSecret: secret.base32,
      mfaEnabled: false, // Not enabled until verified
      mfaPending: true
    };
    
    await user.save();
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'user_mfa_setup',
      details: {
        status: 'pending'
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/mfa/verify-setup
// @desc    Verify MFA setup
// @access  Private
router.post(
  '/verify-setup',
  [
    auth,
    [
      check('token', 'Token is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { token } = req.body;
      
      // Get user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.mfaSecret,
        encoding: 'base32',
        token
      });
      
      if (!verified) {
        return res.status(400).json({ msg: 'Invalid verification code' });
      }
      
      // Enable MFA
      user.securitySettings = {
        ...user.securitySettings,
        mfaEnabled: true,
        mfaPending: false,
        lastMfaUpdate: new Date()
      };
      
      await user.save();
      
      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_mfa_enabled',
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();
      
      res.json({ msg: 'MFA enabled successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/mfa/disable
// @desc    Disable MFA
// @access  Private
router.post(
  '/disable',
  [
    auth,
    [
      check('token', 'Token is required').not().isEmpty(),
      check('password', 'Password is required').exists()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { token, password } = req.body;
      
      // Get user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      
      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.mfaSecret,
        encoding: 'base32',
        token
      });
      
      if (!verified) {
        return res.status(400).json({ msg: 'Invalid verification code' });
      }
      
      // Disable MFA
      user.securitySettings = {
        ...user.securitySettings,
        mfaEnabled: false,
        mfaPending: false,
        mfaSecret: null,
        lastMfaUpdate: new Date()
      };
      
      await user.save();
      
      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_mfa_disabled',
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();
      
      res.json({ msg: 'MFA disabled successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/mfa/status
// @desc    Get MFA status for the current user
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      mfaEnabled: user.securitySettings?.mfaEnabled || false,
      mfaPending: user.securitySettings?.mfaPending || false
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
