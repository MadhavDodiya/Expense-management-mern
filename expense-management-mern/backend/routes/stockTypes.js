const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  listStockTypes,
  createStockType,
  updateStockType,
  deleteStockType
} = require('../controllers/stockTypeController');

const router = express.Router();

// Anyone logged in can view stock types for selection/display.
router.get('/', auth, listStockTypes);
router.post('/', auth, authorize('ADMIN'), createStockType);
router.put('/:id', auth, authorize('ADMIN'), updateStockType);
router.delete('/:id', auth, authorize('ADMIN'), deleteStockType);

module.exports = router;
