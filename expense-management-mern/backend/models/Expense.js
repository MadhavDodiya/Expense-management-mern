const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  convertedAmount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['TRAVEL', 'FOOD', 'ACCOMMODATION', 'TRANSPORT', 'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'ENTERTAINMENT', 'OTHER']
  },
  expenseDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSING'],
    default: 'PENDING'
  },
  receipts: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  ocrData: {
    merchant: String,
    extractedAmount: Number,
    extractedDate: Date,
    confidence: Number,
    rawText: String
  },
  approvalFlow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalFlow'
  },
  currentApprovalStep: {
    type: Number,
    default: 0
  },
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    comments: String,
    actionDate: Date,
    stepNumber: Number
  }],
  rejectionReason: {
    type: String,
    default: ''
  },
  approvedAmount: {
    type: Number,
    default: 0
  },
  approvalDate: {
    type: Date,
    default: null
  },
  reimbursementStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'PAID'],
    default: 'PENDING'
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY'],
    default: undefined
  }
}, {
  timestamps: true
});

// Indexes for better performance
ExpenseSchema.index({ user: 1, status: 1 });
ExpenseSchema.index({ company: 1, createdAt: -1 });
ExpenseSchema.index({ 'approvals.approver': 1, 'approvals.status': 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
