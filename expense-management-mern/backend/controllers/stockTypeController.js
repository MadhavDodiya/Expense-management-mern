const StockType = require('../models/StockType');
const StockItem = require('../models/StockItem');
const { EXPENSE_CATEGORIES } = require('../constants/expenseCategories');

const normalizeName = (value) => (value || '').toString().trim().toLowerCase();

const ensureDefaultTypes = async (companyId) => {
  // Seed expense categories as stock types so UI always has a baseline.
  await Promise.all(
    (EXPENSE_CATEGORIES || []).map(async (cat) => {
      const name = (cat || '').toString().trim();
      const nameNormalized = normalizeName(name);
      if (!nameNormalized) return;
      await StockType.findOneAndUpdate(
        { company: companyId, group: cat, parentId: null, nameNormalized },
        { $setOnInsert: { company: companyId, group: cat, parentId: null, name, nameNormalized } },
        { upsert: true, new: false, setDefaultsOnInsert: true }
      );
    })
  );

  // Backfill older docs that existed before we added "group".
  await StockType.updateMany(
    { company: companyId, $or: [{ group: { $exists: false } }, { group: null }, { group: '' }] },
    { $set: { group: 'OTHER' } }
  );

  // Backfill parentId.
  await StockType.updateMany(
    { company: companyId, $or: [{ parentId: { $exists: false } }, { parentId: undefined }] },
    { $set: { parentId: null } }
  );

  // Seed TRANSPORT defaults: Car/Bike/Taxi/Bus + top 10 car companies under Car.
  const transportGroup = 'TRANSPORT';
  const defaults = ['Car', 'Bike', 'Taxi', 'Bus'];
  await Promise.all(defaults.map(async (name) => {
    const nameNormalized = normalizeName(name);
    await StockType.findOneAndUpdate(
      { company: companyId, group: transportGroup, parentId: null, nameNormalized },
      { $setOnInsert: { company: companyId, group: transportGroup, parentId: null, name, nameNormalized } },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    );
  }));

  const carType = await StockType.findOne({
    company: companyId,
    group: transportGroup,
    parentId: null,
    nameNormalized: normalizeName('Car')
  }).select('_id');

  if (carType?._id) {
    const top10Cars = [
      'Maruti Suzuki',
      'Hyundai',
      'Tata Motors',
      'Mahindra',
      'Kia',
      'Toyota',
      'Honda',
      'Renault',
      'Volkswagen',
      'Skoda'
    ];
    await Promise.all(top10Cars.map(async (name) => {
      const nameNormalized = normalizeName(name);
      await StockType.findOneAndUpdate(
        { company: companyId, group: transportGroup, parentId: carType._id, nameNormalized },
        { $setOnInsert: { company: companyId, group: transportGroup, parentId: carType._id, name, nameNormalized } },
        { upsert: true, new: false, setDefaultsOnInsert: true }
      );
    }));
  }
};

const listStockTypes = async (req, res) => {
  try {
    const group = (req.query?.group || '').toString().trim().toUpperCase();
    if (group && !EXPENSE_CATEGORIES.includes(group)) {
      return res.status(400).json({ message: 'Invalid group value' });
    }
    const parentId = (req.query?.parentId || '').toString().trim();

    await ensureDefaultTypes(req.user.company);
    const filter = { company: req.user.company };
    if (group) filter.group = group;
    if (parentId) filter.parentId = parentId;
    if (!parentId) filter.parentId = null;

    let types = await StockType.find(filter).sort({ nameNormalized: 1 });
    // Hide the system root type which is the same as group (e.g. TRANSPORT under TRANSPORT).
    if (group && !parentId) {
      const groupNorm = normalizeName(group);
      types = types.filter(t => (t.nameNormalized || '') !== groupNorm);
    }
    res.json({ types, groups: EXPENSE_CATEGORIES });
  } catch (error) {
    console.error('List stock types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createStockType = async (req, res) => {
  try {
    const { name, group, parentId } = req.body || {};
    const trimmed = (name || '').toString().trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Type name is required' });
    }

    const grp = (group || 'OTHER').toString().trim().toUpperCase();
    if (grp && !EXPENSE_CATEGORIES.includes(grp)) {
      return res.status(400).json({ message: 'Invalid group value' });
    }

    let resolvedParentId = null;
    if (parentId) {
      const parent = await StockType.findOne({ _id: parentId, company: req.user.company });
      if (!parent) return res.status(400).json({ message: 'Invalid parentId value' });
      if ((parent.group || 'OTHER') !== (grp || 'OTHER')) {
        return res.status(400).json({ message: 'Parent type group mismatch' });
      }
      resolvedParentId = parent._id;
    }

    const created = await StockType.create({
      company: req.user.company,
      group: grp || 'OTHER',
      parentId: resolvedParentId,
      name: trimmed,
      nameNormalized: normalizeName(trimmed)
    });

    res.status(201).json({ type: created });
  } catch (error) {
    console.error('Create stock type error:', error);
    // Duplicate key => type already exists
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Type already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStockType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, group, parentId } = req.body || {};

    const trimmed = (name || '').toString().trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Type name is required' });
    }

    const grp = group === undefined ? undefined : (group || '').toString().trim().toUpperCase();
    if (grp !== undefined && grp && !EXPENSE_CATEGORIES.includes(grp)) {
      return res.status(400).json({ message: 'Invalid group value' });
    }

    const type = await StockType.findOne({ _id: id, company: req.user.company });
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    const nextGroup = grp !== undefined ? (grp || 'OTHER') : (type.group || 'OTHER');
    let nextParentId = type.parentId || null;
    if (parentId !== undefined) {
      if (!parentId) {
        nextParentId = null;
      } else {
        const parent = await StockType.findOne({ _id: parentId, company: req.user.company });
        if (!parent) return res.status(400).json({ message: 'Invalid parentId value' });
        if ((parent.group || 'OTHER') !== nextGroup) {
          return res.status(400).json({ message: 'Parent type group mismatch' });
        }
        nextParentId = parent._id;
      }
    }

    type.name = trimmed;
    type.nameNormalized = normalizeName(trimmed);
    if (grp !== undefined) type.group = grp || 'OTHER';
    type.parentId = nextParentId;
    await type.save();

    // Keep StockItem legacy label in sync for display.
    await StockItem.updateMany(
      { company: req.user.company, typeId: type._id },
      { $set: { type: type.name } }
    );

    res.json({ type });
  } catch (error) {
    console.error('Update stock type error:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Type already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteStockType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await StockType.findOne({ _id: id, company: req.user.company });
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    const childCount = await StockType.countDocuments({ company: req.user.company, parentId: type._id });
    if (childCount > 0) {
      return res.status(400).json({ message: 'Cannot delete type because it has child types' });
    }

    const usedCount = await StockItem.countDocuments({ company: req.user.company, typeId: type._id });
    if (usedCount > 0) {
      return res.status(400).json({ message: 'Cannot delete type because it is used by stock items' });
    }

    await type.deleteOne();
    res.json({ message: 'Type deleted' });
  } catch (error) {
    console.error('Delete stock type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  ensureDefaultTypes,
  listStockTypes,
  createStockType,
  updateStockType,
  deleteStockType
};
