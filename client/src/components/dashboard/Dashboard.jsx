import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      if (err.response?.status === 404) {
        // No profile found - this is expected for new users
        setProfile(null);
      } else {
        setError(err.response?.data?.msg || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const deleteProfile = async () => {
    if (window.confirm('Are you sure? This action cannot be undone!')) {
      try {
        await api.delete('/profile');
        setProfile(null);
        alert('Profile deleted successfully');
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError(err.response?.data?.msg || 'Failed to delete profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-layout">
      {/* Instagram-style Top Navigation */}
      <header className="instagram-header">
        <div className="header-content">
          <h1 className="brand-name">DevConnector</h1>
          <div className="header-actions">
            <button className="icon-btn">
              <span className="emoji-icon">❤️</span>
            </button>
            <button className="icon-btn">
              <span className="emoji-icon">💬</span>
            </button>
          </div>
        </div>
      </header>

      <main className="instagram-main">
        {/* Stories Section */}
        <section className="stories-section">
          <div className="stories-container">
            <div className="story-item">
              <div className="story-avatar">
                <div className="avatar-circle-small">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="story-ring"></div>
              </div>
              <span className="story-label">Your story</span>
            </div>
            {/* Add more story items here */}
          </div>
        </section>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="feed-content">
        {profile ? (
          <div className="profile-exists">
            <div className="card">
              <h2>Your Profile</h2>
              <div className="profile-info">
                <div className="profile-header">
                  <h3>{profile.user.name}</h3>
                  <p className="status">{profile.status}</p>
                  {profile.company && <p>at {profile.company}</p>}
                  {profile.location && <p><span className="emoji-icon">📍</span>{profile.location}</p>}
                </div>
                
                {profile.bio && (
                  <div className="profile-bio">
                    <h4>Bio</h4>
                    <p>{profile.bio}</p>
                  </div>
                )}
                
                {profile.skills && profile.skills.length > 0 && (
                  <div className="profile-skills">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.githubusername && (
                  <div className="github-info">
                    <h4>GitHub</h4>
                    <a 
                      href={`https://github.com/${profile.githubusername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-link"
                    >
                      @{profile.githubusername}
                    </a>
                  </div>
                )}

                {profile.social && Object.keys(profile.social).length > 0 && (
                  <div className="social-links">
                    <h4>Social Links</h4>
                    <div className="social-buttons">
                      {profile.social.twitter && (
                        <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                          Twitter
                        </a>
                      )}
                      {profile.social.facebook && (
                        <a href={profile.social.facebook} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                          Facebook
                        </a>
                      )}
                      {profile.social.linkedin && (
                        <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                          LinkedIn
                        </a>
                      )}
                      {profile.social.youtube && (
                        <a href={profile.social.youtube} target="_blank" rel="noopener noreferrer" className="social-btn youtube">
                          YouTube
                        </a>
                      )}
                      {profile.social.instagram && (
                        <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <Link to="/edit-profile" className="btn btn-primary">
                  Edit Profile
                </Link>
                <button onClick={deleteProfile} className="btn btn-danger">
                  Delete Profile
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Experience & Education</h2>
              <div className="experience-education">
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="experience-section">
                    <h3>Experience</h3>
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <h4>{exp.title}</h4>
                        <p><strong>{exp.company}</strong></p>
                        <p>{new Date(exp.from).toLocaleDateString()} - {exp.to ? new Date(exp.to).toLocaleDateString() : 'Present'}</p>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No experience added yet.</p>
                )}
              </div>
              <Link to="/add-experience" className="btn btn-primary">
                Add Experience
              </Link>
            </div>
          </div>
        ) : (
          <div className="no-profile">
            <div className="card">
              <h2>Welcome to DevConnector!</h2>
              <p>You haven't created a profile yet. Let's get you started by creating your developer profile.</p>
              <p>Your profile will help other developers connect with you and showcase your skills and experience.</p>
              <Link to="/create-profile" className="btn btn-primary">
                Create Profile
              </Link>
            </div>

            <div className="card">
              <h2>What you can do:</h2>
              <ul className="feature-list">
                <li><span className="emoji-icon">✨</span>Create your developer profile</li>
                <li><span className="emoji-icon">💼</span>Add your experience and education</li>
                <li><span className="emoji-icon">🔗</span>Connect your social media accounts</li>
                <li><span className="emoji-icon">👥</span>Connect with other developers</li>
                <li><span className="emoji-icon">📝</span>Share posts and thoughts</li>
                <li><span className="emoji-icon">⭐</span>Showcase your GitHub repositories</li>
              </ul>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Instagram-style Bottom Navigation */}
      <nav className="instagram-bottom-nav">
        <Link to="/dashboard" className="nav-item active">
          <span className="emoji-icon">🏠</span>
          <span className="nav-label">Home</span>
        </Link>
        <Link to="/posts" className="nav-item">
          <span className="emoji-icon">🔍</span>
          <span className="nav-label">Search</span>
        </Link>
        <Link to="/create-profile" className="nav-item">
          <span className="emoji-icon">➕</span>
          <span className="nav-label">Create</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <span className="emoji-icon">👤</span>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Dashboard;
