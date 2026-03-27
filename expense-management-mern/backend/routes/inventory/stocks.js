const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const { addStock, getStock, updateStockQuantity } = require('../../controllers/inventory/stockController');

const router = express.Router();

// Admin manages stocks
router.post('/', auth, authorize('ADMIN'), addStock);
// Anyone logged in can view the nested stock structure for selection/display.
router.get('/', auth, getStock);
router.put('/items/:itemId/quantity', auth, authorize('ADMIN'), updateStockQuantity);

module.exports = router;
