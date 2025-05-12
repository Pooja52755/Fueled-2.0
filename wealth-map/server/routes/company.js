const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Models
const Company = require('../models/Company');
const User = require('../models/User');

// @route   GET api/companies/me
// @desc    Get current user's company
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/companies/me
// @desc    Update company profile
// @access  Private (Admin only)
router.put(
  '/me',
  [
    auth,
    [
      check('name', 'Company name is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is admin
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to update company profile' });
      }

      const {
        name,
        logo,
        address,
        phone,
        website,
        industry,
        description,
        dataAccessPreferences
      } = req.body;

      // Build company object
      const companyFields = {};
      if (name) companyFields.name = name;
      if (logo) companyFields.logo = logo;
      if (address) companyFields.address = address;
      if (phone) companyFields.phone = phone;
      if (website) companyFields.website = website;
      if (industry) companyFields.industry = industry;
      if (description) companyFields.description = description;
      if (dataAccessPreferences) companyFields.dataAccessPreferences = dataAccessPreferences;

      // Update company
      const company = await Company.findByIdAndUpdate(
        req.user.company,
        { $set: companyFields },
        { new: true }
      );

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/companies/employees
// @desc    Get all employees for a company
// @access  Private (Admin only)
router.get('/employees', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ msg: 'Not authorized to view all employees' });
    }

    const employees = await User.find({ company: req.user.company })
      .select('-password')
      .sort({ lastName: 1 });

    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/companies/employees/:id
// @desc    Update employee status or role
// @access  Private (Admin only)
router.put('/employees/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update employee status' });
    }

    const { isActive, role } = req.body;

    // Find employee
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Check if employee belongs to the same company
    if (employee.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this employee' });
    }

    // Update employee
    if (isActive !== undefined) employee.isActive = isActive;
    if (role) employee.role = role;

    await employee.save();

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/companies/usage-stats
// @desc    Get company usage statistics
// @access  Private (Admin only)
router.get('/usage-stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view usage statistics' });
    }

    // Get employee count
    const employeeCount = await User.countDocuments({ company: req.user.company });

    // Get active employee count
    const activeEmployeeCount = await User.countDocuments({ 
      company: req.user.company,
      isActive: true
    });

    // Get login statistics
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentLogins = await User.countDocuments({
      company: req.user.company,
      lastLogin: { $gte: lastWeek }
    });

    // TODO: Add more usage statistics like searches, exports, etc.

    res.json({
      employeeCount,
      activeEmployeeCount,
      recentLogins,
      // Other statistics
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/companies/data-access
// @desc    Update company data access preferences
// @access  Private (Admin only)
router.put('/data-access', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update data access preferences' });
    }

    const { dataAccessPreferences } = req.body;

    // Update company
    const company = await Company.findByIdAndUpdate(
      req.user.company,
      { $set: { dataAccessPreferences } },
      { new: true }
    );

    res.json(company.dataAccessPreferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
