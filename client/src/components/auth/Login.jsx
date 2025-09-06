import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { email, password } = formData;
  const { login, isAuthenticated, error, loading, clearErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Clear errors when component unmounts
    return () => {
      clearErrors();
    };
  }, []);

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  // Clear errors when user types
  const clearErrorsOnType = useCallback(() => {
    if (error) clearErrors();
  }, [error, clearErrors]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation only if user has attempted to submit
    if (submitAttempted) {
      validateField(name, value);
    }
    
    // Clear server errors when user types
    clearErrorsOnType();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (validateForm()) {
      await login({ email, password });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Sign Into Your Account</p>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error === 'Invalid credentials' ? (
              <>
                Invalid email or password. Please try again or <Link to="/register" className="alert-link">create an account</Link>.
              </>
            ) : error.includes('Too many authentication attempts') ? (
              <>
                Too many login attempts. Please try again later or <Link to="/register" className="alert-link">create a new account</Link>.
              </>
            ) : (
              error
            )}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className={`form-group ${validationErrors.email ? 'error' : ''}`}>
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={onChange}
              className={validationErrors.email ? 'error' : ''}
            />
            {validationErrors.email && (
              <div className="field-error">{validationErrors.email}</div>
            )}
          </div>
          
          <div className={`form-group ${validationErrors.password ? 'error' : ''}`}>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={onChange}
              className={validationErrors.password ? 'error' : ''}
            />
            {validationErrors.password && (
              <div className="field-error">{validationErrors.password}</div>
            )}
          </div>
          
          <input
            type="submit"
            className="btn btn-primary"
            value={loading ? 'Signing In...' : 'Login'}
            disabled={loading}
          />
        </form>
        
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        
        <p className="auth-link">
          Don't have an account? <span 
            onClick={() => navigate('/register')} 
            className="link-text"
            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
