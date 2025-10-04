const mongoose = require('mongoose');

const ApprovalFlowSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  conditions: {
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: {
      type: Number,
      default: null
    },
    categories: [{
      type: String
    }],
    departments: [String]
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    approverType: {
      type: String,
      enum: ['MANAGER', 'SPECIFIC_USER', 'ROLE_BASED', 'ANY_FROM_LIST'],
      required: true
    },
    approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    requiredApprovals: {
      type: Number,
      default: 1
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    escalationTime: {
      type: Number, // in hours
      default: 24
    }
  }],
  conditionalRules: {
    percentageRule: {
      enabled: {
        type: Boolean,
        default: false
      },
      percentage: {
        type: Number,
        min: 1,
        max: 100,
        default: 50
      }
    },
    specificApproverRule: {
      enabled: {
        type: Boolean,
        default: false
      },
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bypassOthers: {
        type: Boolean,
        default: false
      }
    },
    hybridRule: {
      enabled: {
        type: Boolean,
        default: false
      },
      operator: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'OR'
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApprovalFlow', ApprovalFlowSchema);
