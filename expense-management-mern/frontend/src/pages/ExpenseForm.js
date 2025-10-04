import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const ExpenseForm = () => {
  const { user } = useAuth();
  const { createExpense, updateExpense, getExpense, processOCR, currentExpense } = useExpense();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: user?.company?.currency || 'USD',
    category: 'OTHER',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  const [receipts, setReceipts] = useState([]);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadExpense();
    }
  }, [isEdit, id]);

  const loadExpense = async () => {
    const expense = await getExpense(id);
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency,
        category: expense.category,
        expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0]
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setReceipts(files);

    // Process first file with OCR
    if (files.length > 0) {
      setOcrProcessing(true);
      const ocrResult = await processOCR(files[0]);

      if (ocrResult) {
        setFormData(prev => ({
          ...prev,
          title: ocrResult.merchant || prev.title,
          amount: ocrResult.amount?.toString() || prev.amount,
          description: `${ocrResult.merchant || ''} - Receipt scan`.trim()
        }));
      }
      setOcrProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    receipts.forEach(file => {
      submitData.append('receipts', file);
    });

    let result;
    if (isEdit) {
      result = await updateExpense(id, submitData);
    } else {
      result = await createExpense(submitData);
    }

    if (result) {
      navigate('/expenses');
    }
  };

  const categories = [
    'TRAVEL', 'FOOD', 'ACCOMMODATION', 'TRANSPORT', 
    'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'ENTERTAINMENT', 'OTHER'
  ];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">{isEdit ? 'Edit Expense' : 'New Expense'}</h1>
          <p className="text-muted mb-0">
            {isEdit ? 'Update expense details' : 'Submit a new expense for approval'}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Expense Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    placeholder="Enter expense title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    placeholder="Describe the expense"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="amount"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expense Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="expenseDate"
                      value={formData.expenseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Receipt Upload</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <small className="form-text text-muted">
                    Upload receipt images. The first image will be processed with OCR to auto-fill details.
                  </small>

                  {ocrProcessing && (
                    <div className="alert alert-info mt-2">
                      <div className="d-flex align-items-center">
                        <div className="loading-spinner me-2"></div>
                        Processing receipt with OCR...
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? 'Update Expense' : 'Submit Expense'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/expenses')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Expense Guidelines
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Include detailed descriptions
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Upload clear receipt images
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Select appropriate category
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Verify amounts are accurate
                </li>
              </ul>
            </div>
          </div>

          {receipts.length > 0 && (
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="card-title mb-0">Receipt Preview</h6>
              </div>
              <div className="card-body">
                {receipts.map((file, index) => (
                  <div key={index} className="mb-2">
                    <small className="text-muted">{file.name}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
