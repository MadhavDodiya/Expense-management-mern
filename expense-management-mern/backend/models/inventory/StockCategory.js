const mongoose = require('mongoose');

const StockCategorySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
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

StockCategorySchema.index({ company: 1, nameNormalized: 1 }, { unique: true });

module.exports = mongoose.model('InventoryStockCategory', StockCategorySchema);

