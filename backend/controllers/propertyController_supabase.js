const { 
  findOne, 
  findMany, 
  insert, 
  update, 
  remove, 
  count, 
  search,
} = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all properties with pagination and filters (Supabase-compatible)
const getProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search: searchText,
    property_type,
    status,
    bedrooms,
    bathrooms,
    min_price,
    max_price,
    min_size,
    max_size,
    location,
    featured,
    agent_id,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const lim = parseInt(limit, 10) || 12;

  // Build conditions for Supabase
  const conditions = { is_active: true };
  if (property_type) conditions.property_type = property_type;
  if (status) conditions.status = status;
  if (bedrooms !== undefined && bedrooms !== '') conditions.bedrooms = parseInt(bedrooms, 10);
  if (bathrooms !== undefined && bathrooms !== '') conditions.bathrooms = parseInt(bathrooms, 10);
  if (agent_id) conditions.agent_id = parseInt(agent_id, 10);
  if (featured) conditions.is_featured = featured === 'true';

  // For price and size ranges, we'll need to filter after fetching
  // This is a limitation of the simplified Supabase approach
  let properties;
  
  if (searchText) {
    // Use search function for text search
    properties = await search('properties', searchText, conditions, '*', `${sort_by} ${sort_order}`, lim, offset);
  } else {
    // Use findMany for regular queries
    properties = await findMany('properties', conditions, '*', `${sort_by} ${sort_order}`, lim, offset);
  }

  // Apply price and size filters (client-side filtering)
  if (min_price || max_price || min_size || max_size || location) {
    properties = properties.filter(property => {
      if (min_price && property.price < parseFloat(min_price)) return false;
      if (max_price && property.price > parseFloat(max_price)) return false;
      if (min_size && property.size < parseFloat(min_size)) return false;
      if (max_size && property.size > parseFloat(max_size)) return false;
      if (location && !property.location.toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });
  }

  // Get total count
  const totalCount = await count('properties', conditions);

  // Get agent info and images for each property
  for (let property of properties) {
    // Get agent information
    const agent = await findOne('users', { id: property.agent_id }, 'id, name, email, phone, avatar, bio, company, license');
    property.agent_name = agent?.name;
    property.agent_email = agent?.email;
    property.agent_phone = agent?.phone;
    
    // Get property images
    const images = await findMany('property_images', { property_id: property.id }, '*', 'is_primary DESC, sort_order ASC');
    property.images = images;
    
    // Get statistics (simplified)
    property.favorites_count = await count('favorites', { property_id: property.id });
    property.reviews_count = await count('reviews', { property_id: property.id, is_approved: true });
    
    // Note: Average rating calculation would need a custom query, setting to 0 for now
    property.average_rating = 0;
  }

  const totalPages = Math.ceil(totalCount / lim) || 1;

  res.status(200).json({
    success: true,
    data: {
      properties,
      pagination: {
        current_page: parseInt(page, 10) || 1,
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: lim,
        has_next: (parseInt(page, 10) || 1) < totalPages,
        has_prev: (parseInt(page, 10) || 1) > 1
      }
    }
  });
});

// Get single property by ID
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get property
  const property = await findOne('properties', { id: id, is_active: true });
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Get agent information
  const agent = await findOne('users', { id: property.agent_id }, 'id, name, email, phone, avatar, bio, company, license');
  property.agent = agent;

  // Get property images
  const images = await findMany('property_images', { property_id: id }, '*', 'is_primary DESC, sort_order ASC');
  property.images = images;

  // Get property statistics
  const favorites_count = await count('favorites', { property_id: id });
  const reviews_count = await count('reviews', { property_id: id, is_approved: true });
  
  // Increment view count
  await update('properties', { views_count: property.views_count + 1 }, { id: id });

  // Check if property is favorited by current user (if authenticated)
  let is_favorited = false;
  if (req.user) {
    const favorite = await findOne('favorites', { user_id: req.user.id, property_id: id });
    is_favorited = !!favorite;
  }

  res.status(200).json({
    success: true,
    data: {
      property: {
        ...property,
        favorites_count,
        reviews_count,
        average_rating: '0.0', // Simplified for now
        is_favorited
      }
    }
  });
});

// Create new property
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    location,
    latitude,
    longitude,
    property_type,
    status,
    bedrooms,
    bathrooms,
    size,
    size_unit = 'sqft',
    year_built,
    parking_spaces,
    amenities,
    features
  } = req.body;

  const agent_id = req.user.id;

  // Create property
  const propertyData = {
    title,
    description,
    price,
    location,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    property_type,
    status,
    bedrooms: bedrooms || 0,
    bathrooms: bathrooms || 0,
    size,
    size_unit,
    year_built: year_built ?? null,
    parking_spaces: parking_spaces ?? 0,
    amenities: amenities ? JSON.stringify(amenities) : null,
    features: features ? JSON.stringify(features) : null,
    agent_id,
    is_active: true
  };

  const propertyId = await insert('properties', propertyData);

  // Get created property with agent info
  const property = await findOne('properties', { id: propertyId });
  const agent = await findOne('users', { id: property.agent_id }, 'id, name, email, phone, avatar, bio, company, license');
  property.agent = agent;

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: {
      property
    }
  });
});

// Update property
const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    location,
    latitude,
    longitude,
    property_type,
    status,
    bedrooms,
    bathrooms,
    size,
    size_unit,
    year_built,
    parking_spaces,
    amenities,
    features,
    is_featured
  } = req.body;

  // Check if property exists and user has permission
  const existingProperty = await findOne('properties', { id });
  
  if (!existingProperty) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check permissions (admin can edit any property, agents can only edit their own)
  if (req.user.role !== 'admin' && existingProperty.agent_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own properties'
    });
  }

  // Build update object
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (location !== undefined) updateData.location = location;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (property_type !== undefined) updateData.property_type = property_type;
  if (status !== undefined) updateData.status = status;
  if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
  if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
  if (size !== undefined) updateData.size = size;
  if (size_unit !== undefined) updateData.size_unit = size_unit;
  if (year_built !== undefined) updateData.year_built = year_built;
  if (parking_spaces !== undefined) updateData.parking_spaces = parking_spaces;
  if (amenities !== undefined) updateData.amenities = amenities ? JSON.stringify(amenities) : null;
  if (features !== undefined) updateData.features = features ? JSON.stringify(features) : null;
  if (is_featured !== undefined && req.user.role === 'admin') updateData.is_featured = is_featured;

  await update('properties', updateData, { id });

  // Get updated property with agent info
  const property = await findOne('properties', { id });
  const agent = await findOne('users', { id: property.agent_id }, 'id, name, email, phone, avatar, bio, company, license');
  property.agent = agent;

  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: {
      property
    }
  });
});

// Delete property
const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if property exists
  const existingProperty = await findOne('properties', { id });
  
  if (!existingProperty) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && existingProperty.agent_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own properties'
    });
  }

  // Delete related records first (Supabase should handle cascading, but let's be explicit)
  await remove('property_images', { property_id: id });
  await remove('favorites', { property_id: id });
  await remove('reviews', { property_id: id });
  await remove('property_viewings', { property_id: id });
  
  // Delete property
  await remove('properties', { id });

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

// Get featured properties
const getFeaturedProperties = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const properties = await findMany(
    'properties', 
    { is_featured: true, is_active: true },
    '*',
    'created_at DESC',
    limit
  );

  // Get agent info and images for each property
  for (let property of properties) {
    const agent = await findOne('users', { id: property.agent_id }, 'id, name, email, phone, avatar');
    property.agent = agent;
    
    const images = await findMany('property_images', { property_id: property.id }, '*', 'is_primary DESC, sort_order ASC', 3);
    property.images = images;
  }

  res.status(200).json({
    success: true,
    data: {
      properties
    }
  });
});

// Get properties by agent
const getPropertiesByAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { page = 1, limit = 12, status } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = { agent_id: agentId, is_active: true };
  
  if (status) conditions.status = status;

  const properties = await findMany('properties', conditions, '*', 'created_at DESC', limit, offset);
  const totalCount = await count('properties', conditions);

  // Get agent info
  const agent = await findOne('users', { id: agentId }, 'id, name, email, phone, avatar, bio, company, license');

  // Get images for each property
  for (let property of properties) {
    const images = await findMany('property_images', { property_id: property.id }, '*', 'is_primary DESC, sort_order ASC', 3);
    property.images = images;
  }

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      agent,
      properties,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertiesByAgent
};