import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    getCurrentProfile();
  }, []);

  const getCurrentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      setProfile(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.msg || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="card">
          <h2>No Profile Found</h2>
          <p>You haven't created a profile yet.</p>
          <Link to="/create-profile" className="btn btn-primary">
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h1>{profile.user.name}</h1>
          <p className="profile-status">{profile.status}</p>
          {profile.company && <p className="profile-company">at {profile.company}</p>}
          {profile.location && <p className="profile-location">📍 {profile.location}</p>}

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{profile.user.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.user.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.experience?.length || 0}</span>
              <span className="stat-label">Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.skills?.length || 0}</span>
              <span className="stat-label">Skills</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/edit-profile" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2><span className="emoji-icon">👋</span> About</h2>
          <div className="profile-card">
            {profile.bio && <p>{profile.bio}</p>}
            {profile.website && (
              <p>
                <strong>🌐 Website:</strong>{' '}
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  {profile.website}
                </a>
              </p>
            )}
          </div>
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="profile-section">
            <h2><span className="emoji-icon">🛠️</span> Skills</h2>
            <div className="profile-card">
              <div className="skills-grid">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {profile.githubusername && (
          <div className="profile-section">
            <h2><span className="emoji-icon">💻</span> GitHub</h2>
            <div className="profile-card">
              <a
                href={`https://github.com/${profile.githubusername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                @{profile.githubusername}
              </a>
            </div>
          </div>
        )}

        {profile.social && Object.keys(profile.social).length > 0 && (
          <div className="profile-section">
            <h2><span className="emoji-icon">🔗</span> Social Links</h2>
            <div className="profile-card">
              <div className="social-links-grid">
                {profile.social.twitter && (
                  <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    Twitter
                  </a>
                )}
                {profile.social.facebook && (
                  <a href={profile.social.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    Facebook
                  </a>
                )}
                {profile.social.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    LinkedIn
                  </a>
                )}
                {profile.social.youtube && (
                  <a href={profile.social.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                    YouTube
                  </a>
                )}
                {profile.social.instagram && (
                  <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {profile.experience && profile.experience.length > 0 && (
          <div className="profile-section">
            <h2><span className="emoji-icon">💼</span> Experience</h2>
            <div className="experience-list">
              {profile.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h3>{exp.title}</h3>
                  <p className="company">{exp.company}</p>
                  <p className="duration">
                    {new Date(exp.from).toLocaleDateString()} - {exp.to ? new Date(exp.to).toLocaleDateString() : 'Present'}
                  </p>
                  {exp.description && <p className="description">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.education && profile.education.length > 0 && (
          <div className="profile-section">
            <h2>Education</h2>
            <div className="education-list">
              {profile.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h3>{edu.school}</h3>
                  <p className="degree">{edu.degree}</p>
                  <p className="duration">
                    {new Date(edu.from).toLocaleDateString()} - {edu.to ? new Date(edu.to).toLocaleDateString() : 'Present'}
                  </p>
                  {edu.description && <p className="description">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;