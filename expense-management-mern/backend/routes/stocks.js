const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { listStocks, upsertStock, updateStock, deleteStock } = require('../controllers/stockController');

const router = express.Router();

// Anyone logged in can view stocks list (all departments within the company).
router.get('/', auth, listStocks);
router.post('/', auth, authorize('ADMIN'), upsertStock);
router.put('/:id', auth, authorize('ADMIN'), updateStock);
router.delete('/:id', auth, authorize('ADMIN'), deleteStock);

module.exports = router;
