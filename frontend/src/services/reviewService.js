import api from './api'

const reviewService = {
  // Get all reviews
  getReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params })
    return response.data
  },

  // Get review by ID
  getReviewById: async (id) => {
    const response = await api.get(`/reviews/${id}`)
    return response.data
  },

  // Create new review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData)
    return response.data
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  },

  // Approve review (admin only)
  approveReview: async (id) => {
    const response = await api.put(`/reviews/${id}/approve`)
    return response.data
  },

  // Reject review (admin only)
  rejectReview: async (id) => {
    const response = await api.put(`/reviews/${id}/reject`)
    return response.data
  },

  // Get reviews for a property
  getPropertyReviews: async (propertyId, params = {}) => {
    const response = await api.get(`/properties/${propertyId}/reviews`, { params })
    return response.data
  },

  // Get reviews by user
  getUserReviews: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/reviews`, { params })
    return response.data
  },

  // Mark review as helpful
  markHelpful: async (id) => {
    const response = await api.post(`/reviews/${id}/helpful`)
    return response.data
  },

  // Report review
  reportReview: async (id, reason) => {
    const response = await api.post(`/reviews/${id}/report`, { reason })
    return response.data
  }
}

export default reviewService
