const express = require('express');
const router = express.Router();

const { findMany, findOne, update, remove } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateId } = require('../middleware/validationMiddleware');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = {};
  if (role) conditions.role = role;

  let users;
  if (search) {
    users = await findMany('users', conditions, '*', 'created_at DESC', limit, offset);
    // Filter by search term (simplified - in production, use database search)
    users = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    users = await findMany('users', conditions, '*', 'created_at DESC', limit, offset);
  }

  // Remove passwords from response
  users = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  const totalCount = await require('../config/database').count('users', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get user by ID (admin or own user)
router.get('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check permissions (admin can view any user, users can only view themselves)
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own profile'
    });
  }

  const user = await findOne('users', { id });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    data: {
      user: userWithoutPassword
    }
  });
}));

// Update user (admin or own user)
router.put('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, is_verified, is_active, bio, company, license } = req.body;

  // Check permissions
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }

  const existingUser = await findOne('users', { id });
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Build update object
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (company !== undefined) updateData.company = company;
  if (license !== undefined) updateData.license = license;

  // Only admins can update these fields
  if (req.user.role === 'admin') {
    if (role !== undefined) updateData.role = role;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (is_active !== undefined) updateData.is_active = is_active;
  }

  await update('users', updateData, { id });

  // Get updated user
  const user = await findOne('users', { id });
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: userWithoutPassword
    }
  });
}));

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingUser = await findOne('users', { id });
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  await remove('users', { id });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get user statistics (admin only)
router.get('/stats/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { count, findOne } = require('../config/database');

  const totalUsers = await count('users');
  const totalAgents = await count('users', { role: 'agent' });
  const verifiedAgents = await count('users', { role: 'agent', is_verified: true });
  const totalProperties = await count('properties');
  const activeProperties = await count('properties', { is_active: true });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total_users: totalUsers,
        total_agents: totalAgents,
        verified_agents: verifiedAgents,
        pending_agents: totalAgents - verifiedAgents,
        total_properties: totalProperties,
        active_properties: activeProperties
      }
    }
  });
}));

module.exports = router;
