const express = require('express');
const router = express.Router();

const { findOne, insert, findMany, update, remove, count } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateViewing, validateId } = require('../middleware/validationMiddleware');

// Schedule property viewing
router.post('/', protect, validateViewing, asyncHandler(async (req, res) => {
  const { property_id, agent_id, viewing_date, notes } = req.body;
  const user_id = req.user.id;

  // Check if property exists and is active
  const property = await findOne('properties', { id: property_id, is_active: true });
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if agent exists and is verified
  const agent = await findOne('users', { id: agent_id, role: 'agent', is_verified: true, is_active: true });
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found or not verified'
    });
  }

  // Check if user already has a viewing scheduled for this property at the same time
  const existingViewing = await findOne('property_viewings', {
    property_id,
    user_id,
    viewing_date,
    status: ['pending', 'confirmed']
  });

  if (existingViewing) {
    return res.status(400).json({
      success: false,
      message: 'You already have a viewing scheduled for this property at this time'
    });
  }

  // Create viewing
  const viewingData = {
    property_id,
    user_id,
    agent_id,
    viewing_date,
    notes: notes || null,
    status: 'pending'
  };

  const viewingId = await insert('property_viewings', viewingData);

  // Get created viewing with related info
  const viewing = await findOne('property_viewings', { id: viewingId });
  
  // Get related information
  const user = await findOne('users', { id: user_id }, 'id, name, email, phone');
  const agentInfo = await findOne('users', { id: agent_id }, 'id, name, email, phone');
  const propertyInfo = await findOne('properties', { id: property_id }, 'id, title, location, price');

  viewing.user = user;
  viewing.agent = agentInfo;
  viewing.property = propertyInfo;

  res.status(201).json({
    success: true,
    message: 'Property viewing scheduled successfully',
    data: {
      viewing
    }
  });
}));

// Get user's viewings
router.get('/my-viewings', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const user_id = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = { user_id };
  if (status) conditions.status = status;

  const viewings = await findMany('property_viewings', conditions, '*', 'viewing_date DESC', limit, offset);

  // Get related information for each viewing
  for (let viewing of viewings) {
    const user = await findOne('users', { id: viewing.user_id }, 'id, name, email, phone');
    const agent = await findOne('users', { id: viewing.agent_id }, 'id, name, email, phone');
    const property = await findOne('properties', { id: viewing.property_id }, 'id, title, location, price, property_type');

    viewing.user = user;
    viewing.agent = agent;
    viewing.property = property;
  }

  const totalCount = await count('property_viewings', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      viewings,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get agent's viewings
router.get('/agent-viewings', protect, authorize('agent'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const agent_id = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = { agent_id };
  if (status) conditions.status = status;

  const viewings = await findMany('property_viewings', conditions, '*', 'viewing_date DESC', limit, offset);

  // Get related information for each viewing
  for (let viewing of viewings) {
    const user = await findOne('users', { id: viewing.user_id }, 'id, name, email, phone');
    const agent = await findOne('users', { id: viewing.agent_id }, 'id, name, email, phone');
    const property = await findOne('properties', { id: viewing.property_id }, 'id, title, location, price, property_type');

    viewing.user = user;
    viewing.agent = agent;
    viewing.property = property;
  }

  const totalCount = await count('property_viewings', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      viewings,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get all viewings (admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, agent_id, user_id, property_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = {};
  if (status) conditions.status = status;
  if (agent_id) conditions.agent_id = agent_id;
  if (user_id) conditions.user_id = user_id;
  if (property_id) conditions.property_id = property_id;

  const viewings = await findMany('property_viewings', conditions, '*', 'viewing_date DESC', limit, offset);

  // Get related information for each viewing
  for (let viewing of viewings) {
    const user = await findOne('users', { id: viewing.user_id }, 'id, name, email, phone');
    const agent = await findOne('users', { id: viewing.agent_id }, 'id, name, email, phone');
    const property = await findOne('properties', { id: viewing.property_id }, 'id, title, location, price, property_type');

    viewing.user = user;
    viewing.agent = agent;
    viewing.property = property;
  }

  const totalCount = await count('property_viewings', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      viewings,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get single viewing by ID
router.get('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const viewing = await findOne('property_viewings', { id });
  
  if (!viewing) {
    return res.status(404).json({
      success: false,
      message: 'Viewing not found'
    });
  }

  // Check permissions (admin can view all, users can view their own, agents can view their assigned)
  if (user.role !== 'admin' && 
      viewing.user_id !== user.id && 
      viewing.agent_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own viewings or viewings assigned to you'
    });
  }

  // Get related information
  const viewingUser = await findOne('users', { id: viewing.user_id }, 'id, name, email, phone');
  const agent = await findOne('users', { id: viewing.agent_id }, 'id, name, email, phone');
  const property = await findOne('properties', { id: viewing.property_id }, 'id, title, location, price, property_type');

  viewing.user = viewingUser;
  viewing.agent = agent;
  viewing.property = property;

  res.status(200).json({
    success: true,
    data: {
      viewing
    }
  });
}));

// Update viewing status
router.put('/:id/status', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const user = req.user;

  const viewing = await findOne('property_viewings', { id });
  
  if (!viewing) {
    return res.status(404).json({
      success: false,
      message: 'Viewing not found'
    });
  }

  // Check permissions
  const canUpdate = 
    user.role === 'admin' || 
    (user.role === 'agent' && viewing.agent_id === user.id) ||
    (user.role === 'user' && viewing.user_id === user.id && status === 'cancelled');

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this viewing'
    });
  }

  // Validate status transition
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled'],
    'cancelled': [], // Cannot change from cancelled
    'completed': [] // Cannot change from completed
  };

  if (!validTransitions[viewing.status].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${viewing.status} to ${status}`
    });
  }

  // Update viewing
  const updateData = { status };
  if (notes !== undefined) updateData.notes = notes;
  
  await update('property_viewings', updateData, { id });

  // Get updated viewing with related info
  const updatedViewing = await findOne('property_viewings', { id });
  const viewingUser = await findOne('users', { id: updatedViewing.user_id }, 'id, name, email, phone');
  const agent = await findOne('users', { id: updatedViewing.agent_id }, 'id, name, email, phone');
  const property = await findOne('properties', { id: updatedViewing.property_id }, 'id, title, location, price, property_type');

  updatedViewing.user = viewingUser;
  updatedViewing.agent = agent;
  updatedViewing.property = property;

  res.status(200).json({
    success: true,
    message: 'Viewing status updated successfully',
    data: {
      viewing: updatedViewing
    }
  });
}));

// Cancel viewing
router.delete('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const viewing = await findOne('property_viewings', { id });
  
  if (!viewing) {
    return res.status(404).json({
      success: false,
      message: 'Viewing not found'
    });
  }

  // Check permissions (user can cancel their own, agent can cancel assigned, admin can cancel any)
  const canCancel = 
    user.role === 'admin' || 
    (user.role === 'agent' && viewing.agent_id === user.id) ||
    (user.role === 'user' && viewing.user_id === user.id);

  if (!canCancel) {
    return res.status(403).json({
      success: false,
      message: 'You can only cancel your own viewings or viewings assigned to you'
    });
  }

  // Only pending or confirmed viewings can be cancelled
  if (!['pending', 'confirmed'].includes(viewing.status)) {
    return res.status(400).json({
      success: false,
      message: 'Only pending or confirmed viewings can be cancelled'
    });
  }

  await update('property_viewings', { status: 'cancelled' }, { id });

  res.status(200).json({
    success: true,
    message: 'Viewing cancelled successfully'
  });
}));

module.exports = router;
