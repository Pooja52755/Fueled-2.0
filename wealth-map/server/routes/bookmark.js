const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');

// @route   POST api/bookmark/property/:id
// @desc    Bookmark a property
// @access  Private
router.post('/property/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      // If property doesn't exist in our database, it might be a Zillow property
      // We'll allow bookmarking by ID without validation for external properties
      console.log(`Property ${propertyId} not found in database, allowing bookmark by ID`);
    }

    // Check if already bookmarked
    if (user.bookmarkedProperties.includes(propertyId)) {
      return res.status(400).json({ msg: 'Property already bookmarked' });
    }

    // Add to bookmarks
    user.bookmarkedProperties.push(propertyId);
    await user.save();

    res.json({ 
      success: true, 
      msg: 'Property bookmarked successfully',
      bookmarkedProperties: user.bookmarkedProperties
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/bookmark/property/:id
// @desc    Remove bookmark from a property
// @access  Private
router.delete('/property/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;

    // Check if bookmarked
    if (!user.bookmarkedProperties.includes(propertyId)) {
      return res.status(400).json({ msg: 'Property not bookmarked' });
    }

    // Remove from bookmarks
    user.bookmarkedProperties = user.bookmarkedProperties.filter(
      id => id.toString() !== propertyId
    );
    await user.save();

    res.json({ 
      success: true, 
      msg: 'Property removed from bookmarks',
      bookmarkedProperties: user.bookmarkedProperties
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookmark/properties
// @desc    Get all bookmarked properties
// @access  Private
router.get('/properties', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarkedProperties');
    res.json(user.bookmarkedProperties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookmark/check/:id
// @desc    Check if a property is bookmarked
// @access  Private
router.get('/check/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isBookmarked = user.bookmarkedProperties.includes(req.params.id);
    res.json({ isBookmarked });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
