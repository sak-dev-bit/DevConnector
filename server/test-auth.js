const axios = require('axios');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    return null;
  }
};

const testLogin = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
};

const testUserData = async (token) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/auth', {
      headers: {
        'x-auth-token': token
      }
    });
    
    console.log('User data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch user data failed:', error.response?.data || error.message);
    return null;
  }
};

const runTests = async () => {
  console.log('Testing authentication endpoints...\n');
  
  // Test registration
  console.log('1. Testing registration...');
  const regResult = await testRegistration();
  
  if (regResult && regResult.token) {
    // Test getting user data with token
    console.log('\n3. Testing get user data...');
    await testUserData(regResult.token);
  }
  
  // Test login
  console.log('\n2. Testing login...');
  const loginResult = await testLogin();
  
  if (loginResult && loginResult.token) {
    // Test getting user data with login token
    console.log('\n4. Testing get user data with login token...');
    await testUserData(loginResult.token);
  }
};

runTests();
