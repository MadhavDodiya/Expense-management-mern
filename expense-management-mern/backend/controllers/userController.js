const User = require('../models/User');
const Company = require('../models/Company');

// Get all users in company
const getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const filter = { company: req.user.company };

    // Add filters
    if (role && role !== 'ALL') {
      filter.role = role;
    }
    if (department && department !== 'ALL') {
      filter.department = department;
    }

    let users = await User.find(filter)
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      users = users.filter(user => 
        searchRegex.test(user.firstName) ||
        searchRegex.test(user.lastName) ||
        searchRegex.test(user.email) ||
        searchRegex.test(user.employeeId)
      );
    }

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      employeeId,
      phone,
      managerId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate manager (if provided)
    let manager = null;
    if (managerId) {
      manager = await User.findOne({ 
        _id: managerId, 
        company: req.user.company,
        role: { $in: ['ADMIN', 'MANAGER'] }
      });
      if (!manager) {
        return res.status(400).json({ message: 'Invalid manager selected' });
      }
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      department,
      employeeId,
      phone,
      company: req.user.company,
      manager: managerId || null
    });

    await user.save();

    // Populate manager details for response
    await user.populate('manager', 'firstName lastName email');

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      role,
      department,
      employeeId,
      phone,
      managerId,
      isActive
    } = req.body;

    const user = await User.findOne({ 
      _id: userId, 
      company: req.user.company 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate manager (if provided)
    if (managerId) {
      const manager = await User.findOne({ 
        _id: managerId, 
        company: req.user.company,
        role: { $in: ['ADMIN', 'MANAGER'] }
      });
      if (!manager) {
        return res.status(400).json({ message: 'Invalid manager selected' });
      }
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.department = department || user.department;
    user.employeeId = employeeId || user.employeeId;
    user.phone = phone || user.phone;
    user.manager = managerId || user.manager;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();
    await user.populate('manager', 'firstName lastName email');

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ 
      _id: userId, 
      company: req.user.company 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete admin user
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get managers for dropdown
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      company: req.user.company,
      role: { $in: ['ADMIN', 'MANAGER'] },
      isActive: true
    }).select('firstName lastName email role');

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getManagers
};
