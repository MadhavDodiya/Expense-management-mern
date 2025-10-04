const express = require('express');
const { 
  getPendingApprovals, 
  processApproval, 
  getApprovalHistory, 
  getApprovalAnalytics 
} = require('../controllers/approvalController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/approvals/pending
// @desc    Get pending approvals for current user
// @access  Private (Manager/Admin)
router.get('/pending', auth, authorize('ADMIN', 'MANAGER'), getPendingApprovals);

// @route   POST /api/approvals/:expenseId
// @desc    Process approval (approve/reject)
// @access  Private (Manager/Admin)
router.post('/:expenseId', auth, authorize('ADMIN', 'MANAGER'), processApproval);

// @route   GET /api/approvals/history
// @desc    Get approval history
// @access  Private (Manager/Admin)
router.get('/history', auth, authorize('ADMIN', 'MANAGER'), getApprovalHistory);

// @route   GET /api/approvals/analytics
// @desc    Get approval analytics
// @access  Private (Manager/Admin)
router.get('/analytics', auth, authorize('ADMIN', 'MANAGER'), getApprovalAnalytics);

module.exports = router;
