import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, changePassword, updateProfile, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    language: 'en-US',
    timezone: 'UTC',
    emailNotifications: true,
    approvalNotifications: true
  });

  useEffect(() => {
    if (!user?.preferences) return;
    setPreferences({
      language: user.preferences.language || 'en-US',
      timezone: user.preferences.timezone || 'UTC',
      emailNotifications: user.preferences.emailNotifications ?? true,
      approvalNotifications: user.preferences.approvalNotifications ?? true
    });
  }, [user]);

  useEffect(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      department: user?.department || ''
    });
  }, [user]);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreferenceSave = async () => {
    await updatePreferences(preferences);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setProfileSaving(true);
    const success = await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      department: profileData.department
    });
    setProfileSaving(false);

    if (success) {
      setProfileData((prev) => ({
        ...prev,
        firstName: prev.firstName.trim(),
        lastName: prev.lastName.trim(),
        phone: prev.phone.trim(),
        department: prev.department.trim()
      }));
    }
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Profile Settings</h1>
          <p className="text-muted mb-0">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          {/* Navigation Tabs */}
          <div className="card">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-2"></i>
                Profile Information
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="fas fa-lock me-2"></i>
                Change Password
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="fas fa-bell me-2"></i>
                Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Profile Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.role || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.company?.name || ''}
                        readOnly
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Change Password</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                    <small className="form-text text-muted">
                      Password must be at least 6 characters long.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <small className="text-danger">Passwords do not match</small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Preferences</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select"
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="hi-IN">Hindi (India)</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      name="timezone"
                      value={preferences.timezone}
                      onChange={handlePreferenceChange}
                    >
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="America/New_York">US Eastern (ET)</option>
                      <option value="America/Chicago">US Central (CT)</option>
                      <option value="America/Los_Angeles">US Pacific (PT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange}
                  />
                  <label className="form-check-label" htmlFor="emailNotifications">
                    Email notifications for expense updates
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="approvalNotifications"
                    name="approvalNotifications"
                    checked={preferences.approvalNotifications}
                    onChange={handlePreferenceChange}
                  />
                  <label className="form-check-label" htmlFor="approvalNotifications">
                    Approval request notifications
                  </label>
                </div>

                <button className="btn btn-primary" onClick={handlePreferenceSave}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
