const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Company = require('./models/Company');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const expenseRoutes = require('./routes/expenses');
const approvalRoutes = require('./routes/approvals');
const ocrRoutes = require('./routes/ocr');
const stockRoutes = require('./routes/stocks');
const stockTypeRoutes = require('./routes/stockTypes');
const platformRoutes = require('./routes/platform');
const inventoryStockRoutes = require('./routes/inventory/stocks');
const inventoryExpenseRoutes = require('./routes/inventory/expenses');

// Load environment variables from backend/.env regardless of launch directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.then(async () => {
  // Optional: bootstrap a SUPER_ADMIN user (platform admin) to manage multiple companies.
  // Set env vars: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD.
  const email = (process.env.SUPER_ADMIN_EMAIL || '').toString().trim().toLowerCase();
  const password = (process.env.SUPER_ADMIN_PASSWORD || '').toString();
  if (!email || !password) return;

  try {
    const platformDomain = (process.env.PLATFORM_COMPANY_DOMAIN || 'platform.local').toString().trim().toLowerCase();
    const platformName = (process.env.PLATFORM_COMPANY_NAME || 'Platform').toString().trim() || 'Platform';

    const platformCompany = await Company.findOneAndUpdate(
      { domain: platformDomain },
      {
        $setOnInsert: {
          name: platformName,
          domain: platformDomain,
          country: 'N/A',
          currency: 'USD'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email,
        password,
        role: 'SUPER_ADMIN',
        company: platformCompany._id
      });
      console.log('SUPER_ADMIN user created');
    }
  } catch (bootstrapError) {
    console.error('SUPER_ADMIN bootstrap error:', bootstrapError);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/stock-types', stockTypeRoutes);
app.use('/api/platform', platformRoutes);

// Inventory (3-level stock + expenses)
app.use('/api/inventory/stocks', inventoryStockRoutes);
app.use('/api/inventory/expenses', inventoryExpenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
