import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h2 mb-0">Manager Dashboard</h1>
              <p className="mb-0">Welcome back, {user?.firstName}! Manage your team's expenses here.</p>
            </div>
            <div className="col-auto">
              <Link to="/expenses/new" className="btn btn-light">
                <i className="fas fa-plus me-2"></i>
                New Expense
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-users fa-2x mb-3"></i>
              <h3 className="mb-1">8</h3>
              <p className="mb-0">Team Members</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x mb-3"></i>
              <h3 className="mb-1">12</h3>
              <p className="mb-0">Pending Approvals</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-3"></i>
              <h3 className="mb-1">45</h3>
              <p className="mb-0">Approved This Month</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-dollar-sign fa-2x mb-3"></i>
              <h3 className="mb-1">$12,450</h3>
              <p className="mb-0">Team Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link to="/approvals" className="btn btn-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-clock fa-2x mb-2"></i>
                    <span>Pending Approvals</span>
                    <small className="text-muted">12 waiting</small>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/expenses" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-list fa-2x mb-2"></i>
                    <span>Team Expenses</span>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/expenses/new" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-plus fa-2x mb-2"></i>
                    <span>New Expense</span>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/profile" className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-user fa-2x mb-2"></i>
                    <span>Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
