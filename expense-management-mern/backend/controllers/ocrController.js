const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

// Process receipt image with OCR
const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imagePath = req.file.path;

    // Preprocess image for better OCR results
    const processedImagePath = await preprocessImage(imagePath);

    // Perform OCR
    const ocrResult = await Tesseract.recognize(processedImagePath, 'eng', {
      logger: m => console.log(m) // Optional: log progress
    });

    const extractedText = ocrResult.data.text;

    // Parse receipt data from extracted text
    const receiptData = parseReceiptData(extractedText);

    // Clean up processed image file
    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }

    res.json({
      success: true,
      data: {
        ...receiptData,
        rawText: extractedText,
        confidence: ocrResult.data.confidence,
        originalFile: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path
        }
      }
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
      message: 'Failed to process receipt',
      error: error.message 
    });
  }
};

// Preprocess image for better OCR results
const preprocessImage = async (imagePath) => {
  try {
    const image = await Jimp.read(imagePath);

    // Apply image processing techniques
    await image
      .greyscale() // Convert to grayscale
      .contrast(0.3) // Increase contrast
      .normalize() // Normalize colors
      .resize(Jimp.AUTO, 800); // Resize for better processing

    const processedPath = imagePath.replace(path.extname(imagePath), '_processed.jpg');
    await image.writeAsync(processedPath);

    return processedPath;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    return imagePath; // Return original if preprocessing fails
  }
};

// Parse receipt data from OCR text
const parseReceiptData = (text) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  const receiptData = {
    merchant: '',
    amount: 0,
    date: null,
    items: [],
    currency: 'USD'
  };

  // Extract merchant name (usually first few lines)
  const merchantPatterns = [
    /^[A-Z\s&'-]{3,}$/,
    /^[A-Z][a-z\s&'-]{3,}$/
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (merchantPatterns.some(pattern => pattern.test(line))) {
      receiptData.merchant = line;
      break;
    }
  }

  // Extract total amount
  const amountPatterns = [
    /(?:total|amount|sum|charge)[:\s]*[$€£¥₹]?([\d,]+\.?\d*)/i,
    /[$€£¥₹]([\d,]+\.\d{2})(?!\d)/g,
    /\b(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)(?:\s*$|\s+[a-z])/gi
  ];

  const amounts = [];

  amountPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const numericPart = match.replace(/[^\d.,]/g, '');
        const amount = parseFloat(numericPart.replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          amounts.push(amount);
        }
      });
    }
  });

  // Get the largest amount (likely the total)
  if (amounts.length > 0) {
    receiptData.amount = Math.max(...amounts);
  }

  // Extract date
  const datePatterns = [
    /\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\b/g,
    /\b(\d{4}[/.-]\d{1,2}[/.-]\d{1,2})\b/g,
    /\b(\w{3}\s+\d{1,2},?\s+\d{4})\b/gi
  ];

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const dateStr = matches[0];
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        receiptData.date = parsedDate;
      }
    }
  });

  // Extract line items
  const itemPatterns = [
    /^\s*(.+?)\s+[$€£¥₹]?([\d,]+\.?\d*)\s*$/gm,
    /^\s*(\d+)\s+(.+?)\s+([\d,]+\.?\d*)\s*$/gm
  ];

  itemPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const item = {
        description: match[1] ? match[1].trim() : (match[2] ? match[2].trim() : ''),
        amount: parseFloat((match[2] ? match[3] : match[2]).replace(/,/g, ''))
      };

      if (item.description && !isNaN(item.amount) && item.amount > 0) {
        receiptData.items.push(item);
      }
    }
  });

  // Detect currency
  const currencyPatterns = {
    'USD': /[$]|USD|US\$/i,
    'EUR': /[€]|EUR|EURO/i,
    'GBP': /[£]|GBP|POUND/i,
    'JPY': /[¥]|JPY|YEN/i,
    'INR': /[₹]|INR|RUPEE/i
  };

  Object.keys(currencyPatterns).forEach(currency => {
    if (currencyPatterns[currency].test(text)) {
      receiptData.currency = currency;
    }
  });

  return receiptData;
};

// Test OCR functionality
const testOCR = async (req, res) => {
  try {
    res.json({ 
      message: 'OCR service is running',
      supported_languages: ['eng'],
      max_file_size: '10MB'
    });
  } catch (error) {
    res.status(500).json({ message: 'OCR service error' });
  }
};

module.exports = {
  processReceipt,
  testOCR
};
