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

// @route   GET api/search/properties
// @desc    Search properties with text search
// @access  Private
router.get('/properties', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Build search object
    const searchQuery = {
      $text: { $search: query }
    };
    
    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Apply company data access preferences
    if (company.dataAccessPreferences && company.dataAccessPreferences.propertyTypes) {
      searchQuery.propertyType = { $in: company.dataAccessPreferences.propertyTypes };
    }
    
    // Execute query with pagination
    const properties = await Property.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: 'owners.owner',
        select: 'name ownerType wealthData'
      })
      .sort({ score: { $meta: 'textScore' } });
    
    // Get total count
    const count = await Property.countDocuments(searchQuery);
    
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

// @route   GET api/search/owners
// @desc    Search property owners with text search
// @access  Private
router.get('/owners', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 10, wealthRange } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Build search object
    const searchQuery = {
      $text: { $search: query }
    };
    
    // Add wealth range filter if provided
    if (wealthRange) {
      const [min, max] = wealthRange.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        searchQuery['wealthData.estimatedNetWorth'] = { $gte: min, $lte: max };
      } else if (!isNaN(min)) {
        searchQuery['wealthData.estimatedNetWorth'] = { $gte: min };
      } else if (!isNaN(max)) {
        searchQuery['wealthData.estimatedNetWorth'] = { $lte: max };
      }
    }
    
    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Check if wealth data access is allowed
    if (company.dataAccessPreferences && !company.dataAccessPreferences.wealthDataAccess) {
      return res.status(403).json({ msg: 'Not authorized to access wealth data' });
    }
    
    // Execute query with pagination
    const owners = await Owner.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ score: { $meta: 'textScore' } });
    
    // Get total count
    const count = await Owner.countDocuments(searchQuery);
    
    res.json({
      owners,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/search/advanced
// @desc    Advanced search with multiple criteria
// @access  Private
router.get('/advanced', auth, async (req, res) => {
  try {
    const {
      propertyType,
      propertySubType,
      minValue,
      maxValue,
      minSize,
      maxSize,
      state,
      city,
      zipCode,
      yearBuiltMin,
      yearBuiltMax,
      ownerWealthMin,
      ownerWealthMax,
      ownerType,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build property filter
    const propertyFilter = {};
    
    if (propertyType) propertyFilter.propertyType = propertyType;
    if (propertySubType) propertyFilter.propertySubType = propertySubType;
    if (minValue) propertyFilter['value.estimatedValue'] = { $gte: Number(minValue) };
    if (maxValue) {
      if (propertyFilter['value.estimatedValue']) {
        propertyFilter['value.estimatedValue'].$lte = Number(maxValue);
      } else {
        propertyFilter['value.estimatedValue'] = { $lte: Number(maxValue) };
      }
    }
    if (minSize) propertyFilter['size.buildingSize'] = { $gte: Number(minSize) };
    if (maxSize) {
      if (propertyFilter['size.buildingSize']) {
        propertyFilter['size.buildingSize'].$lte = Number(maxSize);
      } else {
        propertyFilter['size.buildingSize'] = { $lte: Number(maxSize) };
      }
    }
    if (state) propertyFilter['address.state'] = state;
    if (city) propertyFilter['address.city'] = city;
    if (zipCode) propertyFilter['address.zipCode'] = zipCode;
    if (yearBuiltMin) propertyFilter.yearBuilt = { $gte: Number(yearBuiltMin) };
    if (yearBuiltMax) {
      if (propertyFilter.yearBuilt) {
        propertyFilter.yearBuilt.$lte = Number(yearBuiltMax);
      } else {
        propertyFilter.yearBuilt = { $lte: Number(yearBuiltMax) };
      }
    }
    
    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Apply company data access preferences
    if (company.dataAccessPreferences && company.dataAccessPreferences.propertyTypes) {
      propertyFilter.propertyType = { $in: company.dataAccessPreferences.propertyTypes };
    }
    
    // Check if we need to filter by owner wealth
    let ownerFilter = null;
    if ((ownerWealthMin || ownerWealthMax) && company.dataAccessPreferences.wealthDataAccess) {
      ownerFilter = {};
      
      if (ownerType) ownerFilter.ownerType = ownerType;
      
      if (ownerWealthMin) ownerFilter['wealthData.estimatedNetWorth'] = { $gte: Number(ownerWealthMin) };
      if (ownerWealthMax) {
        if (ownerFilter['wealthData.estimatedNetWorth']) {
          ownerFilter['wealthData.estimatedNetWorth'].$lte = Number(ownerWealthMax);
        } else {
          ownerFilter['wealthData.estimatedNetWorth'] = { $lte: Number(ownerWealthMax) };
        }
      }
      
      // Find owners matching the criteria
      const owners = await Owner.find(ownerFilter).select('_id');
      const ownerIds = owners.map(owner => owner._id);
      
      // Add owner filter to property filter
      propertyFilter['owners.owner'] = { $in: ownerIds };
      propertyFilter['owners.isCurrentOwner'] = true;
    }
    
    // Execute query with pagination
    const properties = await Property.find(propertyFilter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: 'owners.owner',
        select: 'name ownerType wealthData'
      })
      .sort({ 'value.estimatedValue': -1 });
    
    // Get total count
    const count = await Property.countDocuments(propertyFilter);
    
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

// @route   GET api/search/autocomplete
// @desc    Get autocomplete suggestions for search
// @access  Private
router.get('/autocomplete', auth, async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    const suggestions = [];
    
    // Property address suggestions
    if (type === 'all' || type === 'property') {
      const propertyAddresses = await Property.find({
        $or: [
          { 'address.street': { $regex: query, $options: 'i' } },
          { 'address.city': { $regex: query, $options: 'i' } },
          { 'address.formattedAddress': { $regex: query, $options: 'i' } }
        ]
      })
      .limit(5)
      .select('address');
      
      propertyAddresses.forEach(property => {
        suggestions.push({
          type: 'property',
          text: property.address.formattedAddress || `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`,
          id: property._id
        });
      });
    }
    
    // Owner name suggestions
    if (type === 'all' || type === 'owner') {
      const owners = await Owner.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'individual.firstName': { $regex: query, $options: 'i' } },
          { 'individual.lastName': { $regex: query, $options: 'i' } }
        ]
      })
      .limit(5)
      .select('name ownerType');
      
      owners.forEach(owner => {
        suggestions.push({
          type: 'owner',
          text: owner.name,
          ownerType: owner.ownerType,
          id: owner._id
        });
      });
    }
    
    // City suggestions
    if (type === 'all' || type === 'city') {
      const cities = await Property.aggregate([
        { $match: { 'address.city': { $regex: query, $options: 'i' } } },
        { $group: { _id: '$address.city' } },
        { $limit: 3 }
      ]);
      
      cities.forEach(city => {
        suggestions.push({
          type: 'city',
          text: city._id
        });
      });
    }
    
    // State suggestions
    if (type === 'all' || type === 'state') {
      const states = await Property.aggregate([
        { $match: { 'address.state': { $regex: query, $options: 'i' } } },
        { $group: { _id: '$address.state' } },
        { $limit: 3 }
      ]);
      
      states.forEach(state => {
        suggestions.push({
          type: 'state',
          text: state._id
        });
      });
    }
    
    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/search/census-data
// @desc    Get census data for wealth information
// @access  Private
router.get('/census-data', auth, async (req, res) => {
  try {
    const { state } = req.query;
    
    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Check if wealth data access is allowed
    if (company.dataAccessPreferences && !company.dataAccessPreferences.wealthDataAccess) {
      return res.status(403).json({ msg: 'Not authorized to access wealth data' });
    }
    
    // Fetch median household income by state from Census API
    // B19013_001E is the variable for median household income
    const response = await axios.get(
      `${config.apiEndpoints.censusData}?get=NAME,B19013_001E&for=state:${state || '*'}`
    );
    
    // Format the response
    const formattedData = response.data.slice(1).map(item => ({
      state: item[0],
      medianHouseholdIncome: parseInt(item[1]),
      stateCode: item[2]
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/search/mock-investors
// @desc    Get mock investor data
// @access  Private
router.get('/mock-investors', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get company data access preferences
    const company = await Company.findById(req.user.company);
    
    // Check if wealth data access is allowed
    if (company.dataAccessPreferences && !company.dataAccessPreferences.wealthDataAccess) {
      return res.status(403).json({ msg: 'Not authorized to access wealth data' });
    }
    
    // Fetch mock investor data
    const response = await axios.get(
      `${config.apiEndpoints.mockUsers}?limit=${limit}`
    );
    
    // Format the response to include wealth data
    const investors = response.data.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      age: user.age,
      wealthData: {
        estimatedNetWorth: Math.floor(Math.random() * 10000000) + 100000,
        confidenceLevel: Math.floor(Math.random() * 100),
        wealthComposition: {
          realEstate: Math.floor(Math.random() * 5000000),
          stocks: Math.floor(Math.random() * 3000000),
          cash: Math.floor(Math.random() * 1000000),
          other: Math.floor(Math.random() * 1000000)
        },
        incomeEstimate: Math.floor(Math.random() * 500000) + 50000,
        wealthTier: ['ultra-high', 'high', 'upper-middle', 'middle', 'lower-middle', 'low'][Math.floor(Math.random() * 6)]
      }
    }));
    
    res.json(investors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/search/mock-companies
// @desc    Get mock company data
// @access  Private
router.get('/mock-companies', auth, async (req, res) => {
  try {
    const { quantity = 5 } = req.query;
    
    // Fetch mock company data
    const response = await axios.get(
      `${config.apiEndpoints.mockCompanies}?_quantity=${quantity}`
    );
    
    // Format the response to include wealth data
    const companies = response.data.data.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: {
        street: company.addresses[0]?.street || '',
        city: company.addresses[0]?.city || '',
        state: company.addresses[0]?.state || '',
        zipCode: company.addresses[0]?.zipcode || '',
        country: company.addresses[0]?.country || 'USA'
      },
      wealthData: {
        estimatedNetWorth: Math.floor(Math.random() * 100000000) + 1000000,
        confidenceLevel: Math.floor(Math.random() * 100),
        wealthComposition: {
          realEstate: Math.floor(Math.random() * 50000000),
          stocks: Math.floor(Math.random() * 30000000),
          cash: Math.floor(Math.random() * 10000000),
          other: Math.floor(Math.random() * 10000000)
        },
        incomeEstimate: Math.floor(Math.random() * 5000000) + 500000,
        wealthTier: ['ultra-high', 'high', 'upper-middle'][Math.floor(Math.random() * 3)]
      }
    }));
    
    res.json(companies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
