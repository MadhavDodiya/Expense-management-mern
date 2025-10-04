import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { getUserExpenses, expenses } = useExpense();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await getUserExpenses({ limit: 20 });
  };

  useEffect(() => {
    if (expenses.length > 0) {
      calculateStats();
    }
  }, [expenses]);

  const calculateStats = () => {
    const totalExpenses = expenses.length;
    const pendingExpenses = expenses.filter(exp => exp.status === 'PENDING').length;
    const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED').length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    setStats({
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      totalAmount
    });
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h2 mb-0">My Dashboard</h1>
              <p className="mb-0">Welcome back, {user?.firstName}! Track your expenses and submissions here.</p>
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
              <i className="fas fa-receipt fa-2x mb-3"></i>
              <h3 className="mb-1">{stats.totalExpenses}</h3>
              <p className="mb-0">Total Expenses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x mb-3"></i>
              <h3 className="mb-1">{stats.pendingExpenses}</h3>
              <p className="mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-3"></i>
              <h3 className="mb-1">{stats.approvedExpenses}</h3>
              <p className="mb-0">Approved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-dollar-sign fa-2x mb-3"></i>
              <h3 className="mb-1">${stats.totalAmount.toLocaleString()}</h3>
              <p className="mb-0">Total Amount</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Expenses */}
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Expenses</h5>
              <Link to="/expenses" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {expenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 10).map(expense => (
                        <tr key={expense._id}>
                          <td>
                            <Link to={`/expenses/${expense._id}`} className="text-decoration-none fw-semibold">
                              {expense.title}
                            </Link>
                            <br />
                            <small className="text-muted">{expense.description}</small>
                          </td>
                          <td>
                            <span className="fw-semibold">
                              ${expense.amount.toLocaleString()}
                            </span>
                            <br />
                            <small className="text-muted">{expense.currency}</small>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{expense.category}</span>
                          </td>
                          <td>
                            <span className={`status-badge status-${expense.status.toLowerCase()}`}>
                              {expense.status}
                            </span>
                          </td>
                          <td>
                            <small>
                              {new Date(expense.expenseDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link to={`/expenses/${expense._id}`} className="btn btn-outline-primary btn-sm">
                                <i className="fas fa-eye"></i>
                              </Link>
                              {expense.status === 'PENDING' && (
                                <Link to={`/expenses/${expense._id}/edit`} className="btn btn-outline-secondary btn-sm">
                                  <i className="fas fa-edit"></i>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No expenses submitted yet</p>
                  <Link to="/expenses/new" className="btn btn-primary">
                    Submit Your First Expense
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Link to="/expenses/new" className="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-plus-circle fa-2x mb-2"></i>
                    <span>Submit New Expense</span>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/expenses" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-list fa-2x mb-2"></i>
                    <span>View All Expenses</span>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/profile" className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fas fa-user fa-2x mb-2"></i>
                    <span>Update Profile</span>
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

export default EmployeeDashboard;
