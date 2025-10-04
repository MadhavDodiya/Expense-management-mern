# Database Setup Guide

## Issue Identified
The account creation (registration) is failing because **MongoDB is not installed or not running** on your system.

## Quick Fix - Install MongoDB

### Option 1: Install MongoDB Community Edition (Recommended)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" as your OS
   - Download the MSI installer

2. **Install MongoDB**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Start MongoDB Service**
   - Open Services (services.msc)
   - Find "MongoDB" service
   - Right-click and select "Start"
   - Set startup type to "Automatic" for future use

### Option 2: Install via Chocolatey (if you have it)

```powershell
choco install mongodb
```

### Option 3: Install via Scoop (if you have it)

```powershell
scoop install mongodb
```

## Verify Installation

After installing MongoDB, verify it's working:

1. **Check if MongoDB is running:**
   ```powershell
   # Open Command Prompt or PowerShell as Administrator
   net start MongoDB
   ```

2. **Test connection:**
   ```powershell
   mongo
   # or
   mongosh
   ```

3. **Restart your backend server:**
   ```powershell
   cd expense-management-mern/backend
   npm start
   ```

## Alternative: Use MongoDB Atlas (Cloud Database)

If you prefer not to install MongoDB locally:

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Choose the free tier (M0)
   - Select a region close to you
   - Create cluster

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update .env file**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense_management
   ```

## Test Registration After Setup

Once MongoDB is running:

1. **Start the backend server:**
   ```powershell
   cd expense-management-mern/backend
   npm start
   ```

2. **Test registration:**
   ```powershell
   node test-registration.js
   ```

3. **Start the frontend:**
   ```powershell
   cd expense-management-mern/frontend
   npm start
   ```

4. **Try creating an account at:** http://localhost:3000/register

## Troubleshooting

### MongoDB Won't Start
- Check if port 27017 is available
- Run as Administrator
- Check Windows Firewall settings

### Connection Refused
- Ensure MongoDB service is running
- Check if the port is blocked
- Verify the connection string in .env

### Permission Issues
- Run Command Prompt as Administrator
- Check MongoDB data directory permissions

## Expected Behavior After Fix

Once MongoDB is properly installed and running:

1. ✅ Backend server will show "MongoDB Connected" message
2. ✅ Registration endpoint will work without 500 errors
3. ✅ You can create accounts through the frontend
4. ✅ Users will be stored in the database

## Need Help?

If you're still having issues:

1. Check the backend console for error messages
2. Verify MongoDB is running: `net start MongoDB`
3. Test the connection: `mongosh`
4. Check the .env file has the correct MONGODB_URI

The registration functionality is working correctly - it just needs a database to store the data!
