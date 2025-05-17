const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify if a user has completed MFA verification
 * This middleware should be used after the regular auth middleware
 */
module.exports = async function(req, res, next) {
  try {
    // Get token from header
    const token = req.header('x-mfa-token');

    // Check if token exists
    if (!token) {
      return res.status(401).json({ msg: 'MFA verification required', requireMfa: true });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.MFA_SECRET_KEY);

    // Check if the token is for the right user
    if (decoded.user.id !== req.user.id) {
      return res.status(401).json({ msg: 'Invalid MFA token', requireMfa: true });
    }

    // Check if the token has expired (MFA tokens are short-lived)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ msg: 'MFA token expired', requireMfa: true });
    }

    // Check if user has MFA enabled
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // If user doesn't have MFA enabled, skip MFA verification
    if (!user.mfaEnabled) {
      return next();
    }

    // If we got here, the MFA verification is valid
    req.mfaVerified = true;
    next();
  } catch (err) {
    console.error('MFA verification error:', err.message);
    return res.status(401).json({ msg: 'MFA verification required', requireMfa: true });
  }
};
