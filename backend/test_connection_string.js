const { Pool } = require('pg');
require('dotenv').config();

console.log('===========================================');
console.log('Supabase Connection String Test');
console.log('===========================================\n');

// Test different connection methods
const connectionMethods = [
  {
    name: 'Direct Connection',
    config: {
      connectionString: 'postgresql://postgres:lRBmNMEXMfkHk6fq@db.rmqmvkaerxxjqxxybkqi.supabase.co:5432/postgres',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Pooler Connection (Transaction Mode)',
    config: {
      connectionString: 'postgresql://postgres.rmqmvkaerxxjqxxybkqi:lRBmNMEXMfkHk6fq@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Pooler Connection (Session Mode)',
    config: {
      connectionString: 'postgresql://postgres.rmqmvkaerxxjqxxybkqi:lRBmNMEXMfkHk6fq@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(method) {
  console.log(`\n--- Testing: ${method.name} ---`);
  console.log('Connection string:', method.config.connectionString.replace(/:[^:@]*@/, ':***@'));
  
  const pool = new Pool(method.config);
  
  try {
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log('✅ Query successful!');
    console.log('   Server time:', result.rows[0].time);
    console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('   Code:', error.code);
    
    await pool.end();
    return false;
  }
}

async function testAll() {
  for (const method of connectionMethods) {
    const success = await testConnection(method);
    if (success) {
      console.log('\n===========================================');
      console.log('✅ FOUND WORKING CONNECTION!');
      console.log('===========================================');
      console.log(`Use this configuration in your .env:`);
      
      const url = new URL(method.config.connectionString);
      console.log(`DB_HOST=${url.hostname}`);
      console.log(`DB_PORT=${url.port}`);
      console.log(`DB_USER=${url.username}`);
      console.log(`DB_PASSWORD=${url.password}`);
      console.log(`DB_NAME=${url.pathname.slice(1)}`);
      console.log(`DB_SSL=true`);
      
      process.exit(0);
    }
  }
  
  console.log('\n===========================================');
  console.log('❌ NO WORKING CONNECTION FOUND');
  console.log('===========================================');
  console.log('Please check:');
  console.log('1. Your Supabase project is active');
  console.log('2. The password is correct');
  console.log('3. Your network allows connections to Supabase');
  process.exit(1);
}

testAll();