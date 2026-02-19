import React, { useEffect, useState } from 'react';
import { useExpense } from '../context/ExpenseContext';

const ApprovalQueue = () => {
  const { getPendingApprovals, processApproval, pendingApprovals, loading } = useExpense();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    getPendingApprovals();
  }, [getPendingApprovals]);

  const handleApproval = async (expenseId, decision) => {
    await processApproval(expenseId, decision, comments);
    setSelectedExpense(null);
    setComments('');
    getPendingApprovals(); // Refresh list
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Pending Approvals</h1>
          <p className="text-muted mb-0">Review and approve expense submissions</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="loading-spinner mb-3"></div>
          <p className="text-muted">Loading approvals...</p>
        </div>
      ) : pendingApprovals.length > 0 ? (
        <div className="row">
          {pendingApprovals.map(expense => (
            <div key={expense._id} className="col-md-6 mb-4">
              <div className="card expense-card">
                <div className="card-body">
                  <h5 className="card-title">{expense.title}</h5>
                  <p className="card-text text-muted">{expense.description}</p>

                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>Amount:</strong> ${expense.convertedAmount}
                    </div>
                    <div className="col-6">
                      <strong>Category:</strong> {expense.category}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Submitted by:</strong> {expense.user?.firstName} {expense.user?.lastName}
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApproval(expense._id, 'APPROVED')}
                    >
                      <i className="fas fa-check me-1"></i>
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <i className="fas fa-times me-1"></i>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
          <h5 className="text-muted">No pending approvals</h5>
          <p className="text-muted">All expenses have been processed.</p>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedExpense && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Expense</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedExpense(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject "{selectedExpense.title}"?</p>
                <div className="mb-3">
                  <label className="form-label">Rejection Comments</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide reason for rejection..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedExpense(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleApproval(selectedExpense._id, 'REJECTED')}
                >
                  Reject Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
