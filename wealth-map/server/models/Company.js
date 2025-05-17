const mongoose = require('mongoose');
const slugify = require('slugify');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: 'default-company-logo.png'
  },
  coverImage: {
    type: String,
    default: 'default-company-cover.jpg'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    formattedAddress: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  contactPhone: {
    type: String
  },
  website: {
    type: String
  },
  industry: {
    type: String
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  founded: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    documentType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  administrators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitationSettings: {
    allowDomainSignup: {
      type: Boolean,
      default: false
    },
    allowedDomains: [String],
    requireAdminApproval: {
      type: Boolean,
      default: true
    },
    invitationExpireDays: {
      type: Number,
      default: 7
    },
    defaultRole: {
      type: String,
      enum: ['viewer', 'analyst', 'manager', 'admin'],
      default: 'viewer'
    }
  },
  securitySettings: {
    requireMfa: {
      type: Boolean,
      default: false
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      },
      passwordExpireDays: {
        type: Number,
        default: 90
      },
      preventPasswordReuse: {
        type: Number,
        default: 5 // Number of previous passwords that cannot be reused
      }
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    ipRestrictions: [String],
    allowedLoginHours: {
      start: {
        type: String,
        default: '00:00' // 24-hour format
      },
      end: {
        type: String,
        default: '23:59' // 24-hour format
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      enforceDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    }
  },
  dataAccessPreferences: {
    propertyTypes: {
      type: [String],
      default: ['residential', 'commercial', 'industrial', 'land', 'mixed-use']
    },
    maxValueThreshold: {
      type: Number,
      default: 100000000 // $100M
    },
    geographicRestrictions: {
      states: [String],
      countries: [String],
      cities: [String],
      zipCodes: [String]
    },
    dataRetentionPeriod: {
      type: Number,
      default: 365 // days
    },
    dataExportLimits: {
      dailyLimit: {
        type: Number,
        default: 1000
      },
      monthlyLimit: {
        type: Number,
        default: 10000
      }
    }
  },
  brandingSettings: {
    primaryColor: {
      type: String,
      default: '#4CAF50'
    },
    secondaryColor: {
      type: String,
      default: '#2196F3'
    },
    accentColor: {
      type: String,
      default: '#FF9800'
    },
    customCss: String,
    emailTemplate: String,
    reportTemplate: String
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'trialing'],
    default: 'active'
  },
  subscriptionDetails: {
    planId: String,
    customerId: String,
    subscriptionId: String,
    startDate: Date,
    endDate: Date,
    trialEndDate: Date,
    paymentMethod: {
      type: String
    }
  },
  apiKeys: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Virtual for getting employee count
CompanySchema.virtual('employeeCount').get(function() {
  return this.employees ? this.employees.length : 0;
});

// Pre-save hook to generate slug from company name
CompanySchema.pre('save', async function(next) {
  // Only generate slug if name is modified (or new)
  if (this.isModified('name') || !this.slug) {
    // Generate a base slug from the company name
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.(),'"!:@]/g
    });
    
    // Check if the slug already exists
    let slug = baseSlug;
    let counter = 1;
    let existingCompany = null;
    
    do {
      existingCompany = await this.constructor.findOne({ slug });
      
      // If a company with this slug exists and it's not this company
      if (existingCompany && !existingCompany._id.equals(this._id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        existingCompany = null; // Exit the loop
      }
    } while (existingCompany);
    
    this.slug = slug;
  }
  
  next();
});

// Method to get company profile
CompanySchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    logo: this.logo,
    address: this.address,
    phone: this.phone,
    website: this.website,
    industry: this.industry,
    description: this.description,
    isActive: this.isActive,
    dataAccessPreferences: this.dataAccessPreferences,
    subscription: {
      plan: this.subscription.plan,
      isActive: this.subscription.isActive
    }
  };
};

module.exports = mongoose.model('Company', CompanySchema);
