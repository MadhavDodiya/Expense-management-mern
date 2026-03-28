import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const ExpenseList = () => {
  const { user, formatDate, formatCurrency } = useAuth();
  const { 
    expenses, 
    getUserExpenses, 
    getCompanyExpenses, 
    deleteExpense, 
    downloadExpenseReceipt,
    exportMonthlyReport,
    filters, 
    setFilters,
    pagination,
    loading 
  } = useExpense();

  const [localFilters, setLocalFilters] = useState({
    status: 'ALL',
    category: 'ALL',
    userId: 'ALL',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [companyUsers, setCompanyUsers] = useState([]);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadExpenses = useCallback(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      getCompanyExpenses(filters);
    } else {
      getUserExpenses(filters);
    }
  }, [user?.role, getCompanyExpenses, getUserExpenses, filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!(user?.role === 'ADMIN' || user?.role === 'MANAGER')) return;
      try {
        const res = await axios.get('/api/users');
        setCompanyUsers(res.data.users || []);
      } catch (error) {
        console.error('Load users for filter error:', error);
      }
    };
    loadUsers();
  }, [user?.role]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters({ ...localFilters, page: 1 });
  };

  const resetFilters = () => {
    const emptyFilters = { status: 'ALL', category: 'ALL', userId: 'ALL', startDate: '', endDate: '', search: '', sortBy: 'createdAt', sortOrder: 'desc' };
    setLocalFilters(emptyFilters);
    setFilters({ ...emptyFilters, page: 1 });
  };

  const handleExport = async (format) => {
    const [yearText, monthText] = reportMonth.split('-');
    await exportMonthlyReport({
      format,
      year: Number(yearText),
      month: Number(monthText),
      status: localFilters.status,
      category: localFilters.category,
      userId: localFilters.userId
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const currentUserId = user?.id || user?._id;

  const getExpenseOwnerId = (expense) => {
    if (!expense?.user) return null;
    if (typeof expense.user === 'string') return expense.user;
    return expense.user._id || expense.user.id || null;
  };

  const categories = ['TRAVEL', 'FOOD', 'ACCOMMODATION', 'TRANSPORT', 'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'ENTERTAINMENT', 'OTHER'];

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">
            {user?.role === 'EMPLOYEE' ? 'My Expenses' : 'Company Expenses'}
          </h1>
          <p className="text-muted mb-0">
            {user?.role === 'EMPLOYEE' ? 'Track your submitted expenses' : 'Manage all company expenses'}
          </p>
        </div>
        <Link to="/expenses/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Expense Request
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={localFilters.status}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={localFilters.category}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={localFilters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={localFilters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary me-2" onClick={applyFilters}>
                <i className="fas fa-search me-1"></i>
                Apply Filters
              </button>
              <button className="btn btn-outline-secondary" onClick={resetFilters}>
                <i className="fas fa-times me-1"></i>
                Reset
              </button>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <div className="col-md-3">
                <label className="form-label">User</label>
                <select
                  name="userId"
                  className="form-select"
                  value={localFilters.userId}
                  onChange={handleFilterChange}
                >
                  <option value="ALL">All Users</option>
                  {companyUsers.map((companyUser) => (
                    <option key={companyUser._id} value={companyUser._id}>
                      {companyUser.firstName} {companyUser.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Title, description, status..."
                value={localFilters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Sort By</label>
              <select
                name="sortBy"
                className="form-select"
                value={localFilters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
                <option value="amount">Amount</option>
                <option value="expenseDate">Expense Date</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Order</label>
              <select
                name="sortOrder"
                className="form-select"
                value={localFilters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <input
                type="month"
                className="form-control me-2"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
              />
              <button className="btn btn-outline-primary me-2" onClick={() => handleExport('csv')}>
                Export CSV
              </button>
              <button className="btn btn-outline-dark" onClick={() => handleExport('pdf')}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="loading-spinner mb-3"></div>
              <p className="text-muted">Loading expenses...</p>
            </div>
          ) : expenses.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && <th>Employee</th>}
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => {
                      const expenseOwnerId = getExpenseOwnerId(expense);
                      const canManageOwnExpense =
                        (expense.status === 'PENDING' || expense.status === 'DRAFT') &&
                        String(expenseOwnerId || '') === String(currentUserId || '');

                      return (
                      <tr key={expense._id}>
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {expense.user?.firstName?.charAt(0)}{expense.user?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-semibold small">{expense.user?.firstName} {expense.user?.lastName}</div>
                                <small className="text-muted">{expense.user?.email}</small>
                              </div>
                            </div>
                          </td>
                        )}
                        <td>
                          <div>
                            <Link to={`/expenses/${expense._id}`} className="text-decoration-none fw-semibold">
                              {expense.title}
                            </Link>
                            <br />
                            <small className="text-muted">{expense.description}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="fw-semibold">
                              {formatCurrency(expense.amount, expense.currency)}
                            </span>
                            <br />
                            <small className="text-muted">{expense.currency}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {expense.category.replace(/_/g, ' ')}
                            {expense.categoryType ? ` / ${expense.categoryType.replace(/_/g, ' ')}` : ''}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${expense.status.toLowerCase()}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td>
                          <small>
                            {formatDate(expense.expenseDate)}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link to={`/expenses/${expense._id}`} className="btn btn-outline-primary btn-sm">
                              <i className="fas fa-eye"></i>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm"
                              onClick={() => downloadExpenseReceipt(expense._id)}
                              title="Download Receipt"
                            >
                              <i className="fas fa-file-download"></i>
                            </button>
                            {canManageOwnExpense && (
                              <>
                                <Link to={`/expenses/${expense._id}/edit`} className="btn btn-outline-secondary btn-sm">
                                  <i className="fas fa-edit"></i>
                                </Link>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDelete(expense._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Expenses pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                        disabled={pagination.currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li key={index + 1} className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setFilters({ ...filters, page: index + 1 })}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No expenses found</h5>
              <p className="text-muted">
                {user?.role === 'EMPLOYEE' 
                  ? "You haven't submitted any expenses yet." 
                  : "No expenses match your current filters."
                }
              </p>
              <Link to="/expenses/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Create New Expense Request
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
