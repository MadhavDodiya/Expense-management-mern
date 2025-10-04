const express = require('express');
const { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getManagers 
} = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users in company
// @access  Private (Admin/Manager)
router.get('/', auth, authorize('ADMIN', 'MANAGER'), getUsers);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', auth, authorize('ADMIN'), createUser);

// @route   PUT /api/users/:userId
// @desc    Update user
// @access  Private (Admin only)
router.put('/:userId', auth, authorize('ADMIN'), updateUser);

// @route   DELETE /api/users/:userId
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:userId', auth, authorize('ADMIN'), deleteUser);

// @route   GET /api/users/managers
// @desc    Get all managers for dropdown
// @access  Private (Admin only)
router.get('/managers', auth, authorize('ADMIN'), getManagers);

module.exports = router;
