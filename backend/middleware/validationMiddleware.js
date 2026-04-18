const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['user', 'agent', 'admin'])
    .withMessage('Role must be either user, agent, or admin'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Property creation validation
const validatePropertyCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),
  body('latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('property_type')
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial'])
    .withMessage('Invalid property type'),
  body('status')
    .isIn(['sale', 'rent'])
    .withMessage('Status must be either sale or rent'),
  body('bedrooms')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  body('size')
    .isFloat({ min: 0 })
    .withMessage('Size must be a positive number'),
  body('size_unit')
    .optional()
    .isIn(['sqft', 'sqm', 'acre'])
    .withMessage('Size unit must be sqft, sqm, or acre'),
  body('year_built')
    .optional({ values: 'falsy' })
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Year built must be between 1800 and current year'),
  body('parking_spaces')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Parking spaces must be a non-negative integer'),
  body('amenities')
    .optional({ values: 'falsy' })
    .isArray()
    .withMessage('Amenities must be an array'),
  body('features')
    .optional({ values: 'falsy' })
    .isArray()
    .withMessage('Features must be an array'),
  handleValidationErrors
];

// Property update validation
const validatePropertyUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('property_type')
    .optional()
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial'])
    .withMessage('Invalid property type'),
  body('status')
    .optional()
    .isIn(['sale', 'rent'])
    .withMessage('Status must be either sale or rent'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  body('size')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Size must be a positive number'),
  body('size_unit')
    .optional()
    .isIn(['sqft', 'sqm', 'acre'])
    .withMessage('Size unit must be sqft, sqm, or acre'),
  body('year_built')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Year built must be between 1800 and current year'),
  body('parking_spaces')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Parking spaces must be a non-negative integer'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('receiver_id')
    .isInt({ min: 1 })
    .withMessage('Receiver ID must be a positive integer'),
  body('property_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Property ID must be a positive integer'),
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Subject must be between 3 and 255 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('property_id')
    .isInt({ min: 1 })
    .withMessage('Property ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters'),
  handleValidationErrors
];

// Viewing validation
const validateViewing = [
  body('property_id')
    .isInt({ min: 1 })
    .withMessage('Property ID must be a positive integer'),
  body('agent_id')
    .isInt({ min: 1 })
    .withMessage('Agent ID must be a positive integer'),
  body('viewing_date')
    .isISO8601()
    .withMessage('Viewing date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Viewing date must be in the future');
      }
      return true;
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];

// Search query validation (empty query params like bedrooms= must be ignored, not validated as invalid ints)
const validateSearchQuery = [
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search text is too long'),
  query('min_price')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('max_price')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('property_type')
    .optional({ values: 'falsy' })
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial'])
    .withMessage('Invalid property type'),
  query('status')
    .optional({ values: 'falsy' })
    .isIn(['sale', 'rent'])
    .withMessage('Status must be either sale or rent'),
  query('bedrooms')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  query('bathrooms')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  query('min_size')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Minimum size must be a positive number'),
  query('max_size')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Maximum size must be a positive number'),
  query('location')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location filter is too long'),
  query('featured')
    .optional({ values: 'falsy' })
    .isIn(['true', 'false'])
    .withMessage('Invalid featured flag'),
  query('agent_id')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Agent ID must be a positive integer'),
  query('sort_by')
    .optional({ values: 'falsy' })
    .isIn(['created_at', 'price', 'size', 'bedrooms', 'bathrooms', 'views_count'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional({ values: 'falsy' })
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Invalid sort order'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePropertyCreation,
  validatePropertyUpdate,
  validateMessage,
  validateReview,
  validateViewing,
  validateId,
  validateSearchQuery,
  handleValidationErrors
};
