import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    // Common items
    {
      path: '/',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    {
      path: '/expenses',
      icon: 'fas fa-receipt',
      label: 'My Expenses',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    {
      path: '/expenses/new',
      icon: 'fas fa-plus-circle',
      label: 'New Expense',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    // Manager/Admin items
    {
      path: '/approvals',
      icon: 'fas fa-check-circle',
      label: 'Approvals',
      roles: ['ADMIN', 'MANAGER']
    },
    // Admin only items
    {
      path: '/users',
      icon: 'fas fa-users',
      label: 'User Management',
      roles: ['ADMIN']
    },
    {
      path: '/settings',
      icon: 'fas fa-cog',
      label: 'Settings',
      roles: ['ADMIN']
    },
    // Common items
    {
      path: '/profile',
      icon: 'fas fa-user',
      label: 'Profile',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className={`d-flex flex-column h-100 text-white p-3 ${isOpen ? '' : 'd-none d-lg-flex'}`} 
         style={{ width: isOpen ? '250px' : '80px', minWidth: isOpen ? '250px' : '80px' }}>

      {/* Logo */}
      <div className="mb-4 text-center">
        <h4 className={`${isOpen ? '' : 'd-none'}`}>
          <i className="fas fa-coins me-2"></i>
          ExpenseMS
        </h4>
        {!isOpen && <i className="fas fa-coins fa-2x"></i>}
      </div>

      {/* Navigation */}
      <nav className="nav nav-pills flex-column mb-auto">
        {visibleItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`nav-link text-white mb-2 d-flex align-items-center ${
              isActive(item.path) ? 'active bg-white text-primary' : ''
            }`}
            style={{ 
              borderRadius: '10px',
              transition: 'all 0.3s',
              justifyContent: isOpen ? 'flex-start' : 'center'
            }}
          >
            <i className={`${item.icon} ${isOpen ? 'me-2' : ''}`}></i>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className={`border-top pt-3 ${isOpen ? '' : 'd-none'}`}>
        <div className="d-flex align-items-center">
          <div className="me-2">
            <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
                 style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-user"></i>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold small">{user?.firstName} {user?.lastName}</div>
            <div className="small opacity-75">{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
