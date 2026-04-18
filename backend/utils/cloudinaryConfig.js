const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'real-estate',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `property-${req.user?.id || 'anonymous'}-${uniqueSuffix}`;
    },
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: parseInt(process.env.MAX_FILES) || 10 // 10 files default
  }
});

// Helper functions for Cloudinary operations
const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Get image info from Cloudinary
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image info from Cloudinary:', error);
    throw error;
  }
};

// Upload image buffer directly to Cloudinary
const uploadImageBuffer = async (buffer, publicId) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          public_id: publicId,
          folder: 'real-estate',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    return result;
  } catch (error) {
    console.error('Error uploading image buffer to Cloudinary:', error);
    throw error;
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, options = {}) => {
  const {
    width = 300,
    height = 200,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

// Bulk delete images
const deleteMultipleImages = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map(publicId => deleteImage(publicId))
    );
    return results;
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
};

// Create image gallery with different sizes
const createImageGallery = async (publicId) => {
  try {
    const sizes = [
      { name: 'thumbnail', width: 300, height: 200 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1200, height: 800 }
    ];

    const gallery = {};
    
    for (const size of sizes) {
      gallery[size.name] = getOptimizedImageUrl(publicId, {
        width: size.width,
        height: size.height
      });
    }

    return gallery;
  } catch (error) {
    console.error('Error creating image gallery:', error);
    throw error;
  }
};

// Validate Cloudinary configuration
const validateConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }
};

// Test Cloudinary connection
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    return result;
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadSingle,
  uploadMultiple,
  deleteImage,
  getImageInfo,
  uploadImageBuffer,
  getOptimizedImageUrl,
  getThumbnailUrl,
  deleteMultipleImages,
  createImageGallery,
  validateConfig,
  testConnection
};
