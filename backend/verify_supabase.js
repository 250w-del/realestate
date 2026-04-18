const https = require('https');

console.log('===========================================');
console.log('Supabase Project Verification');
console.log('===========================================\n');

const projectUrl = 'https://rmqmvkaerxxjqxxybkqi.supabase.co';
const apiKey = 'sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-';

console.log('Project URL:', projectUrl);
console.log('API Key:', apiKey.substring(0, 20) + '...');
console.log('');

// Test if the Supabase API is accessible
console.log('Testing Supabase API accessibility...');

const options = {
  hostname: 'rmqmvkaerxxjqxxybkqi.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
};

const req = https.request(options, (res) => {
  console.log('✅ Supabase API is accessible!');
  console.log('   Status Code:', res.statusCode);
  console.log('   Status Message:', res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API Response received successfully');
      console.log('');
      console.log('This confirms your Supabase project exists and is active.');
      console.log('The database connection issue is likely due to:');
      console.log('1. Network/DNS resolution problems');
      console.log('2. Firewall blocking database connections');
      console.log('3. ISP blocking PostgreSQL ports');
      console.log('');
      console.log('Solutions to try:');
      console.log('1. Use a VPN');
      console.log('2. Try from a different network (mobile hotspot)');
      console.log('3. Contact your ISP about PostgreSQL port access');
      console.log('4. Use Supabase REST API instead of direct database connection');
    } else {
      console.log('⚠️  API accessible but returned error:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Supabase API is NOT accessible');
  console.log('   Error:', error.message);
  console.log('');
  console.log('This suggests a network connectivity issue.');
  console.log('Please check your internet connection.');
});

req.setTimeout(10000, () => {
  console.log('❌ Request timed out');
  console.log('This suggests network connectivity issues.');
  req.destroy();
});

req.end();