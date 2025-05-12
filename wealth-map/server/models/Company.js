const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: '/default-company-logo.png'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  industry: {
    type: String
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dataAccessPreferences: {
    propertyTypes: {
      type: [String],
      default: ['residential', 'commercial', 'industrial']
    },
    wealthDataAccess: {
      type: Boolean,
      default: true
    },
    ownershipHistoryAccess: {
      type: Boolean,
      default: true
    },
    exportEnabled: {
      type: Boolean,
      default: true
    },
    maxExportsPerMonth: {
      type: Number,
      default: 100
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
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
