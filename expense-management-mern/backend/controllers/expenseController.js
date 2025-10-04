const Expense = require('../models/Expense');
const User = require('../models/User');
const ApprovalFlow = require('../models/ApprovalFlow');
const { convertCurrency } = require('../utils/currencyHelper');

// Create new expense
const createExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      currency,
      category,
      expenseDate,
      ocrData
    } = req.body;

    // Convert amount to company currency if different
    const user = await User.findById(req.user.id).populate('company');
    let convertedAmount = amount;

    if (currency !== user.company.currency) {
      convertedAmount = await convertCurrency(amount, currency, user.company.currency);
    }

    // Create expense
    const expense = new Expense({
      user: req.user.id,
      company: req.user.company,
      title,
      description,
      amount,
      currency,
      convertedAmount,
      category,
      expenseDate: new Date(expenseDate),
      receipts: [],
      ocrData: ocrData || null
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      expense.receipts = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    await expense.save();

    // Start approval workflow
    try {
      await startApprovalWorkflow(expense);
    } catch (workflowError) {
      console.error('Approval workflow error:', workflowError);
      // Continue even if approval workflow fails
    }

    await expense.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'approvals.approver', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user expenses
const getUserExpenses = async (req, res) => {
  try {
    const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.id };

    // Add filters
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (startDate && endDate) {
      filter.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(filter)
      .populate('approvals.approver', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalExpenses: total
    });
  } catch (error) {
    console.error('Get user expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all company expenses (Admin/Manager)
const getCompanyExpenses = async (req, res) => {
  try {
    const { status, category, userId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = { company: req.user.company };

    // Add filters
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (userId && userId !== 'ALL') {
      filter.user = userId;
    }
    if (startDate && endDate) {
      filter.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // For managers, show only their team's expenses
    if (req.user.role === 'MANAGER') {
      const teamMembers = await User.find({
        company: req.user.company,
        manager: req.user.id
      }).select('_id');

      const teamMemberIds = teamMembers.map(member => member._id);
      teamMemberIds.push(req.user.id); // Include manager's own expenses

      filter.user = { $in: teamMemberIds };
    }

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
      totalExpenses: total
    });
  } catch (error) {
    console.error('Get company expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single expense
const getExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate('user', 'firstName lastName email employeeId department')
      .populate('approvals.approver', 'firstName lastName email role');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user has permission to view this expense
    const canView = 
      expense.user._id.toString() === req.user.id || // Own expense
      req.user.role === 'ADMIN' || // Admin can view all
      (req.user.role === 'MANAGER' && await isUserInTeam(expense.user._id, req.user.id)) || // Manager can view team expenses
      expense.approvals.some(approval => approval.approver._id.toString() === req.user.id); // Approver can view

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update expense (only if pending)
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const {
      title,
      description,
      amount,
      currency,
      category,
      expenseDate
    } = req.body;

    const expense = await Expense.findOne({ 
      _id: expenseId, 
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'PENDING' && expense.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Cannot edit expense after approval process has started' });
    }

    // Convert amount if currency changed
    const user = await User.findById(req.user.id).populate('company');
    let convertedAmount = amount;

    if (currency !== user.company.currency) {
      convertedAmount = await convertCurrency(amount, currency, user.company.currency);
    }

    // Update expense
    expense.title = title || expense.title;
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.currency = currency || expense.currency;
    expense.convertedAmount = convertedAmount;
    expense.category = category || expense.category;
    expense.expenseDate = expenseDate ? new Date(expenseDate) : expense.expenseDate;

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newReceipts = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      expense.receipts = [...expense.receipts, ...newReceipts];
    }

    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete expense (only if pending)
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ 
      _id: expenseId, 
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'PENDING' && expense.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Cannot delete expense after approval process has started' });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to start approval workflow
const startApprovalWorkflow = async (expense) => {
  try {
    // Get default approval flow for the company
    const approvalFlow = await ApprovalFlow.findOne({
      company: expense.company,
      isActive: true,
      isDefault: true
    }).populate('steps.approvers');

    if (!approvalFlow) {
      // If no approval flow, set to pending for manual review
      expense.status = 'PENDING';
      await expense.save();
      return;
    }

    expense.approvalFlow = approvalFlow._id;
    expense.currentApprovalStep = 0;

    // Create approval entries for each step
    for (let i = 0; i < approvalFlow.steps.length; i++) {
      const step = approvalFlow.steps[i];

      let approvers = [];

      if (step.approverType === 'MANAGER') {
        // Get user's manager
        const user = await User.findById(expense.user).populate('manager');
        if (user && user.manager) {
          approvers = [user.manager._id];
        }
      } else if (step.approverType === 'SPECIFIC_USER' && step.approvers) {
        approvers = step.approvers.map(approver => approver._id);
      }

      // Only add approvals if we have approvers
      if (approvers.length > 0) {
        for (const approverId of approvers) {
          expense.approvals.push({
            approver: approverId,
            stepNumber: i,
            status: 'PENDING'
          });
        }
      }
    }

    // If no approvals were created, set to pending
    if (expense.approvals.length === 0) {
      expense.status = 'PENDING';
    }

    await expense.save();
  } catch (error) {
    console.error('Start approval workflow error:', error);
    // Set to pending if workflow fails
    expense.status = 'PENDING';
    await expense.save();
  }
};

// Helper function to check if user is in team
const isUserInTeam = async (userId, managerId) => {
  const user = await User.findById(userId);
  return user && user.manager && user.manager.toString() === managerId;
};

module.exports = {
  createExpense,
  getUserExpenses,
  getCompanyExpenses,
  getExpense,
  updateExpense,
  deleteExpense
};
