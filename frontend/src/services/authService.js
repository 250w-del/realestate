import api from './api'

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Verify email (if implemented)
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/request-password-reset', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },
}

export default authService
