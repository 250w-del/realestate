const express = require('express');
const router = express.Router();

const { findOne, insert, findMany, update, count } = require('../config/database');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { validateMessage, validateId } = require('../middleware/validationMiddleware');

// Send message
router.post('/', protect, validateMessage, asyncHandler(async (req, res) => {
  const { receiver_id, property_id, subject, message } = req.body;
  const sender_id = req.user.id;

  // Check if recipient exists
  const recipient = await findOne('users', { id: receiver_id, is_active: true });
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient not found'
    });
  }

  // Check if property exists (if provided)
  if (property_id) {
    const property = await findOne('properties', { id: property_id, is_active: true });
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
  }

  // Prevent sending message to self
  if (sender_id === receiver_id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot send a message to yourself'
    });
  }

  // Create message
  const messageData = {
    sender_id,
    receiver_id,
    property_id: property_id || null,
    subject: subject || null,
    message
  };

  const messageId = await insert('messages', messageData);

  // Get created message with sender/receiver info
  const createdMessage = await findOne('messages', { id: messageId });
  
  // Get sender and recipient info
  const sender = await findOne('users', { id: sender_id }, 'id, name, email, avatar');
  const messageReceiver = await findOne('users', { id: receiver_id }, 'id, name, email, avatar');
  
  createdMessage.sender = sender;
  createdMessage.receiver = messageReceiver;

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message: createdMessage
    }
  });
}));

// Get user's messages (sent and received)
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type = 'all', property_id } = req.query;
  const user_id = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = '';
  let queryParams = [];

  if (type === 'sent') {
    whereClause = 'WHERE m.sender_id = ?';
    queryParams.push(user_id);
  } else if (type === 'received') {
    whereClause = 'WHERE m.receiver_id = ?';
    queryParams.push(user_id);
  } else {
    whereClause = 'WHERE m.sender_id = ? OR m.receiver_id = ?';
    queryParams.push(user_id, user_id);
  }

  if (property_id) {
    whereClause += ' AND m.property_id = ?';
    queryParams.push(property_id);
  }

  const query = `
    SELECT m.*, 
    s.name as sender_name, s.email as sender_email, s.avatar as sender_avatar,
    r.name as receiver_name, r.email as receiver_email, r.avatar as receiver_avatar,
    p.title as property_title, p.location as property_location
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    LEFT JOIN properties p ON m.property_id = p.id
    ${whereClause}
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { query: dbQuery } = require('../config/database');
  const messages = await dbQuery(query, [...queryParams, parseInt(limit), offset]);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM messages m
    ${whereClause}
  `;
  const countResult = await dbQuery(countQuery, queryParams);
  const totalCount = countResult[0].total;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

// Get single message by ID
router.get('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const message = await findOne('messages', { id });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is sender or receiver
  if (message.sender_id !== user_id && message.receiver_id !== user_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own messages'
    });
  }

  // Get sender and receiver info
  const sender = await findOne('users', { id: message.sender_id }, 'id, name, email, avatar');
  const receiver = await findOne('users', { id: message.receiver_id }, 'id, name, email, avatar');
  
  message.sender = sender;
  message.receiver = receiver;

  // Get property info if exists
  if (message.property_id) {
    const property = await findOne('properties', { id: message.property_id }, 'id, title, location');
    message.property = property;
  }

  res.status(200).json({
    success: true,
    data: {
      message
    }
  });
}));

// Mark message as read
router.put('/:id/read', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const message = await findOne('messages', { id });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only receiver can mark as read
  if (message.receiver_id !== user_id) {
    return res.status(403).json({
      success: false,
      message: 'Only the message recipient can mark it as read'
    });
  }

  // Update message
  await update('messages', { is_read: true }, { id });

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
}));

// Delete message
router.delete('/:id', protect, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const message = await findOne('messages', { id });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only sender can delete their own messages
  if (message.sender_id !== user_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own messages'
    });
  }

  await remove('messages', { id });

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// Get unread message count
router.get('/unread/count', protect, asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  const unreadCount = await count('messages', { receiver_id: user_id, is_read: false });

  res.status(200).json({
    success: true,
    data: {
      unread_count: unreadCount
    }
  });
}));

// Get conversation between two users
router.get('/conversation/:userId', protect, validateId, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Check if other user exists
  const otherUser = await findOne('users', { id: userId, is_active: true });
  if (!otherUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const query = `
    SELECT m.*, 
    s.name as sender_name, s.email as sender_email, s.avatar as sender_avatar,
    r.name as receiver_name, r.email as receiver_email, r.avatar as receiver_avatar,
    p.title as property_title, p.location as property_location
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    LEFT JOIN properties p ON m.property_id = p.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
    LIMIT ? OFFSET ?
  `;

  const { query: dbQuery } = require('../config/database');
  const messages = await dbQuery(query, [currentUserId, userId, userId, currentUserId, parseInt(limit), offset]);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM messages m
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
  `;
  const countResult = await dbQuery(countQuery, [currentUserId, userId, userId, currentUserId]);
  const totalCount = countResult[0].total;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      messages,
      other_user: otherUser,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: parseInt(limit)
      }
    }
  });
}));

module.exports = router;
