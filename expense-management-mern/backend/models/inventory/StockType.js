const mongoose = require('mongoose');

const StockTypeSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryStockCategory',
    required: true,
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
}, { timestamps: true });

StockTypeSchema.index({ company: 1, category: 1, nameNormalized: 1 }, { unique: true });

module.exports = mongoose.model('InventoryStockType', StockTypeSchema);

