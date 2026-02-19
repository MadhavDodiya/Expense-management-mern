import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';

const ExpenseDetails = () => {
  const { id } = useParams();
  const { getExpense, currentExpense, loading } = useExpense();

  useEffect(() => {
    if (id) {
      getExpense(id);
    }
  }, [id, getExpense]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="loading-spinner mb-3"></div>
        <p className="text-muted">Loading expense details...</p>
      </div>
    );
  }

  if (!currentExpense) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">Expense not found</p>
        <Link to="/expenses" className="btn btn-primary">Back to Expenses</Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Expense Details</h1>
          <p className="text-muted mb-0">{currentExpense.title}</p>
        </div>
        <div>
          <Link to="/expenses" className="btn btn-outline-secondary me-2">
            <i className="fas fa-arrow-left me-1"></i>
            Back
          </Link>
          {currentExpense.status === 'PENDING' && (
            <Link to={`/expenses/${id}/edit`} className="btn btn-primary">
              <i className="fas fa-edit me-1"></i>
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5>{currentExpense.title}</h5>
              <p className="text-muted">{currentExpense.description}</p>

              <div className="row">
                <div className="col-md-6">
                  <p><strong>Amount:</strong> ${currentExpense.amount} {currentExpense.currency}</p>
                  <p><strong>Category:</strong> {currentExpense.category.replace('_', ' ')}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Date:</strong> {new Date(currentExpense.expenseDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${currentExpense.status.toLowerCase()}`}>{currentExpense.status}</span></p>
                </div>
              </div>

              {currentExpense.receipts && currentExpense.receipts.length > 0 && (
                <div className="mt-4">
                  <h6>Receipts</h6>
                  <div className="row">
                    {currentExpense.receipts.map((receipt, index) => (
                      <div key={index} className="col-md-4 mb-3">
                        <img 
                          src={`/uploads/receipts/${receipt.filename}`} 
                          alt={receipt.originalName}
                          className="receipt-preview img-fluid"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Approval Timeline</h6>
            </div>
            <div className="card-body">
              <div className="expense-timeline">
                <div className="timeline-item">
                  <div className="fw-semibold">Submitted</div>
                  <small className="text-muted">
                    {new Date(currentExpense.createdAt).toLocaleString()}
                  </small>
                </div>

                {currentExpense.approvals && currentExpense.approvals.map((approval, index) => (
                  <div key={index} className="timeline-item">
                    <div className="fw-semibold">
                      {approval.status === 'APPROVED' ? 'Approved' : 
                       approval.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                    </div>
                    <small className="text-muted">
                      By: {approval.approver?.firstName} {approval.approver?.lastName}
                    </small>
                    {approval.actionDate && (
                      <small className="text-muted d-block">
                        {new Date(approval.actionDate).toLocaleString()}
                      </small>
                    )}
                    {approval.comments && (
                      <small className="text-muted d-block">
                        "{approval.comments}"
                      </small>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
