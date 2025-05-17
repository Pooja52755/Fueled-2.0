const mongoose = require('mongoose');
const crypto = require('crypto');

const InvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['viewer', 'analyst', 'manager', 'admin'],
    default: 'viewer'
  },
  permissions: {
    type: [String],
    default: []
  },
  token: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'revoked'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date
  },
  message: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastResent: {
    type: Date
  }
}, {
  timestamps: true
});

// Create invitation token
InvitationSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Check if invitation is expired
InvitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Set invitation as accepted
InvitationSchema.methods.accept = async function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  await this.save();
};

// Set invitation as expired
InvitationSchema.methods.expire = async function() {
  this.status = 'expired';
  await this.save();
};

// Set invitation as revoked
InvitationSchema.methods.revoke = async function() {
  this.status = 'revoked';
  await this.save();
};

// Resend invitation
InvitationSchema.methods.resend = async function(days) {
  this.token = this.constructor.generateToken();
  this.expiresAt = new Date(Date.now() + (days || 7) * 24 * 60 * 60 * 1000);
  this.status = 'pending';
  this.resendCount += 1;
  this.lastResent = new Date();
  await this.save();
  return this;
};

// Indexes for efficient querying
InvitationSchema.index({ email: 1, company: 1 }, { unique: true });
InvitationSchema.index({ token: 1 }, { unique: true });
InvitationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Invitation', InvitationSchema);
