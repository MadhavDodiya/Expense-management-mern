const Expense = require('../models/Expense');
const User = require('../models/User');
const ApprovalFlow = require('../models/ApprovalFlow');
const mongoose = require('mongoose');

// Get pending approvals for current user
const getPendingApprovals = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

    let filter;
    if (req.user.role === 'ADMIN') {
      // Admin can review all company pending expenses
      filter = {
        company: req.user.company,
        status: 'PENDING'
      };
    } else {
      // Manager can review assigned pending approvals and team pending expenses without an approval flow
      const teamMembers = await User.find({
        company: req.user.company,
        manager: req.user.id
      }).select('_id');

      const teamMemberIds = teamMembers.map((member) => member._id.toString());
      teamMemberIds.push(req.user.id.toString());

      filter = {
        company: req.user.company,
        status: 'PENDING',
        $or: [
          {
            approvals: {
              $elemMatch: {
                approver: req.user.id,
                status: 'PENDING'
              }
            }
          },
          {
            approvals: { $size: 0 },
            user: { $in: teamMemberIds }
          }
        ]
      };
    }

    const expenses = await Expense.find(filter)
      .populate('user', 'firstName lastName email employeeId department')
      .populate('approvals.approver', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
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
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }

    const expense = await Expense.findById(expenseId)
      .populate('user', 'firstName lastName email')
      .populate('approvalFlow');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (expense.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending expenses can be processed' });
    }

    // Basic company scope check
    if (expense.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the approval entry for current user
    const approvalIndex = expense.approvals.findIndex(
      (approval) => {
        if (!approval?.approver) return false;
        const approverId = approval.approver._id ? approval.approver._id.toString() : approval.approver.toString();
        return approverId === req.user.id &&
        approval.status === 'PENDING'
      }
    );

    if (approvalIndex === -1 && expense.approvals.length > 0) {
      return res.status(400).json({ message: 'No pending approval found for this user' });
    }

    if (approvalIndex === -1 && expense.approvals.length === 0) {
      // Fallback: allow manual approval when no approval chain exists
      expense.approvals.push({
        approver: req.user.id,
        status: decision,
        comments,
        actionDate: new Date(),
        stepNumber: 0
      });
    } else {
      // Update existing approval
      expense.approvals[approvalIndex].status = decision;
      expense.approvals[approvalIndex].comments = comments;
      expense.approvals[approvalIndex].actionDate = new Date();
    }

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
    const { status } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

    const filter = {};

    if (status && status !== 'ALL') {
      filter.approvals = {
        $elemMatch: {
          approver: req.user.id,
          status
        }
      };
    } else {
      filter.approvals = {
        $elemMatch: {
          approver: req.user.id
        }
      };
    }

    const expenses = await Expense.find(filter)
      .populate('user', 'firstName lastName email employeeId')
      .populate('approvals.approver', 'firstName lastName email')
      .sort({ 'approvals.actionDate': -1 })
      .limit(limit)
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
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get approval statistics
    const stats = await Expense.aggregate([
      {
        $match: {
          'approvals.approver': userObjectId
        }
      },
      {
        $unwind: '$approvals'
      },
      {
        $match: {
          'approvals.approver': userObjectId
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
      approvals: {
        $elemMatch: {
          approver: userId,
          status: 'PENDING'
        }
      }
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
        if (totalApprovals === 0) {
          return true;
        }
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
          if (totalApprovals === 0) {
            return true;
          }
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
