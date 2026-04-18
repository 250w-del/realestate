const express = require('express');
const router = express.Router();

const { findOne, insert, remove, findMany, count } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { validateId } = require('../middleware/validationMiddleware');

// Add property to favorites
router.post('/', protect, asyncHandler(async (req, res) => {
  const { property_id } = req.body;
  const user_id = req.user.id;

  // Check if property exists
  const property = await findOne('properties', { id: property_id, is_active: true });
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if already favorited
  const existingFavorite = await findOne('favorites', { user_id, property_id });
  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: 'Property already in favorites'
    });
  }

  // Add to favorites
  await insert('favorites', { user_id, property_id });

  res.status(201).json({
    success: true,
    message: 'Property added to favorites'
  });
}));

// Remove property from favorites
router.delete('/:propertyId', protect, validateId, asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const user_id = req.user.id;

  // Check if favorite exists
  const favorite = await findOne('favorites', { user_id, property_id: propertyId });
  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  // Remove from favorites
  await remove('favorites', { user_id, property_id: propertyId });

  res.status(200).json({
    success: true,
    message: 'Property removed from favorites'
  });
}));

// Get user's favorites
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const user_id = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Get favorites with property details
  const query = `
    SELECT f.*, p.title, p.price, p.location, p.property_type, p.status, p.bedrooms, p.bathrooms, p.size,
    u.name as agent_name, u.email as agent_email,
    (SELECT COUNT(*) FROM property_images pi WHERE pi.property_id = p.id) as image_count,
    (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
    FROM favorites f
    JOIN properties p ON f.property_id = p.id
    JOIN users u ON p.agent_id = u.id
    WHERE f.user_id = ? AND p.is_active = TRUE
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { query: dbQuery } = require('../config/database');
  const favorites = await dbQuery(query, [user_id, parseInt(limit), offset]);

  // Get total count
  const totalCount = await count('favorites', { user_id });
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      favorites,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Check if property is favorited
router.get('/check/:propertyId', protect, validateId, asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const user_id = req.user.id;

  const favorite = await findOne('favorites', { user_id, property_id: propertyId });

  res.status(200).json({
    success: true,
    data: {
      is_favorited: !!favorite
    }
  });
}));

// Get favorite count for a property
router.get('/count/:propertyId', validateId, asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const favoriteCount = await count('favorites', { property_id: propertyId });

  res.status(200).json({
    success: true,
    data: {
      favorite_count: favoriteCount
    }
  });
}));

module.exports = router;
