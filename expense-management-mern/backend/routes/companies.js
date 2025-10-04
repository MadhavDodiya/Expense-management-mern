const express = require('express');
const Company = require('../models/Company');
const { getSupportedCurrencies } = require('../utils/currencyHelper');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/companies/settings
// @desc    Get company settings
// @access  Private (Admin)
router.get('/settings', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ company });
  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/companies/settings
// @desc    Update company settings
// @access  Private (Admin)
router.put('/settings', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const {
      name,
      contactEmail,
      contactPhone,
      address,
      currency,
      timezone,
      settings
    } = req.body;

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company fields
    if (name) company.name = name;
    if (contactEmail) company.contactEmail = contactEmail;
    if (contactPhone) company.contactPhone = contactPhone;
    if (address) company.address = { ...company.address, ...address };
    if (currency) company.currency = currency;
    if (timezone) company.timezone = timezone;
    if (settings) company.settings = { ...company.settings, ...settings };

    await company.save();

    res.json({
      message: 'Company settings updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/currencies
// @desc    Get supported currencies
// @access  Private
router.get('/currencies', auth, async (req, res) => {
  try {
    const currencies = await getSupportedCurrencies();
    res.json({ currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
