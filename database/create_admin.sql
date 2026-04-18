

USE real_estate;

-- Insert admin user (password will be hashed by the application)
INSERT INTO users (
    name,
    email,
    password,
    role,
    phone,
    bio,
    company,
    is_verified,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Michel Uwiringiyimana',
    'micherealestate1@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This should be properly hashed in the application
    'admin',
    '+250788818207', -- Rwanda phone format
    'System Administrator for Real Estate Platform',
    'Real Estate Platform',
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT * FROM users WHERE email = 'michelrealestate1@gmail.com';
