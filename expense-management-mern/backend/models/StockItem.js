const mongoose = require('mongoose');

const StockItemSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  // Normalized key for case-insensitive lookups.
  nameNormalized: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  // Display name shown in UI (keeps original casing/spaces).
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  // If maxQuantity > 0 and quantity >= maxQuantity => stock full.
  // If maxQuantity <= 0 => treat as unlimited.
  maxQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  // New: reference to a StockType. Keep legacy `type` string for existing data/UI fallback.
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockType',
    default: null,
    index: true
  },
  // Legacy/type label (also used for quick display without populate).
  type: {
    type: String,
    trim: true,
    default: 'OTHER',
    index: true
  },
  // Denormalized group from StockType for filtering (e.g. FOOD only).
  typeGroup: {
    type: String,
    default: 'OTHER',
    index: true
  },
  // Admin-controlled status:
  // - ACTIVE: normal behavior
  // - BLOCKED: approvals for this item will be rejected regardless of quantity/maxQuantity
  status: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },
  lastUpdatedFromExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null
  }
}, {
  timestamps: true
});

StockItemSchema.index({ company: 1, nameNormalized: 1 }, { unique: true });
StockItemSchema.index({ company: 1, typeId: 1, nameNormalized: 1 });
StockItemSchema.index({ company: 1, type: 1, nameNormalized: 1 });

module.exports = mongoose.model('StockItem', StockItemSchema);
