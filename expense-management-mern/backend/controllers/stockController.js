const StockItem = require('../models/StockItem');
const StockType = require('../models/StockType');
const { ensureDefaultTypes } = require('./stockTypeController');

const normalizeName = (value) => (value || '').toString().trim().toLowerCase();

// Admin: list all stocks for company
const listStocks = async (req, res) => {
  try {
    const typeId = (req.query?.typeId || '').toString().trim();

    await ensureDefaultTypes(req.user.company);
    const types = await StockType.find({ company: req.user.company }).sort({ nameNormalized: 1 });

    const filter = { company: req.user.company };
    if (typeId) filter.typeId = typeId;

    const stocks = await StockItem.find(filter)
      .populate('typeId', 'name group')
      .sort({ nameNormalized: 1 });

    res.json({ stocks, types });
  } catch (error) {
    console.error('List stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: create / upsert by name
const upsertStock = async (req, res) => {
  try {
    const { name, quantity, maxQuantity, status, typeId } = req.body || {};

    const trimmedName = (name || '').toString().trim();
    const nameNormalized = normalizeName(trimmedName);
    if (!trimmedName) {
      return res.status(400).json({ message: 'Stock name is required' });
    }

    const qty = quantity === undefined ? undefined : Number(quantity);
    const maxQty = maxQuantity === undefined ? undefined : Number(maxQuantity);
    if (qty !== undefined && (!Number.isFinite(qty) || qty < 0)) {
      return res.status(400).json({ message: 'Quantity must be a number >= 0' });
    }
    if (maxQty !== undefined && (!Number.isFinite(maxQty) || maxQty < 0)) {
      return res.status(400).json({ message: 'Max quantity must be a number >= 0' });
    }
    if (status !== undefined && !['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let resolvedType = null;
    if (typeId) {
      resolvedType = await StockType.findOne({ _id: typeId, company: req.user.company });
      if (!resolvedType) {
        return res.status(400).json({ message: 'Invalid typeId value' });
      }
    }

    const update = {
      $set: {
        name: trimmedName,
        nameNormalized
      }
    };
    if (qty !== undefined) update.$set.quantity = qty;
    if (maxQty !== undefined) update.$set.maxQuantity = maxQty;
    if (status !== undefined) update.$set.status = status;
    if (resolvedType) {
      update.$set.typeId = resolvedType._id;
      update.$set.type = resolvedType.name;
      // denormalize group for faster filtering (optional)
      update.$set.typeGroup = resolvedType.group || 'OTHER';
    }

    const stock = await StockItem.findOneAndUpdate(
      { company: req.user.company, nameNormalized },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('typeId', 'name group');

    // Safeguard: keep quantity within cap if set
    if (stock.maxQuantity > 0 && stock.quantity > stock.maxQuantity) {
      stock.quantity = stock.maxQuantity;
      await stock.save();
    }

    res.status(201).json({ stock });
  } catch (error) {
    console.error('Upsert stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: update by id
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, maxQuantity, status, typeId } = req.body || {};

    const stock = await StockItem.findOne({ _id: id, company: req.user.company });
    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    if (name !== undefined) {
      const trimmedName = (name || '').toString().trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Stock name cannot be empty' });
      }
      stock.name = trimmedName;
      stock.nameNormalized = normalizeName(trimmedName);
    }

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ message: 'Quantity must be a number >= 0' });
      }
      stock.quantity = qty;
    }

    if (maxQuantity !== undefined) {
      const maxQty = Number(maxQuantity);
      if (!Number.isFinite(maxQty) || maxQty < 0) {
        return res.status(400).json({ message: 'Max quantity must be a number >= 0' });
      }
      stock.maxQuantity = maxQty;
    }

    if (status !== undefined) {
      if (!['ACTIVE', 'BLOCKED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      stock.status = status;
    }

    if (typeId !== undefined) {
      if (typeId === null || typeId === '') {
        stock.typeId = null;
        stock.type = 'OTHER';
        stock.typeGroup = 'OTHER';
      } else {
        const resolvedType = await StockType.findOne({ _id: typeId, company: req.user.company });
        if (!resolvedType) {
          return res.status(400).json({ message: 'Invalid typeId value' });
        }
        stock.typeId = resolvedType._id;
        stock.type = resolvedType.name;
        stock.typeGroup = resolvedType.group || 'OTHER';
      }
    }

    // If a cap is set, keep quantity within [0, maxQuantity].
    if (stock.maxQuantity > 0 && stock.quantity > stock.maxQuantity) {
      stock.quantity = stock.maxQuantity;
    }

    await stock.save();
    await stock.populate('typeId', 'name group');
    res.json({ stock });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: delete by id
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await StockItem.findOne({ _id: id, company: req.user.company });
    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    await stock.deleteOne();
    res.json({ message: 'Stock item deleted' });
  } catch (error) {
    console.error('Delete stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listStocks,
  upsertStock,
  updateStock,
  deleteStock
};
