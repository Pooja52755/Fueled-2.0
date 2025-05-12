const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'USA'
    },
    formattedAddress: {
      type: String
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'land', 'mixed-use', 'other'],
    required: true
  },
  propertySubType: {
    type: String,
    enum: [
      'single-family', 'multi-family', 'condo', 'townhouse', 'apartment',
      'office', 'retail', 'hotel', 'warehouse', 'manufacturing',
      'vacant-land', 'farm', 'special-purpose', 'other'
    ]
  },
  size: {
    buildingSize: {
      type: Number, // square feet
      default: 0
    },
    lotSize: {
      type: Number, // square feet
      default: 0
    },
    units: {
      type: Number,
      default: 1
    },
    bedrooms: {
      type: Number,
      default: 0
    },
    bathrooms: {
      type: Number,
      default: 0
    }
  },
  value: {
    estimatedValue: {
      type: Number,
      default: 0
    },
    assessedValue: {
      type: Number,
      default: 0
    },
    lastSalePrice: {
      type: Number,
      default: 0
    },
    lastSaleDate: {
      type: Date
    },
    valuationSource: {
      type: String
    },
    valuationDate: {
      type: Date,
      default: Date.now
    }
  },
  yearBuilt: {
    type: Number
  },
  features: {
    type: [String]
  },
  images: {
    type: [String]
  },
  description: {
    type: String
  },
  owners: [{
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
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
  transactions: [{
    transactionType: {
      type: String,
      enum: ['sale', 'transfer', 'foreclosure', 'other']
    },
    date: {
      type: Date
    },
    price: {
      type: Number
    },
    seller: {
      type: String
    },
    buyer: {
      type: String
    },
    description: {
      type: String
    },
    documentNumber: {
      type: String
    }
  }],
  taxInfo: {
    parcelNumber: {
      type: String
    },
    taxAssessment: {
      type: Number
    },
    taxYear: {
      type: Number
    },
    propertyTax: {
      type: Number
    }
  },
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

// Index for geospatial queries
PropertySchema.index({ location: '2dsphere' });
// Index for text search
PropertySchema.index({ 
  'address.formattedAddress': 'text',
  'address.street': 'text',
  'address.city': 'text',
  'address.state': 'text',
  'address.zipCode': 'text',
  'description': 'text'
});

module.exports = mongoose.model('Property', PropertySchema);
