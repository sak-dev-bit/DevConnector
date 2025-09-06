import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to DevConnector</h1>
        <div className="user-info">
          {user && (
            <>
              <p>Welcome, {user.name}!</p>
              <p>Email: {user.email}</p>
            </>
          )}
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="card">
          <h2>Your Profile</h2>
          <p>Manage your developer profile and connect with other developers.</p>
          <button className="btn btn-primary">Create Profile</button>
        </div>
        
        <div className="card">
          <h2>Posts</h2>
          <p>Share your thoughts and connect with the developer community.</p>
          <button className="btn btn-primary">View Posts</button>
        </div>
        
        <div className="card">
          <h2>Developers</h2>
          <p>Browse and connect with other developers in the community.</p>
          <button className="btn btn-primary">Browse Developers</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
