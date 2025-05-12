const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
  ownerType: {
    type: String,
    enum: ['individual', 'entity'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // For individual owners
  individual: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    age: {
      type: Number
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      default: 'unknown'
    },
    occupation: {
      type: String
    },
    employer: {
      type: String
    },
    contactInfo: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    profileImage: {
      type: String
    }
  },
  // For entity owners
  entity: {
    companyType: {
      type: String,
      enum: ['corporation', 'llc', 'partnership', 'trust', 'non-profit', 'government', 'other'],
      default: 'other'
    },
    registrationNumber: {
      type: String
    },
    foundedYear: {
      type: Number
    },
    industry: {
      type: String
    },
    description: {
      type: String
    },
    contactInfo: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      website: String
    },
    logo: {
      type: String
    },
    officers: [{
      name: String,
      title: String,
      startDate: Date
    }]
  },
  // Wealth data
  wealthData: {
    estimatedNetWorth: {
      type: Number,
      default: 0
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    wealthComposition: {
      realEstate: {
        type: Number,
        default: 0
      },
      stocks: {
        type: Number,
        default: 0
      },
      cash: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    },
    incomeEstimate: {
      type: Number,
      default: 0
    },
    wealthTier: {
      type: String,
      enum: ['ultra-high', 'high', 'upper-middle', 'middle', 'lower-middle', 'low', 'unknown'],
      default: 'unknown'
    },
    dataSource: {
      type: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Properties owned
  properties: [{
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    ownershipPercentage: {
      type: Number,
      default: 100
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    isCurrentOwner: {
      type: Boolean,
      default: true
    }
  }],
  // Relationships with other owners
  relationships: [{
    relatedOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
    },
    relationshipType: {
      type: String,
      enum: ['family', 'business', 'associate', 'other']
    },
    description: {
      type: String
    }
  }],
  // Metadata
  metadata: {
    source: {
      type: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    dataQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Text search index
OwnerSchema.index({ 
  name: 'text',
  'individual.firstName': 'text',
  'individual.lastName': 'text',
  'entity.description': 'text'
});

module.exports = mongoose.model('Owner', OwnerSchema);
