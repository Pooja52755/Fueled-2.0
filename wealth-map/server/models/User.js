const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager'],
    default: 'user'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  acceptedTerms: {
    type: Boolean,
    default: false
  },
  completedOnboarding: {
    type: Boolean,
    default: false
  },
  savedSearches: [{
    name: String,
    filters: Object,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarkedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  savedMapViews: [{
    name: String,
    center: {
      lat: Number,
      lng: Number
    },
    zoom: Number,
    filters: Object,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile (without sensitive data)
UserSchema.methods.getProfile = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    company: this.company,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    mfaEnabled: this.mfaEnabled,
    notificationPreferences: this.notificationPreferences,
    acceptedTerms: this.acceptedTerms,
    completedOnboarding: this.completedOnboarding
  };
};

module.exports = mongoose.model('User', UserSchema);
