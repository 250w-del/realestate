const { testConnection } = require('./config/supabase');

console.log('===========================================');
console.log('Supabase Client Test');
console.log('===========================================\n');

async function runTest() {
  const success = await testConnection();
  
  if (success) {
    console.log('\n===========================================');
    console.log('✅ SUPABASE CLIENT WORKING!');
    console.log('===========================================');
    console.log('');
    console.log('You can now use Supabase client instead of direct PostgreSQL.');
    console.log('');
    console.log('To switch to Supabase client:');
    console.log('1. Update your imports in controllers:');
    console.log('   const { findOne, findMany, ... } = require("../config/supabase");');
    console.log('');
    console.log('2. Or create a hybrid approach that falls back to Supabase');
    console.log('   when PostgreSQL connection fails.');
  } else {
    console.log('\n===========================================');
    console.log('❌ SUPABASE CLIENT FAILED');
    console.log('===========================================');
    console.log('');
    console.log('This could mean:');
    console.log('1. Database tables are not created yet');
    console.log('2. API keys are incorrect');
    console.log('3. Network issues');
  }
}

runTest();