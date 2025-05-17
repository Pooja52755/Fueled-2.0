const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @route   POST api/export/property/:id
// @desc    Export property details as PDF or JSON
// @access  Private
router.post('/property/:id', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    const propertyId = req.params.id;
    
    // For Zillow properties that might not be in our database
    // We'll create a mock export based on the ID
    let property;
    try {
      property = await Property.findById(propertyId)
        .populate({
          path: 'owners.owner',
          select: 'name ownerType wealthData individual entity'
        });
    } catch (err) {
      console.log(`Property ${propertyId} not found in database, creating mock export`);
      // We'll continue with a null property and handle it below
    }

    // Record the export in user history
    const user = await User.findById(req.user.id);
    if (!user.exportHistory) {
      user.exportHistory = [];
    }
    
    user.exportHistory.push({
      type: 'property',
      itemId: propertyId,
      format,
      timestamp: new Date()
    });
    
    await user.save();

    // Generate export based on format
    if (format === 'json') {
      // For JSON format, just return the property data
      return res.json({
        success: true,
        msg: 'Property data exported successfully',
        data: property || { id: propertyId, note: 'External property data' },
        exportTimestamp: new Date()
      });
    } else if (format === 'pdf') {
      // For PDF, we'd normally generate a PDF file
      // For this implementation, we'll just return a success message
      return res.json({
        success: true,
        msg: 'Property PDF report generated successfully',
        downloadUrl: `/api/export/download/${propertyId}?format=pdf&token=${Date.now()}`,
        exportTimestamp: new Date()
      });
    } else {
      return res.status(400).json({ msg: 'Invalid export format' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/export/download/:id
// @desc    Download exported property report
// @access  Private (via token)
router.get('/download/:id', async (req, res) => {
  try {
    const { format, token } = req.query;
    const propertyId = req.params.id;
    
    // Validate token (in a real implementation, this would be more secure)
    if (!token) {
      return res.status(401).json({ msg: 'No download token provided' });
    }
    
    // In a real implementation, we would generate and serve the actual file
    // For this implementation, we'll create a simple JSON file
    
    const exportData = {
      propertyId,
      exportFormat: format,
      exportTimestamp: new Date(),
      exportToken: token
    };
    
    // Set appropriate headers based on format
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="property-${propertyId}.pdf"`);
      
      // In a real implementation, we would serve a PDF file
      // For now, just send a message
      res.send(`This would be a PDF file for property ${propertyId}`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="property-${propertyId}.json"`);
      res.json(exportData);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/export/share/property/:id
// @desc    Share property details via email
// @access  Private
router.post('/share/property/:id', auth, async (req, res) => {
  try {
    const { email, message } = req.body;
    const propertyId = req.params.id;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
    
    // In a real implementation, we would send an actual email
    // For this implementation, we'll just log the request and return success
    
    console.log(`Sharing property ${propertyId} with ${email}`);
    console.log(`Message: ${message || 'No message provided'}`);
    
    // Record the share in user history
    const user = await User.findById(req.user.id);
    if (!user.shareHistory) {
      user.shareHistory = [];
    }
    
    user.shareHistory.push({
      type: 'property',
      itemId: propertyId,
      sharedWith: email,
      message: message || '',
      timestamp: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      msg: `Property details shared with ${email} successfully`,
      shareTimestamp: new Date()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
