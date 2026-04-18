const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findOne, insert, update } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await findOne('users', { email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const userData = {
    name,
    email,
    password: hashedPassword,
    role,
    is_active: true
  };

  const userId = await insert('users', userData);

  // Get created user (without password)
  const user = await findOne('users', { id: userId }, 'id, name, email, role, phone, bio, company, is_verified, is_active, created_at');

  // Generate token
  const token = generateToken(userId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await findOne('users', { email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // NOTE: We allow agents to log in even if unverified.
  // Verification should restrict privileged agent actions, not basic access.

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await findOne('users', { id: req.user.id }, 'id, name, email, role, phone, avatar, bio, company, license, is_verified, is_active, created_at');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio, company, license } = req.body;
  const userId = req.user.id;

  // Build update object
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (company !== undefined) updateData.company = company;
  if (license !== undefined) updateData.license = license;

  // Update user
  await update('users', updateData, { id: userId });

  // Get updated user
  const user = await findOne('users', { id: userId }, 'id, name, email, role, phone, avatar, bio, company, license, is_verified, is_active, created_at');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password
  const user = await findOne('users', { id: userId });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await update('users', { password: hashedNewPassword }, { id: userId });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Logout (client-side token removal)
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // However, we could implement token blacklisting if needed
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Generate new token
  const token = generateToken(userId);

  // Get user
  const user = await findOne('users', { id: userId }, 'id, name, email, role, phone, avatar, bio, company, license, is_verified, is_active, created_at');

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user,
      token
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken
};
