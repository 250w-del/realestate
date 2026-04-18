import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user info')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed')
    }
  }
)

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password update failed')
    }
  }
)

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const json = await authService.uploadAvatar(file)
      return json.data?.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload profile photo'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return {}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
}

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('token')
      if (token) {
        state.token = token
        state.isAuthenticated = true
      }
      state.isInitialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) state.user = action.payload
        state.error = null
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        // Still logout even if API call fails
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
      })
  },
})

export const { clearError, setCredentials, logout: logoutAction, initializeAuth } = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectIsInitialized = (state) => state.auth.isInitialized
