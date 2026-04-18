const { insert } = require('./config/database');

async function createAdminUser() {
  try {
    const userData = {
      name: 'Michel Uwiringiyimana',
      email: 'michelrealestate1@gmail.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'admin',
      is_verified: true,
      is_active: true
    };

    const userId = await insert('users', userData);
    console.log('Admin user created successfully with ID:', userId);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
}

createAdminUser();
