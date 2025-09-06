import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const { name, email, password, password2 } = formData;
  const { register, isAuthenticated, error, loading, clearErrors } = useAuth();
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

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return '';
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = 'Name can only contain letters and spaces';
    }
    
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
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter, lowercase letter, and number';
    }
    
    // Confirm password validation
    if (!password2) {
      errors.password2 = 'Please confirm your password';
    } else if (password !== password2) {
      errors.password2 = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation
  const validateField = (fieldName, value) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value) {
          errors.name = 'Name is required';
        } else if (value.length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else if (value.length > 50) {
          errors.name = 'Name must be less than 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = 'Name can only contain letters and spaces';
        } else {
          delete errors.name;
        }
        break;
        
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
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter, lowercase letter, and number';
        } else {
          delete errors.password;
        }
        
        // Update password strength
        setPasswordStrength(checkPasswordStrength(value));
        
        // Revalidate password2 if it exists
        if (formData.password2) {
          if (value !== formData.password2) {
            errors.password2 = 'Passwords do not match';
          } else {
            delete errors.password2;
          }
        }
        break;
        
      case 'password2':
        if (!value) {
          errors.password2 = 'Please confirm your password';
        } else if (formData.password !== value) {
          errors.password2 = 'Passwords do not match';
        } else {
          delete errors.password2;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation only if user has attempted to submit
    if (submitAttempted) {
      validateField(name, value);
    }
    
    // Update password strength for password field
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear server errors when user starts typing
    if (error) {
      clearErrors();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (validateForm()) {
      await register({ name, email, password });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1>Sign Up</h1>
          <p>Create Your Account</p>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error === 'User already exists' || error.includes('already exists') ? (
              <>
                This email is already registered. <Link to="/login" className="alert-link">Login here</Link> instead.
              </>
            ) : (
              error
            )}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className={`form-group ${validationErrors.name ? 'error' : ''}`}>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={name}
              onChange={onChange}
              className={validationErrors.name ? 'error' : ''}
            />
            {validationErrors.name && (
              <div className="field-error">{validationErrors.name}</div>
            )}
          </div>
          
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
            <small className="form-text">
              This site uses Gravatar so if you want a profile image, use a
              Gravatar email
            </small>
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
            {password && (
              <div className={`password-strength password-${passwordStrength}`}>
                Password strength: {passwordStrength}
              </div>
            )}
          </div>
          
          <div className={`form-group ${validationErrors.password2 ? 'error' : ''}`}>
            <input
              type="password"
              placeholder="Confirm Password"
              name="password2"
              value={password2}
              onChange={onChange}
              className={validationErrors.password2 ? 'error' : ''}
            />
            {validationErrors.password2 && (
              <div className="field-error">{validationErrors.password2}</div>
            )}
          </div>
          
          <input
            type="submit"
            className="btn btn-primary"
            value={loading ? 'Creating Account...' : 'Register'}
            disabled={loading}
          />
        </form>
        
        <p className="auth-link">
          Already have an account? <span 
            onClick={() => navigate('/login')} 
            className="link-text"
            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
