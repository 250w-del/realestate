const axios = require('axios');

async function testRegistration() {
  try {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123456',
      role: 'user'
    };

    console.log('Testing registration with data:', userData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
