const { query } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('Checking database structure...');
    
    // Check current database
    const currentDb = await query('SELECT DATABASE() as current_db');
    console.log('Current database:', currentDb[0].current_db);
    
    // Check if users table exists
    const tables = await query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));
    
    // Check users table structure
    if (tables.some(t => Object.values(t)[0] === 'users')) {
      const userTableStructure = await query('DESCRIBE users');
      console.log('Users table structure:');
      userTableStructure.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? 'KEY' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('Database check failed:', error.message);
  }
}

checkDatabase();
