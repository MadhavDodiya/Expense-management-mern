import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const ExpenseList = () => {
  const { user } = useAuth();
  const { 
    expenses, 
    getUserExpenses, 
    getCompanyExpenses, 
    deleteExpense, 
    filters, 
    setFilters,
    pagination,
    loading 
  } = useExpense();

  const [localFilters, setLocalFilters] = useState({
    status: 'ALL',
    category: 'ALL',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  const loadExpenses = () => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      getCompanyExpenses(filters);
    } else {
      getUserExpenses(filters);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters = { status: 'ALL', category: 'ALL', startDate: '', endDate: '' };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
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
          New Expense
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
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
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
                    {expenses.map(expense => (
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
                              ${expense.amount.toLocaleString()}
                            </span>
                            <br />
                            <small className="text-muted">{expense.currency}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{expense.category.replace('_', ' ')}</span>
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
                            {(expense.status === 'PENDING' || expense.status === 'DRAFT') && 
                             expense.user._id === user?.id && (
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
                    ))}
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
                Create New Expense
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
