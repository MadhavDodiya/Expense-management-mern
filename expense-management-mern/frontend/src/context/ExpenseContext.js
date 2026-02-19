import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create context
const ExpenseContext = createContext();

// Initial state
const initialState = {
  expenses: [],
  currentExpense: null,
  pendingApprovals: [],
  loading: false,
  filters: {
    status: 'ALL',
    category: 'ALL',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  },
  pagination: {
    totalPages: 0,
    currentPage: 1,
    totalExpenses: 0
  }
};

// Expense reducer
const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_EXPENSES':
      return { 
        ...state, 
        expenses: action.payload.expenses,
        pagination: {
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          totalExpenses: action.payload.totalExpenses || 0
        }
      };
    case 'SET_CURRENT_EXPENSE':
      return { ...state, currentExpense: action.payload };
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses] 
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense._id === action.payload._id ? action.payload : expense
        ),
        currentExpense: action.payload
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense._id !== action.payload)
      };
    case 'SET_PENDING_APPROVALS':
      return { ...state, pendingApprovals: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
};

// Expense provider component
export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Get user expenses
  const getUserExpenses = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'ALL') {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/expenses/my?${params}`);
      dispatch({ type: 'SET_EXPENSES', payload: res.data });
    } catch (error) {
      console.error('Get user expenses error:', error);
      toast.error('Failed to load expenses');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get company expenses (Admin/Manager)
  const getCompanyExpenses = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'ALL') {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/expenses/company?${params}`);
      dispatch({ type: 'SET_EXPENSES', payload: res.data });
    } catch (error) {
      console.error('Get company expenses error:', error);
      toast.error('Failed to load company expenses');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get single expense
  const getExpense = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.get(`/api/expenses/${id}`);
      dispatch({ type: 'SET_CURRENT_EXPENSE', payload: res.data.expense });
      return res.data.expense;
    } catch (error) {
      console.error('Get expense error:', error);
      toast.error('Failed to load expense details');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Create expense
  const createExpense = useCallback(async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/expenses', expenseData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      dispatch({ type: 'ADD_EXPENSE', payload: res.data.expense });
      toast.success('Expense created successfully');
      return res.data.expense;
    } catch (error) {
      console.error('Create expense error:', error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to create expense';
      toast.error(message);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (id, expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.put(`/api/expenses/${id}`, expenseData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      dispatch({ type: 'UPDATE_EXPENSE', payload: res.data.expense });
      toast.success('Expense updated successfully');
      return res.data.expense;
    } catch (error) {
      console.error('Update expense error:', error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update expense';
      toast.error(message);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully');
      return true;
    } catch (error) {
      console.error('Delete expense error:', error);
      const message = error.response?.data?.message || 'Failed to delete expense';
      toast.error(message);
      return false;
    }
  }, []);

  // Process OCR
  const processOCR = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await axios.post('/api/ocr/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Receipt processed successfully');
        return res.data.data;
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('Failed to process receipt');
      return null;
    }
  }, []);

  // Get pending approvals
  const getPendingApprovals = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/approvals/pending?${params}`);
      dispatch({ type: 'SET_PENDING_APPROVALS', payload: res.data.expenses });
    } catch (error) {
      console.error('Get pending approvals error:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Process approval
  const processApproval = useCallback(async (expenseId, decision, comments) => {
    try {
      const res = await axios.post(`/api/approvals/${expenseId}`, {
        decision,
        comments
      });

      // Update the expense in pending approvals
      dispatch({ 
        type: 'SET_PENDING_APPROVALS', 
        payload: state.pendingApprovals.filter(expense => expense._id !== expenseId)
      });

      toast.success(`Expense ${decision.toLowerCase()} successfully`);
      return res.data.expense;
    } catch (error) {
      console.error('Process approval error:', error);
      const message = error.response?.data?.message || 'Failed to process approval';
      toast.error(message);
      return null;
    }
  }, [state.pendingApprovals]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const value = useMemo(() => ({
    ...state,
    getUserExpenses,
    getCompanyExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    processOCR,
    getPendingApprovals,
    processApproval,
    setFilters,
    resetFilters
  }), [state, getUserExpenses, getCompanyExpenses, getExpense, createExpense, updateExpense, deleteExpense, processOCR, getPendingApprovals, processApproval, setFilters, resetFilters]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use expense context
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
