const express = require('express');
const { auth } = require('../../middleware/auth');
const { addExpense } = require('../../controllers/inventory/expenseController');

const router = express.Router();

// Any authenticated user can add an inventory expense request
router.post('/', auth, addExpense);

module.exports = router;

