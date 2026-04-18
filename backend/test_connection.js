const { Pool } = require('pg');
require('dotenv').config();

console.log('===========================================');
console.log('Supabase Connection Test');
console.log('===========================================\n');

// Show configuration
console.log('Configuration from .env:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
console.log('- DB_SSL:', process.env.DB_SSL);
console.log('');

// Test DNS resolution
console.log('Step 1: Testing DNS resolution...');
const dns = require('dns');
dns.lookup(process.env.DB_HOST, (err, address) => {
  if (err) {
    console.log('❌ DNS Resolution FAILED');
    console.log('   Error:', err.message);
    console.log('   This means your computer cannot find the Supabase server.');
    console.log('');
    console.log('   Possible solutions:');
    console.log('   1. Check your internet connection');
    console.log('   2. Try: ping', process.env.DB_HOST);
    console.log('   3. Check if hostname is correct in .env');
    console.log('   4. Try using a different DNS (8.8.8.8 or 1.1.1.1)');
    console.log('   5. Disable VPN if you\'re using one');
    process.exit(1);
  } else {
    console.log('✅ DNS Resolution successful');
    console.log('   IP Address:', address);
    console.log('');
    
    // Test database connection
    console.log('Step 2: Testing database connection...');
    
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000
    });
    
    pool.connect((err, client, release) => {
      if (err) {
        console.log('❌ Database Connection FAILED');
        console.log('   Error:', err.message);
        console.log('   Code:', err.code);
        console.log('');
        
        if (err.code === 'ECONNREFUSED') {
          console.log('   The server refused the connection.');
          console.log('   - Check if the port is correct (should be 5432)');
          console.log('   - Verify Supabase project is active');
        } else if (err.message.includes('password')) {
          console.log('   Authentication failed.');
          console.log('   - Check DB_PASSWORD in .env file');
          console.log('   - Get password from: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi');
          console.log('   - Settings → Database');
        } else if (err.message.includes('database')) {
          console.log('   Database not found.');
          console.log('   - Use DB_NAME=postgres (not real_estate)');
        } else if (err.message.includes('SSL') || err.message.includes('ssl')) {
          console.log('   SSL connection issue.');
          console.log('   - Ensure DB_SSL=true in .env');
        }
        
        pool.end();
        process.exit(1);
      } else {
        console.log('✅ Database Connection successful!');
        console.log('');
        
        // Test query
        console.log('Step 3: Testing database query...');
        client.query('SELECT NOW() as time, version() as version', (err, result) => {
          release();
          
          if (err) {
            console.log('❌ Query FAILED');
            console.log('   Error:', err.message);
          } else {
            console.log('✅ Query successful!');
            console.log('   Server time:', result.rows[0].time);
            console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
            console.log('');
            console.log('===========================================');
            console.log('✅ ALL TESTS PASSED!');
            console.log('===========================================');
            console.log('');
            console.log('Your Supabase connection is working correctly.');
            console.log('You can now start your server with: npm run dev');
          }
          
          pool.end();
          process.exit(err ? 1 : 0);
        });
      }
    });
  }
});
