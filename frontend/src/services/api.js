import axios from 'axios'

const resolveBaseURL = () => {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv) return fromEnv
  // Dev without env: use Vite proxy (vite.config.js server.proxy /api → :5000)
  if (import.meta.env.DEV) return '/api'
  return 'http://localhost:5000/api'
}

// Create axios instance
const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date()
    const duration = endTime - response.config.metadata.startTime
    console.log(`API Request to ${response.config.url} took ${duration}ms`)

    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden:', data.message)
          break
        case 404:
          // Not found
          console.error('Resource not found:', data.message)
          break
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded:', data.message)
          break
        case 500:
          // Server error
          console.error('Server error:', data.message)
          break
        default:
          console.error('API error:', data.message || 'Unknown error')
      }

      return Promise.reject(error)
    } else if (error.request) {
      // Network error - no response (offline, wrong URL, or API not running → ERR_CONNECTION_REFUSED)
      console.error('Network error:', error.message)
      const hint =
        import.meta.env.DEV
          ? ' Start the backend from the backend folder: npm run dev (port 5000).'
          : ' Please check your connection and try again.'
      return Promise.reject(
        new Error(`Cannot reach the API server.${hint}`)
      )
    } else {
      // Other error
      console.error('Request error:', error.message)
      return Promise.reject(error)
    }
  }
)

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
}

export const removeAuthToken = () => {
  localStorage.removeItem('token')
  delete api.defaults.headers.common['Authorization']
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Request wrapper with error handling
export const apiRequest = async (config) => {
  try {
    const response = await api(config)
    return response.data
  } catch (error) {
    throw error
  }
}

// File upload helper
export const uploadFile = async (file, onProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)

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

  try {
    const response = await api.post('/upload', formData, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Multiple file upload helper
export const uploadFiles = async (files, onProgress = null) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

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

  try {
    const response = await api.post('/upload/multiple', formData, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Property image upload
export const uploadPropertyImages = async (propertyId, formData, onProgress = null) => {
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

  try {
    const response = await api.post(`/upload/property-images/${propertyId}`, formData, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// API health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw error
  }
}

// Export the axios instance for direct use if needed
export default api
