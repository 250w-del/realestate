const express = require('express');
const router = express.Router();

const { findOne, insert, update, remove } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple, uploadSingle, wrapMulter, deleteImage, cloudinary } = require('../middleware/uploadMiddleware');

// Upload property images
router.post('/property-images/:propertyId', protect, wrapMulter(uploadMultiple('images', 10)), asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const user = req.user;

  // Check if property exists and user has permission
  const property = await findOne('properties', { id: propertyId });
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check permissions (admin can upload to any property, agents can only upload to their own)
  if (user.role !== 'admin' && property.agent_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only upload images to your own properties'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  // Check current image count
  const { count } = require('../config/database');
  const currentImageCount = await count('property_images', { property_id: propertyId });
  const maxImages = parseInt(process.env.MAX_PROPERTY_IMAGES) || 10;

  if (currentImageCount + req.files.length > maxImages) {
    return res.status(400).json({
      success: false,
      message: `Maximum ${maxImages} images allowed per property`
    });
  }

  const uploadedImages = [];

  // Process each uploaded file
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    
    let imageUrl, publicId;
    
    if (process.env.NODE_ENV === 'production') {
      // Cloudinary upload
      imageUrl = file.secure_url;
      publicId = file.public_id;
    } else {
      // Local upload - create a URL path
      imageUrl = `/uploads/${file.filename}`;
      publicId = null;
    }

    // Determine if this should be primary image (first image uploaded)
    const isPrimary = currentImageCount === 0 && i === 0;

    // Save to database
    const imageData = {
      property_id: propertyId,
      image_url: imageUrl,
      image_public_id: publicId,
      alt_text: file.originalname,
      is_primary: isPrimary,
      sort_order: currentImageCount + i
    };

    const imageId = await insert('property_images', imageData);
    const savedImage = await findOne('property_images', { id: imageId });
    uploadedImages.push(savedImage);
  }

  res.status(201).json({
    success: true,
    message: `${req.files.length} image(s) uploaded successfully`,
    data: {
      images: uploadedImages
    }
  });
}));

// Upload user avatar
router.post('/avatar', protect, wrapMulter(uploadSingle('avatar')), asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  let avatarUrl, publicId;
  
  if (process.env.NODE_ENV === 'production') {
    // Cloudinary upload
    avatarUrl = req.file.secure_url;
    publicId = req.file.public_id;
  } else {
    // Local upload
    avatarUrl = `/uploads/${req.file.filename}`;
    publicId = null;
  }

  // Delete old avatar if exists
  if (user.avatar) {
    try {
      if (user.avatar.startsWith('/uploads/')) {
        // Local file deletion would go here
        // fs.unlinkSync(path.join(__dirname, '..', user.avatar));
      } else if (publicId) {
        // Cloudinary deletion
        const oldPublicId = user.avatar.split('/').pop().split('.')[0];
        await deleteImage(oldPublicId);
      }
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }

  // Update user avatar in database
  await update('users', { avatar: avatarUrl }, { id: user.id });

  // Get updated user
  const updatedUser = await findOne('users', { id: user.id });
  const { password, ...userWithoutPassword } = updatedUser;

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      user: userWithoutPassword,
      avatar_url: avatarUrl
    }
  });
}));

// Update property image (set primary, update alt text, etc.)
router.put('/property-image/:imageId', protect, asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const { is_primary, alt_text, sort_order } = req.body;
  const user = req.user;

  // Get image with property info
  const image = await findOne('property_images', { id: imageId });
  
  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Get property to check permissions
  const property = await findOne('properties', { id: image.property_id });
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check permissions
  if (user.role !== 'admin' && property.agent_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit images of your own properties'
    });
  }

  const updateData = {};
  if (is_primary !== undefined) updateData.is_primary = is_primary;
  if (alt_text !== undefined) updateData.alt_text = alt_text;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

  // If setting as primary, unset other primary images
  if (is_primary) {
    await require('../config/database').update('property_images', { is_primary: false }, { property_id: image.property_id });
  }

  await update('property_images', updateData, { id: imageId });

  // Get updated image
  const updatedImage = await findOne('property_images', { id: imageId });

  res.status(200).json({
    success: true,
    message: 'Image updated successfully',
    data: {
      image: updatedImage
    }
  });
}));

// Delete property image
router.delete('/property-image/:imageId', protect, asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const user = req.user;

  // Get image with property info
  const image = await findOne('property_images', { id: imageId });
  
  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Get property to check permissions
  const property = await findOne('properties', { id: image.property_id });
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check permissions
  if (user.role !== 'admin' && property.agent_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete images of your own properties'
    });
  }

  // Delete from cloudinary if using cloudinary
  if (image.image_public_id && process.env.NODE_ENV === 'production') {
    try {
      await deleteImage(image.image_public_id);
    } catch (error) {
      console.error('Error deleting image from cloudinary:', error);
    }
  }

  // Delete from database
  await remove('property_images', { id: imageId });

  // If this was primary image, set another image as primary
  if (image.is_primary) {
    const remainingImages = await require('../config/database').findMany('property_images', { property_id: image.property_id }, '*', 'sort_order ASC', 1);
    if (remainingImages.length > 0) {
      await update('property_images', { is_primary: true }, { id: remainingImages[0].id });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
}));

// Reorder property images
router.put('/property-images/:propertyId/reorder', protect, asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { imageOrders } = req.body; // Array of { id: imageId, sort_order: newOrder }
  const user = req.user;

  // Check property permissions
  const property = await findOne('properties', { id: propertyId });
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (user.role !== 'admin' && property.agent_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only reorder images of your own properties'
    });
  }

  if (!Array.isArray(imageOrders) || imageOrders.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image orders provided'
    });
  }

  // Update each image's sort order
  for (const imageOrder of imageOrders) {
    if (imageOrder.id && imageOrder.sort_order !== undefined) {
      await update('property_images', { sort_order: imageOrder.sort_order }, { id: imageOrder.id });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Images reordered successfully'
  });
}));

// Get upload statistics (admin only)
router.get('/stats', protect, require('../middleware/authMiddleware').authorize('admin'), asyncHandler(async (req, res) => {
  const { count } = require('../config/database');

  const totalImages = await count('property_images');
  const totalUsers = await count('users');
  const usersWithAvatars = await count('users', 'avatar IS NOT NULL');

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total_property_images: totalImages,
        total_users: totalUsers,
        users_with_avatars: usersWithAvatars
      }
    }
  });
}));

module.exports = router;
