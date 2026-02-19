import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        {/* Sidebar Toggle */}
        <button
          className="btn btn-outline-light d-lg-none"
          type="button"
          onClick={onToggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Page Title */}
        <div className="navbar-brand mb-0 h1 ms-3">
          Welcome back, {user?.firstName}!
        </div>

        {/* Right side items */}
        <div className="d-flex align-items-center">
          {/* Notifications */}
          <div className="dropdown me-3">
            <button
              className="btn btn-outline-light position-relative"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">Notifications</h6></li>
              <li><button type="button" className="dropdown-item">
                <i className="fas fa-check-circle text-success me-2"></i>
                Expense approved
              </button></li>
              <li><button type="button" className="dropdown-item">
                <i className="fas fa-clock text-warning me-2"></i>
                Pending approval
              </button></li>
              <li><button type="button" className="dropdown-item">
                <i className="fas fa-times-circle text-danger me-2"></i>
                Expense rejected
              </button></li>
            </ul>
          </div>

          {/* User Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-user me-2"></i>
              {user?.firstName}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">{user?.email}</h6></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => navigate('/profile')}
                >
                  <i className="fas fa-user me-2"></i>Profile
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => navigate('/settings')}
                >
                  <i className="fas fa-cog me-2"></i>Settings
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
