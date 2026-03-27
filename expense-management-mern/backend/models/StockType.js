const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../constants/expenseCategories');

const StockTypeSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  // Group types under an expense category so Stocks can be managed per category.
  group: {
    type: String,
    enum: EXPENSE_CATEGORIES,
    default: 'OTHER',
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockType',
    default: null,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameNormalized: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  }
}, {
  timestamps: true
});

StockTypeSchema.index({ company: 1, group: 1, parentId: 1, nameNormalized: 1 }, { unique: true });

module.exports = mongoose.model('StockType', StockTypeSchema);
