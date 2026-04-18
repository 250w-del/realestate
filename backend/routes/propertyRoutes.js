const express = require('express');
const router = express.Router();

const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertiesByAgent
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validatePropertyCreation,
  validatePropertyUpdate,
  validateId,
  validateSearchQuery
} = require('../middleware/validationMiddleware');

// Public routes
router.get('/', validateSearchQuery, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/agent/:agentId', getPropertiesByAgent);
router.get('/:id', validateId, getPropertyById);

// Protected routes - require authentication
router.post('/', protect, authorize('agent', 'admin'), validatePropertyCreation, createProperty);
router.put('/:id', protect, validateId, validatePropertyUpdate, updateProperty);
router.delete('/:id', protect, authorize('agent', 'admin'), validateId, deleteProperty);

module.exports = router;
