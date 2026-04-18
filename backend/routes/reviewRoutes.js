const express = require('express');
const router = express.Router();

const { findOne, insert, findMany, update, remove, count } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { validateReview, validateId } = require('../middleware/validationMiddleware');

// Create review
router.post('/', protect, validateReview, asyncHandler(async (req, res) => {
  const { property_id, rating, review } = req.body;
  const user_id = req.user.id;

  // Check if property exists and is active
  const property = await findOne('properties', { id: property_id, is_active: true });
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if user already reviewed this property
  const existingReview = await findOne('reviews', { property_id, user_id });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this property'
    });
  }

  // Create review
  const reviewData = {
    property_id,
    user_id,
    agent_id: property.agent_id,
    rating,
    review: review || null,
    is_approved: false // Reviews need admin approval
  };

  const reviewId = await insert('reviews', reviewData);

  // Get created review with user info
  const createdReview = await findOne('reviews', { id: reviewId });
  
  // Get user information
  const reviewer = await findOne('users', { id: user_id }, 'id, name, email, avatar');
  createdReview.reviewer = reviewer;

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully. It will be visible after admin approval.',
    data: {
      review: createdReview
    }
  });
}));

// Get reviews for a property
router.get('/property/:propertyId', validateId, asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Check if property exists
  const property = await findOne('properties', { id: propertyId, is_active: true });
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  let conditions = { property_id: propertyId, is_approved: true };
  if (rating) conditions.rating = rating;

  const reviews = await findMany('reviews', conditions, '*', 'created_at DESC', limit, offset);

  // Get reviewer information for each review
  for (let review of reviews) {
    const reviewer = await findOne('users', { id: review.user_id }, 'id, name, email, avatar');
    review.reviewer = reviewer;
  }

  const totalCount = await count('reviews', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get rating statistics
  const ratingStats = await findOne('reviews', { property_id: propertyId, is_approved: true }, 
    'COUNT(*) as total_reviews, AVG(rating) as average_rating');
  
  // Get rating distribution
  const ratingDistribution = [];
  for (let i = 1; i <= 5; i++) {
    const count = await count('reviews', { property_id: propertyId, rating: i, is_approved: true });
    ratingDistribution.push({ rating: i, count });
  }

  res.status(200).json({
    success: true,
    data: {
      reviews,
      stats: {
        total_reviews: ratingStats.total_reviews || 0,
        average_rating: parseFloat(ratingStats.average_rating || 0).toFixed(1),
        rating_distribution: ratingDistribution
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get user's reviews
router.get('/my-reviews', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const user_id = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await findMany('reviews', { user_id }, '*', 'created_at DESC', limit, offset);

  // Get property information for each review
  for (let review of reviews) {
    const property = await findOne('properties', { id: review.property_id }, 'id, title, location, price');
    review.property = property;
  }

  const totalCount = await count('reviews', { user_id });
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get agent's reviews
router.get('/agent/:agentId', validateId, asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Check if agent exists
  const agent = await findOne('users', { id: agentId, role: 'agent' });
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  const reviews = await findMany('reviews', { agent_id: agentId, is_approved: true }, '*', 'created_at DESC', limit, offset);

  // Get property and reviewer information for each review
  for (let review of reviews) {
    const property = await findOne('properties', { id: review.property_id }, 'id, title, location, price');
    const reviewer = await findOne('users', { id: review.user_id }, 'id, name, email, avatar');
    review.property = property;
    review.reviewer = reviewer;
  }

  const totalCount = await count('reviews', { agent_id: agentId, is_approved: true });
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get agent rating statistics
  const ratingStats = await findOne('reviews', { agent_id: agentId, is_approved: true }, 
    'COUNT(*) as total_reviews, AVG(rating) as average_rating');

  res.status(200).json({
    success: true,
    data: {
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        total_reviews: ratingStats.total_reviews || 0,
        average_rating: parseFloat(ratingStats.average_rating || 0).toFixed(1)
      },
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get all reviews (admin only)
router.get('/', protect, require('../middleware/authMiddleware').authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, property_id, agent_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = {};
  if (status === 'approved') conditions.is_approved = true;
  else if (status === 'pending') conditions.is_approved = false;
  if (property_id) conditions.property_id = property_id;
  if (agent_id) conditions.agent_id = agent_id;

  const reviews = await findMany('reviews', conditions, '*', 'created_at DESC', limit, offset);

  // Get related information for each review
  for (let review of reviews) {
    const property = await findOne('properties', { id: review.property_id }, 'id, title, location');
    const reviewer = await findOne('users', { id: review.user_id }, 'id, name, email');
    const agent = await findOne('users', { id: review.agent_id }, 'id, name, email');
    
    review.property = property;
    review.reviewer = reviewer;
    review.agent = agent;
  }

  const totalCount = await count('reviews', conditions);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Approve review (admin only)
router.put('/:id/approve', protect, require('../middleware/authMiddleware').authorize('admin'), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await findOne('reviews', { id });
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  if (review.is_approved) {
    return res.status(400).json({
      success: false,
      message: 'Review is already approved'
    });
  }

  await update('reviews', { is_approved: true }, { id });

  // Get updated review with related info
  const updatedReview = await findOne('reviews', { id });
  const property = await findOne('properties', { id: updatedReview.property_id }, 'id, title, location');
  const reviewer = await findOne('users', { id: updatedReview.user_id }, 'id, name, email');
  const agent = await findOne('users', { id: updatedReview.agent_id }, 'id, name, email');
  
  updatedReview.property = property;
  updatedReview.reviewer = reviewer;
  updatedReview.agent = agent;

  res.status(200).json({
    success: true,
    message: 'Review approved successfully',
    data: {
      review: updatedReview
    }
  });
}));

// Delete review (admin only, or user can delete their own unapproved review)
router.delete('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const review = await findOne('reviews', { id });
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check permissions (admin can delete any, user can delete their own unapproved review)
  const canDelete = 
    user.role === 'admin' || 
    (user.id === review.user_id && !review.is_approved);

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own unapproved reviews'
    });
  }

  await remove('reviews', { id });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
}));

module.exports = router;
