// 404 Not Found Handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // MySQL error codes
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry. This resource already exists.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referenced resource not found.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    const message = 'Cannot delete this resource as it is referenced by other records.';
    error = { message, statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired.';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field.';
    error = { message, statusCode: 400 };
  }

  // Cloudinary errors
  if (err.name === 'CloudinaryError') {
    const message = 'Image upload failed.';
    error = { message, statusCode: 400 };
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};
