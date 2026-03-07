const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Company = require('../models/Company');
const { getSupportedCurrencies } = require('../utils/currencyHelper');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

const logosDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, logosDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `company-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed for company logo'));
  }
});

const handleLogoUpload = (req, res, next) => {
  logoUpload.single('logo')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'Logo file too large. Maximum size is 5MB.' });
        return;
      }
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(400).json({ message: error.message || 'Invalid logo file' });
  });
};

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

// @route   PUT /api/companies/settings/logo
// @desc    Upload/update company logo
// @access  Private (Admin)
router.put('/settings/logo', auth, authorize('ADMIN'), handleLogoUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Logo file is required' });
    }

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const previousLogo = company.logo || '';
    company.logo = `/uploads/logos/${req.file.filename}`;
    await company.save();

    if (previousLogo && previousLogo.startsWith('/uploads/logos/')) {
      const oldLogoFilePath = path.join(__dirname, '..', previousLogo.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldLogoFilePath)) {
        fs.unlinkSync(oldLogoFilePath);
      }
    }

    return res.json({
      message: 'Company logo updated successfully',
      logo: company.logo,
      company
    });
  } catch (error) {
    console.error('Upload company logo error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/companies/settings/logo
// @desc    Remove company logo
// @access  Private (Admin)
router.delete('/settings/logo', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const existingLogo = company.logo || '';
    company.logo = '';
    await company.save();

    if (existingLogo && existingLogo.startsWith('/uploads/logos/')) {
      const existingLogoPath = path.join(__dirname, '..', existingLogo.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(existingLogoPath)) {
        fs.unlinkSync(existingLogoPath);
      }
    }

    return res.json({
      message: 'Company logo removed successfully',
      logo: '',
      company
    });
  } catch (error) {
    console.error('Remove company logo error:', error);
    return res.status(500).json({ message: 'Server error' });
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
