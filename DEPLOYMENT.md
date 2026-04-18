# Real Estate Platform - Deployment Guide

This comprehensive guide covers deploying the Real Estate Platform to production using modern cloud services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Cloud Services Configuration](#cloud-services-configuration)
7. [Domain and SSL Setup](#domain-and-ssl-setup)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Security Best Practices](#security-best-practices)
10. [Maintenance and Updates](#maintenance-and-updates)

## Prerequisites

### Required Accounts
- [Render](https://render.com/) account (for backend deployment)
- [Vercel](https://vercel.com/) account (for frontend deployment)
- [MySQL Cloud](https://www.mysql.com/cloud/) or [PlanetScale](https://planetscale.com/) account
- [Cloudinary](https://cloudinary.com/) account (for image storage)
- [Domain name](https://www.namecheap.com/) (optional, for custom domain)

### Required Tools
- Node.js 18+ and npm
- Git
- MySQL client (for database management)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/real-estate-platform.git
cd real-estate-platform
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install --production
```

**Frontend:**
```bash
cd ../frontend
npm install --production
```

### 3. Environment Variables

Create environment files for both backend and frontend:

**Backend (.env):**
```env
# Database Configuration
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=real_estate_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Application Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
MAX_FILES=10

# Logging Configuration
LOG_LEVEL=INFO
EXTERNAL_LOGGING_ENABLED=false

# Security Configuration
BLACKLISTED_IPS=
WHITELISTED_IPS=

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_CLOUDINARY_URL=https://res.cloudinary.com/your-cloud-name
VITE_APP_NAME=RealEstate Platform
VITE_APP_VERSION=1.0.0
```

## Database Setup

### Option 1: MySQL Cloud (Recommended)

1. **Create MySQL Instance:**
   - Go to [MySQL Cloud](https://www.mysql.com/cloud/)
   - Create a new MySQL Database Service
   - Choose the appropriate tier (starting with Basic tier)
   - Note the connection details

2. **Import Database Schema:**
   ```bash
   mysql -h your-host -u your-username -p real_estate_db < database/schema.sql
   ```

3. **Create Database User:**
   ```sql
   CREATE USER 'real_estate_app'@'%' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON real_estate_db.* TO 'real_estate_app'@'%';
   FLUSH PRIVILEGES;
   ```

### Option 2: PlanetScale (Serverless MySQL)

1. **Create PlanetScale Database:**
   - Sign up at [PlanetScale](https://planetscale.com/)
   - Create a new database
   - Import the schema using the PlanetScale CLI

2. **Get Connection String:**
   - Go to your database dashboard
   - Click "Connect" and select "General"
   - Copy the connection string

### Option 3: Local MySQL (Development Only)

```bash
# Install MySQL
sudo apt-get install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE real_estate_db;
CREATE USER 'real_estate_app'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON real_estate_db.* TO 'real_estate_app'@'localhost';
FLUSH PRIVILEGES;

# Import schema
mysql -u real_estate_app -p real_estate_db < database/schema.sql
```

## Backend Deployment (Render)

### 1. Prepare for Deployment

**Update package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

**Create render.yaml:**
```yaml
services:
  - type: web
    name: real-estate-api
    env: node
    plan: starter
    buildCommand: "npm install --production"
    startCommand: "npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

### 2. Deploy to Render

1. **Connect GitHub:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name:** real-estate-api
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Node
   - **Build Command:** `npm install --production`
   - **Start Command:** `npm start`

3. **Add Environment Variables:**
   - Add all variables from your .env file
   - Make sure to add the database connection string

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://real-estate-api.onrender.com`)

### 3. Configure Health Checks

Add a health check endpoint to your backend (already included in server.js):
```javascript
// This endpoint is already in server.js
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

**Update vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000
  }
})
```

**Create vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### 2. Deploy to Vercel

1. **Connect GitHub:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Connect your GitHub repository

2. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

3. **Add Environment Variables:**
   - `VITE_API_URL`: Your backend Render URL

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL

## Cloud Services Configuration

### Cloudinary Setup

1. **Create Account:**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Choose the free tier to start

2. **Configure Upload Settings:**
   - Go to Settings → Upload
   - Set allowed formats: jpg, png, gif, webp
   - Set max file size: 10MB
   - Enable auto-format and quality optimization

3. **Get API Credentials:**
   - Go to Dashboard → API Keys
   - Copy Cloud Name, API Key, and API Secret
   - Add to your environment variables

### Email Service Setup (Gmail)

1. **Enable 2FA:**
   - Go to your Google Account settings
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to Security → App Passwords
   - Create a new app password for your application
   - Use this password in your environment variables

## Domain and SSL Setup

### Custom Domain Setup

1. **Vercel Domain:**
   - Go to Vercel project settings
   - Click "Domains" → "Add"
   - Enter your domain name
   - Configure DNS records as instructed

2. **Render Domain:**
   - Go to Render service settings
   - Click "Custom Domains" → "Add Custom Domain"
   - Enter your subdomain (e.g., api.yourdomain.com)
   - Configure DNS records

### SSL Configuration

Both Vercel and Render provide automatic SSL certificates. For additional security:

1. **Let's Encrypt (if using custom server):**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

2. **Force HTTPS:**
   - Add HTTPS redirect in your Nginx configuration
   - Update your application to use HTTPS URLs

## Monitoring and Logging

### Application Monitoring

1. **Render Monitoring:**
   - Built-in metrics and logs
   - Custom health checks
   - Error tracking

2. **Vercel Analytics:**
   - Real-time performance metrics
   - User analytics
   - Speed insights

### Logging Setup

1. **Application Logs:**
   - Logs are automatically collected by Render and Vercel
   - Set up log rotation in your application
   - Configure external logging service if needed

2. **Database Monitoring:**
   - Monitor query performance
   - Set up alerts for slow queries
   - Monitor connection pool usage

### Error Tracking

1. **Sentry Integration (Optional):**
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

2. **Add to server.js:**
   ```javascript
   const Sentry = require('@sentry/node');
   const { nodeProfilingIntegration } = require('@sentry/profiling-node');

   Sentry.init({
     dsn: 'your-sentry-dsn',
     integrations: [
       nodeProfilingIntegration(),
     ],
   });
   ```

## Security Best Practices

### 1. Environment Security

- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations
- Never commit secrets to Git

### 2. API Security

- Implement rate limiting
- Use HTTPS everywhere
- Validate all inputs
- Sanitize outputs

### 3. Database Security

- Use parameterized queries
- Implement connection pooling
- Regular backups
- Access control

### 4. Application Security

- Keep dependencies updated
- Use security headers
- Implement CORS properly
- Regular security audits

## Maintenance and Updates

### 1. Regular Updates

**Dependencies:**
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit fix
```

**Database:**
- Regular backups
- Index optimization
- Query performance analysis

### 2. Monitoring Setup

**Health Checks:**
- Set up automated health checks
- Monitor response times
- Alert on failures

**Performance Monitoring:**
- Track page load times
- Monitor API response times
- Database performance metrics

### 3. Backup Strategy

**Database Backups:**
```bash
# Daily backup
mysqldump -h host -u user -p database > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

**Application Backups:**
- Version control (Git)
- Environment variables backup
- Configuration files backup

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Check connection string
   - Verify credentials
   - Check network connectivity

2. **Build Failures:**
   - Check Node.js version
   - Verify dependencies
   - Check build logs

3. **Runtime Errors:**
   - Check application logs
   - Verify environment variables
   - Monitor resource usage

### Debugging Commands

```bash
# Check logs (Render)
render logs

# Check logs (Vercel)
vercel logs

# Database connection test
mysql -h host -u user -p database

# Health check
curl https://your-api-url.onrender.com/health
```

## Performance Optimization

### 1. Database Optimization

- Add indexes for frequently queried columns
- Optimize slow queries
- Use connection pooling
- Implement caching

### 2. Frontend Optimization

- Enable code splitting
- Optimize images
- Use CDN for static assets
- Implement lazy loading

### 3. Backend Optimization

- Implement caching (Redis)
- Use compression
- Optimize API responses
- Load balancing

## Scaling Considerations

### 1. Horizontal Scaling

- Multiple backend instances
- Database read replicas
- Load balancers
- CDN distribution

### 2. Vertical Scaling

- Increase server resources
- Database optimization
- Memory management
- CPU optimization

## Cost Optimization

### 1. Resource Management

- Monitor resource usage
- Right-size instances
- Implement auto-scaling
- Use spot instances when possible

### 2. Storage Optimization

- Compress images
- Use CDN for static assets
- Implement lifecycle policies
- Clean up unused resources

## Support and Documentation

### 1. Documentation

- API documentation (Swagger)
- User guides
- Deployment guides
- Troubleshooting guides

### 2. Support Channels

- Email support
- Chat support
- Community forums
- Issue tracking

## Conclusion

This deployment guide provides a comprehensive approach to deploying the Real Estate Platform to production. By following these steps, you'll have a secure, scalable, and maintainable application.

For additional support or questions, please refer to the project documentation or create an issue in the GitHub repository.

---

**Next Steps:**
1. Set up monitoring and alerting
2. Implement automated testing
3. Set up CI/CD pipelines
4. Create disaster recovery plan
5. Regular security audits

**Important Notes:**
- Always test deployments in a staging environment first
- Keep backups of your database and configurations
- Monitor your application regularly
- Stay updated with security patches and updates
