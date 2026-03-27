const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { listCompanies, createCompany } = require('../controllers/platformController');

const router = express.Router();

router.get('/companies', auth, authorize('SUPER_ADMIN'), listCompanies);
router.post('/companies', auth, authorize('SUPER_ADMIN'), createCompany);

module.exports = router;

