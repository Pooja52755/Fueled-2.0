const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const axios = require('axios');
const auth = require('../middleware/auth');
const config = require('../config/config');

// Models
const Property = require('../models/Property');
const Owner = require('../models/Owner');
const User = require('../models/User');
const Company = require('../models/Company');

// @route   GET api/properties
// @desc    Get properties with pagination and filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      propertyType,
      minValue,
      maxValue,
      state,
      city
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (propertyType) filter.propertyType = propertyType;
    if (minValue) filter['value.estimatedValue'] = { $gte: Number(minValue) };
    if (maxValue) {
      if (filter['value.estimatedValue']) {
        filter['value.estimatedValue'].$lte = Number(maxValue);
      } else {
        filter['value.estimatedValue'] = { $lte: Number(maxValue) };
      }
    }
    if (state) filter['address.state'] = state;
    if (city) filter['address.city'] = city;

    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Apply company data access preferences
    if (company.dataAccessPreferences && company.dataAccessPreferences.propertyTypes) {
      filter.propertyType = { $in: company.dataAccessPreferences.propertyTypes };
    }

    // Execute query with pagination
    const properties = await Property.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: 'owners.owner',
        select: 'name ownerType wealthData'
      })
      .sort({ 'value.estimatedValue': -1 });

    // Get total count
    const count = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate({
        path: 'owners.owner',
        select: 'name ownerType wealthData individual entity'
      });

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check company data access permissions
    const company = await Company.findById(req.user.company);
    
    if (
      company.dataAccessPreferences &&
      company.dataAccessPreferences.propertyTypes &&
      !company.dataAccessPreferences.propertyTypes.includes(property.propertyType)
    ) {
      return res.status(403).json({ msg: 'Not authorized to access this property type' });
    }

    res.json(property);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/geocode/:address
// @desc    Geocode an address using Nominatim API
// @access  Private
router.get('/geocode/:address', auth, async (req, res) => {
  try {
    const address = encodeURIComponent(req.params.address);
    
    const response = await axios.get(
      `${config.apiEndpoints.nominatim}?q=${address}&format=json&limit=1`
    );
    
    if (response.data.length === 0) {
      return res.status(404).json({ msg: 'Address not found' });
    }
    
    const location = {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
      displayName: response.data[0].display_name,
      type: response.data[0].type,
      importance: response.data[0].importance
    };
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/by-location
// @desc    Get properties by location (coordinates and radius)
// @access  Private
router.get('/by-location', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 1000, limit = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' });
    }
    
    // Convert radius from meters to degrees (approximate)
    const radiusInDegrees = radius / 111000; // 1 degree is approximately 111km
    
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .limit(parseInt(limit))
    .populate({
      path: 'owners.owner',
      select: 'name ownerType wealthData'
    });
    
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/owner/:ownerId
// @desc    Get properties by owner ID
// @access  Private
router.get('/owner/:ownerId', auth, async (req, res) => {
  try {
    const properties = await Property.find({
      'owners.owner': req.params.ownerId,
      'owners.isCurrentOwner': true
    });
    
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Owner not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/transactions/:propertyId
// @desc    Get transaction history for a property
// @access  Private
router.get('/transactions/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId)
      .select('transactions');
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    // Check company data access permissions
    const company = await Company.findById(req.user.company);
    
    if (
      company.dataAccessPreferences &&
      !company.dataAccessPreferences.ownershipHistoryAccess
    ) {
      return res.status(403).json({ msg: 'Not authorized to access transaction history' });
    }
    
    res.json(property.transactions);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/stats
// @desc    Get property statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Count by property type
    const propertyTypeStats = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);
    
    // Average property value
    const averageValue = await Property.aggregate([
      { $group: { _id: null, average: { $avg: '$value.estimatedValue' } } }
    ]);
    
    // Count by state
    const stateStats = await Property.aggregate([
      { $group: { _id: '$address.state', count: { $sum: 1 } } }
    ]);
    
    // Property value ranges
    const valueRanges = await Property.aggregate([
      {
        $bucket: {
          groupBy: '$value.estimatedValue',
          boundaries: [0, 100000, 250000, 500000, 1000000, 5000000, 10000000],
          default: 'Above 10M',
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    
    res.json({
      propertyTypeStats,
      averageValue: averageValue.length > 0 ? averageValue[0].average : 0,
      stateStats,
      valueRanges
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper function to fetch property data from NYC Open Data API
async function fetchNYCPropertyData(limit = 100) {
  try {
    const response = await axios.get(
      `${config.apiEndpoints.nycProperties}?$limit=${limit}`
    );
    
    return response.data;
  } catch (err) {
    console.error('Error fetching NYC property data:', err.message);
    throw err;
  }
}

// Helper function to fetch mock owner data
async function fetchMockOwnerData(count = 10) {
  try {
    const response = await axios.get(
      `${config.apiEndpoints.mockUsers}?limit=${count}`
    );
    
    return response.data.users;
  } catch (err) {
    console.error('Error fetching mock owner data:', err.message);
    throw err;
  }
}

// @route   GET api/properties/seed-database
// @desc    Seed database with sample property and owner data
// @access  Private (Admin only)
router.get('/seed-database', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to seed database' });
    }
    
    // Fetch NYC property data
    const nycProperties = await fetchNYCPropertyData(50);
    
    // Fetch mock owner data
    const mockOwners = await fetchMockOwnerData(30);
    
    // Create owners
    const ownerIds = [];
    
    for (const mockOwner of mockOwners) {
      const owner = new Owner({
        ownerType: 'individual',
        name: `${mockOwner.firstName} ${mockOwner.lastName}`,
        individual: {
          firstName: mockOwner.firstName,
          lastName: mockOwner.lastName,
          age: mockOwner.age,
          gender: mockOwner.gender.toLowerCase(),
          contactInfo: {
            email: mockOwner.email,
            phone: mockOwner.phone
          }
        },
        wealthData: {
          estimatedNetWorth: Math.floor(Math.random() * 10000000),
          confidenceLevel: Math.floor(Math.random() * 100),
          wealthComposition: {
            realEstate: Math.floor(Math.random() * 5000000),
            stocks: Math.floor(Math.random() * 3000000),
            cash: Math.floor(Math.random() * 1000000),
            other: Math.floor(Math.random() * 1000000)
          },
          incomeEstimate: Math.floor(Math.random() * 500000),
          wealthTier: ['ultra-high', 'high', 'upper-middle', 'middle', 'lower-middle', 'low'][Math.floor(Math.random() * 6)],
          dataSource: 'Mock Data',
          lastUpdated: new Date()
        },
        metadata: {
          source: 'Seed Data',
          dataQualityScore: Math.floor(Math.random() * 100)
        }
      });
      
      await owner.save();
      ownerIds.push(owner._id);
    }
    
    // Create properties
    const propertyIds = [];
    
    for (const nycProperty of nycProperties) {
      // Assign random owner
      const randomOwnerIndex = Math.floor(Math.random() * ownerIds.length);
      const randomOwnerId = ownerIds[randomOwnerIndex];
      
      const property = new Property({
        address: {
          street: nycProperty.address || '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: nycProperty.zipcode || '10001',
          country: 'USA',
          formattedAddress: `${nycProperty.address || '123 Main St'}, New York, NY ${nycProperty.zipcode || '10001'}`
        },
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(nycProperty.longitude) || -73.9857,
            parseFloat(nycProperty.latitude) || 40.7484
          ]
        },
        propertyType: ['residential', 'commercial', 'industrial', 'land'][Math.floor(Math.random() * 4)],
        propertySubType: ['single-family', 'multi-family', 'condo', 'office', 'retail', 'warehouse'][Math.floor(Math.random() * 6)],
        size: {
          buildingSize: parseFloat(nycProperty.gross_square_feet) || Math.floor(Math.random() * 10000),
          lotSize: parseFloat(nycProperty.land_square_feet) || Math.floor(Math.random() * 20000),
          units: Math.floor(Math.random() * 10) + 1,
          bedrooms: Math.floor(Math.random() * 6),
          bathrooms: Math.floor(Math.random() * 4) + 1
        },
        value: {
          estimatedValue: parseFloat(nycProperty.sale_price) || Math.floor(Math.random() * 2000000) + 100000,
          assessedValue: Math.floor(Math.random() * 1500000) + 100000,
          lastSalePrice: parseFloat(nycProperty.sale_price) || Math.floor(Math.random() * 1800000) + 100000,
          lastSaleDate: new Date(nycProperty.sale_date) || new Date(Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)),
          valuationSource: 'NYC Property Data',
          valuationDate: new Date()
        },
        yearBuilt: nycProperty.year_built || Math.floor(Math.random() * 100) + 1920,
        features: ['Parking', 'Elevator', 'Doorman', 'Gym', 'Pool'].filter(() => Math.random() > 0.5),
        images: ['/sample-property-1.jpg', '/sample-property-2.jpg'],
        description: `Beautiful property in ${nycProperty.neighborhood || 'New York City'}`,
        owners: [{
          owner: randomOwnerId,
          ownershipPercentage: 100,
          startDate: new Date(Date.now() - Math.floor(Math.random() * 10 * 365 * 24 * 60 * 60 * 1000)),
          isCurrentOwner: true
        }],
        transactions: [{
          transactionType: 'sale',
          date: new Date(nycProperty.sale_date) || new Date(Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)),
          price: parseFloat(nycProperty.sale_price) || Math.floor(Math.random() * 1800000) + 100000,
          seller: 'Previous Owner',
          buyer: `${mockOwners[randomOwnerIndex].firstName} ${mockOwners[randomOwnerIndex].lastName}`,
          documentNumber: `DOC-${Math.floor(Math.random() * 1000000)}`
        }],
        taxInfo: {
          parcelNumber: `PARCEL-${Math.floor(Math.random() * 1000000)}`,
          taxAssessment: Math.floor(Math.random() * 1000000),
          taxYear: 2023,
          propertyTax: Math.floor(Math.random() * 20000)
        },
        metadata: {
          source: 'NYC Open Data',
          lastUpdated: new Date(),
          dataQualityScore: Math.floor(Math.random() * 100)
        }
      });
      
      await property.save();
      propertyIds.push(property._id);
      
      // Update owner with property reference
      await Owner.findByIdAndUpdate(randomOwnerId, {
        $push: {
          properties: {
            property: property._id,
            ownershipPercentage: 100,
            startDate: new Date(Date.now() - Math.floor(Math.random() * 10 * 365 * 24 * 60 * 60 * 1000)),
            isCurrentOwner: true
          }
        }
      });
    }
    
    res.json({
      message: 'Database seeded successfully',
      ownersCreated: ownerIds.length,
      propertiesCreated: propertyIds.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
