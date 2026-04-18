-- Real Estate Platform Database Schema
-- PostgreSQL 14+

-- Create database (run this separately if needed)
-- CREATE DATABASE real_estate WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Connect to database
-- \c real_estate;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity searches

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'user');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial');
CREATE TYPE property_status AS ENUM ('sale', 'rent');
CREATE TYPE size_unit AS ENUM ('sqft', 'sqm', 'acre');
CREATE TYPE viewing_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    phone VARCHAR(20), 
    avatar VARCHAR(255),
    bio TEXT,
    company VARCHAR(255),
    license VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type property_type NOT NULL,
    status property_status NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    size DECIMAL(8, 2) NOT NULL,
    size_unit size_unit DEFAULT 'sqft',
    year_built INTEGER,
    parking_spaces INTEGER DEFAULT 0,
    amenities JSONB,
    features JSONB,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for properties
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_complex ON properties(status, property_type, price, is_active);

-- Full-text search index for properties
CREATE INDEX idx_properties_search ON properties 
USING GIN(to_tsvector('english', title || ' ' || description || ' ' || location));

-- Property images table
CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255),
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for property_images
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(is_primary);
CREATE INDEX idx_property_images_sort_order ON property_images(sort_order);

-- Favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Create indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_property_id ON messages(property_id);
CREATE INDEX idx_messages_parent_id ON messages(parent_id);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Property viewings table
CREATE TABLE property_viewings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewing_date TIMESTAMP NOT NULL,
    status viewing_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for property_viewings
CREATE INDEX idx_viewings_property_id ON property_viewings(property_id);
CREATE INDEX idx_viewings_user_id ON property_viewings(user_id);
CREATE INDEX idx_viewings_agent_id ON property_viewings(agent_id);
CREATE INDEX idx_viewings_date ON property_viewings(viewing_date);
CREATE INDEX idx_viewings_status ON property_viewings(status);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_agent_id ON reviews(agent_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- Search history table
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    search_query VARCHAR(255),
    filters JSONB,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search_history
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for settings
CREATE INDEX idx_settings_key ON settings(key_name);

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

-- Create view for property statistics
CREATE OR REPLACE VIEW property_stats AS
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viewings_updated_at BEFORE UPDATE ON property_viewings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for development)
-- Note: Password is 'password' hashed with bcrypt
-- Insert admin user
INSERT INTO users (name, email, password, role, phone, bio, company, is_verified) VALUES
('Michel Uwiringiyimana', 'michelrealestate1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+250788818207', 'System Administrator for Michel Real Estate', 'Michelrealestate', TRUE);

-- Insert sample agent
INSERT INTO users (name, email, password, role, phone, bio, company, license, is_verified) VALUES
('William Tuyiringire', 'williamtuyiringire49@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', '+250794392761', 'Experienced real estate agent with 10+ years in the industry', 'Michelrealestate', 'RE123456', TRUE);

-- Insert sample user
INSERT INTO users (name, email, password, role) VALUES
('Jane Doe', 'jane@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
