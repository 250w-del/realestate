import api from './api'

const propertyService = {
  // Get all properties with filters
  getProperties: async (params = {}) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== null && v !== undefined
      )
    )
    const response = await api.get('/properties', { params: cleaned })
    return response.data
  },

  // Get property by ID
  getPropertyById: async (id) => {
    const response = await api.get(`/properties/${id}`)
    return response.data
  },

  // Get featured properties
  getFeaturedProperties: async (params = {}) => {
    const response = await api.get('/properties/featured', { params })
    return response.data
  },

  // Get properties by agent
  getPropertiesByAgent: async (agentId, params = {}) => {
    const response = await api.get(`/properties/agent/${agentId}`, { params })
    return response.data
  },

  // Create new property
  createProperty: async (propertyData) => {
    const response = await api.post('/properties', propertyData)
    return response.data
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData)
    return response.data
  },

  // Delete property
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`)
    return response.data
  },

  // Search properties
  searchProperties: async (searchParams) => {
    const response = await api.get('/properties', { params: searchParams })
    return response.data
  },

  // Get property statistics
  getPropertyStats: async (id) => {
    const response = await api.get(`/properties/${id}/stats`)
    return response.data
  },

  // Get similar properties
  getSimilarProperties: async (id, params = {}) => {
    const response = await api.get(`/properties/${id}/similar`, { params })
    return response.data
  },

  // Get property recommendations
  getPropertyRecommendations: async (params = {}) => {
    const response = await api.get('/properties/recommendations', { params })
    return response.data
  },

  // Get property analytics (for agents/admins)
  getPropertyAnalytics: async (id, params = {}) => {
    const response = await api.get(`/properties/${id}/analytics`, { params })
    return response.data
  },

  // Upload property images
  uploadPropertyImages: async (propertyId, formData, onProgress = null) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      } : undefined,
    }
    
    const response = await api.post(`/upload/property-images/${propertyId}`, formData, config)
    return response.data
  },

  // Update property image
  updatePropertyImage: async (imageId, imageData) => {
    const response = await api.put(`/upload/property-image/${imageId}`, imageData)
    return response.data
  },

  // Delete property image
  deletePropertyImage: async (imageId) => {
    const response = await api.delete(`/upload/property-image/${imageId}`)
    return response.data
  },

  // Reorder property images
  reorderPropertyImages: async (propertyId, imageOrders) => {
    const response = await api.put(`/upload/property-images/${propertyId}/reorder`, { imageOrders })
    return response.data
  },
}

export default propertyService
