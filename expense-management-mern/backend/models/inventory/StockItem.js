const mongoose = require('mongoose');

const StockItemSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryStockType',
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
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

// Do not allow duplicate items in the same type.
StockItemSchema.index({ company: 1, type: 1, nameNormalized: 1 }, { unique: true });

module.exports = mongoose.model('InventoryStockItem', StockItemSchema);

