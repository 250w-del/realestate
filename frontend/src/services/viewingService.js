import api from './api'

const viewingService = {
  // Get all viewings for current user
  getViewings: async (params = {}) => {
    const response = await api.get('/viewings', { params })
    return response.data
  },

  // Get viewing by ID
  getViewingById: async (id) => {
    const response = await api.get(`/viewings/${id}`)
    return response.data
  },

  // Schedule new viewing
  scheduleViewing: async (viewingData) => {
    const response = await api.post('/viewings', viewingData)
    return response.data
  },

  // Update viewing status
  updateViewing: async (id, updateData) => {
    const response = await api.put(`/viewings/${id}`, updateData)
    return response.data
  },

  // Cancel viewing
  cancelViewing: async (id) => {
    const response = await api.delete(`/viewings/${id}`)
    return response.data
  },

  // Get viewings for a property
  getPropertyViewings: async (propertyId, params = {}) => {
    const response = await api.get(`/properties/${propertyId}/viewings`, { params })
    return response.data
  },

  // Get viewings for an agent
  getAgentViewings: async (agentId, params = {}) => {
    const response = await api.get(`/agents/${agentId}/viewings`, { params })
    return response.data
  }
}

export default viewingService
