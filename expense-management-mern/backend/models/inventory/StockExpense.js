const mongoose = require('mongoose');

const StockExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryStockCategory',
    required: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryStockType',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemNameNormalized: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryStockExpense', StockExpenseSchema);

