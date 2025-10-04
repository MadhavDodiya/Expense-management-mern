const express = require('express');
const { 
  createExpense, 
  getUserExpenses, 
  getCompanyExpenses, 
  getExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const { auth, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', auth, upload.array('receipts', 5), handleUploadError, createExpense);

// @route   GET /api/expenses/my
// @desc    Get current user's expenses
// @access  Private
router.get('/my', auth, getUserExpenses);

// @route   GET /api/expenses/company
// @desc    Get all company expenses (Admin/Manager)
// @access  Private (Admin/Manager)
router.get('/company', auth, authorize('ADMIN', 'MANAGER'), getCompanyExpenses);

// @route   GET /api/expenses/:expenseId
// @desc    Get single expense
// @access  Private
router.get('/:expenseId', auth, getExpense);

// @route   PUT /api/expenses/:expenseId
// @desc    Update expense (only if pending)
// @access  Private
router.put('/:expenseId', auth, upload.array('receipts', 5), handleUploadError, updateExpense);

// @route   DELETE /api/expenses/:expenseId
// @desc    Delete expense (only if pending)
// @access  Private
router.delete('/:expenseId', auth, deleteExpense);

module.exports = router;
