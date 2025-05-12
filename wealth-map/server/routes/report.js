const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Models
const Property = require('../models/Property');
const Owner = require('../models/Owner');
const User = require('../models/User');
const Company = require('../models/Company');

// @route   POST api/reports/property
// @desc    Generate a property report
// @access  Private
router.post(
  '/property',
  [
    auth,
    [
      check('propertyId', 'Property ID is required').not().isEmpty(),
      check('format', 'Report format is required').isIn(['json', 'csv', 'pdf'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { propertyId, format, includeOwnerInfo, includeTransactions } = req.body;

      // Check company export permissions
      const company = await Company.findById(req.user.company);
      if (!company.dataAccessPreferences.exportEnabled) {
        return res.status(403).json({ msg: 'Export functionality is disabled for your company' });
      }

      // Get property data
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ msg: 'Property not found' });
      }

      // Prepare report data
      const reportData = {
        property: {
          id: property._id,
          address: property.address,
          propertyType: property.propertyType,
          propertySubType: property.propertySubType,
          size: property.size,
          value: property.value,
          yearBuilt: property.yearBuilt,
          features: property.features,
          description: property.description,
          taxInfo: property.taxInfo
        },
        generatedAt: new Date(),
        generatedBy: {
          userId: req.user.id,
          company: company.name
        }
      };

      // Include owner information if requested and permitted
      if (includeOwnerInfo && company.dataAccessPreferences.wealthDataAccess) {
        const currentOwners = property.owners.filter(owner => owner.isCurrentOwner);
        
        if (currentOwners.length > 0) {
          const ownerIds = currentOwners.map(owner => owner.owner);
          const owners = await Owner.find({ _id: { $in: ownerIds } });
          
          reportData.owners = owners.map(owner => ({
            id: owner._id,
            name: owner.name,
            ownerType: owner.ownerType,
            wealthData: {
              estimatedNetWorth: owner.wealthData.estimatedNetWorth,
              confidenceLevel: owner.wealthData.confidenceLevel,
              wealthTier: owner.wealthData.wealthTier
            }
          }));
        }
      }

      // Include transaction history if requested and permitted
      if (includeTransactions && company.dataAccessPreferences.ownershipHistoryAccess) {
        reportData.transactions = property.transactions;
      }

      // Record export in user activity (could be implemented with a separate model)
      
      // Return report data based on requested format
      switch (format) {
        case 'json':
          return res.json(reportData);
        case 'csv':
          // In a real implementation, convert to CSV
          return res.json({
            message: 'CSV export functionality would be implemented here',
            data: reportData
          });
        case 'pdf':
          // In a real implementation, generate PDF
          return res.json({
            message: 'PDF export functionality would be implemented here',
            data: reportData
          });
        default:
          return res.json(reportData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/reports/owner
// @desc    Generate an owner report
// @access  Private
router.post(
  '/owner',
  [
    auth,
    [
      check('ownerId', 'Owner ID is required').not().isEmpty(),
      check('format', 'Report format is required').isIn(['json', 'csv', 'pdf'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { ownerId, format, includeProperties } = req.body;

      // Check company export permissions
      const company = await Company.findById(req.user.company);
      if (!company.dataAccessPreferences.exportEnabled) {
        return res.status(403).json({ msg: 'Export functionality is disabled for your company' });
      }

      // Check wealth data access permissions
      if (!company.dataAccessPreferences.wealthDataAccess) {
        return res.status(403).json({ msg: 'Wealth data access is disabled for your company' });
      }

      // Get owner data
      const owner = await Owner.findById(ownerId);
      if (!owner) {
        return res.status(404).json({ msg: 'Owner not found' });
      }

      // Prepare report data
      const reportData = {
        owner: {
          id: owner._id,
          name: owner.name,
          ownerType: owner.ownerType,
          wealthData: owner.wealthData
        },
        generatedAt: new Date(),
        generatedBy: {
          userId: req.user.id,
          company: company.name
        }
      };

      // Include properties if requested
      if (includeProperties) {
        const propertyIds = owner.properties
          .filter(prop => prop.isCurrentOwner)
          .map(prop => prop.property);
        
        const properties = await Property.find({ _id: { $in: propertyIds } });
        
        reportData.properties = properties.map(property => ({
          id: property._id,
          address: property.address,
          propertyType: property.propertyType,
          value: property.value
        }));
      }

      // Return report data based on requested format
      switch (format) {
        case 'json':
          return res.json(reportData);
        case 'csv':
          // In a real implementation, convert to CSV
          return res.json({
            message: 'CSV export functionality would be implemented here',
            data: reportData
          });
        case 'pdf':
          // In a real implementation, generate PDF
          return res.json({
            message: 'PDF export functionality would be implemented here',
            data: reportData
          });
        default:
          return res.json(reportData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/reports/custom
// @desc    Generate a custom report with multiple properties
// @access  Private
router.post(
  '/custom',
  [
    auth,
    [
      check('name', 'Report name is required').not().isEmpty(),
      check('propertyIds', 'At least one property ID is required').isArray({ min: 1 }),
      check('format', 'Report format is required').isIn(['json', 'csv', 'pdf'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { 
        name, 
        description, 
        propertyIds, 
        includeOwnerInfo, 
        includeTransactions, 
        format 
      } = req.body;

      // Check company export permissions
      const company = await Company.findById(req.user.company);
      if (!company.dataAccessPreferences.exportEnabled) {
        return res.status(403).json({ msg: 'Export functionality is disabled for your company' });
      }

      // Get properties data
      const properties = await Property.find({ _id: { $in: propertyIds } });
      
      if (properties.length === 0) {
        return res.status(404).json({ msg: 'No properties found with the provided IDs' });
      }

      // Prepare report data
      const reportData = {
        name,
        description,
        properties: properties.map(property => ({
          id: property._id,
          address: property.address,
          propertyType: property.propertyType,
          propertySubType: property.propertySubType,
          size: property.size,
          value: property.value,
          yearBuilt: property.yearBuilt
        })),
        generatedAt: new Date(),
        generatedBy: {
          userId: req.user.id,
          company: company.name
        }
      };

      // Include owner information if requested and permitted
      if (includeOwnerInfo && company.dataAccessPreferences.wealthDataAccess) {
        // Get all owner IDs from all properties
        const ownerIds = [];
        properties.forEach(property => {
          property.owners
            .filter(owner => owner.isCurrentOwner)
            .forEach(owner => {
              ownerIds.push(owner.owner);
            });
        });
        
        const owners = await Owner.find({ _id: { $in: ownerIds } });
        
        // Add owner data to each property
        reportData.properties = reportData.properties.map(propData => {
          const property = properties.find(p => p._id.toString() === propData.id.toString());
          const propertyOwnerIds = property.owners
            .filter(o => o.isCurrentOwner)
            .map(o => o.owner.toString());
          
          const propertyOwners = owners
            .filter(owner => propertyOwnerIds.includes(owner._id.toString()))
            .map(owner => ({
              id: owner._id,
              name: owner.name,
              ownerType: owner.ownerType,
              wealthData: {
                estimatedNetWorth: owner.wealthData.estimatedNetWorth,
                confidenceLevel: owner.wealthData.confidenceLevel,
                wealthTier: owner.wealthData.wealthTier
              }
            }));
          
          return {
            ...propData,
            owners: propertyOwners
          };
        });
      }

      // Include transaction history if requested and permitted
      if (includeTransactions && company.dataAccessPreferences.ownershipHistoryAccess) {
        reportData.properties = reportData.properties.map(propData => {
          const property = properties.find(p => p._id.toString() === propData.id.toString());
          
          return {
            ...propData,
            transactions: property.transactions
          };
        });
      }

      // Save report to user's history (could be implemented with a separate model)
      
      // Return report data based on requested format
      switch (format) {
        case 'json':
          return res.json(reportData);
        case 'csv':
          // In a real implementation, convert to CSV
          return res.json({
            message: 'CSV export functionality would be implemented here',
            data: reportData
          });
        case 'pdf':
          // In a real implementation, generate PDF
          return res.json({
            message: 'PDF export functionality would be implemented here',
            data: reportData
          });
        default:
          return res.json(reportData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/reports/schedule
// @desc    Schedule a recurring report
// @access  Private
router.post(
  '/schedule',
  [
    auth,
    [
      check('reportType', 'Report type is required').isIn(['property', 'owner', 'custom']),
      check('frequency', 'Frequency is required').isIn(['daily', 'weekly', 'monthly']),
      check('format', 'Report format is required').isIn(['json', 'csv', 'pdf'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { 
        reportType, 
        name,
        description,
        frequency, 
        dayOfWeek, 
        dayOfMonth,
        format,
        recipients,
        parameters
      } = req.body;

      // Check company export permissions
      const company = await Company.findById(req.user.company);
      if (!company.dataAccessPreferences.exportEnabled) {
        return res.status(403).json({ msg: 'Export functionality is disabled for your company' });
      }

      // In a real implementation, save the scheduled report to a database
      // For now, just return a success message
      
      res.json({
        message: 'Report scheduled successfully',
        schedule: {
          reportType,
          name,
          description,
          frequency,
          dayOfWeek,
          dayOfMonth,
          format,
          recipients,
          parameters,
          createdBy: req.user.id,
          createdAt: new Date()
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/reports/export-history
// @desc    Get user's export history
// @access  Private
router.get('/export-history', auth, async (req, res) => {
  try {
    // In a real implementation, fetch the user's export history from a database
    // For now, just return a mock history
    
    res.json([
      {
        id: '1',
        type: 'property',
        name: 'Single Property Report',
        format: 'pdf',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'custom',
        name: 'Multi-Property Portfolio',
        format: 'csv',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'owner',
        name: 'High Net Worth Individuals',
        format: 'json',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/reports/wealth-analysis
// @desc    Generate a wealth analysis report
// @access  Private
router.post(
  '/wealth-analysis',
  [
    auth,
    [
      check('filters', 'Filters are required').not().isEmpty(),
      check('format', 'Report format is required').isIn(['json', 'csv', 'pdf'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { filters, format } = req.body;

      // Check company export permissions
      const company = await Company.findById(req.user.company);
      if (!company.dataAccessPreferences.exportEnabled) {
        return res.status(403).json({ msg: 'Export functionality is disabled for your company' });
      }

      // Build query based on filters
      const query = {};
      
      // Apply wealth tier filter
      if (filters.wealthTier && filters.wealthTier !== 'all') {
        query['wealthData.wealthTier'] = filters.wealthTier;
      }
      
      // Apply net worth range filter
      if (filters.minNetWorth > 0 || filters.maxNetWorth < 1000000000) {
        query['wealthData.estimatedNetWorth'] = {};
        if (filters.minNetWorth > 0) {
          query['wealthData.estimatedNetWorth'].$gte = filters.minNetWorth;
        }
        if (filters.maxNetWorth < 1000000000) {
          query['wealthData.estimatedNetWorth'].$lte = filters.maxNetWorth;
        }
      }

      // Apply location filter if provided
      if (filters.location && filters.location.city) {
        query['contactInfo.address.city'] = filters.location.city;
      }
      if (filters.location && filters.location.state) {
        query['contactInfo.address.state'] = filters.location.state;
      }

      // Get owners data based on filters
      const owners = await Owner.find(query).limit(100);

      // Calculate wealth statistics
      const wealthStats = {
        totalOwners: owners.length,
        averageNetWorth: 0,
        medianNetWorth: 0,
        wealthTierDistribution: {
          low: 0,
          medium: 0,
          high: 0,
          ultra: 0
        },
        wealthComposition: {
          realEstate: 0,
          stocks: 0,
          cash: 0,
          other: 0
        }
      };

      // Calculate statistics
      if (owners.length > 0) {
        // Sort net worths for median calculation
        const netWorths = owners.map(owner => owner.wealthData.estimatedNetWorth).sort((a, b) => a - b);
        
        // Calculate average
        const totalNetWorth = netWorths.reduce((sum, worth) => sum + worth, 0);
        wealthStats.averageNetWorth = totalNetWorth / owners.length;
        
        // Calculate median
        const midIndex = Math.floor(netWorths.length / 2);
        wealthStats.medianNetWorth = netWorths.length % 2 === 0
          ? (netWorths[midIndex - 1] + netWorths[midIndex]) / 2
          : netWorths[midIndex];
        
        // Calculate wealth tier distribution
        owners.forEach(owner => {
          wealthStats.wealthTierDistribution[owner.wealthData.wealthTier]++;
          
          // Add to wealth composition
          if (owner.wealthData.wealthComposition) {
            wealthStats.wealthComposition.realEstate += owner.wealthData.wealthComposition.realEstate || 0;
            wealthStats.wealthComposition.stocks += owner.wealthData.wealthComposition.stocks || 0;
            wealthStats.wealthComposition.cash += owner.wealthData.wealthComposition.cash || 0;
            wealthStats.wealthComposition.other += owner.wealthData.wealthComposition.other || 0;
          }
        });
      }

      // Prepare report data
      const reportData = {
        metadata: {
          reportType: 'Wealth Analysis',
          generatedAt: new Date(),
          generatedBy: req.user.id,
          filters: filters
        },
        wealthStats,
        owners: owners.map(owner => ({
          id: owner._id,
          name: owner.name,
          ownerType: owner.ownerType,
          wealthTier: owner.wealthData.wealthTier,
          estimatedNetWorth: owner.wealthData.estimatedNetWorth,
          wealthComposition: owner.wealthData.wealthComposition
        }))
      };

      // Generate report based on format
      switch (format) {
        case 'json':
          return res.json(reportData);
        
        case 'csv':
          // In a real implementation, this would convert the data to CSV
          // For now, we'll just return the JSON with a message
          return res.json({
            message: 'CSV export functionality will be implemented soon',
            data: reportData
          });
        
        case 'pdf':
          // In a real implementation, this would generate a PDF
          // For now, we'll just return the JSON with a message
          return res.json({
            message: 'PDF export functionality will be implemented soon',
            data: reportData
          });
        
        default:
          return res.json(reportData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
