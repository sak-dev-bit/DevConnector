import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 'var(--space-5)' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
      <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  if (error || !profile) return (
    <div className="dc-card" style={{ padding: 'var(--space-7)', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🧑‍💻</div>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>No profile yet</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
        Set up your developer profile to showcase your skills and experience.
      </p>
      <Link to="/create-profile" className="btn btn-primary">Create Profile</Link>
    </div>
  );

  const pu = profile.user || {};

  return (
    <div>
      {/* Hero */}
      <div className="profile-hero dc-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="dc-avatar dc-avatar--xxl" style={{ flexShrink: 0, zIndex: 1 }}>
          {pu.avatar ? <img src={pu.avatar} alt={pu.name} /> : pu.name?.charAt(0)}
        </div>
        <div className="profile-hero__info">
          <h1 className="profile-hero__name">{pu.name}</h1>
          {profile.status && <div className="profile-hero__status">{profile.status}</div>}
          <div className="profile-hero__meta">
            {profile.company  && <span>🏢 {profile.company}</span>}
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website  && <a href={profile.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/edit-profile" className="btn btn-secondary btn-sm">✏️ Edit Profile</Link>
            <Link to="/add-experience" className="btn btn-ghost btn-sm">+ Experience</Link>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{pu.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{pu.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.skills?.length || 0}</span>
              <span className="stat-label">Skills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{(profile.experience?.length || 0) + (profile.education?.length || 0)}</span>
              <span className="stat-label">Entries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-sections">

        {/* Bio */}
        {profile.bio && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">👋 About</div>
            <div className="profile-section__body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{profile.bio}</p>
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">🛠️ Skills</div>
            <div className="profile-section__body">
              <div className="skills-list">
                {profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* GitHub */}
        {profile.githubusername && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">💻 GitHub</div>
            <div className="profile-section__body">
              <a
                href={`https://github.com/${profile.githubusername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-pill"
                style={{ display: 'inline-flex' }}
              >
                🐙 @{profile.githubusername}
              </a>
            </div>
          </div>
        )}

        {/* Experience */}
        {profile.experience?.length > 0 && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">💼 Experience</div>
            <div>
              {profile.experience.map((exp, i) => (
                <div key={i} className="experience-item">
                  <div className="experience-item__title">{exp.title}</div>
                  <div className="experience-item__company">{exp.company}</div>
                  <div className="experience-item__dates">
                    {new Date(exp.from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
                    {exp.to ? new Date(exp.to).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                  </div>
                  {exp.description && <div className="experience-item__desc">{exp.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {profile.education?.length > 0 && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">🎓 Education</div>
            <div>
              {profile.education.map((edu, i) => (
                <div key={i} className="experience-item">
                  <div className="experience-item__title">{edu.school}</div>
                  <div className="experience-item__company">{edu.degree}{edu.fieldofstudy && ` — ${edu.fieldofstudy}`}</div>
                  <div className="experience-item__dates">
                    {new Date(edu.from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
                    {edu.to ? new Date(edu.to).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                  </div>
                  {edu.description && <div className="experience-item__desc">{edu.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {profile.social && Object.values(profile.social).some(Boolean) && (
          <div className="profile-section dc-card">
            <div className="profile-section__head">🔗 Social Links</div>
            <div className="profile-section__body">
              <div className="social-links-row">
                {profile.social.twitter  && <a href={profile.social.twitter}  target="_blank" rel="noopener noreferrer" className="social-link-pill">🐦 Twitter</a>}
                {profile.social.linkedin  && <a href={profile.social.linkedin}  target="_blank" rel="noopener noreferrer" className="social-link-pill">💼 LinkedIn</a>}
                {profile.social.github    && <a href={profile.social.github}    target="_blank" rel="noopener noreferrer" className="social-link-pill">🐙 GitHub</a>}
                {profile.social.youtube   && <a href={profile.social.youtube}   target="_blank" rel="noopener noreferrer" className="social-link-pill">▶️ YouTube</a>}
                {profile.social.facebook  && <a href={profile.social.facebook}  target="_blank" rel="noopener noreferrer" className="social-link-pill">👤 Facebook</a>}
                {profile.social.instagram && <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link-pill">📸 Instagram</a>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;