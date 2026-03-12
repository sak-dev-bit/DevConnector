import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      setProfile(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Could not load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ This will permanently delete your account. Are you sure?')) return;
    try {
      await api.delete('/profile');
      toast.success('Account deleted');
      window.location.href = '/';
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (loading) return (
    <div style={{ padding: 'var(--space-5)' }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
      <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }} />
      <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  return (
    <div>
      {/* Welcome card */}
      <div className="dc-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div className="dc-avatar dc-avatar--xl">
          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {profile ? `${profile.status}${profile.company ? ` at ${profile.company}` : ''}` : 'Complete your developer profile to get started.'}
          </p>
        </div>
        {profile
          ? <Link to="/profile" className="btn btn-secondary btn-sm">View Profile →</Link>
          : <Link to="/create-profile" className="btn btn-primary btn-sm">Create Profile</Link>
        }
      </div>

      {!profile && (
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
          🚀 You haven't created a profile yet.{' '}
          <Link to="/create-profile" className="alert-link">Set one up now</Link> to connect with other developers!
        </div>
      )}

      {/* Quick actions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {[
          { icon: '📰', title: 'Developer Feed',    desc: 'See what the community is sharing', link: '/posts',          btn: 'Open Feed' },
          { icon: '👤', title: 'My Profile',         desc: 'View and manage your public profile', link: '/profile',      btn: 'View Profile' },
          { icon: '✏️', title: 'Edit Profile',       desc: 'Update your bio, skills, and links', link: '/edit-profile',  btn: 'Edit Now' },
          { icon: '💼', title: 'Add Experience',     desc: 'Showcase your work history',          link: '/add-experience',btn: 'Add Entry' },
        ].map(({ icon, title, desc, link, btn }) => (
          <div key={title} className="dc-card" style={{
            padding: 'var(--space-4)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}>
            <div style={{ fontSize: '1.8rem' }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
            </div>
            <Link to={link} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>{btn}</Link>
          </div>
        ))}
      </div>

      {/* Skills preview */}
      {profile?.skills?.length > 0 && (
        <div className="dc-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
            🛠️ Your Skills
          </div>
          <div className="skills-list">
            {profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="dc-card" style={{ padding: 'var(--space-4)', borderColor: 'rgba(218,54,51,0.3)' }}>
        <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
          ⚠️ Danger Zone
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-3)' }}>
          Permanently delete your account, profile, and all posts. This cannot be undone.
        </p>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default Dashboard;
