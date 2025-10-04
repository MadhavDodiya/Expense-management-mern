const express = require('express');
const { processReceipt, testOCR } = require('../controllers/ocrController');
const { auth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/ocr/process
// @desc    Process receipt image with OCR
// @access  Private
router.post('/process', auth, upload.single('receipt'), handleUploadError, processReceipt);

// @route   GET /api/ocr/test
// @desc    Test OCR functionality
// @access  Private
router.get('/test', auth, testOCR);

module.exports = router;
