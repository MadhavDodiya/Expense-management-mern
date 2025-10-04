const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  country: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  logo: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowMultipleCurrency: {
      type: Boolean,
      default: true
    },
    requireReceiptForExpense: {
      type: Boolean,
      default: false
    },
    autoApprovalLimit: {
      type: Number,
      default: 0
    },
    managerApprovalRequired: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
