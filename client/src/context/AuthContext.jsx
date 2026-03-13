import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api, { apiBaseUrl, setAccessToken } from '../services/api';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../socket';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  token: null,
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
      setAccessToken(action.payload.token);
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
      setAccessToken(null);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case actionTypes.LOGOUT:
      setAccessToken(null);
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
    try {
      const res = await api.get('/auth');

      dispatch({
        type: actionTypes.USER_LOADED,
        payload: res.data.user,
      });

      // Initialize socket after user is loaded
      const socket = initSocket(res.data.user.id);

      socket.off('notification'); // Prevent multiple listeners
      socket.on('notification', (data) => {
        if (data.type === 'LIKE') {
          toast.success(`${data.senderName} liked your post!`, {
            duration: 4000,
            icon: '❤️'
          });
        } else if (data.type === 'COMMENT') {
          toast.success(`${data.senderName} commented: "${data.text.substring(0, 20)}..."`, {
            duration: 4000,
            icon: '💬'
          });
        }
      });
    } catch (error) {
      console.error('Load user error:', error.response?.data || error.message);
      disconnectSocket();
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: error.response?.data?.msg || 'Failed to load user',
      });
    }
  };

  // Silent refresh on mount
  const checkAuth = async () => {
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
      if (res.data.success) {
        setAccessToken(res.data.token);
        // Load user data (this will dispatch USER_LOADED and init socket)
        await loadUser();
      } else {
        // Not authenticated - just stop loading
        dispatch({ type: actionTypes.AUTH_ERROR, payload: null });
      }
    } catch (error) {
      // Refresh failed (user not logged in) - clear loading state cleanly
      dispatch({ type: actionTypes.AUTH_ERROR, payload: null });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);

      dispatch({
        type: actionTypes.AUTH_SUCCESS,
        payload: res.data,
      });

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
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    disconnectSocket();
    dispatch({ type: actionTypes.LOGOUT });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: actionTypes.CLEAR_ERRORS });
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
