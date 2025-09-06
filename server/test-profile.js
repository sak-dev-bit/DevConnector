const axios = require('axios');

const testProfileCreation = async () => {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123'
    });

    const token = loginResponse.data.token;
    console.log('Login successful, got token');

    // Test profile creation
    const profileResponse = await axios.post('http://localhost:5000/api/profile', {
      status: 'Developer',
      skills: 'JavaScript, React, Node.js',
      bio: 'Test developer profile'
    }, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Profile creation successful:', profileResponse.data);

    // Test profile fetch
    const getProfileResponse = await axios.get('http://localhost:5000/api/profile/me', {
      headers: {
        'x-auth-token': token
      }
    });

    console.log('Profile fetch successful:', getProfileResponse.data);

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testProfileCreation();