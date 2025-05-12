const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Models
const User = require('../models/User');

// @route   GET api/employees/profile
// @desc    Get current employee profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
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

// @route   PUT api/employees/profile
// @desc    Update employee profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        firstName,
        lastName,
        notificationPreferences
      } = req.body;

      // Build user object
      const userFields = {};
      if (firstName) userFields.firstName = firstName;
      if (lastName) userFields.lastName = lastName;
      if (notificationPreferences) userFields.notificationPreferences = notificationPreferences;

      // Update user
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userFields },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/employees/accept-terms
// @desc    Accept terms of service
// @access  Private
router.put('/accept-terms', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.acceptedTerms = true;
    await user.save();
    
    res.json({ msg: 'Terms accepted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/employees/complete-onboarding
// @desc    Mark onboarding as completed
// @access  Private
router.put('/complete-onboarding', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.completedOnboarding = true;
    await user.save();
    
    res.json({ msg: 'Onboarding completed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/employees/mfa
// @desc    Enable/disable multi-factor authentication
// @access  Private
router.put('/mfa', auth, async (req, res) => {
  try {
    const { enabled, secret } = req.body;
    
    const user = await User.findById(req.user.id);
    
    user.mfaEnabled = enabled;
    if (secret) user.mfaSecret = secret;
    
    await user.save();
    
    res.json({ 
      mfaEnabled: user.mfaEnabled,
      msg: user.mfaEnabled ? 'MFA enabled successfully' : 'MFA disabled successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/employees/saved-searches
// @desc    Get employee's saved searches
// @access  Private
router.get('/saved-searches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json(user.savedSearches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/employees/saved-searches
// @desc    Create a new saved search
// @access  Private
router.post(
  '/saved-searches',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('filters', 'Filters are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, filters } = req.body;
      
      const user = await User.findById(req.user.id);
      
      user.savedSearches.push({ name, filters });
      await user.save();
      
      res.json(user.savedSearches);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/employees/saved-searches/:id
// @desc    Delete a saved search
// @access  Private
router.delete('/saved-searches/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find the saved search
    const searchIndex = user.savedSearches.findIndex(
      search => search._id.toString() === req.params.id
    );
    
    if (searchIndex === -1) {
      return res.status(404).json({ msg: 'Saved search not found' });
    }
    
    // Remove the saved search
    user.savedSearches.splice(searchIndex, 1);
    await user.save();
    
    res.json(user.savedSearches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/employees/bookmarked-properties
// @desc    Get employee's bookmarked properties
// @access  Private
router.get('/bookmarked-properties', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedProperties');
    
    res.json(user.bookmarkedProperties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/employees/bookmarked-properties/:propertyId
// @desc    Bookmark a property
// @access  Private
router.post('/bookmarked-properties/:propertyId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if property is already bookmarked
    if (user.bookmarkedProperties.includes(req.params.propertyId)) {
      return res.status(400).json({ msg: 'Property already bookmarked' });
    }
    
    // Add property to bookmarks
    user.bookmarkedProperties.push(req.params.propertyId);
    await user.save();
    
    res.json(user.bookmarkedProperties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/employees/bookmarked-properties/:propertyId
// @desc    Remove a bookmarked property
// @access  Private
router.delete('/bookmarked-properties/:propertyId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find the property in bookmarks
    const propertyIndex = user.bookmarkedProperties.findIndex(
      property => property.toString() === req.params.propertyId
    );
    
    if (propertyIndex === -1) {
      return res.status(404).json({ msg: 'Bookmarked property not found' });
    }
    
    // Remove the property from bookmarks
    user.bookmarkedProperties.splice(propertyIndex, 1);
    await user.save();
    
    res.json(user.bookmarkedProperties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/employees/saved-map-views
// @desc    Get employee's saved map views
// @access  Private
router.get('/saved-map-views', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json(user.savedMapViews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/employees/saved-map-views
// @desc    Create a new saved map view
// @access  Private
router.post(
  '/saved-map-views',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('center', 'Center coordinates are required').not().isEmpty(),
      check('zoom', 'Zoom level is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, center, zoom, filters } = req.body;
      
      const user = await User.findById(req.user.id);
      
      user.savedMapViews.push({ name, center, zoom, filters });
      await user.save();
      
      res.json(user.savedMapViews);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/employees/saved-map-views/:id
// @desc    Delete a saved map view
// @access  Private
router.delete('/saved-map-views/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find the saved map view
    const viewIndex = user.savedMapViews.findIndex(
      view => view._id.toString() === req.params.id
    );
    
    if (viewIndex === -1) {
      return res.status(404).json({ msg: 'Saved map view not found' });
    }
    
    // Remove the saved map view
    user.savedMapViews.splice(viewIndex, 1);
    await user.save();
    
    res.json(user.savedMapViews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
