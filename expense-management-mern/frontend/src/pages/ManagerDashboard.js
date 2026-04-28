import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ManagerDashboard = () => {
  const { user, formatDate, formatCurrency } = useAuth();
  const { getCompanyExpenses, expenses } = useExpense();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedExpenses: 0,
    totalAmount: 0,
    teamMembers: 0,
    approvedThisMonth: 0,
    monthlyExpenses: []
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch dynamic stats from the backend
      const res = await axios.get('/api/expenses/stats');
      if (res.data) {
        setStats(res.data);
      }
      // Also fetch expenses for the list/table if needed
      await getCompanyExpenses({ limit: 10 });
    } catch (error) {
      console.error('Load dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [getCompanyExpenses]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Chart data
  const barChartData = {
    labels: stats.monthlyExpenses.map(item => item[0]),
    datasets: [
      {
        label: 'Approved Expenses',
        data: stats.monthlyExpenses.map(item => item[1]),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h2 mb-0">Manager Dashboard</h1>
              <p className="text-muted mb-0">Welcome back, {user?.firstName}! Here's what's happening with your team.</p>
            </div>
            <div className="col-auto">
              <Link to="/expenses/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                New Expense Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card dashboard-stat border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-primary-soft text-primary me-3">
                  <i className="fas fa-users"></i>
                </div>
                <h6 className="card-subtitle text-muted mb-0">Team Members</h6>
              </div>
              <h3 className="card-title mb-0">{stats.teamMembers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-warning-soft text-warning me-3">
                  <i className="fas fa-clock"></i>
                </div>
                <h6 className="card-subtitle text-muted mb-0">Pending Approvals</h6>
              </div>
              <h3 className="card-title mb-0">{stats.pendingApprovals}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-success-soft text-success me-3">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h6 className="card-subtitle text-muted mb-0">Approved This Month</h6>
              </div>
              <h3 className="card-title mb-0">{stats.approvedThisMonth}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-stat border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-info-soft text-info me-3">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <h6 className="card-subtitle text-muted mb-0">Team Total</h6>
              </div>
              <h3 className="card-title mb-0">{formatCurrency(stats.totalAmount, user?.company?.currency)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Monthly Spending Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
              <h5 className="card-title mb-0">Monthly Team Spending</h5>
              <Link to="/expenses" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-4">
              <div style={{ height: '300px' }}>
                <Bar 
                  data={barChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value, user?.company?.currency)
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Amount: ${formatCurrency(context.raw, user?.company?.currency)}`
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-grid gap-3">
                <Link to="/approvals" className="btn btn-outline-warning text-start py-3 px-4 d-flex align-items-center">
                  <i className="fas fa-clock fa-lg me-3"></i>
                  <div>
                    <div className="fw-bold">Pending Approvals</div>
                    <small className="text-muted">{stats.pendingApprovals} requests waiting</small>
                  </div>
                  <i className="fas fa-chevron-right ms-auto"></i>
                </Link>
                <Link to="/expenses" className="btn btn-outline-primary text-start py-3 px-4 d-flex align-items-center">
                  <i className="fas fa-list fa-lg me-3"></i>
                  <div>
                    <div className="fw-bold">Team Expenses</div>
                    <small className="text-muted">View all team history</small>
                  </div>
                  <i className="fas fa-chevron-right ms-auto"></i>
                </Link>
                <Link to="/expenses/new" className="btn btn-outline-success text-start py-3 px-4 d-flex align-items-center">
                  <i className="fas fa-plus fa-lg me-3"></i>
                  <div>
                    <div className="fw-bold">New Request</div>
                    <small className="text-muted">Create a new expense</small>
                  </div>
                  <i className="fas fa-chevron-right ms-auto"></i>
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary text-start py-3 px-4 d-flex align-items-center">
                  <i className="fas fa-user fa-lg me-3"></i>
                  <div>
                    <div className="fw-bold">Profile</div>
                    <small className="text-muted">Manage your settings</small>
                  </div>
                  <i className="fas fa-chevron-right ms-auto"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Team Expenses */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
          <h5 className="card-title mb-0">Recent Team Expenses</h5>
          <Link to="/expenses" className="btn btn-sm btn-link">View All</Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4">Date</th>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th className="text-center">Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.slice(0, 5).map((expense) => (
                    <tr key={expense._id}>
                      <td className="px-4">{formatDate(expense.expenseDate)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light text-primary rounded-circle me-2 d-flex align-items-center justify-content-center">
                            {expense.user?.firstName?.charAt(0)}{expense.user?.lastName?.charAt(0)}
                          </div>
                          <span>{expense.user?.firstName} {expense.user?.lastName}</span>
                        </div>
                      </td>
                      <td>{expense.title}</td>
                      <td>
                        <span className="badge bg-light text-dark">{expense.category}</span>
                      </td>
                      <td className="fw-bold">{formatCurrency(expense.convertedAmount, user?.company?.currency)}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${
                          expense.status === 'APPROVED' ? 'bg-success' :
                          expense.status === 'REJECTED' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <Link to={`/expenses/${expense._id}`} className="btn btn-sm btn-light">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No recent expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
