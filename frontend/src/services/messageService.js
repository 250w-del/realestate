import api from './api'

const messageService = {
  // Send message
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData)
    return response.data
  },

  // Get messages
  getMessages: async (params = {}) => {
    const response = await api.get('/messages', { params })
    return response.data
  },

  // Get message by ID
  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`)
    return response.data
  },

  // Mark message as read
  markAsRead: async (id) => {
    const response = await api.put(`/messages/${id}/read`)
    return response.data
  },

  // Delete message
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`)
    return response.data
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count')
    return response.data
  },

  // Get conversation between two users
  getConversation: async (userId, params = {}) => {
    const response = await api.get(`/messages/conversation/${userId}`, { params })
    return response.data
  },

  // Get message statistics
  getMessageStats: async () => {
    const response = await api.get('/messages/stats')
    return response.data
  },

  // Mark multiple messages as read
  markMultipleAsRead: async (messageIds) => {
    const response = await api.put('/messages/mark-read', { message_ids: messageIds })
    return response.data
  },

  // Archive messages
  archiveMessages: async (messageIds) => {
    const response = await api.put('/messages/archive', { message_ids: messageIds })
    return response.data
  },

  // Get archived messages
  getArchivedMessages: async (params = {}) => {
    const response = await api.get('/messages/archived', { params })
    return response.data
  },
}

export default messageService
