import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const ExpenseForm = () => {
  const { user } = useAuth();
  const { createExpense, updateExpense, getExpense, processOCR } = useExpense();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const carCompaniesTop10 = [
    'Maruti Suzuki',
    'Hyundai',
    'Tata Motors',
    'Mahindra',
    'Kia',
    'Toyota',
    'Honda',
    'Renault',
    'Volkswagen',
    'Skoda'
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: user?.company?.currency || 'USD',
    category: 'OTHER',
    categoryType: '',
    expenseDate: new Date().toISOString().split('T')[0],
    transportMode: '',
    transportCompany: ''
  });

  const [receipts, setReceipts] = useState([]);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  const loadExpense = useCallback(async () => {
    const expense = await getExpense(id);
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency,
        category: expense.category,
        categoryType: expense.categoryType || (expense.category === 'TRANSPORT' ? (expense.transportDetails?.mode || '') : ''),
        expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
        transportMode: expense.transportDetails?.mode || '',
        transportCompany: expense.transportDetails?.company || ''
      });
    }
  }, [getExpense, id]);

  useEffect(() => {
    if (isEdit && id) {
      loadExpense();
    }
  }, [isEdit, id, loadExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Keep transport-specific fields consistent.
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        categoryType: value === prev.category ? prev.categoryType : '',
        transportMode: value === 'TRANSPORT' ? prev.transportMode : '',
        transportCompany: value === 'TRANSPORT' ? prev.transportCompany : ''
      }));
      return;
    }

    if (name === 'categoryType') {
      setFormData(prev => ({ ...prev, categoryType: value }));
      return;
    }

    if (name === 'transportMode') {
      setFormData(prev => ({
        ...prev,
        transportMode: value,
        categoryType: value,
        // Clear company unless CAR is selected
        transportCompany: value === 'CAR' ? prev.transportCompany : ''
      }));
      return;
    }

    if (name === 'transportCompany') {
      setFormData(prev => {
        const next = { ...prev, transportCompany: value };
        // Auto-fill title to company name for stock tracking (only when using Transport->Car).
        if (prev.category === 'TRANSPORT' && prev.transportMode === 'CAR') {
          if (!prev.title || prev.title === prev.transportCompany) {
            next.title = value;
          }
        }
        return next;
      });
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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

  const categoryTypes = {
    TRAVEL: ['AIRFARE', 'HOTEL', 'VISA', 'MEALS', 'LOCAL_TRANSPORT', 'OTHER'],
    FOOD: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'CLIENT_MEETING', 'OTHER'],
    ACCOMMODATION: ['HOTEL', 'GUEST_HOUSE', 'AIRBNB', 'OTHER'],
    OFFICE_SUPPLIES: ['STATIONERY', 'EQUIPMENT', 'FURNITURE', 'PRINTING', 'OTHER'],
    SOFTWARE: ['SUBSCRIPTION', 'LICENSE', 'CLOUD', 'OTHER'],
    TRAINING: ['COURSE', 'CERTIFICATION', 'CONFERENCE', 'WORKSHOP', 'OTHER'],
    ENTERTAINMENT: ['TEAM_EVENT', 'CLIENT_EVENT', 'GIFTS', 'OTHER'],
    OTHER: []
  };

  const transportModes = [
    { value: 'CAR', label: 'Car' },
    { value: 'BIKE', label: 'Bike' },
    { value: 'TAXI', label: 'Taxi' },
    { value: 'BUS', label: 'Bus' },
    { value: 'TRAIN', label: 'Train' },
    { value: 'FLIGHT', label: 'Flight' },
    { value: 'OTHER', label: 'Other' }
  ];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">{isEdit ? 'Edit Expense' : 'New Expense Request'}</h1>
          <p className="text-muted mb-0">
            {isEdit ? 'Update expense details' : 'Submit a new expense request for approval'}
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
                          {cat.replace(/_/g, ' ')}
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

                {formData.category !== 'TRANSPORT' && (categoryTypes[formData.category] || []).length > 0 && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category Type</label>
                      <select
                        className="form-select"
                        name="categoryType"
                        value={formData.categoryType}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {(categoryTypes[formData.category] || []).map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.category === 'TRANSPORT' && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Transport Type</label>
                      <select
                        className="form-select"
                        name="transportMode"
                        value={formData.transportMode}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        {transportModes.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    {formData.transportMode === 'CAR' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Car Company</label>
                        <select
                          className="form-select"
                          name="transportCompany"
                          value={formData.transportCompany}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select</option>
                          {carCompaniesTop10.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <small className="form-text text-muted">
                          Selecting a company will auto-fill the Expense Title (for stock tracking).
                        </small>
                      </div>
                    )}
                  </div>
                )}

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
