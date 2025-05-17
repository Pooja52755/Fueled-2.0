const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Company related actions
      'company_registration',
      'company_update',
      'company_settings_update',
      'company_subscription_change',
      'company_verification',
      
      // User related actions
      'user_login',
      'user_logout',
      'user_registration',
      'user_invitation',
      'user_invitation_accepted',
      'user_password_change',
      'user_profile_update',
      'user_role_change',
      'user_deactivation',
      'user_reactivation',
      'user_mfa_enabled',
      'user_mfa_disabled',
      
      // Property related actions
      'property_view',
      'property_bookmark',
      'property_unbookmark',
      'property_export',
      'property_share',
      
      // Map related actions
      'map_view_save',
      'map_view_load',
      'map_view_delete',
      
      // Search related actions
      'search_performed',
      'filter_applied',
      
      // Security related actions
      'failed_login_attempt',
      'password_reset_request',
      'password_reset_complete',
      'suspicious_activity_detected'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
ActivityLogSchema.index({ company: 1, timestamp: -1 });
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
