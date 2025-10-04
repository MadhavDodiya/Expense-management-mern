const axios = require('axios');

// Test registration endpoint
const testRegistration = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    const testData = {
      companyName: 'Test Company',
      companyDomain: 'testcompany',
      country: 'United States',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testcompany.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.response?.data);
  }
};

// Test if server is running
const testServer = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/me');
    console.log('✅ Server is running');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the backend server first.');
    } else {
      console.log('✅ Server is running (auth endpoint returned expected error)');
    }
  }
};

const runTests = async () => {
  console.log('=== Registration Test ===');
  await testServer();
  console.log('\n--- Testing Registration ---');
  await testRegistration();
};

runTests();
