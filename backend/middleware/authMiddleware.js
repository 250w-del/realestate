const jwt = require('jsonwebtoken');
const { findOne } = require('../config/database');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await findOne('users', { id: decoded.id }, 'id, name, email, role, is_active');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in authentication.'
      });
    }
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized.`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required.'
        });
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      const resource = await findOne(req.resourceTable || 'properties', { 
        id: resourceId,
        [resourceIdField]: req.user.id 
      });

      if (!resource) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in authorization.'
      });
    }
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findOne('users', { id: decoded.id }, 'id, name, email, role, is_active');
      
      if (user && user.is_active) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth
};
