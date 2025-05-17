const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/mapview
// @desc    Save a map view
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, center, zoom, filters } = req.body;

    // Validate required fields
    if (!name || !center || !zoom) {
      return res.status(400).json({ msg: 'Name, center, and zoom are required' });
    }

    // Validate center coordinates
    if (!center.lat || !center.lng) {
      return res.status(400).json({ msg: 'Center must include lat and lng coordinates' });
    }

    const user = await User.findById(req.user.id);

    // Create new map view
    const newMapView = {
      name,
      center,
      zoom,
      filters: filters || {},
      createdAt: new Date()
    };

    // Add to saved map views
    user.savedMapViews.push(newMapView);
    await user.save();

    res.json({ 
      success: true, 
      msg: 'Map view saved successfully',
      savedMapViews: user.savedMapViews
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/mapview
// @desc    Get all saved map views
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.savedMapViews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/mapview/:id
// @desc    Get a specific saved map view
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mapView = user.savedMapViews.id(req.params.id);
    
    if (!mapView) {
      return res.status(404).json({ msg: 'Map view not found' });
    }
    
    res.json(mapView);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/mapview/:id
// @desc    Delete a saved map view
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mapViewId = req.params.id;
    
    // Find and remove the map view
    const mapViewIndex = user.savedMapViews.findIndex(view => view._id.toString() === mapViewId);
    
    if (mapViewIndex === -1) {
      return res.status(404).json({ msg: 'Map view not found' });
    }
    
    user.savedMapViews.splice(mapViewIndex, 1);
    await user.save();
    
    res.json({ 
      success: true, 
      msg: 'Map view deleted successfully',
      savedMapViews: user.savedMapViews
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
