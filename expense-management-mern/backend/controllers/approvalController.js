const Expense = require('../models/Expense');
const User = require('../models/User');
const ApprovalFlow = require('../models/ApprovalFlow');

// Get pending approvals for current user
const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = {
      'approvals.approver': req.user.id,
      'approvals.status': 'PENDING'
    };

    const expenses = await Expense.find(filter)
      .populate('user', 'firstName lastName email employeeId department')
      .populate('approvals.approver', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalApprovals: total
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process approval (approve/reject)
const processApproval = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { decision, comments } = req.body; // decision: 'APPROVED' or 'REJECTED'

    const expense = await Expense.findById(expenseId)
      .populate('user', 'firstName lastName email')
      .populate('approvalFlow');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Find the approval entry for current user
    const approvalIndex = expense.approvals.findIndex(
      approval => 
        approval.approver.toString() === req.user.id && 
        approval.status === 'PENDING'
    );

    if (approvalIndex === -1) {
      return res.status(400).json({ message: 'No pending approval found for this user' });
    }

    // Update approval
    expense.approvals[approvalIndex].status = decision;
    expense.approvals[approvalIndex].comments = comments;
    expense.approvals[approvalIndex].actionDate = new Date();

    if (decision === 'REJECTED') {
      // If rejected, update expense status
      expense.status = 'REJECTED';
      expense.rejectionReason = comments;
    } else if (decision === 'APPROVED') {
      // Check if all required approvals are complete
      const isFullyApproved = await checkApprovalCompletion(expense);

      if (isFullyApproved) {
        expense.status = 'APPROVED';
        expense.approvalDate = new Date();
        expense.approvedAmount = expense.convertedAmount;
      }
    }

    await expense.save();

    res.json({
      message: `Expense ${decision.toLowerCase()} successfully`,
      expense
    });
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get approval history
const getApprovalHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {
      'approvals.approver': req.user.id
    };

    if (status && status !== 'ALL') {
      filter['approvals.status'] = status;
    }

    const expenses = await Expense.find(filter)
      .populate('user', 'firstName lastName email employeeId')
      .populate('approvals.approver', 'firstName lastName email')
      .sort({ 'approvals.actionDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out only the approvals by current user
    const processedExpenses = expenses.map(expense => {
      const userApprovals = expense.approvals.filter(
        approval => approval.approver._id.toString() === req.user.id
      );

      return {
        ...expense.toObject(),
        approvals: userApprovals
      };
    });

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses: processedExpenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalApprovals: total
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get approval analytics
const getApprovalAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get approval statistics
    const stats = await Expense.aggregate([
      {
        $match: {
          'approvals.approver': userId
        }
      },
      {
        $unwind: '$approvals'
      },
      {
        $match: {
          'approvals.approver': userId
        }
      },
      {
        $group: {
          _id: '$approvals.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' }
        }
      }
    ]);

    // Get pending count
    const pendingCount = await Expense.countDocuments({
      'approvals.approver': userId,
      'approvals.status': 'PENDING'
    });

    // Get average approval time
    const approvedExpenses = await Expense.find({
      'approvals.approver': userId,
      'approvals.status': 'APPROVED'
    });

    let totalApprovalTime = 0;
    let approvedCount = 0;

    approvedExpenses.forEach(expense => {
      const userApproval = expense.approvals.find(
        approval => approval.approver.toString() === userId && approval.status === 'APPROVED'
      );

      if (userApproval && userApproval.actionDate) {
        const timeDiff = userApproval.actionDate - expense.createdAt;
        totalApprovalTime += timeDiff;
        approvedCount++;
      }
    });

    const avgApprovalTime = approvedCount > 0 ? totalApprovalTime / approvedCount / (1000 * 60 * 60) : 0; // in hours

    res.json({
      stats,
      pendingCount,
      avgApprovalTimeHours: Math.round(avgApprovalTime * 100) / 100
    });
  } catch (error) {
    console.error('Get approval analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check if all approvals are complete
const checkApprovalCompletion = async (expense) => {
  try {
    if (!expense.approvalFlow) {
      return true; // No approval flow means auto-approve
    }

    const approvalFlow = await ApprovalFlow.findById(expense.approvalFlow);

    if (!approvalFlow) {
      return true;
    }

    // Check conditional rules
    if (approvalFlow.conditionalRules) {
      const { percentageRule, specificApproverRule, hybridRule } = approvalFlow.conditionalRules;

      // Check specific approver rule
      if (specificApproverRule.enabled) {
        const specificApproval = expense.approvals.find(
          approval => 
            approval.approver.toString() === specificApproverRule.approver.toString() &&
            approval.status === 'APPROVED'
        );

        if (specificApproval) {
          return true; // Specific approver approved
        }
      }

      // Check percentage rule
      if (percentageRule.enabled) {
        const approvedCount = expense.approvals.filter(approval => approval.status === 'APPROVED').length;
        const totalApprovals = expense.approvals.length;
        const approvalPercentage = (approvedCount / totalApprovals) * 100;

        if (approvalPercentage >= percentageRule.percentage) {
          return true; // Percentage threshold met
        }
      }

      // Check hybrid rule
      if (hybridRule.enabled) {
        const specificApproved = specificApproverRule.enabled && expense.approvals.some(
          approval => 
            approval.approver.toString() === specificApproverRule.approver.toString() &&
            approval.status === 'APPROVED'
        );

        const percentageApproved = percentageRule.enabled && (() => {
          const approvedCount = expense.approvals.filter(approval => approval.status === 'APPROVED').length;
          const totalApprovals = expense.approvals.length;
          return (approvedCount / totalApprovals) * 100 >= percentageRule.percentage;
        })();

        if (hybridRule.operator === 'OR') {
          return specificApproved || percentageApproved;
        } else {
          return specificApproved && percentageApproved;
        }
      }
    }

    // Default sequential approval - all approvals must be approved
    const pendingApprovals = expense.approvals.filter(approval => approval.status === 'PENDING');
    return pendingApprovals.length === 0;
  } catch (error) {
    console.error('Check approval completion error:', error);
    return false;
  }
};

module.exports = {
  getPendingApprovals,
  processApproval,
  getApprovalHistory,
  getApprovalAnalytics
};
