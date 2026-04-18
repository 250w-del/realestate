const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);

module.exports = router;
