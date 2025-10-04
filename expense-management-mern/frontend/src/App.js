import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';

// Components
import PrivateRoute from './components/Common/PrivateRoute';
import Layout from './components/Common/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ExpenseList from './pages/ExpenseList';
import ExpenseForm from './pages/ExpenseForm';
import ExpenseDetails from './pages/ExpenseDetails';
import ApprovalQueue from './pages/ApprovalQueue';
import UserManagement from './pages/UserManagement';
import CompanySettings from './pages/CompanySettings';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Private Routes */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* Dashboard Routes */}
                <Route index element={<DashboardRedirect />} />
                <Route path="admin-dashboard" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
                <Route path="manager-dashboard" element={<PrivateRoute roles={['MANAGER']}><ManagerDashboard /></PrivateRoute>} />
                <Route path="employee-dashboard" element={<PrivateRoute roles={['EMPLOYEE']}><EmployeeDashboard /></PrivateRoute>} />

                {/* Expense Routes */}
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="expenses/new" element={<ExpenseForm />} />
                <Route path="expenses/:id" element={<ExpenseDetails />} />
                <Route path="expenses/:id/edit" element={<ExpenseForm />} />

                {/* Approval Routes */}
                <Route path="approvals" element={<PrivateRoute roles={['ADMIN', 'MANAGER']}><ApprovalQueue /></PrivateRoute>} />

                {/* User Management */}
                <Route path="users" element={<PrivateRoute roles={['ADMIN']}><UserManagement /></PrivateRoute>} />

                {/* Settings */}
                <Route path="settings" element={<PrivateRoute roles={['ADMIN']}><CompanySettings /></PrivateRoute>} />

                {/* Profile */}
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on role
const DashboardRedirect = () => {
  const role = localStorage.getItem('userRole');

  switch(role) {
    case 'ADMIN':
      return <Navigate to="/admin-dashboard" replace />;
    case 'MANAGER':
      return <Navigate to="/manager-dashboard" replace />;
    case 'EMPLOYEE':
      return <Navigate to="/employee-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
