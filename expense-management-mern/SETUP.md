# Quick Setup Guide

## Prerequisites Check
Before starting, ensure you have:
- [ ] Node.js installed (version 14 or higher)
- [ ] MongoDB installed and running
- [ ] Git (optional, for version control)

## Step-by-Step Installation

### 1. Extract and Navigate
```bash
# Extract the zip file to your desired location
# Navigate to the project directory
cd expense-management-mern
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install All Project Dependencies
```bash
npm run install-all
```
This will install dependencies for both frontend and backend.

### 4. Database Setup
Make sure MongoDB is running:
```bash
# On Windows (if installed as service):
net start MongoDB

# On macOS (using homebrew):
brew services start mongodb-community

# On Linux (systemd):
sudo systemctl start mongod
```

### 5. Environment Configuration
1. Navigate to the `backend` folder
2. Create a `.env` file (or rename `.env.example` if provided)
3. Configure the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense_management
   JWT_SECRET=your-secret-key-here
   ```

### 6. Start Development Servers
From the root directory, run:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 8. Create Your First Account
1. Go to http://localhost:3000/register
2. Fill in your company details
3. Create an admin account
4. Start using the system!

## Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
cd backend
npm start
```

## Troubleshooting

### Port Already in Use
If you get port errors, you can change the ports in:
- Backend: Change PORT in .env file
- Frontend: Change in package.json or use PORT=3001 npm start

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in .env
- Verify database permissions

### Module Not Found Errors
Run the install commands again:
```bash
npm run install-all
```

### OCR Not Working
OCR functionality requires additional system dependencies. If you encounter issues:
- Ensure you have adequate server memory
- Check image file formats (JPG, PNG supported)
- Verify upload directory permissions

## Next Steps After Setup

1. **Create Users**: Use the admin account to create employee and manager accounts
2. **Configure Workflows**: Set up approval workflows in Company Settings
3. **Submit Test Expense**: Create a sample expense to test the workflow
4. **Explore Features**: Try the OCR receipt scanning feature

## Need Help?
- Check the main README.md for detailed documentation
- Review the API documentation
- Check browser console for frontend errors
- Check server logs for backend errors

Happy expense managing! 🚀
