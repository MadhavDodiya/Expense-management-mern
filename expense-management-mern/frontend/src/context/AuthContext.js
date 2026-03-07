import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'it-IT', label: 'Italian (Italy)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ru-RU', label: 'Russian (Russia)' },
  { code: 'zh-CN', label: 'Chinese (Simplified, China)' },
  { code: 'zh-TW', label: 'Chinese (Traditional, Taiwan)' },
  { code: 'ja-JP', label: 'Japanese (Japan)' },
  { code: 'ko-KR', label: 'Korean (South Korea)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
  { code: 'bn-BD', label: 'Bengali (Bangladesh)' },
  { code: 'ur-PK', label: 'Urdu (Pakistan)' },
  { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { code: 'ar-AE', label: 'Arabic (UAE)' },
  { code: 'tr-TR', label: 'Turkish (Turkey)' },
  { code: 'nl-NL', label: 'Dutch (Netherlands)' },
  { code: 'sv-SE', label: 'Swedish (Sweden)' },
  { code: 'da-DK', label: 'Danish (Denmark)' },
  { code: 'no-NO', label: 'Norwegian (Norway)' },
  { code: 'fi-FI', label: 'Finnish (Finland)' },
  { code: 'pl-PL', label: 'Polish (Poland)' },
  { code: 'cs-CZ', label: 'Czech (Czechia)' },
  { code: 'hu-HU', label: 'Hungarian (Hungary)' },
  { code: 'ro-RO', label: 'Romanian (Romania)' },
  { code: 'el-GR', label: 'Greek (Greece)' },
  { code: 'he-IL', label: 'Hebrew (Israel)' },
  { code: 'th-TH', label: 'Thai (Thailand)' },
  { code: 'vi-VN', label: 'Vietnamese (Vietnam)' },
  { code: 'id-ID', label: 'Indonesian (Indonesia)' },
  { code: 'ms-MY', label: 'Malay (Malaysia)' },
  { code: 'tl-PH', label: 'Filipino (Philippines)' },
  { code: 'uk-UA', label: 'Ukrainian (Ukraine)' },
  { code: 'sr-RS', label: 'Serbian (Serbia)' },
  { code: 'hr-HR', label: 'Croatian (Croatia)' },
  { code: 'sk-SK', label: 'Slovak (Slovakia)' },
  { code: 'sl-SI', label: 'Slovenian (Slovenia)' },
  { code: 'bg-BG', label: 'Bulgarian (Bulgaria)' },
  { code: 'lt-LT', label: 'Lithuanian (Lithuania)' },
  { code: 'lv-LV', label: 'Latvian (Latvia)' },
  { code: 'et-EE', label: 'Estonian (Estonia)' },
  { code: 'ca-ES', label: 'Catalan (Spain)' },
  { code: 'fa-IR', label: 'Persian (Iran)' },
  { code: 'sw-KE', label: 'Swahili (Kenya)' },
  { code: 'ta-IN', label: 'Tamil (India)' },
  { code: 'te-IN', label: 'Telugu (India)' }
];

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userRole', action.payload.user.role);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const userLocale = state.user?.preferences?.language || 'en-US';
  const userTimeZone = state.user?.preferences?.timezone || 'UTC';

  // Set auth header
  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Load user
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (token) {
      setAuthToken(token);

      try {
        const res = await axios.get('/api/auth/me');
        dispatch({ type: 'LOAD_USER', payload: res.data.user });
      } catch (error) {
        console.error('Load user error:', error);
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setAuthToken]);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const res = await axios.post('/api/auth/login', credentials);

      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      setAuthToken(res.data.token);

      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'AUTH_ERROR' });
      return false;
    }
  }, [setAuthToken]);

  // Register
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const res = await axios.post('/api/auth/register', userData);

      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      setAuthToken(res.data.token);

      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'AUTH_ERROR' });
      return false;
    }
  }, [setAuthToken]);

  // Logout
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
    toast.info('Logged out successfully');
  }, [setAuthToken]);

  // Change password
  const changePassword = useCallback(async (passwords) => {
    try {
      await axios.post('/api/auth/change-password', passwords);
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      dispatch({ type: 'LOAD_USER', payload: res.data.user });
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return false;
    }
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    try {
      const res = await axios.put('/api/auth/preferences', preferences);
      dispatch({ type: 'LOAD_USER', payload: res.data.user });
      toast.success('Preferences updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return false;
    }
  }, []);

  const formatDate = useCallback((dateValue, options = {}) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(userLocale, {
      timeZone: userTimeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options
    }).format(date);
  }, [userLocale, userTimeZone]);

  const formatDateTime = useCallback((dateValue, options = {}) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(userLocale, {
      timeZone: userTimeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      ...options
    }).format(date);
  }, [userLocale, userTimeZone]);

  const formatCurrency = useCallback((value, currency = 'USD', options = {}) => {
    const amount = Number(value || 0);
    const safeCurrency = currency || 'USD';
    try {
      return new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: safeCurrency,
        currencyDisplay: 'symbol',
        maximumFractionDigits: 2,
        ...options
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${safeCurrency}`;
    }
  }, [userLocale]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = {
    ...state,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    updatePreferences,
    formatDate,
    formatDateTime,
    formatCurrency,
    supportedLanguages: SUPPORTED_LANGUAGES,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
