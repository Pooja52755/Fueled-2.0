const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Models
const Company = require('../models/Company');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Invitation = require('../models/Invitation');

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
      check('name', 'Company name is required').not().isEmpty(),
      check('contactEmail', 'Valid contact email is required').isEmail()
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
        description,
        logo,
        coverImage,
        address,
        contactEmail,
        contactPhone,
        website,
        industry,
        size,
        founded
      } = req.body;

      // Build company object
      const companyFields = {};
      if (name) companyFields.name = name;
      if (description) companyFields.description = description;
      if (logo) companyFields.logo = logo;
      if (coverImage) companyFields.coverImage = coverImage;
      if (address) companyFields.address = address;
      if (contactEmail) companyFields.contactEmail = contactEmail;
      if (contactPhone) companyFields.contactPhone = contactPhone;
      if (website) companyFields.website = website;
      if (industry) companyFields.industry = industry;
      if (size) companyFields.size = size;
      if (founded) companyFields.founded = founded;

      // Update company
      const company = await Company.findByIdAndUpdate(
        req.user.company,
        { $set: companyFields },
        { new: true }
      );

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: company._id,
        action: 'company_update',
        details: {
          updatedFields: Object.keys(companyFields)
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/companies/settings
// @desc    Update company settings
// @access  Private (Admin only)
router.put(
  '/settings',
  [
    auth,
    [
      check('settingsType', 'Settings type is required').isIn([
        'invitation', 'security', 'dataAccess', 'branding'
      ])
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
        return res.status(403).json({ msg: 'Not authorized to update company settings' });
      }

      const { settingsType, settings } = req.body;
      const company = await Company.findById(req.user.company);

      if (!company) {
        return res.status(404).json({ msg: 'Company not found' });
      }

      // Update specific settings based on type
      switch (settingsType) {
        case 'invitation':
          company.invitationSettings = {
            ...company.invitationSettings,
            ...settings
          };
          break;
        case 'security':
          company.securitySettings = {
            ...company.securitySettings,
            ...settings
          };
          break;
        case 'dataAccess':
          company.dataAccessPreferences = {
            ...company.dataAccessPreferences,
            ...settings
          };
          break;
        case 'branding':
          company.brandingSettings = {
            ...company.brandingSettings,
            ...settings
          };
          break;
        default:
          return res.status(400).json({ msg: 'Invalid settings type' });
      }

      await company.save();

      // Log activity
      const activityLog = new ActivityLog({
        user: user._id,
        company: company._id,
        action: 'company_settings_update',
        details: {
          settingsType,
          updatedFields: Object.keys(settings)
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activityLog.save();

      // Return the updated settings section
      let responseData;
      switch (settingsType) {
        case 'invitation':
          responseData = company.invitationSettings;
          break;
        case 'security':
          responseData = company.securitySettings;
          break;
        case 'dataAccess':
          responseData = company.dataAccessPreferences;
          break;
        case 'branding':
          responseData = company.brandingSettings;
          break;
      }

      res.json(responseData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/companies/employees
// @desc    Get all employees for a company
// @access  Private (Admin or Manager only)
router.get('/employees', auth, async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized to view all employees' });
    }

    // Parse query parameters
    const { status, role, search, sort, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { company: req.user.company };
    
    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // Sort options
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOption = { lastName: 1, firstName: 1 };
    }

    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Get employees
    const employees = await User.find(query)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'employee_list_view',
      details: {
        filters: { status, role, search },
        resultCount: employees.length
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/companies/employees/:id
// @desc    Get employee details
// @access  Private (Admin or Manager only)
router.get('/employees/:id', auth, async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized to view employee details' });
    }

    // Find employee
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('company', 'name');
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Check if employee belongs to the same company
    if (employee.company._id.toString() !== user.company.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this employee' });
    }

    // Get activity logs for this employee
    const recentActivity = await ActivityLog.find({ user: employee._id })
      .sort({ timestamp: -1 })
      .limit(10);

    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'employee_profile_view',
      details: {
        employeeId: employee._id,
        employeeEmail: employee.email
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({
      employee,
      recentActivity
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/companies/employees/:id
// @desc    Update employee status, role, or permissions
// @access  Private (Admin only)
router.put('/employees/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update employee' });
    }

    const { isActive, role, permissions, securitySettings, notificationPreferences } = req.body;

    // Find employee
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Check if employee belongs to the same company
    if (employee.company.toString() !== admin.company.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this employee' });
    }

    // Prevent admins from downgrading themselves
    if (employee._id.toString() === admin._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ msg: 'Administrators cannot downgrade their own role' });
    }

    // Track changes for activity log
    const changes = {};

    // Update employee fields
    if (isActive !== undefined && employee.isActive !== isActive) {
      employee.isActive = isActive;
      changes.isActive = isActive;
    }
    
    if (role && employee.role !== role) {
      employee.role = role;
      changes.role = role;
    }
    
    if (permissions) {
      employee.permissions = permissions;
      changes.permissions = permissions;
    }
    
    if (securitySettings) {
      employee.securitySettings = {
        ...employee.securitySettings,
        ...securitySettings
      };
      changes.securitySettings = Object.keys(securitySettings);
    }
    
    if (notificationPreferences) {
      employee.notificationPreferences = {
        ...employee.notificationPreferences,
        ...notificationPreferences
      };
      changes.notificationPreferences = Object.keys(notificationPreferences);
    }

    await employee.save();

    // Log activity
    const activityLog = new ActivityLog({
      user: admin._id,
      company: admin.company,
      action: 'user_role_change',
      details: {
        employeeId: employee._id,
        employeeEmail: employee.email,
        changes
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        permissions: employee.permissions,
        isActive: employee.isActive,
        lastLogin: employee.lastLogin,
        securitySettings: employee.securitySettings,
        notificationPreferences: employee.notificationPreferences
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/companies/employees/:id
// @desc    Deactivate an employee (soft delete)
// @access  Private (Admin only)
router.delete('/employees/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to deactivate employees' });
    }

    // Find employee
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Check if employee belongs to the same company
    if (employee.company.toString() !== admin.company.toString()) {
      return res.status(403).json({ msg: 'Not authorized to deactivate this employee' });
    }

    // Prevent admins from deactivating themselves
    if (employee._id.toString() === admin._id.toString()) {
      return res.status(400).json({ msg: 'Administrators cannot deactivate themselves' });
    }

    // Soft delete by deactivating
    employee.isActive = false;
    employee.deactivatedAt = new Date();
    employee.deactivatedBy = admin._id;
    
    await employee.save();

    // Log activity
    const activityLog = new ActivityLog({
      user: admin._id,
      company: admin.company,
      action: 'user_deactivation',
      details: {
        employeeId: employee._id,
        employeeEmail: employee.email
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({ msg: 'Employee deactivated successfully' });
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

    // Get time range from query params
    const { period = 'week' } = req.query;
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }

    // Get employee statistics
    const employeeCount = await User.countDocuments({ company: req.user.company });
    const activeEmployeeCount = await User.countDocuments({ 
      company: req.user.company,
      isActive: true
    });
    const recentLogins = await User.countDocuments({
      company: req.user.company,
      lastLogin: { $gte: startDate }
    });

    // Get activity statistics
    const activityStats = await ActivityLog.aggregate([
      { 
        $match: { 
          company: mongoose.Types.ObjectId(req.user.company),
          timestamp: { $gte: startDate }
        } 
      },
      { 
        $group: { 
          _id: '$action',
          count: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Get property interaction statistics
    const propertyStats = await ActivityLog.aggregate([
      { 
        $match: { 
          company: mongoose.Types.ObjectId(req.user.company),
          timestamp: { $gte: startDate },
          action: { $in: ['property_view', 'property_bookmark', 'property_export', 'property_share'] }
        } 
      },
      { 
        $group: { 
          _id: '$action',
          count: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Get top users by activity
    const topUsers = await ActivityLog.aggregate([
      { 
        $match: { 
          company: mongoose.Types.ObjectId(req.user.company),
          timestamp: { $gte: startDate }
        } 
      },
      { 
        $group: { 
          _id: '$user',
          count: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          'userDetails.firstName': 1,
          'userDetails.lastName': 1,
          'userDetails.email': 1,
          'userDetails.role': 1
        }
      }
    ]);

    // Get daily activity counts for trend analysis
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await ActivityLog.aggregate([
      { 
        $match: { 
          company: mongoose.Types.ObjectId(req.user.company),
          timestamp: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get company from database to get current usage statistics
    const company = await Company.findById(req.user.company);

    // Log this activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'usage_stats_view',
      details: {
        period
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({
      overview: {
        employeeCount,
        activeEmployeeCount,
        recentLogins,
        period
      },
      activityStats: activityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      propertyStats: propertyStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      topUsers,
      dailyActivity,
      usageStatistics: company.usageStatistics || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/companies/activity
// @desc    Get company activity logs
// @access  Private (Admin only)
router.get('/activity', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view activity logs' });
    }

    // Parse query parameters
    const { 
      action, 
      userId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      sort = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { company: req.user.company };
    
    // Filter by action
    if (action) {
      query.action = action;
    }
    
    // Filter by user
    if (userId) {
      query.user = userId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(query);
    
    // Get activity logs
    const activities = await ActivityLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Log this activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'activity_logs_view',
      details: {
        filters: { action, userId, startDate, endDate },
        resultCount: activities.length
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json({
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
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

    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      company: user.company,
      action: 'data_access_update',
      details: {
        updatedFields: Object.keys(dataAccessPreferences)
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activityLog.save();

    res.json(company.dataAccessPreferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/companies/data-access/audit
// @desc    Get audit log of data access changes
// @access  Private (Admin only)
router.get('/data-access/audit', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view data access audit logs' });
    }

    // Get all data access change logs
    const auditLogs = await ActivityLog.find({
      company: req.user.company,
      action: 'data_access_update'
    })
    .populate('user', 'firstName lastName email role')
    .sort({ timestamp: -1 })
    .limit(100);

    res.json(auditLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
