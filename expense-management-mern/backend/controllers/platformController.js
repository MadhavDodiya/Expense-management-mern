const Company = require('../models/Company');
const User = require('../models/User');
const { getCountryCurrency } = require('../utils/currencyHelper');

// Platform (SUPER_ADMIN) endpoints to manage multiple companies.

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find({})
      .sort({ createdAt: -1 })
      .select('name domain country currency isActive createdAt updatedAt');

    res.json({ companies });
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create company + admin user for that company.
// Body: { companyName, companyDomain, country, currency?, adminFirstName, adminLastName, adminEmail, adminPassword }
const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyDomain,
      country,
      currency,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword
    } = req.body || {};

    const name = (companyName || '').toString().trim();
    const domain = (companyDomain || '').toString().trim().toLowerCase();
    const adminEmailNormalized = (adminEmail || '').toString().trim().toLowerCase();

    if (!name || !domain || !country) {
      return res.status(400).json({ message: 'companyName, companyDomain and country are required' });
    }
    if (!adminFirstName || !adminLastName || !adminEmailNormalized || !adminPassword) {
      return res.status(400).json({ message: 'adminFirstName, adminLastName, adminEmail and adminPassword are required' });
    }
    if (String(adminPassword).length < 6) {
      return res.status(400).json({ message: 'adminPassword must be at least 6 characters' });
    }

    const existingCompany = await Company.findOne({ domain });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company domain already exists' });
    }

    const existingUser = await User.findOne({ email: adminEmailNormalized });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const resolvedCurrency = currency || (await getCountryCurrency(country)) || 'USD';

    const company = await Company.create({
      name,
      domain,
      country,
      currency: resolvedCurrency
    });

    const admin = await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmailNormalized,
      password: adminPassword,
      role: 'ADMIN',
      company: company._id
    });

    res.status(201).json({
      message: 'Company created',
      company: {
        id: company._id,
        name: company.name,
        domain: company.domain,
        country: company.country,
        currency: company.currency
      },
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listCompanies,
  createCompany
};

