# Expense Management System

This project is a MERN stack expense management platform for company expense tracking, approvals, OCR receipt scanning, reporting, and role-based access control.

It supports:
- employee expense submission
- manager approval workflow
- admin-level company management
- receipt upload and OCR parsing
- currency-aware expense handling
- analytics dashboards and export flows

## Project Summary

- **Frontend:** React 18 with React Router, Bootstrap, Axios, Chart.js, toast notifications, and form helpers.
- **Backend:** Node.js with Express, MongoDB, Mongoose, JWT authentication, file upload support, OCR, email notifications, and scheduled jobs.
- **Database:** MongoDB.
- **Architecture:** MERN, with a separate backend API and React client.
- **Deployment support:** Local development and Vercel deployment are both configured.

## Package Inventory

The project currently includes these installed npm packages in `package.json` files.

### Root Package

- `concurrently` for running backend and frontend together during development.

### Frontend Dependencies

The frontend uses 18 runtime packages:

- `react`
- `react-dom`
- `react-router-dom`
- `react-scripts`
- `axios`
- `bootstrap`
- `react-bootstrap`
- `react-toastify`
- `react-datepicker`
- `react-dropzone`
- `chart.js`
- `react-chartjs-2`
- `moment`
- `react-select`
- `react-table`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/user-event`

### Backend Dependencies

The backend uses 15 runtime packages and 2 development packages:

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cors`
- `dotenv`
- `multer`
- `tesseract.js`
- `jimp`
- `nodemailer`
- `node-cron`
- `compression`
- `axios`
- `moment`
- `uuid`
- `jest` for tests
- `nodemon` for development reloads

### What These Packages Do

- `axios`: API requests from frontend and backend utilities.
- `bootstrap` and `react-bootstrap`: UI layout and components.
- `chart.js` and `react-chartjs-2`: dashboard charts and analytics.
- `react-toastify`: success and error notifications.
- `react-datepicker`: date input handling.
- `react-dropzone`: file upload interactions.
- `react-select`: searchable select inputs.
- `react-table`: tabular data rendering.
- `express`: REST API server.
- `mongoose`: MongoDB schema and model layer.
- `jsonwebtoken`: login token creation and verification.
- `bcryptjs`: password hashing.
- `multer`: receipt and logo file uploads.
- `tesseract.js`: OCR text extraction from receipts.
- `jimp`: image processing for OCR pre-processing.
- `nodemailer`: email delivery.
- `node-cron`: scheduled background jobs.
- `compression`: response compression.
- `cors`: cross-origin requests from the React app.
- `dotenv`: environment variable loading.
- `uuid`: unique identifiers.

## Repository Structure

```text
expense-management-mern/
|-- api/
|   `-- index.js
|-- backend/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- uploads/
|   `-- server.js
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- components/
|       |-- context/
|       `-- pages/
|-- package.json
|-- vercel.json
`-- README.md
```

## Application Modules

This codebase currently contains:

- **15 frontend pages**
- **6 shared frontend components**
- **2 frontend contexts**
- **11 backend routes**
- **10 backend controllers**
- **10 backend models**
- **2 backend middleware modules**
- **2 backend utility modules**

## Frontend Pages

The frontend pages are located in `frontend/src/pages`.

### Authentication and Access

- `Login`: Handles user sign-in and stores the JWT token.
- `Register`: Creates a company and initial admin account.
- `ForgotPassword`: Starts the password reset flow.
- `ResetPassword`: Completes the password reset flow using the reset token.

### Dashboards

- `AdminDashboard`: Company-level overview for admins. It shows company expenses, approval status, stock overview, recent requests, and chart-based analytics.
- `ManagerDashboard`: Manager landing screen with team-oriented summary cards and quick actions.
- `EmployeeDashboard`: Personal dashboard for employees. It shows the user's own expenses, pending items, approved items, and total amounts.

### Expense Management

- `ExpenseList`: Main expense listing page. It switches between personal and company expenses based on role, supports filtering, sorting, date search, and monthly CSV/PDF export.
- `ExpenseForm`: Create and edit expense form. It supports receipt uploads, OCR extraction, category selection, transport details, and submission/update flow.
- `ExpenseDetails`: Detailed expense view. It shows receipt previews, generated receipt text, approval timeline, and company details.

### Approval and Administration

- `ApprovalQueue`: Displays pending approvals for admins and managers. It lets reviewers approve or reject expenses and add rejection comments.
- `UserManagement`: Admin screen for creating, updating, filtering, and deleting company users.
- `CompanySettings`: Admin screen for managing company profile, address, currency, approval settings, and company logo.

### Inventory and Profile

- `StockManagement`: Admin inventory screen for managing stock items, stock types, groups, and inline stock updates.
- `Profile`: Personal account page for updating profile information, changing password, and managing preferences such as language and notifications.

## Backend Modules

The backend logic is organized into controllers, routes, models, middleware, and utilities.

### Controllers

- `authController`: Registration, login, password reset, and profile authentication operations.
- `expenseController`: Expense creation, listing, detail retrieval, receipts, exports, updates, and deletions.
- `approvalController`: Approval queue retrieval and approval or rejection processing.
- `userController`: User listing, creation, updates, deletion, and manager lookups.
- `platformController`: Super admin company management APIs.
- `ocrController`: Receipt OCR and data extraction flow.
- `stockController`: Stock item CRUD and listing operations.
- `stockTypeController`: Stock category and type management.
- `inventory/stockController`: Inventory stock handling for the inventory module.
- `inventory/expenseController`: Inventory expense handling for the inventory module.

### Routes

- `routes/auth.js`: Authentication APIs.
- `routes/expenses.js`: Expense APIs.
- `routes/approvals.js`: Approval APIs.
- `routes/users.js`: User management APIs.
- `routes/companies.js`: Company settings, currency, and logo APIs.
- `routes/platform.js`: Super admin multi-company APIs.
- `routes/ocr.js`: OCR APIs.
- `routes/stocks.js`: Stock APIs.
- `routes/stockTypes.js`: Stock type APIs.
- `routes/inventory/stocks.js`: Inventory stock APIs.
- `routes/inventory/expenses.js`: Inventory expense APIs.

### Models

- `User`: Stores identity, role, company relation, preferences, manager relation, and authentication data.
- `Company`: Stores company profile, domain, currency, logo, address, and settings.
- `Expense`: Stores expense information, receipts, approval data, currency conversion, and approval status.
- `ApprovalFlow`: Stores configurable approval workflow definitions.
- `StockType`: Stores stock type hierarchy and grouping.
- `StockItem`: Stores stock items and quantities.
- `inventory/StockType`: Inventory-specific type model.
- `inventory/StockItem`: Inventory-specific item model.
- `inventory/StockExpense`: Inventory expense model.
- `inventory/StockCategory`: Inventory category model.

### Middleware and Utilities

- `middleware/auth.js`: JWT authentication and role-based authorization.
- `middleware/upload.js`: File upload handling and validation.
- `utils/currencyHelper.js`: Currency lookup and conversion helpers.
- `utils/emailService.js`: Email sending utilities.

## Database

The application uses **MongoDB** as the database and **Mongoose** as the object data modeling layer.

### Main Collections

- `users`
- `companies`
- `expenses`
- `approvalflows`
- `stocktypes`
- `stockitems`
- `stockexpenses`
- `stockcategories`
- inventory-specific collections for the inventory module

### Data Flow

- Users authenticate with JWT.
- Expenses are stored with company and user references.
- Expenses can contain multiple receipt attachments.
- OCR can extract text and amount data from receipt images.
- Approval history is stored in the expense document for auditability.

## Key Features

- Role-based dashboards for admin, manager, and employee users
- Expense submission with receipt upload
- OCR parsing for receipt data extraction
- Multi-step approval workflow
- Monthly reporting with CSV and PDF export
- Company settings management
- Multi-currency support
- Stock and inventory tracking
- Profile management and password updates
- Email support for notifications and workflow communication

## Step-by-Step Setup

### 1. Download the Project

You can download the code in any of these ways:

- clone the repository with Git
- download the project as a ZIP from your repository hosting service
- copy the project folder to your local machine if you already have it

Example:

```bash
git clone <repository-url>
cd expense-management-mern
```

### 2. Install Prerequisites

Install these tools before running the project:

- Node.js 14 or later
- npm
- MongoDB locally or MongoDB Atlas

### 3. Install Dependencies

From the project root:

```bash
npm run install-all
```

This installs:

- backend dependencies from `backend/package.json`
- frontend dependencies from `frontend/package.json`

### 4. Configure Environment Variables

Create `backend/.env` with values similar to:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_management
JWT_SECRET=your-super-secret-jwt-key
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=strong-password
PLATFORM_COMPANY_NAME=Platform
PLATFORM_COMPANY_DOMAIN=platform.local
```

Optional production email settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 5. Start MongoDB

- If you are using local MongoDB, make sure the service is running.
- If you are using Atlas, update `MONGODB_URI` with your connection string.

### 6. Run the Project

Run both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run server
npm run client
```

### 7. Open the Application

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## User Flow

### Employee Flow

1. Log in to the application.
2. Open `My Dashboard`.
3. Create a new expense in `New Expense Request`.
4. Upload receipts if available.
5. Review OCR extracted data.
6. Submit the request and track status from `My Expenses`.

### Manager Flow

1. Log in with manager credentials.
2. Open `Manager Dashboard`.
3. Review team expenses from `Company Expenses`.
4. Open `Pending Approvals` for approval decisions.
5. Approve or reject requests with comments.

### Admin Flow

1. Log in with admin credentials.
2. Use `Admin Dashboard` to review company-level analytics.
3. Open `User Management` to manage employees and managers.
4. Open `Company Settings` to update company profile and approval preferences.
5. Open `Stock Management` to manage stock items and stock types.
6. Review all company expense activity and approvals.

## API Overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `PUT /api/auth/profile`
- `PUT /api/auth/preferences`

### Expenses

- `GET /api/expenses/my`
- `GET /api/expenses/company`
- `POST /api/expenses`
- `GET /api/expenses/:expenseId`
- `PUT /api/expenses/:expenseId`
- `DELETE /api/expenses/:expenseId`
- `GET /api/expenses/:expenseId/receipt`
- `GET /api/expenses/:expenseId/receipt/download`
- `GET /api/expenses/reports/monthly/export`

### Approvals

- `GET /api/approvals/pending`
- `POST /api/approvals/:id`
- `GET /api/approvals/history`

### Users

- `GET /api/users`
- `GET /api/users/managers`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Companies and Platform

- `GET /api/companies/settings`
- `PUT /api/companies/settings`
- `PUT /api/companies/settings/logo`
- `DELETE /api/companies/settings/logo`
- `GET /api/companies/currencies`
- `GET /api/platform/companies`
- `POST /api/platform/companies`

### OCR and Inventory

- `POST /api/ocr/process`
- `GET /api/stocks`
- `POST /api/stocks`
- `PUT /api/stocks/:id`
- `DELETE /api/stocks/:id`
- `GET /api/stock-types`
- `POST /api/stock-types`
- inventory endpoints under `/api/inventory/*`

## Role-Based Access

### Super Admin

- Can manage companies at the platform level.
- Can create new companies and admin accounts.

### Admin

- Can manage users, company settings, approvals, expenses, and stocks.
- Can view all company-level expense data.

### Manager

- Can review team expenses and approvals.
- Can see company expense data limited to the manager scope.

### Employee

- Can submit expenses.
- Can view personal expenses and profile settings.

## Deployment Notes

The project includes `vercel.json` and `api/index.js` for Vercel deployment.

- `api/index.js` exports the backend app for serverless deployment.
- `vercel.json` maps `/api/*` requests to the backend function.
- The frontend is built as a static React app.

For production, set:

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret
```

## Troubleshooting

- If the backend does not start, confirm that MongoDB is reachable and `MONGODB_URI` is valid.
- If login fails, check `JWT_SECRET` and whether the database has the expected user records.
- If file upload fails, confirm that the `uploads` folder is writable.
- If OCR fails, confirm that the receipt image is clear and supported.
- If the frontend cannot reach the API, verify the proxy setting in `frontend/package.json`.

## Summary

This project is a complete company expense management platform with authentication, dashboards, expense workflows, OCR receipt scanning, reporting, company settings, user management, stock management, and MongoDB-backed persistence.
