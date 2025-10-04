import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { getCompanyExpenses, expenses } = useExpense();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedExpenses: 0,
    totalAmount: 0,
    monthlyExpenses: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await getCompanyExpenses({ limit: 100 });
  };

  useEffect(() => {
    if (expenses.length > 0) {
      calculateStats();
    }
  }, [expenses]);

  const calculateStats = () => {
    const totalExpenses = expenses.length;
    const pendingApprovals = expenses.filter(exp => exp.status === 'PENDING').length;
    const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED').length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);

    // Monthly expenses for chart
    const monthlyData = {};
    expenses.forEach(exp => {
      const month = new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + exp.convertedAmount;
    });

    setStats({
      totalExpenses,
      pendingApprovals,
      approvedExpenses,
      totalAmount,
      monthlyExpenses: Object.entries(monthlyData).slice(-6)
    });
  };

  // Chart data
  const statusChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [
        expenses.filter(exp => exp.status === 'PENDING').length,
        expenses.filter(exp => exp.status === 'APPROVED').length,
        expenses.filter(exp => exp.status === 'REJECTED').length
      ],
      backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
      borderWidth: 0
    }]
  };

  const monthlyChartData = {
    labels: stats.monthlyExpenses.map(([month]) => month),
    datasets: [{
      label: 'Monthly Expenses',
      data: stats.monthlyExpenses.map(([, amount]) => amount),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h2 mb-0">Admin Dashboard</h1>
              <p className="mb-0">Welcome back, {user?.firstName}! Here's what's happening at your company.</p>
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
              <h3 className="mb-1">{stats.pendingApprovals}</h3>
              <p className="mb-0">Pending Approvals</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-3"></i>
              <h3 className="mb-1">{stats.approvedExpenses}</h3>
              <p className="mb-0">Approved Expenses</p>
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
        {/* Charts */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Expense Status Distribution</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {expenses.length > 0 ? (
                <div style={{ width: '300px', height: '300px' }}>
                  <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <p className="text-muted">No expenses data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Monthly Expense Trends</h5>
            </div>
            <div className="card-body">
              {stats.monthlyExpenses.length > 0 ? (
                <Bar data={monthlyChartData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p className="text-muted">No monthly data available</p>
              )}
            </div>
          </div>
        </div>

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
                        <th>Employee</th>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 10).map(expense => (
                        <tr key={expense._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {expense.user?.firstName?.charAt(0)}{expense.user?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-semibold">{expense.user?.firstName} {expense.user?.lastName}</div>
                                <small className="text-muted">{expense.user?.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Link to={`/expenses/${expense._id}`} className="text-decoration-none">
                              {expense.title}
                            </Link>
                          </td>
                          <td>
                            <span className="fw-semibold">
                              ${expense.convertedAmount.toLocaleString()}
                            </span>
                            <br />
                            <small className="text-muted">{user?.company?.currency}</small>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No expenses found</p>
                  <Link to="/expenses/new" className="btn btn-primary">
                    Create First Expense
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
                <div className="col-md-3">
                  <Link to="/users" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="fas fa-users fa-2x mb-2"></i>
                    <span>Manage Users</span>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/approvals" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="fas fa-check-circle fa-2x mb-2"></i>
                    <span>Pending Approvals</span>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/settings" className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="fas fa-cog fa-2x mb-2"></i>
                    <span>Company Settings</span>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/expenses" className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="fas fa-chart-bar fa-2x mb-2"></i>
                    <span>View Reports</span>
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

export default AdminDashboard;
