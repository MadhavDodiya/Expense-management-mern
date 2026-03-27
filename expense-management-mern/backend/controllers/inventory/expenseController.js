const StockCategory = require('../../models/inventory/StockCategory');
const StockType = require('../../models/inventory/StockType');
const StockItem = require('../../models/inventory/StockItem');
const StockExpense = require('../../models/inventory/StockExpense');

const normalize = (value) => (value || '').toString().trim().toLowerCase();

// POST /api/inventory/expenses
// Body: { categoryId, typeId, itemName, quantity } OR { category, type, itemName, quantity }
// Rule: If item already exists in stock (same type) -> reject. Else allow (and create stock item).
const addExpense = async (req, res) => {
  try {
    const { categoryId, typeId, category, type, itemName, quantity } = req.body || {};

    const item = (itemName || '').toString().trim();
    const itemNameNormalized = normalize(item);
    const qty = Number(quantity);

    if ((!categoryId && !category) || (!typeId && !type) || !itemNameNormalized) {
      return res.status(400).json({ message: 'category/categoryId, type/typeId and itemName are required' });
    }
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ message: 'Quantity must be a number >= 0' });
    }

    let categoryDoc = null;
    if (categoryId) {
      categoryDoc = await StockCategory.findOne({ _id: categoryId, company: req.user.company });
    } else {
      categoryDoc = await StockCategory.findOne({ company: req.user.company, nameNormalized: normalize(category) });
    }
    if (!categoryDoc) return res.status(400).json({ message: 'Invalid category' });

    let typeDoc = null;
    if (typeId) {
      typeDoc = await StockType.findOne({ _id: typeId, company: req.user.company, category: categoryDoc._id });
    } else {
      typeDoc = await StockType.findOne({
        company: req.user.company,
        category: categoryDoc._id,
        nameNormalized: normalize(type)
      });
    }
    if (!typeDoc) return res.status(400).json({ message: 'Invalid type for category' });

    const exists = await StockItem.findOne({
      company: req.user.company,
      type: typeDoc._id,
      nameNormalized: itemNameNormalized
    }).select('_id name');

    if (exists) {
      return res.status(400).json({ message: `Item already exists in stock: ${exists.name}` });
    }

    // Allow expense: create expense record and create stock item.
    const createdStockItem = await StockItem.create({
      company: req.user.company,
      type: typeDoc._id,
      name: item,
      nameNormalized: itemNameNormalized,
      quantity: qty
    });

    const createdExpense = await StockExpense.create({
      user: req.user.id,
      company: req.user.company,
      category: categoryDoc._id,
      type: typeDoc._id,
      itemName: item,
      itemNameNormalized,
      quantity: qty
    });

    res.status(201).json({
      message: 'Expense added',
      expense: createdExpense,
      stockItem: createdStockItem
    });
  } catch (error) {
    console.error('Add inventory expense error:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Item already exists in stock' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addExpense };
