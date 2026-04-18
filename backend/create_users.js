const bcrypt = require('bcryptjs');
const { insert } = require('./config/database');

async function createUsers() {
  try {
    console.log('Creating admin and agent users...');
    
    // Hash admin password
    const adminPassword = 'michel@12345';
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(adminPassword, adminSalt);
    
    // Admin user data
    const adminData = {
      name: 'Michel Uwiringiyimana',
      email: 'michelrealestate1@gmail.com',
      password: adminHashedPassword,
      role: 'admin',
      phone: '+250788818207',
      bio: 'System Administrator for Michel Real Estate',
      company: 'Michelrealestate',
      is_verified: true,
      is_active: true
    };
    
    // Insert admin user
    const adminId = await insert('users', adminData);
    console.log('✅ Admin user created successfully!');
    console.log('   Email: michelrealestate1@gmail.com');
    console.log('   Password: michel@12345');
    console.log('   User ID:', adminId);
    
    // Hash agent password
    const agentPassword = 'william@@001122';
    const agentSalt = await bcrypt.genSalt(10);
    const agentHashedPassword = await bcrypt.hash(agentPassword, agentSalt);
    
    // Agent user data
    const agentData = {
      name: 'William Tuyiringire',
      email: 'williamtuyiringire49@gmail.com',
      password: agentHashedPassword,
      role: 'agent',
      phone: '+250794392761',
      bio: 'Experienced real estate agent with 10+ years in the industry',
      company: 'Michelrealestate',
      license: 'RE123456',
      is_verified: true,
      is_active: true
    };
    
    // Insert agent user
    const agentId = await insert('users', agentData);
    console.log('✅ Agent user created successfully!');
    console.log('   Email: williamtuyiringire49@gmail.com');
    console.log('   Password: william@@001122');
    console.log('   User ID:', agentId);
    
    console.log('\n🎉 Both users created successfully!');
    console.log('\nLogin Credentials:');
    console.log('================');
    console.log('ADMIN LOGIN:');
    console.log('Email: michelrealestate1@gmail.com');
    console.log('Password: michel@12345');
    console.log('\nAGENT LOGIN:');
    console.log('Email: williamtuyiringire49@gmail.com');
    console.log('Password: william@@001122');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}

createUsers();
