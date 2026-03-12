import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getPasswordStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return { label: 'Too short', cls: 'password-weak' };
  const score = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length;
  if (score <= 2) return { label: 'Weak',   cls: 'password-weak' };
  if (score === 3) return { label: 'Medium', cls: 'password-medium' };
  return { label: 'Strong', cls: 'password-strong' };
};

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearErrors } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { clearErrors(); }, []);
  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email address';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await register({ name: formData.name.trim(), email: formData.email.toLowerCase(), password: formData.password });
    setSubmitting(false);
  };

  const strength = getPasswordStrength(formData.password);

  if (loading && !submitting) return <div className="dc-spinner-page"><div className="dc-spinner"></div></div>;

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div className="auth-card__logo">
          <h1>DevConnector</h1>
          <p>Create your developer profile</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name <span className="required">*</span></label>
            <input
              id="name" name="name" type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <div className="field-error">⚠ {errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email <span className="required">*</span></label>
            <input
              id="reg-email" name="email" type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password" name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: '44px' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {strength && <span className={`password-strength ${strength.cls}`}>{strength.label}</span>}
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="required">*</span></label>
            <input
              id="confirmPassword" name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="field-error">⚠ {errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
            {submitting ? <><div className="dc-spinner dc-spinner--sm" style={{ borderTopColor: '#fff' }}></div> Creating account...</> : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
