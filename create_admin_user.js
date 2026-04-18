const bcrypt = require('bcryptjs');
const { insert } = require('./backend/config/database');

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'michel@12345';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Admin user data
    const adminData = {
      name: 'Michel Uwiringiyimana',
      email: 'michelrealestate@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+250788818207',
      bio: 'System Administrator for Michel Real Estate',
      company: 'Michelrealestate',
      is_verified: true,
      is_active: true
    };
    
    // Insert admin user
    const userId = await insert('users', adminData);
    console.log('Admin user created successfully!');
    console.log('Login Credentials:');
    console.log('Email: michelrealestate@gmail.com');
    console.log('Password: michel@12345');
    console.log('Role: admin');
    console.log('User ID:', userId);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
