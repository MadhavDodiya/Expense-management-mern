import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const ExpenseDetails = () => {
  const { id } = useParams();
  const { getExpense, currentExpense, loading, getExpenseReceipt, downloadExpenseReceipt } = useExpense();
  const { formatDate, formatDateTime, formatCurrency } = useAuth();
  const apiBaseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

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

  const handleShowReceipt = async () => {
    if (showReceipt) {
      setShowReceipt(false);
      return;
    }

    setLoadingReceipt(true);
    const receipt = await getExpenseReceipt(id);
    if (receipt?.content) {
      setReceiptPreview(receipt.content);
      setShowReceipt(true);
    }
    setLoadingReceipt(false);
  };

  const getCompanyLogoUrl = (logoPath) => {
    if (!logoPath) return '';
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) return logoPath;
    return apiBaseUrl ? `${apiBaseUrl}${logoPath}` : logoPath;
  };

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
          <button
            type="button"
            className="btn btn-outline-info me-2"
            onClick={handleShowReceipt}
            disabled={loadingReceipt}
          >
            <i className={`fas ${showReceipt ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
            {loadingReceipt ? 'Loading...' : (showReceipt ? 'Hide Receipt' : 'Show Receipt')}
          </button>
          <button
            type="button"
            className="btn btn-outline-success me-2"
            onClick={() => downloadExpenseReceipt(id)}
          >
            <i className="fas fa-file-download me-1"></i>
            Download Receipt
          </button>
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
                  <p><strong>Amount:</strong> {formatCurrency(currentExpense.amount, currentExpense.currency)}</p>
                  <p><strong>Category:</strong> {currentExpense.category.replace(/_/g, ' ')}</p>
                  {currentExpense.categoryType && (
                    <p><strong>Type:</strong> {currentExpense.categoryType.replace(/_/g, ' ')}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <p><strong>Date:</strong> {formatDate(currentExpense.expenseDate)}</p>
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

              {showReceipt && (
                <div className="mt-4">
                  <h6>Generated Receipt</h6>
                  <pre className="border rounded p-3 bg-light" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                    {receiptPreview}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {currentExpense.company && (
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="card-title mb-0">Company Details</h6>
              </div>
              <div className="card-body">
                {currentExpense.company.logo && (
                  <div className="mb-3">
                    <img
                      src={getCompanyLogoUrl(currentExpense.company.logo)}
                      alt="Company logo"
                      style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }}
                      className="border rounded p-2 bg-white"
                    />
                  </div>
                )}
                <p className="mb-1"><strong>Name:</strong> {currentExpense.company.name || '-'}</p>
                <p className="mb-1"><strong>Domain:</strong> {currentExpense.company.domain || '-'}</p>
                <p className="mb-1"><strong>Email:</strong> {currentExpense.company.contactEmail || '-'}</p>
                <p className="mb-1"><strong>Phone:</strong> {currentExpense.company.contactPhone || '-'}</p>
                <p className="mb-0"><strong>Currency:</strong> {currentExpense.company.currency || '-'}</p>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Approval Timeline</h6>
            </div>
            <div className="card-body">
              <div className="expense-timeline">
                <div className="timeline-item">
                  <div className="fw-semibold">Submitted</div>
                  <small className="text-muted">
                    {formatDateTime(currentExpense.createdAt)}
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
                        {formatDateTime(approval.actionDate)}
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
