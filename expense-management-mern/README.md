# Expense Management System - MERN Stack

A comprehensive expense management system built with MongoDB, Express.js, React, and Node.js. This application provides multi-level approval workflows, OCR receipt scanning, and role-based access control for efficient expense tracking and approval.

## Features

### Core Functionality
- **Multi-Role Support**: Admin, Manager, and Employee roles with specific permissions
- **Expense Submission**: Easy expense creation with receipt upload
- **OCR Integration**: Automatic receipt scanning and data extraction
- **Multi-Level Approvals**: Configurable approval workflows
- **Currency Support**: Multi-currency support with automatic conversion
- **Real-time Dashboard**: Role-based dashboards with analytics
- **Responsive Design**: Mobile-friendly interface

### Advanced Features
- **Conditional Approval Rules**: Percentage-based and specific approver rules
- **Receipt Management**: Multiple receipt uploads per expense
- **Audit Trail**: Complete approval history tracking
- **Email Notifications**: Automated notification system
- **Company Management**: Multi-tenant architecture
- **Data Export**: Export expenses to various formats

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **Tesseract.js**: OCR processing
- **Bcrypt**: Password hashing

### Frontend
- **React**: Frontend library
- **React Router**: Client-side routing
- **Bootstrap**: CSS framework
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **React-Toastify**: Notifications

## Project Structure

```
expense-management-mern/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense_management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage Guide

### First Time Setup

1. **Register Your Company**
   - Visit `http://localhost:3000/register`
   - Fill in company details and admin user information
   - The system will auto-detect currency based on country selection

2. **Admin Dashboard**
   - Access comprehensive company overview
   - Manage users and approval workflows
   - View all company expenses and analytics

3. **Create Users**
   - Navigate to User Management
   - Add employees and managers
   - Set up manager relationships

### Expense Workflow

1. **Employee Submits Expense**
   - Upload receipt (OCR will auto-extract data)
   - Fill in expense details
   - Submit for approval

2. **Manager Approval**
   - Review pending expenses
   - Approve or reject with comments
   - View team expense analytics

3. **Admin Oversight**
   - Monitor all company expenses
   - Override approvals if needed
   - Generate reports and analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register company and admin
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Expenses
- `GET /api/expenses/my` - Get user expenses
- `GET /api/expenses/company` - Get company expenses (Admin/Manager)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/:id` - Get expense details

### Approvals
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/:id` - Process approval
- `GET /api/approvals/history` - Get approval history

### OCR
- `POST /api/ocr/process` - Process receipt image

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## User Roles & Permissions

### Admin
- Full system access
- User management
- Company settings
- Approval workflow configuration
- All expense visibility
- Override approvals

### Manager
- Team expense visibility
- Approve/reject team expenses
- Submit own expenses
- Team analytics

### Employee
- Submit expenses
- View own expenses
- Track approval status
- Update profile

## Approval Workflows

The system supports flexible approval workflows:

1. **Sequential Approval**: Step-by-step approvals
2. **Percentage Rules**: Approval based on percentage of approvers
3. **Specific Approver Rules**: Designated approvers for certain conditions
4. **Hybrid Rules**: Combination of multiple rule types

## Deployment

### Production Environment

1. **Backend Deployment**
   - Use PM2 for process management
   - Set up MongoDB Atlas for cloud database
   - Configure environment variables
   - Set up SSL certificates

2. **Frontend Deployment**
   - Build the React app: `npm run build`
   - Serve static files with nginx or similar
   - Configure reverse proxy for API calls

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense_management
JWT_SECRET=your-production-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **OCR Not Working**
   - Check if image files are being uploaded correctly
   - Verify Tesseract.js installation
   - Ensure adequate server memory

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure correct MIME type filtering

4. **Authentication Problems**
   - Verify JWT secret configuration
   - Check token expiration settings
   - Ensure proper CORS setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

- Built with love using the MERN stack
- OCR powered by Tesseract.js
- UI components from Bootstrap
- Icons from Font Awesome
