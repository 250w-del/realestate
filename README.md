# Real Estate Web Platform

A comprehensive, production-ready real estate web application built with modern technologies. This platform provides a complete solution for property listing, searching, and management with advanced features like real-time messaging, recommendations, and secure authentication.

## 🚀 Features

### Core Features
- **🔐 Advanced Authentication**: JWT-based authentication with role-based access control (Admin, Agent, User)
- **🏠 Property Management**: Full CRUD operations for properties with image galleries
- **🔍 Advanced Search**: Multi-filter property search with pagination and sorting
- **📸 Image Upload**: Cloudinary integration for optimized property images
- **💬 Real-time Chat**: Socket.io for agent-client communication
- **⭐ Reviews & Ratings**: Property review system with approval workflow
- **📅 Viewings**: Schedule and manage property viewings
- **❤️ Favorites**: Save and manage favorite properties
- **📊 Analytics**: Performance tracking and insights for agents and admins

### Advanced Features
- **🤖 AI Recommendations**: Smart property recommendations based on user preferences
- **📧 Email Notifications**: Automated email system for various events
- **🔒 Security**: Comprehensive security measures including rate limiting, XSS protection, and input validation
- **📱 Responsive Design**: Mobile-first design with TailwindCSS and Framer Motion animations
- **🌙 Dark Mode**: Light/dark theme support
- **🔔 Real-time Updates**: Live notifications and status updates

## 🛠 Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **TailwindCSS** for modern, responsive styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Framer Motion** for smooth animations
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **JWT Authentication** for secure auth
- **PostgreSQL** with connection pooling (Supabase-ready)
- **Socket.io** for real-time features
- **Cloudinary** for image storage
- **Nodemailer** for email services
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **Multer** for file uploads

### Database & Services
- **PostgreSQL** for relational data (migrated from MySQL)
- **Supabase** ready for cloud hosting
- **Cloudinary** for image management
- **Email Service** (Gmail SMTP)
- **Socket.io** for WebSocket connections

## 📁 Project Structure

```
real-estate-platform/
├── frontend/                    # React frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Layout/        # Layout components
│   │   │   ├── Header/        # Header component
│   │   │   ├── Footer/        # Footer component
│   │   │   └── Sidebar/       # Sidebar component
│   │   ├── pages/             # Page components
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── user/          # User dashboard
│   │   │   ├── agent/         # Agent dashboard
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── HomePage.jsx
│   │   │   ├── PropertyListingPage.jsx
│   │   │   └── PropertyDetailsPage.jsx
│   │   ├── store/             # Redux store
│   │   │   ├── slices/        # Redux slices
│   │   │   └── store.js       # Store configuration
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                     # Node.js backend API
│   ├── controllers/           # Route controllers
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── config/                # Configuration files
│   ├── utils/                 # Utility functions
│   ├── package.json
│   └── server.js              # Server entry point
├── database/                    # Database files
│   └── schema.sql             # Database schema
├── DEPLOYMENT.md               # Detailed deployment guide
└── README.md                  # This file
```

## 🚀 Quick Start

> **🎯 Using Supabase?** See [README_SUPABASE.md](./README_SUPABASE.md) for a 3-step quick start!

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher) OR **Supabase** account (recommended)
- **Cloudinary** account (free tier available)
- **Gmail** account (for email notifications)

> **Note**: This project has been migrated from MySQL to PostgreSQL. See [POSTGRESQL_MIGRATION_SUMMARY.md](./POSTGRESQL_MIGRATION_SUMMARY.md) for details.

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/real-estate-platform.git
cd real-estate-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup_postgresql.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup_postgresql.sh
./scripts/setup_postgresql.sh
```

#### Option B: Manual Setup - Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE real_estate;
\q

# Import schema
psql -U postgres -d real_estate -f database/schema_postgresql.sql
```

#### Option C: Supabase (Cloud - Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Copy and paste contents of `database/schema_postgresql.sql`
5. Run the SQL
6. Get connection details from Settings → Database

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

### 3. Environment Configuration

**Backend (.env):**
```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=strong_password
DB_NAME=real_estate
DB_SSL=false

# For Supabase, use:
# DB_HOST=db.your-project.supabase.co
# DB_NAME=postgres
# DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_URL=https://res.cloudinary.com/your_cloud_name
```

### 4. Start Development

```bash
# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory)
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Properties
- `GET /api/properties` - List properties with filters
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (Agent/Admin)
- `PUT /api/properties/:id` - Update property (Agent/Admin)
- `DELETE /api/properties/:id` - Delete property (Agent/Admin)
- `GET /api/properties/featured` - Get featured properties

### Favorites
- `POST /api/favorites` - Add to favorites
- `GET /api/favorites` - Get user favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `GET /api/favorites/check/:id` - Check favorite status

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get user messages
- `GET /api/messages/:id` - Get message details
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Viewings
- `POST /api/viewings` - Schedule viewing
- `GET /api/viewings` - Get user viewings
- `PUT /api/viewings/:id` - Update viewing status
- `DELETE /api/viewings/:id` - Cancel viewing

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get property reviews
- `PUT /api/reviews/:id/approve` - Approve review (Admin)
- `DELETE /api/reviews/:id` - Delete review

### Upload
- `POST /api/upload/property-images/:id` - Upload property images
- `DELETE /api/upload/property-image/:id` - Delete property image
- `POST /api/upload/avatar` - Upload user avatar

## 🚀 Deployment

### Quick Deploy (Recommended)

**Frontend (Vercel):**
1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy automatically

**Backend (Render):**
1. Push to GitHub
2. Connect repository to [Render](https://render.com)
3. Set environment variables
4. Deploy automatically

**Database (Supabase - Recommended):**
1. Create database at [Supabase](https://supabase.com)
2. Import schema from `database/schema_postgresql.sql`
3. Update connection string in `.env`

### Detailed Deployment

For comprehensive deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔧 Configuration

### Environment Variables

**Required Backend Variables:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database connection
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Image storage
- `EMAIL_USER`, `EMAIL_PASS` - Email notifications

**Optional Backend Variables:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (INFO/DEBUG/WARN/ERROR)

**Frontend Variables:**
- `VITE_API_URL` - Backend API URL
- `VITE_CLOUDINARY_URL` - Cloudinary base URL

## 🎯 User Roles

### User
- Browse and search properties
- Save favorites
- Contact agents
- Schedule viewings
- Leave reviews

### Agent
- All user features plus:
- Add/edit/delete properties
- Upload property images
- Manage inquiries
- View analytics
- Schedule viewings

### Admin
- All user and agent features plus:
- Manage all users
- Approve agents
- Manage all properties
- View system analytics
- Moderate reviews
- System configuration

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **XSS Protection** and security headers
- **SQL Injection Prevention**
- **File Upload Security**
- **CORS Configuration**
- **Password Hashing** with bcrypt
- **Session Management**

## 📊 Performance Features

- **Database Connection Pooling**
- **Image Optimization** with Cloudinary
- **Lazy Loading** for images
- **Code Splitting** in React
- **Caching** strategies
- **API Response Optimization**
- **Real-time Updates** with Socket.io

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📈 Monitoring

### Application Monitoring
- **Health Checks** at `/health`
- **Performance Metrics** tracking
- **Error Logging** and reporting
- **User Activity** monitoring
- **API Response Time** tracking

### Database Monitoring
- **Query Performance** analysis
- **Connection Pool** monitoring
- **Slow Query** detection
- **Resource Usage** tracking

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Use conventional commits
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- **Issues**: [Create an issue](https://github.com/your-username/real-estate-platform/issues) for bugs
- **Discussions**: [GitHub Discussions](https://github.com/your-username/real-estate-platform/discussions) for questions
- **Email**: support@yourdomain.com for support

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) for the frontend framework
- [Node.js](https://nodejs.org/) for the backend runtime
- [MySQL](https://www.mysql.com/) for the database
- [Cloudinary](https://cloudinary.com/) for image storage
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Socket.io](https://socket.io/) for real-time features

## 📊 Project Stats

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **API Endpoints**: 30+
- **Database Tables**: 10+
- **Features**: 20+
- **Security Measures**: 10+

---

**Built with ❤️ by the Real Estate Platform Team**
