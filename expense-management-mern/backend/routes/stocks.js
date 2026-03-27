const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { listStocks, upsertStock, updateStock, deleteStock } = require('../controllers/stockController');

const router = express.Router();

// Admin only
router.get('/', auth, authorize('ADMIN'), listStocks);
router.post('/', auth, authorize('ADMIN'), upsertStock);
router.put('/:id', auth, authorize('ADMIN'), updateStock);
router.delete('/:id', auth, authorize('ADMIN'), deleteStock);

module.exports = router;
