const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'manager', 'analyst', 'viewer', 'user'],
      message: 'Role must be admin, manager, analyst, viewer, or user'
    },
    default: 'user'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  jobTitle: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  invitationStatus: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitationDate: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  accountLockedUntil: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false // Don't return MFA secret by default
  },
  mfaBackupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    }
  }],
  permissions: {
    viewProperties: {
      type: Boolean,
      default: true
    },
    editProperties: {
      type: Boolean,
      default: false
    },
    viewOwners: {
      type: Boolean,
      default: true
    },
    editOwners: {
      type: Boolean,
      default: false
    },
    exportData: {
      type: Boolean,
      default: false
    },
    inviteUsers: {
      type: Boolean,
      default: false
    },
    manageUsers: {
      type: Boolean,
      default: false
    },
    manageCompany: {
      type: Boolean,
      default: false
    }
  },
  dataAccessLimits: {
    maxPropertiesPerDay: {
      type: Number,
      default: 1000
    },
    maxExportsPerDay: {
      type: Number,
      default: 50
    },
    maxSearchesPerDay: {
      type: Number,
      default: 100
    }
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    propertyAlerts: {
      type: Boolean,
      default: true
    },
    ownerAlerts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: true
    },
    marketUpdates: {
      type: Boolean,
      default: true
    }
  },
  acceptedTerms: {
    type: Boolean,
    default: false
  },
  acceptedPrivacyPolicy: {
    type: Boolean,
    default: false
  },
  termsAcceptedAt: Date,
  privacyPolicyAcceptedAt: Date,
  completedOnboarding: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 0
  },
  activityLog: [{
    action: String,
    details: Object,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  savedSearches: [{
    name: String,
    filters: Object,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastRun: Date,
    runCount: {
      type: Number,
      default: 0
    }
  }],
  bookmarkedProperties: [{
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    externalId: String, // For properties not in our database (e.g., Zillow)
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  savedMapViews: [{
    name: String,
    description: String,
    center: {
      lat: Number,
      lng: Number
    },
    zoom: Number,
    filters: Object,
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastViewed: Date
  }],
  exportHistory: [{
    type: String, // 'property', 'owner', 'report'
    itemId: String,
    format: String, // 'pdf', 'csv', 'json'
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  shareHistory: [{
    type: String, // 'property', 'owner', 'report'
    itemId: String,
    sharedWith: String, // email
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  // Set passwordChangedAt if password is changed (but not on new user)
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to handle latency
  }
  
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
