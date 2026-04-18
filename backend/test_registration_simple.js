const http = require('http');

function testRegistration() {
  const userData = JSON.stringify({
    username: 'Test User',
    email: 'test@example.com',
    password: 'Test123456',
    role: 'user'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  console.log('Testing registration with data:', JSON.parse(userData));

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Response:', response);
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error);
  });

  req.write(userData);
  req.end();
}

testRegistration();
