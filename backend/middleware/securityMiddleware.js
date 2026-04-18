const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const { body, validationResult } = require('express-validator');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many login attempts, please try again after 15 minutes.'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many upload attempts, please try again later.'
);

const contactLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 contact requests per hour
  'Too many contact requests, please try again later.'
);

// Security headers configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key], {
          whiteList: {
            a: ['href', 'title', 'target'],
            b: [],
            i: [],
            em: [],
            strong: [],
            p: [],
            br: []
          }
        });
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

// MongoDB NoSQL injection protection
const preventNoSQLInjection = (req, res, next) => {
  // Check for NoSQL injection patterns
  const checkForInjection = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          // Check for common NoSQL injection patterns
          if (typeof value === 'string') {
            if (value.includes('$where') || 
                value.includes('$gt') || 
                value.includes('$lt') || 
                value.includes('$ne') ||
                value.includes('$in') ||
                value.includes('$regex') ||
                value.includes('{') ||
                value.includes('}')) {
              return true;
            }
          } else if (typeof value === 'object') {
            if (checkForInjection(value)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  if (checkForInjection(req.body) || 
      checkForInjection(req.query) || 
      checkForInjection(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  // Apply mongo-sanitize
  mongoSanitize()(req, res, next);
};

// SQL injection protection helper
const preventSQLInjection = (req, res, next) => {
  const checkForSQLInjection = (str) => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\#|\/\*|\*\/|;|\'|\"|`)/i,
      /\b(OR|AND)\s+\d+\s*=\s*\d+/i,
      /\b(1\s*=\s*1|1\s*=\s*'1')/i
    ];

    return sqlPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          if (typeof value === 'string' && checkForSQLInjection(value)) {
            return true;
          } else if (typeof value === 'object' && checkObject(value)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (checkObject(req.body) || 
      checkObject(req.query) || 
      checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

// XSS protection middleware
const preventXSS = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
        }
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// CSRF protection (for state-changing requests)
const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.get('X-CSRF-Token') || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }

  next();
};

// IP whitelist/blacklist middleware
const ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Blacklist
  const blacklistedIPs = process.env.BLACKLISTED_IPS ? 
    process.env.BLACKLISTED_IPS.split(',') : [];
  
  // Whitelist (if specified, only allow these IPs)
  const whitelistedIPs = process.env.WHITELISTED_IPS ? 
    process.env.WHITELISTED_IPS.split(',') : [];

  if (blacklistedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  next();
};

// User agent validation
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  // Block suspicious user agents
  const suspiciousAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ];

  if (userAgent && suspiciousAgents.some(agent => agent.test(userAgent))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  next();
};

// Content type validation
const validateContentType = (allowedTypes) => {
  return (req, res, next) => {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required'
      });
    }

    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported Media Type'
      });
    }

    next();
  };
};

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(413).json({
        success: false,
        message: `File ${file.originalname} is too large`
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(415).json({
        success: false,
        message: `File type ${file.mimetype} is not allowed`
      });
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /\.(exe|bat|cmd|scr|pif|com)$/
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file name'
      });
    }
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

// Audit logging middleware
const auditLogger = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  let responseData = null;

  res.send = function(data) {
    responseData = data;
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  res.on('finish', () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      statusCode: res.statusCode,
      requestHeaders: req.headers,
      responseHeaders: res.getHeaders(),
      requestBody: req.method !== 'GET' ? req.body : undefined,
      responseData: responseData
    };

    // Log to file or database (implementation depends on your logging system)
    console.log('AUDIT:', JSON.stringify(auditData));
  });

  next();
};

// Combine all security middleware
const securityMiddleware = [
  helmetConfig,
  securityHeaders,
  requestSizeLimiter,
  ipFilter,
  validateUserAgent,
  sanitizeInput,
  preventNoSQLInjection,
  preventSQLInjection,
  preventXSS,
  auditLogger
];

module.exports = {
  securityMiddleware,
  authLimiter,
  generalLimiter,
  uploadLimiter,
  contactLimiter,
  csrfProtection,
  validateContentType,
  validateFileUpload,
  preventNoSQLInjection,
  preventSQLInjection,
  preventXSS,
  sanitizeInput,
  securityHeaders,
  auditLogger
};
