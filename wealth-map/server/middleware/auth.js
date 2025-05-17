const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header or cookies or query
  const token = 
    req.header('x-auth-token') || 
    (req.cookies && req.cookies.token) || 
    req.query.token;

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'Authentication required. Please log in.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || config.jwtSecret || 'wealthmapsecret'
    );
    
    // Set user in request
    req.user = decoded.user;
    
    // Check if user still exists and is active
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'User no longer exists' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        msg: 'Account is deactivated. Please contact your administrator.' 
      });
    }
    
    // Check if token was issued before password change
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      
      // If password was changed after token was issued
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ 
          success: false,
          msg: 'Password recently changed. Please log in again.' 
        });
      }
    }
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token. Please log in again.' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Your session has expired. Please log in again.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      msg: 'Authentication failed. Please log in again.' 
    });
  }
};
