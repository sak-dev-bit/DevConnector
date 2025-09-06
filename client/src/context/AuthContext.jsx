import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
};

// Action types
const actionTypes = {
  USER_LOADED: 'USER_LOADED',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
      };
    case actionTypes.AUTH_SUCCESS:
    case actionTypes.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        error: null,
      };
    case actionTypes.AUTH_ERROR:
    case actionTypes.LOGIN_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case actionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null,
      };
    case actionTypes.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user data
  const loadUser = async () => {
    // Check if token exists in localStorage
    if (!localStorage.getItem('token')) {
      // Silent failure when no token is found during initial load
      // This prevents showing an error when the user hasn't logged in yet
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: null,
      });
      return;
    }

    try {
      const res = await api.get('/auth');

      dispatch({
        type: actionTypes.USER_LOADED,
        payload: res.data.user,
      });
    } catch (error) {
      console.error('Load user error:', error.response?.data || error.message);
      localStorage.removeItem('token'); // Remove invalid token
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: error.response?.data?.msg || 'Failed to load user',
      });
    }
  };

  // Register user
  const register = async (formData) => {
    console.log('AuthContext register called with:', formData);
    try {
      const res = await api.post('/auth/register', formData);

      dispatch({
        type: actionTypes.AUTH_SUCCESS,
        payload: res.data,
      });

      // Wait for state update before calling loadUser
      await new Promise(resolve => setTimeout(resolve, 0));

      // Load user data immediately after successful registration
      await loadUser();
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || 'Registration failed',
      });
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await api.post('/auth/login', formData);

      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: res.data,
      });

      // Wait for state update before calling loadUser
      await new Promise(resolve => setTimeout(resolve, 0));

      // Load user data immediately after successful login
      await loadUser();
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      dispatch({
        type: actionTypes.LOGIN_FAIL,
        payload: error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || 'Login failed',
      });
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: actionTypes.LOGOUT });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: actionTypes.CLEAR_ERRORS });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: null
      });
    }
  }, []); // Removed eslint-disable-next-line to allow proper dependency tracking

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        loadUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
