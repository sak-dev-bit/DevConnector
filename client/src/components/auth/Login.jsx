import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearErrors } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { clearErrors(); }, []);
  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await login(formData);
    setSubmitting(false);
  };

  if (loading && !submitting) return (
    <div className="dc-spinner-page"><div className="dc-spinner"></div></div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <h1>DevConnector</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="form-control"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
              <Link to="/forgot-password" style={{ float: 'right', fontSize: '0.8rem', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={submitting}
          >
            {submitting ? <><div className="dc-spinner dc-spinner--sm" style={{ borderTopColor: '#fff' }}></div> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-card__footer">
          Don't have an account? <Link to="/register">Sign up for free</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
