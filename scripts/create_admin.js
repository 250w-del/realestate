const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'real_estate',
    charset: 'utf8mb4'
};

async function createAdminUser() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        // Admin user details
        const adminUser = {
            name: 'William Tuyiringire',
            email: 'williamtuyiringire49@gmail.com',
            password: 'William@234567',
            role: 'admin',
            phone: '+250 788 123 456',
            bio: 'System Administrator for Real Estate Platform based in Kigali, Rwanda',
            company: 'Real Estate Platform',
            is_verified: true,
            is_active: true
        };
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        
        // Insert the admin user
        const insertQuery = `
            INSERT INTO users (
                name, email, password, role, phone, bio, company, 
                is_verified, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const [result] = await connection.execute(insertQuery, [
            adminUser.name,
            adminUser.email,
            hashedPassword,
            adminUser.role,
            adminUser.phone,
            adminUser.bio,
            adminUser.company,
            adminUser.is_verified,
            adminUser.is_active
        ]);
        
        console.log('✅ Admin user created successfully!');
        console.log(`📧 Email: ${adminUser.email}`);
        console.log(`👤 Name: ${adminUser.name}`);
        console.log(`🔑 Role: ${adminUser.role}`);
        console.log(`📍 Location: Kigali, Rwanda`);
        console.log(`🆔 User ID: ${result.insertId}`);
        
        // Verify the user was created
        const [rows] = await connection.execute(
            'SELECT id, name, email, role, is_verified, is_active FROM users WHERE email = ?',
            [adminUser.email]
        );
        
        console.log('\n🔍 Verification:');
        console.log(JSON.stringify(rows[0], null, 2));
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        
        // Check if user already exists
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️  Admin user with this email already exists');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
createAdminUser();
