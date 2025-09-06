import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSocialInputs, setShowSocialInputs] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    location: '',
    status: '',
    skills: '',
    githubusername: '',
    bio: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    instagram: ''
  });

  const {
    company,
    website,
    location,
    status,
    skills,
    githubusername,
    bio,
    twitter,
    facebook,
    linkedin,
    youtube,
    instagram
  } = formData;

  const statusOptions = [
    'Developer',
    'Junior Developer',
    'Senior Developer',
    'Manager',
    'Student or Learning',
    'Instructor or Teacher',
    'Intern',
    'Other'
  ];

  useEffect(() => {
    getCurrentProfile();
  }, []);

  const getCurrentProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get('/profile/me');
      const profile = res.data;
      
      setFormData({
        company: profile.company || '',
        website: profile.website || '',
        location: profile.location || '',
        status: profile.status || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        githubusername: profile.githubusername || '',
        bio: profile.bio || '',
        twitter: profile.social?.twitter || '',
        facebook: profile.social?.facebook || '',
        linkedin: profile.social?.linkedin || '',
        youtube: profile.social?.youtube || '',
        instagram: profile.social?.instagram || ''
      });

      // Show social inputs if any social links exist
      if (profile.social && Object.keys(profile.social).length > 0) {
        setShowSocialInputs(true);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      // Redirect to dashboard if profile doesn't exist
      if (err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!status) {
      setError('Status is required');
      setLoading(false);
      return;
    }

    if (!skills.trim()) {
      setError('Skills are required');
      setLoading(false);
      return;
    }

    try {
      const profileData = {
        company: company.trim(),
        website: website.trim(),
        location: location.trim(),
        status: status.trim(),
        skills: skills.split(',').map(skill => skill.trim()),
        githubusername: githubusername.trim(),
        bio: bio.trim(),
        social: {}
      };

      // Only add social links if they're provided
      if (twitter.trim()) profileData.social.twitter = twitter.trim();
      if (facebook.trim()) profileData.social.facebook = facebook.trim();
      if (linkedin.trim()) profileData.social.linkedin = linkedin.trim();
      if (youtube.trim()) profileData.social.youtube = youtube.trim();
      if (instagram.trim()) profileData.social.instagram = instagram.trim();

      const res = await api.post('/profile', profileData);
      
      console.log('Profile updated:', res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  if (profileLoading) {
    return (
      <div className="profile-form-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-form-container">
      <div className="profile-form">
        <div className="form-header">
          <h1>Edit Your Profile</h1>
          <p>Update your profile information</p>
          <small>* = required field</small>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <select
              name="status"
              value={status}
              onChange={onChange}
              required
            >
              <option value="">* Select Professional Status</option>
              {statusOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <small className="form-text">
              Give us an idea of where you are at in your career
            </small>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Company"
              name="company"
              value={company}
              onChange={onChange}
            />
            <small className="form-text">
              Could be your own company or one you work for
            </small>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Website"
              name="website"
              value={website}
              onChange={onChange}
            />
            <small className="form-text">
              Could be your own or a company website
            </small>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Location"
              name="location"
              value={location}
              onChange={onChange}
            />
            <small className="form-text">
              City & state suggested (eg. Boston, MA)
            </small>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="* Skills"
              name="skills"
              value={skills}
              onChange={onChange}
              required
            />
            <small className="form-text">
              Please use comma separated values (eg. HTML,CSS,JavaScript,PHP)
            </small>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Github Username"
              name="githubusername"
              value={githubusername}
              onChange={onChange}
            />
            <small className="form-text">
              If you want your latest repos and a Github link, include your username
            </small>
          </div>

          <div className="form-group">
            <textarea
              placeholder="A short bio of yourself"
              name="bio"
              value={bio}
              onChange={onChange}
              rows="5"
            ></textarea>
            <small className="form-text">
              Tell us a little about yourself
            </small>
          </div>

          <div className="social-toggle">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowSocialInputs(!showSocialInputs)}
            >
              {showSocialInputs ? 'Hide' : 'Add'} Social Network Links
            </button>
            <span>Optional</span>
          </div>

          {showSocialInputs && (
            <div className="social-inputs">
              <div className="form-group social-input">
                <div className="input-icon">
                  <i className="fab fa-twitter fa-2x"></i>
                  <input
                    type="text"
                    placeholder="Twitter URL"
                    name="twitter"
                    value={twitter}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-group social-input">
                <div className="input-icon">
                  <i className="fab fa-facebook fa-2x"></i>
                  <input
                    type="text"
                    placeholder="Facebook URL"
                    name="facebook"
                    value={facebook}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-group social-input">
                <div className="input-icon">
                  <i className="fab fa-youtube fa-2x"></i>
                  <input
                    type="text"
                    placeholder="YouTube URL"
                    name="youtube"
                    value={youtube}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-group social-input">
                <div className="input-icon">
                  <i className="fab fa-linkedin fa-2x"></i>
                  <input
                    type="text"
                    placeholder="Linkedin URL"
                    name="linkedin"
                    value={linkedin}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-group social-input">
                <div className="input-icon">
                  <i className="fab fa-instagram fa-2x"></i>
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    name="instagram"
                    value={instagram}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating Profile...' : 'Update Profile'}
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={goBack}
              disabled={loading}
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
