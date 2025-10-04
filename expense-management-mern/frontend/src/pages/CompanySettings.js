import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    currency: 'USD',
    timezone: 'UTC',
    settings: {
      allowMultipleCurrency: true,
      requireReceiptForExpense: false,
      autoApprovalLimit: 0,
      managerApprovalRequired: true
    }
  });

  useEffect(() => {
    loadCompanySettings();
    loadCurrencies();
  }, []);

  const loadCompanySettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/companies/settings');
      const company = response.data.company;
      
      setFormData({
        name: company.name || '',
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || company.country || ''
        },
        currency: company.currency || 'USD',
        timezone: company.timezone || 'UTC',
        settings: {
          allowMultipleCurrency: company.settings?.allowMultipleCurrency ?? true,
          requireReceiptForExpense: company.settings?.requireReceiptForExpense ?? false,
          autoApprovalLimit: company.settings?.autoApprovalLimit ?? 0,
          managerApprovalRequired: company.settings?.managerApprovalRequired ?? true
        }
      });
    } catch (error) {
      console.error('Error loading company settings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      const response = await axios.get('/api/companies/currencies');
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error('Error loading currencies:', error);
      // Fallback currencies
      setCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('settings.')) {
      const settingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await axios.put('/api/companies/settings', formData);
      toast.success('Company settings updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update company settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Company Settings</h1>
          <p className="text-muted mb-0">Configure company preferences and approval workflows</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-building me-2"></i>
              Basic Information
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-map-marker-alt me-2"></i>
              Address Information
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">State/Province</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">ZIP/Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Timezone</label>
                <select
                  className="form-select"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Kolkata">Mumbai (IST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Settings */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-check-circle me-2"></i>
              Approval Settings
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="settings.managerApprovalRequired"
                    checked={formData.settings.managerApprovalRequired}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    Require Manager Approval
                  </label>
                  <div className="form-text">All expenses require manager approval before processing</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="settings.requireReceiptForExpense"
                    checked={formData.settings.requireReceiptForExpense}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    Require Receipt for Expenses
                  </label>
                  <div className="form-text">All expenses must include a receipt</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="settings.allowMultipleCurrency"
                    checked={formData.settings.allowMultipleCurrency}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    Allow Multiple Currencies
                  </label>
                  <div className="form-text">Users can submit expenses in different currencies</div>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Auto-Approval Limit</label>
                <div className="input-group">
                  <span className="input-group-text">{formData.currency}</span>
                  <input
                    type="number"
                    className="form-control"
                    name="settings.autoApprovalLimit"
                    value={formData.settings.autoApprovalLimit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-text">Expenses under this amount will be auto-approved (0 = disabled)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
