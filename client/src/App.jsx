import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import PostFeed from './components/posts/PostFeed';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import PrivateRoute from './components/layout/PrivateRoute';
import ThreeBackground from './components/ThreeBackground';
import ForgotPassword from './pages/ForgotPassword';
import AddExperience from './pages/AddExperience';
import './App.css';

/* ─── Navbar ───────────────────────────────────── */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="dc-navbar">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="dc-navbar__logo" style={{ textDecoration: 'none' }}>
        Dev<span>Connector</span>
      </Link>
      <div className="dc-navbar__actions">
        {isAuthenticated ? (
          <>
            <Link to="/posts" className="dc-navbar__btn" style={{ textDecoration: 'none' }}>📰 Feed</Link>
            <Link to="/profile" className="dc-navbar__btn" style={{ textDecoration: 'none' }}>👤 Profile</Link>
            <button className="dc-navbar__btn" onClick={logout}>🚪 Logout</button>
            <div className="dc-navbar__avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : user?.name?.charAt(0)}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="dc-navbar__btn" style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="dc-navbar__btn--primary btn btn-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* ─── Sidebar ──────────────────────────────────── */
const Sidebar = () => {
  const { user } = useAuth();
  return (
    <aside className="dc-sidebar">
      <nav className="dc-sidebar__nav">
        <div className="dc-sidebar__logo">🔧 DevConnector</div>
        <NavLink to="/dashboard"     className={({ isActive }) => `dc-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="dc-sidebar__icon">🏠</span><span>Home</span>
        </NavLink>
        <NavLink to="/posts"         className={({ isActive }) => `dc-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="dc-sidebar__icon">📰</span><span>Feed</span>
        </NavLink>
        <NavLink to="/profile"       className={({ isActive }) => `dc-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="dc-sidebar__icon">👤</span><span>Profile</span>
        </NavLink>
        <NavLink to="/edit-profile"  className={({ isActive }) => `dc-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="dc-sidebar__icon">✏️</span><span>Edit Profile</span>
        </NavLink>
        <NavLink to="/add-experience" className={({ isActive }) => `dc-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="dc-sidebar__icon">💼</span><span>Experience</span>
        </NavLink>
      </nav>
    </aside>
  );
};

/* ─── Right Panel ──────────────────────────────── */
const RightPanel = () => (
  <aside className="dc-right-panel">
    <div className="dc-widget">
      <div className="dc-widget__title">Suggested Developers</div>
      {['Alice Chen', 'Bob Nguyen', 'Sara Patel'].map((name, i) => (
        <div className="dc-widget__item" key={i}>
          <div className="dc-avatar dc-avatar--sm">{name.charAt(0)}</div>
          <div>
            <div className="dc-widget__name">{name}</div>
            <div className="dc-widget__sub">Developer</div>
          </div>
          <button className="dc-widget__follow">Follow</button>
        </div>
      ))}
    </div>
    <div className="dc-widget">
      <div className="dc-widget__title">Quick Links</div>
      <div className="dc-widget__item">
        <span>📖</span>
        <Link to="/create-profile" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Create Profile</Link>
      </div>
      <div className="dc-widget__item">
        <span>💼</span>
        <Link to="/add-experience" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add Experience</Link>
      </div>
    </div>
  </aside>
);

/* ─── App Shell (authenticated layout) ─────────── */
const AppShell = ({ children }) => (
  <div className="dc-shell">
    <Sidebar />
    <main className="dc-shell__feed">{children}</main>
    <RightPanel />
  </div>
);

/* ─── Landing ───────────────────────────────────── */
const Landing = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="dc-spinner-page"><div className="dc-spinner"></div><span>Loading...</span></div>
  );
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <ThreeBackground />
      <div className="auth-page">
        <div className="auth-card landing-card">
          <h1>Connect with <span className="accent">Developers</span> Worldwide</h1>
          <p>Create a developer profile, share your projects, get feedback from the community, and grow your network.</p>
          <div className="landing-btns">
            <Link to="/register" className="btn btn-primary btn-lg btn-full">🚀 Get Started</Link>
            <Link to="/login"    className="btn btn-secondary btn-lg btn-full">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Main App ──────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#161B22', color: '#C9D1D9', border: '1px solid #30363D' },
          success: { iconTheme: { primary: '#238636', secondary: '#fff' } },
        }}
      />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={
            <PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>
          } />
          <Route path="/posts" element={
            <PrivateRoute><AppShell><PostFeed /></AppShell></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><AppShell><Profile /></AppShell></PrivateRoute>
          } />
          <Route path="/create-profile" element={
            <PrivateRoute><CreateProfile /></PrivateRoute>
          } />
          <Route path="/edit-profile" element={
            <PrivateRoute><EditProfile /></PrivateRoute>
          } />
          <Route path="/add-experience" element={
            <PrivateRoute><AddExperience /></PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
