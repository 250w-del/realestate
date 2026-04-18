import api from './api'

const favoriteService = {
  // Add property to favorites
  addToFavorites: async (propertyId) => {
    const response = await api.post('/favorites', { property_id: propertyId })
    return response.data
  },

  // Remove property from favorites
  removeFromFavorites: async (propertyId) => {
    const response = await api.delete(`/favorites/${propertyId}`)
    return response.data
  },

  // Get user's favorites
  getFavorites: async (params = {}) => {
    const response = await api.get('/favorites', { params })
    return response.data
  },

  // Check if property is favorited
  checkFavoriteStatus: async (propertyId) => {
    const response = await api.get(`/favorites/check/${propertyId}`)
    return response.data
  },

  // Get favorite count for a property
  getFavoriteCount: async (propertyId) => {
    const response = await api.get(`/favorites/count/${propertyId}`)
    return response.data
  },

  // Get favorite statistics
  getFavoriteStats: async () => {
    const response = await api.get('/favorites/stats')
    return response.data
  },
}

export default favoriteService
