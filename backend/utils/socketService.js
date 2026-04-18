const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { findOne } = require('../config/database');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
  }

  // Initialize Socket.IO server
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('Socket.IO server initialized');
    return this.io;
  }

  // Setup authentication middleware
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await findOne('users', { id: decoded.id });
        
        if (!user || !user.is_active) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  // Setup event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} connected (${socket.id})`);
      
      // Store user connection
      this.connectedUsers.set(socket.user.id, socket.id);
      this.userSockets.set(socket.id, socket.user.id);

      // Join user to their personal room
      socket.join(`user_${socket.user.id}`);
      
      // Join agent to their agent room if they're an agent
      if (socket.user.role === 'agent') {
        socket.join(`agent_${socket.user.id}`);
      }

      // Join admin to admin room if they're admin
      if (socket.user.role === 'admin') {
        socket.join('admin_room');
      }

      // Send online users list
      this.sendOnlineUsersList();

      // Handle joining property rooms
      socket.on('join_property', (propertyId) => {
        socket.join(`property_${propertyId}`);
        console.log(`User ${socket.user.name} joined property room: ${propertyId}`);
      });

      // Handle leaving property rooms
      socket.on('leave_property', (propertyId) => {
        socket.leave(`property_${propertyId}`);
        console.log(`User ${socket.user.name} left property room: ${propertyId}`);
      });

      // Handle real-time messaging
      socket.on('send_message', async (data) => {
        await this.handleMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle viewing requests
      socket.on('viewing_request', async (data) => {
        await this.handleViewingRequest(socket, data);
      });

      // Handle property updates
      socket.on('property_update', (data) => {
        this.handlePropertyUpdate(socket, data);
      });

      // Handle user status updates
      socket.on('status_update', (status) => {
        this.handleStatusUpdate(socket, status);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.user.name}:`, error);
      });
    });
  }

  // Handle real-time messaging
  async handleMessage(socket, data) {
    try {
      const { receiver_id, property_id, message } = data;
      
      // Create message in database (you would implement this)
      // const messageData = await messageService.createMessage({
      //   sender_id: socket.user.id,
      //   receiver_id,
      //   property_id,
      //   message
      // });

      // Send to receiver if online
      const receiverSocketId = this.connectedUsers.get(receiver_id);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('new_message', {
          id: Date.now(), // temporary
          sender_id: socket.user.id,
          sender: {
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          receiver_id,
          property_id,
          message,
          created_at: new Date().toISOString()
        });
      }

      // Send confirmation to sender
      socket.emit('message_sent', {
        temp_id: Date.now(),
        status: 'sent'
      });

      console.log(`Message sent from ${socket.user.name} to user ${receiver_id}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  }

  // Handle typing indicators
  handleTypingStart(socket, data) {
    const { receiver_id, property_id } = data;
    
    // Send typing indicator to receiver
    const receiverSocketId = this.connectedUsers.get(receiver_id);
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('user_typing', {
        user_id: socket.user.id,
        user_name: socket.user.name,
        property_id,
        is_typing: true
      });
    }
  }

  handleTypingStop(socket, data) {
    const { receiver_id, property_id } = data;
    
    // Send stop typing indicator to receiver
    const receiverSocketId = this.connectedUsers.get(receiver_id);
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('user_typing', {
        user_id: socket.user.id,
        user_name: socket.user.name,
        property_id,
        is_typing: false
      });
    }
  }

  // Handle viewing requests
  async handleViewingRequest(socket, data) {
    try {
      const { property_id, agent_id, viewing_date } = data;
      
      // Create viewing request in database (you would implement this)
      // const viewing = await viewingService.createViewing({
      //   property_id,
      //   user_id: socket.user.id,
      //   agent_id,
      //   viewing_date
      // });

      // Notify agent if online
      const agentSocketId = this.connectedUsers.get(agent_id);
      if (agentSocketId) {
        this.io.to(agentSocketId).emit('new_viewing_request', {
          id: Date.now(), // temporary
          property_id,
          user: {
            id: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
            phone: socket.user.phone
          },
          viewing_date,
          created_at: new Date().toISOString()
        });
      }

      // Send confirmation to user
      socket.emit('viewing_request_sent', {
        status: 'pending',
        message: 'Viewing request sent to agent'
      });

      console.log(`Viewing request sent from ${socket.user.name} to agent ${agent_id}`);
    } catch (error) {
      console.error('Error handling viewing request:', error);
      socket.emit('viewing_request_error', { error: 'Failed to send viewing request' });
    }
  }

  // Handle property updates
  handlePropertyUpdate(socket, data) {
    const { property_id, update_type, update_data } = data;
    
    // Broadcast to users viewing this property
    this.io.to(`property_${property_id}`).emit('property_updated', {
      property_id,
      update_type,
      update_data,
      updated_by: {
        id: socket.user.id,
        name: socket.user.name,
        role: socket.user.role
      },
      timestamp: new Date().toISOString()
    });

    console.log(`Property ${property_id} updated by ${socket.user.name}`);
  }

  // Handle user status updates
  handleStatusUpdate(socket, status) {
    // Broadcast user status to relevant rooms
    socket.broadcast.emit('user_status_updated', {
      user_id: socket.user.id,
      user_name: socket.user.name,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Handle disconnection
  handleDisconnect(socket) {
    console.log(`User ${socket.user.name} disconnected`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.user.id);
    this.userSockets.delete(socket.id);
    
    // Send updated online users list
    this.sendOnlineUsersList();
    
    // Notify other users about disconnection
    socket.broadcast.emit('user_disconnected', {
      user_id: socket.user.id,
      user_name: socket.user.name
    });
  }

  // Send online users list to all connected users
  sendOnlineUsersList() {
    const onlineUsers = Array.from(this.connectedUsers.entries()).map(([userId, socketId]) => ({
      user_id: userId,
      socket_id: socketId,
      status: 'online'
    }));
    
    this.io.emit('online_users_updated', onlineUsers);
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Send notification to all agents
  sendNotificationToAgents(notification) {
    this.io.emit('agent_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to all admins
  sendNotificationToAdmins(notification) {
    this.io.to('admin_room').emit('admin_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to property viewers
  broadcastToProperty(propertyId, event, data) {
    this.io.to(`property_${propertyId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get online user count
  getOnlineUserCount() {
    return this.connectedUsers.size;
  }

  // Get online users by role
  getOnlineUsersByRole(role) {
    const users = [];
    for (const [userId, socketId] of this.connectedUsers) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.user && socket.user.role === role) {
        users.push({
          user_id: userId,
          socket_id: socketId,
          name: socket.user.name,
          email: socket.user.email,
          role: socket.user.role
        });
      }
    }
    return users;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get user socket ID
  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  // Emit system-wide notifications
  emitSystemNotification(notification) {
    this.io.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Handle real-time property analytics
  emitPropertyAnalytics(propertyId, analytics) {
    this.io.to(`property_${propertyId}`).emit('property_analytics', {
      property_id,
      analytics,
      timestamp: new Date().toISOString()
    });
  }

  // Handle real-time search updates
  emitSearchUpdate(searchData) {
    this.io.emit('search_update', {
      ...searchData,
      timestamp: new Date().toISOString()
    });
  }
}

// Create and export singleton instance
const socketService = new SocketService();

module.exports = socketService;
