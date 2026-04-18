const { query } = require('./config/database');

async function fixDatabase() {
  try {
    console.log('Adding username column to users table...');
    
    // Check if username column exists
    const columns = await query('DESCRIBE users');
    const hasUsernameColumn = columns.some(col => col.Field === 'username');
    
    if (!hasUsernameColumn) {
      console.log('Adding username column...');
      await query('ALTER TABLE users ADD COLUMN username VARCHAR(100) AFTER id');
      console.log('✅ Username column added successfully');
    } else {
      console.log('✅ Username column already exists');
    }
    
    // Check if profile_picture column exists
    const hasProfilePictureColumn = columns.some(col => col.Field === 'profile_picture');
    if (!hasProfilePictureColumn) {
      console.log('Adding profile_picture column...');
      await query('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) NULL AFTER role');
      console.log('✅ Profile picture column added successfully');
    } else {
      console.log('✅ Profile picture column already exists');
    }
    
    // Show updated table structure
    console.log('\nUpdated users table structure:');
    const updatedColumns = await query('DESCRIBE users');
    updatedColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? 'KEY' : ''}`);
    });
    
  } catch (error) {
    console.error('Database fix failed:', error.message);
  }
}

fixDatabase();
