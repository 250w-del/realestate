-- Real Estate Platform Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS real_estate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE real_estate;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent', 'user') DEFAULT 'user',
    phone VARCHAR(20), 
    avatar VARCHAR(255),
    bio TEXT,
    company VARCHAR(255),
    license VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Properties table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type ENUM('house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial') NOT NULL,
    status ENUM('sale', 'rent') NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    size DECIMAL(8, 2) NOT NULL,
    size_unit ENUM('sqft', 'sqm', 'acre') DEFAULT 'sqft',
    year_built INT,
    parking_spaces INT DEFAULT 0,
    amenities JSON,
    features JSON,
    agent_id INT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_agent_id (agent_id),
    INDEX idx_type (property_type),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_location (location),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description, location)
);

-- Property images table
CREATE TABLE property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255),
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_primary (is_primary),
    INDEX idx_sort_order (sort_order)
);

-- Favorites table
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_property (user_id, property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_property_id (property_id),
    INDEX idx_created_at (created_at)
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    property_id INT,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_property_id (property_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Property viewings table
CREATE TABLE property_viewings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    agent_id INT NOT NULL,
    viewing_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_date (viewing_date),
    INDEX idx_status (status)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    agent_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_property (user_id, property_id),
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_rating (rating),
    INDEX idx_approved (is_approved)
);

-- Search history table
CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    search_query VARCHAR(255),
    filters JSON,
    results_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Settings table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name)
);

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('site_name', 'Michelrealestate', 'Website name'),
('site_description', 'Find your dream home with Michel Real Estate', 'Website description'),
('contact_email', 'michelrealestate1@gmail.com', 'Contact email'),
('contact_phone', '+250788818207', 'Contact phone'),
('contact_location', 'Kigali, Rwanda', 'Contact location'),
('max_property_images', '10', 'Maximum number of images per property'),
('featured_properties_count', '6', 'Number of featured properties on homepage'),
('enable_reviews', 'true', 'Enable property reviews'),
('enable_chat', 'true', 'Enable real-time chat');

-- Create indexes for better performance
CREATE INDEX idx_properties_complex ON properties(status, property_type, price, is_active);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Create view for property statistics
CREATE VIEW property_stats AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.views_count,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT r.id) as reviews_count,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT pv.id) as viewings_count
FROM properties p
LEFT JOIN favorites f ON p.id = f.property_id
LEFT JOIN reviews r ON p.id = r.property_id AND r.is_approved = TRUE
LEFT JOIN property_viewings pv ON p.id = pv.property_id AND pv.status = 'completed'
GROUP BY p.id, p.title, p.price, p.views_count;

-- Create trigger for updating views_count
DELIMITER //
CREATE TRIGGER increment_property_views
    AFTER INSERT ON search_history
    FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        UPDATE properties 
        SET views_count = views_count + 1 
        WHERE id = (
            SELECT property_id FROM (
                SELECT property_id FROM search_history 
                WHERE user_id = NEW.user_id 
                ORDER BY created_at DESC LIMIT 1
            ) AS latest_search
        );
    END IF;
END//
DELIMITER ;

-- Sample data (optional - for development)
-- Insert admin user
INSERT INTO users (name, email, password, role, phone, bio, company, is_verified) VALUES
('Michel Uwiringiyimana', 'michelrealestate1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+250788818207', 'System Administrator for Michel Real Estate', 'Michelrealestate', TRUE);

-- Insert sample agent
INSERT INTO users (name, email, password, role, phone, bio, company, license, is_verified) VALUES
('William Tuyiringire', 'williamtuyiringire49@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', '+250794392761', 'Experienced real estate agent with 10+ years in the industry', 'Michelrealestate', 'RE123456', TRUE);

-- Insert sample user
INSERT INTO users (name, email, password, role) VALUES
('Jane Doe', 'jane@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
