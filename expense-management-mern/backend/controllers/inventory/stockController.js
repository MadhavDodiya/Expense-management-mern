const StockCategory = require('../../models/inventory/StockCategory');
const StockType = require('../../models/inventory/StockType');
const StockItem = require('../../models/inventory/StockItem');

const normalize = (value) => (value || '').toString().trim().toLowerCase();

// POST /api/inventory/stocks
// Body: { category: 'Transport', type: 'Car', items: [{ name: 'Toyota', quantity: 10 }, ...] }
const addStock = async (req, res) => {
  try {
    const { category, type, items } = req.body || {};

    const categoryName = (category || '').toString().trim();
    const typeName = (type || '').toString().trim();
    if (!categoryName || !typeName) {
      return res.status(400).json({ message: 'Category and type are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const normalizedItems = items
      .map((it) => ({
        name: (it?.name || '').toString().trim(),
        nameNormalized: normalize(it?.name),
        quantity: Number(it?.quantity)
      }))
      .filter((it) => it.nameNormalized);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'At least one valid item is required' });
    }

    for (const it of normalizedItems) {
      if (!Number.isFinite(it.quantity) || it.quantity < 0) {
        return res.status(400).json({ message: `Invalid quantity for item "${it.name}"` });
      }
    }

    // Ensure category + type exist.
    const categoryDoc = await StockCategory.findOneAndUpdate(
      { company: req.user.company, nameNormalized: normalize(categoryName) },
      {
        $setOnInsert: {
          company: req.user.company,
          name: categoryName,
          nameNormalized: normalize(categoryName)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const typeDoc = await StockType.findOneAndUpdate(
      {
        company: req.user.company,
        category: categoryDoc._id,
        nameNormalized: normalize(typeName)
      },
      {
        $setOnInsert: {
          company: req.user.company,
          category: categoryDoc._id,
          name: typeName,
          nameNormalized: normalize(typeName)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Reject duplicates within payload.
    const seen = new Set();
    const dupInPayload = [];
    for (const it of normalizedItems) {
      if (seen.has(it.nameNormalized)) dupInPayload.push(it.name);
      seen.add(it.nameNormalized);
    }
    if (dupInPayload.length > 0) {
      return res.status(400).json({ message: `Duplicate items in request: ${dupInPayload.join(', ')}` });
    }

    // Reject if any item already exists in this type.
    const existing = await StockItem.find({
      company: req.user.company,
      type: typeDoc._id,
      nameNormalized: { $in: normalizedItems.map((i) => i.nameNormalized) }
    }).select('name nameNormalized');

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Some items already exist in this type',
        duplicates: existing.map((e) => e.name)
      });
    }

    const createdItems = await StockItem.insertMany(
      normalizedItems.map((it) => ({
        company: req.user.company,
        type: typeDoc._id,
        name: it.name,
        nameNormalized: it.nameNormalized,
        quantity: it.quantity
      }))
    );

    res.status(201).json({
      message: 'Stock created',
      category: categoryDoc,
      type: typeDoc,
      items: createdItems
    });
  } catch (error) {
    console.error('Add stock error:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Duplicate item not allowed in the same type' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inventory/stocks
// Returns nested: [{ category, types: [{ type, items: [...] }] }]
const getStock = async (req, res) => {
  try {
    const categories = await StockCategory.find({ company: req.user.company })
      .sort({ nameNormalized: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);
    const types = await StockType.find({ company: req.user.company, category: { $in: categoryIds } })
      .sort({ nameNormalized: 1 })
      .lean();

    const typeIds = types.map((t) => t._id);
    const items = await StockItem.find({ company: req.user.company, type: { $in: typeIds } })
      .sort({ nameNormalized: 1 })
      .lean();

    const itemsByType = new Map();
    for (const item of items) {
      const key = item.type.toString();
      if (!itemsByType.has(key)) itemsByType.set(key, []);
      itemsByType.get(key).push(item);
    }

    const typesByCategory = new Map();
    for (const t of types) {
      const key = t.category.toString();
      if (!typesByCategory.has(key)) typesByCategory.set(key, []);
      typesByCategory.get(key).push({
        ...t,
        items: itemsByType.get(t._id.toString()) || []
      });
    }

    const nested = categories.map((c) => ({
      ...c,
      types: typesByCategory.get(c._id.toString()) || []
    }));

    res.json({ stock: nested });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/inventory/stocks/items/:itemId/quantity
// Body: { quantity: 10 }
const updateStockQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body || {};

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ message: 'Quantity must be a number >= 0' });
    }

    const item = await StockItem.findOneAndUpdate(
      { _id: itemId, company: req.user.company },
      { $set: { quantity: qty } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    res.json({ message: 'Quantity updated', item });
  } catch (error) {
    console.error('Update stock quantity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addStock,
  getStock,
  updateStockQuantity
};

