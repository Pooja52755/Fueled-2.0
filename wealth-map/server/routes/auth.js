const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Models
const User = require('../models/User');
const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');
const Invitation = require('../models/Invitation');

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
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('industry', 'Industry is required').not().isEmpty(),
    check('contactPhone', 'Contact phone is required').not().isEmpty()
  ],
  async (req, res) => {
    console.log('Register company request received:', { 
      companyName: req.body.companyName,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      industry: req.body.industry
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      companyName, 
      firstName, 
      lastName, 
      email, 
      password, 
      industry, 
      contactPhone, 
      website, 
      size, 
      address,
      dataAccessPreferences,
      securitySettings,
      subscriptionPlan
    } = req.body;

    try {
      console.log('Checking if user already exists with email:', email);
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ msg: 'User already exists' });
      }
      
      console.log('User does not exist, proceeding with company creation');

      // Create company with validation
      if (!companyName || !industry) {
        console.log('Missing required company fields');
        return res.status(400).json({ msg: 'Missing required company fields' });
      }
      
      // Check if company already exists
      console.log('Checking if company already exists with name:', companyName);
      const existingCompany = await Company.findOne({ name: companyName });
      if (existingCompany) {
        console.log('Company already exists with name:', companyName);
        return res.status(400).json({ msg: 'Company with this name already exists' });
      }

      // Create company with a unique name
      const company = new Company({
        name: companyName,
        industry,
        contactEmail: email,
        contactPhone: contactPhone || '',
        website: website || '',
        size: size || '1-10',
        address: address || {},
        dataAccessPreferences: dataAccessPreferences || {},
        securitySettings: securitySettings || {},
        subscriptionPlan: subscriptionPlan || 'free',
        subscriptionStatus: 'active',
        subscriptionDetails: {
          startDate: new Date(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        },
        usageStatistics: {
          totalUsers: 1,
          activeUsers: 1,
          lastActivityDate: new Date()
        }
      });

      // Save company
      console.log('Saving company to database...');
      try {
        await company.save();
        console.log('Company saved successfully:', company._id);
      } catch (saveErr) {
        console.error('Error saving company:', saveErr);
        return res.status(500).json({ msg: 'Error creating company', error: saveErr.message });
      }

      // Create admin user
      console.log('Creating admin user...');
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: 'admin',
        company: company._id,
        isVerified: true, // Admin user is automatically verified
        isActive: true,
        lastLogin: new Date(),
        securitySettings: {
          mfaEnabled: false,
          lastPasswordChange: new Date()
        },
        notificationPreferences: {
          email: true,
          inApp: true
        },
        termsAccepted: true,
        acceptedTermsAt: new Date()
      });

      // Save user
      console.log('Saving user to database...');
      try {
        await user.save();
        console.log('User saved successfully:', user._id);
      } catch (saveErr) {
        console.error('Error saving user:', saveErr);
        
        // If user save fails, delete the company to maintain data integrity
        try {
          await Company.findByIdAndDelete(company._id);
          console.log('Deleted company due to user save failure');
        } catch (deleteErr) {
          console.error('Error deleting company after user save failure:', deleteErr);
        }
        
        return res.status(500).json({ msg: 'Error creating user account', error: saveErr.message });
      }

      // Update company with admin reference
      company.administrators = [user._id];
      await company.save();

      // Create activity log entry
      const activityLog = new ActivityLog({
        user: user._id,
        company: company._id,
        action: 'company_registration',
        details: {
          companyName: company.name,
          userEmail: user.email
        },
        ipAddress: req.ip
      });
      await activityLog.save();

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
          res.json({ 
            token,
            user: user.getProfile(),
            company: {
              id: company._id,
              name: company.name,
              industry: company.industry,
              subscriptionPlan: company.subscriptionPlan,
              trialEndDate: company.subscriptionDetails.trialEndDate
            }
          });
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
    console.log('Login request received:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      console.log('Finding user with email:', email);
      let user = await User.findOne({ email }).select('+password').populate('company', 'name logo isActive');
      
      if (!user) {
        console.log('User not found with email:', email);
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      
      console.log('User found:', { id: user._id, email: user.email });

      // Check if user is active
      if (!user.isActive) {
        console.log('User account is deactivated');
        return res.status(403).json({ msg: 'Account is deactivated' });
      }

      // Check if company is active
      if (!user.company || !user.company.isActive) {
        console.log('Company account is deactivated');
        return res.status(403).json({ msg: 'Company account is deactivated' });
      }

      // Check password
      console.log('Comparing password...');
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      
      console.log('Password matched successfully');

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company._id,
        action: 'user_login',
        details: {
          method: 'password'
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      // Check if MFA is enabled
      if (user.securitySettings && user.securitySettings.mfaEnabled) {
        return res.json({
          mfaRequired: true,
          userId: user._id,
          email: user.email
        });
      }

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

// @route   POST api/auth/verify-mfa
// @desc    Verify MFA code and complete login
// @access  Public
router.post(
  '/verify-mfa',
  [
    check('token', 'Token is required').exists(),
    check('code', 'Verification code is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, code } = req.body;

    try {
      // Verify the temporary token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if the token has the requireMfa flag
      if (!decoded.user || !decoded.user.requireMfa) {
        return res.status(400).json({ msg: 'Invalid token' });
      }
      
      // Get the user from the database
      const user = await User.findById(decoded.user.id).populate('company', 'name logo isActive');
      if (!user) {
        return res.status(400).json({ msg: 'User not found' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ msg: 'Account is deactivated' });
      }

      // Check if company is active
      if (!user.company.isActive) {
        return res.status(403).json({ msg: 'Company account is deactivated' });
      }
      
      // Verify MFA code
      if (!user.securitySettings || !user.securitySettings.mfaEnabled) {
        return res.status(400).json({ msg: 'MFA is not enabled for this user' });
      }

      // Verify MFA code using speakeasy
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.mfaSecret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow 2 time steps before and after (30 seconds each)
      });

      if (!verified) {
        return res.status(400).json({ msg: 'Invalid verification code' });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company._id,
        action: 'user_login',
        details: {
          method: 'mfa'
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      // Create and return JWT token with full user information
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company._id,
          mfaVerified: true
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' },
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
// @access  Private (Admin or Manager only)
router.post(
  '/invite',
  [
    auth,
    [
      check('email', 'Please include a valid email').isEmail(),
      check('role', 'Role is required').isIn(['viewer', 'analyst', 'manager', 'admin']),
      check('permissions', 'Permissions must be an array').optional().isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, role, firstName, lastName, permissions, message } = req.body;

      // Check if user has permission to invite
      const inviter = await User.findById(req.user.id);
      if (!['admin', 'manager'].includes(inviter.role)) {
        return res.status(403).json({ msg: 'Not authorized to invite users' });
      }

      // Only admins can invite other admins
      if (role === 'admin' && inviter.role !== 'admin') {
        return res.status(403).json({ msg: 'Only administrators can invite other administrators' });
      }

      // Get company details
      const company = await Company.findById(inviter.company);
      if (!company) {
        return res.status(404).json({ msg: 'Company not found' });
      }

      // Check if company is active
      if (!company.isActive) {
        return res.status(403).json({ msg: 'Company account is inactive' });
      }

      // Check if user already exists
      let existingUser = await User.findOne({ email, company: company._id });
      if (existingUser) {
        return res.status(400).json({ msg: 'User already exists in this company' });
      }

      // Check if invitation already exists
      let existingInvitation = await Invitation.findOne({ 
        email, 
        company: company._id,
        status: 'pending'
      });

      if (existingInvitation) {
        return res.status(400).json({ 
          msg: 'An invitation has already been sent to this email',
          invitation: {
            id: existingInvitation._id,
            email: existingInvitation.email,
            role: existingInvitation.role,
            status: existingInvitation.status,
            expiresAt: existingInvitation.expiresAt
          }
        });
      }

      // Get invitation expiry days from company settings
      const expiryDays = company.invitationSettings?.invitationExpireDays || 7;

      // Create invitation
      const invitation = new Invitation({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        company: company._id,
        invitedBy: inviter._id,
        role,
        permissions: permissions || [],
        token: Invitation.generateToken(),
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
        message: message || '',
        metadata: {
          inviterName: `${inviter.firstName} ${inviter.lastName}`,
          companyName: company.name
        }
      });

      await invitation.save();

      // Log activity
      const activityLog = new ActivityLog({
        user: inviter._id,
        company: company._id,
        action: 'user_invitation',
        details: {
          inviteeEmail: email,
          role,
          invitationId: invitation._id
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      await activityLog.save();

      // TODO: Send invitation email with link
      // This would typically be handled by an email service

      // Update company statistics
      company.usageStatistics.lastActivityDate = new Date();
      await company.save();

      res.json({ 
        msg: 'Invitation sent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/invitations
// @desc    Get all invitations for a company
// @access  Private (Admin or Manager only)
router.get('/invitations', auth, async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized to view invitations' });
    }

    // Get all invitations for the company
    const invitations = await Invitation.find({ company: user.company })
      .sort({ createdAt: -1 })
      .select('-token'); // Don't expose the token

    res.json(invitations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/invitations/:id
// @desc    Update invitation status (revoke, resend)
// @access  Private (Admin or Manager only)
router.put('/invitations/:id', auth, async (req, res) => {
  try {
    const { action } = req.body;

    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized to manage invitations' });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ 
      _id: req.params.id,
      company: user.company
    });

    if (!invitation) {
      return res.status(404).json({ msg: 'Invitation not found' });
    }

    // Handle different actions
    if (action === 'revoke') {
      await invitation.revoke();

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_invitation',
        details: {
          inviteeEmail: invitation.email,
          status: 'revoked',
          invitationId: invitation._id
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      return res.json({ msg: 'Invitation revoked successfully' });
    } else if (action === 'resend') {
      // Get company for settings
      const company = await Company.findById(user.company);
      const expiryDays = company.invitationSettings?.invitationExpireDays || 7;

      // Resend invitation
      await invitation.resend(expiryDays);

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: user.company,
        action: 'user_invitation',
        details: {
          inviteeEmail: invitation.email,
          status: 'resent',
          invitationId: invitation._id
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      // TODO: Send invitation email again

      return res.json({ 
        msg: 'Invitation resent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          expiresAt: invitation.expiresAt
        }
      });
    } else {
      return res.status(400).json({ msg: 'Invalid action' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/accept-invitation/:token
// @desc    Verify invitation token
// @access  Public
router.get('/accept-invitation/:token', async (req, res) => {
  try {
    // Find invitation by token
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('company', 'name logo');

    if (!invitation) {
      return res.status(404).json({ msg: 'Invalid invitation link' });
    }

    // Check if invitation is expired
    if (invitation.isExpired()) {
      await invitation.expire();
      return res.status(400).json({ msg: 'Invitation has expired' });
    }

    // Check if invitation is already accepted
    if (invitation.status !== 'pending') {
      return res.status(400).json({ msg: `Invitation has already been ${invitation.status}` });
    }

    // Return invitation details for the frontend to display
    res.json({
      invitation: {
        id: invitation._id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        company: {
          id: invitation.company._id,
          name: invitation.company.name,
          logo: invitation.company.logo
        },
        expiresAt: invitation.expiresAt
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/accept-invitation/:token
// @desc    Accept invitation and create user account
// @access  Public
router.post(
  '/accept-invitation/:token',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('termsAccepted', 'You must accept the terms of service').equals('true')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, password, termsAccepted } = req.body;

      // Find invitation by token
      const invitation = await Invitation.findOne({ token: req.params.token })
        .populate('company', 'name logo isActive administrators invitationSettings securitySettings');

      if (!invitation) {
        return res.status(404).json({ msg: 'Invalid invitation link' });
      }

      // Check if invitation is expired
      if (invitation.isExpired()) {
        await invitation.expire();
        return res.status(400).json({ msg: 'Invitation has expired' });
      }

      // Check if invitation is already accepted
      if (invitation.status !== 'pending') {
        return res.status(400).json({ msg: `Invitation has already been ${invitation.status}` });
      }

      // Check if company is active
      if (!invitation.company.isActive) {
        return res.status(403).json({ msg: 'Company account is inactive' });
      }

      // Check if user already exists
      let user = await User.findOne({ email: invitation.email, company: invitation.company._id });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create new user
      user = new User({
        firstName,
        lastName,
        email: invitation.email,
        password,
        role: invitation.role,
        permissions: invitation.permissions,
        company: invitation.company._id,
        isVerified: true, // Invited users are automatically verified
        isActive: true,
        lastLogin: new Date(),
        securitySettings: {
          mfaEnabled: invitation.company.securitySettings?.requireMfa || false,
          lastPasswordChange: new Date()
        },
        notificationPreferences: {
          email: true,
          inApp: true
        },
        termsAccepted: termsAccepted === 'true',
        acceptedTermsAt: new Date(),
        metadata: {
          invitationId: invitation._id,
          invitedBy: invitation.invitedBy
        }
      });

      await user.save();

      // Mark invitation as accepted
      await invitation.accept();

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: invitation.company._id,
        action: 'user_invitation_accepted',
        details: {
          invitationId: invitation._id,
          invitedBy: invitation.invitedBy
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      // Update company statistics
      const company = await Company.findById(invitation.company._id);
      company.usageStatistics.totalUsers += 1;
      company.usageStatistics.activeUsers += 1;
      company.usageStatistics.lastActivityDate = new Date();
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
          res.json({
            token,
            user: user.getProfile(),
            company: {
              id: company._id,
              name: company.name,
              logo: company.logo
            }
          });
        }
      );
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
