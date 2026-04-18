import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import favoriteService from '../../services/favoriteService'

// Async thunks
export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.addToFavorites(propertyId)
      return { propertyId, message: response.message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites')
    }
  }
)

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.removeFromFavorites(propertyId)
      return { propertyId, message: response.message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites')
    }
  }
)

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavorites(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites')
    }
  }
)

export const checkFavoriteStatus = createAsyncThunk(
  'favorites/checkFavoriteStatus',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.checkFavoriteStatus(propertyId)
      return { propertyId, isFavorited: response.data.is_favorited }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check favorite status')
    }
  }
)

export const getFavoriteCount = createAsyncThunk(
  'favorites/getFavoriteCount',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavoriteCount(propertyId)
      return { propertyId, count: response.data.favorite_count }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get favorite count')
    }
  }
)

// Initial state
const initialState = {
  favorites: [],
  favoriteStatus: {}, // { propertyId: boolean }
  favoriteCounts: {}, // { propertyId: number }
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
  },
  isLoading: false,
  error: null,
  isUpdating: false,
}

// Slice
const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearFavorites: (state) => {
      state.favorites = []
      state.favoriteStatus = {}
      state.favoriteCounts = {}
    },
    setFavoriteStatus: (state, action) => {
      const { propertyId, isFavorited } = action.payload
      state.favoriteStatus[propertyId] = isFavorited
    },
    updateFavoriteCount: (state, action) => {
      const { propertyId, count } = action.payload
      state.favoriteCounts[propertyId] = count
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isUpdating = false
        const { propertyId } = action.payload
        state.favoriteStatus[propertyId] = true
        
        // Update favorite count
        if (state.favoriteCounts[propertyId] !== undefined) {
          state.favoriteCounts[propertyId] += 1
        }
        
        state.error = null
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload
      })
      
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isUpdating = false
        const { propertyId } = action.payload
        state.favoriteStatus[propertyId] = false
        
        // Update favorite count
        if (state.favoriteCounts[propertyId] !== undefined) {
          state.favoriteCounts[propertyId] = Math.max(0, state.favoriteCounts[propertyId] - 1)
        }
        
        // Remove from favorites list
        state.favorites = state.favorites.filter(fav => fav.property_id !== propertyId)
        
        state.error = null
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload
      })
      
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false
        state.favorites = action.payload.favorites
        state.pagination = action.payload.pagination
        
        // Update favorite status for all properties
        action.payload.favorites.forEach(fav => {
          state.favoriteStatus[fav.property_id] = true
        })
        
        state.error = null
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.favorites = []
      })
      
      // Check Favorite Status
      .addCase(checkFavoriteStatus.pending, (state) => {
        // Don't set loading for this operation as it's usually quick
      })
      .addCase(checkFavoriteStatus.fulfilled, (state, action) => {
        const { propertyId, isFavorited } = action.payload
        state.favoriteStatus[propertyId] = isFavorited
      })
      .addCase(checkFavoriteStatus.rejected, (state, action) => {
        // Don't set error for this operation as it's not critical
        console.error('Failed to check favorite status:', action.payload)
      })
      
      // Get Favorite Count
      .addCase(getFavoriteCount.pending, (state) => {
        // Don't set loading for this operation as it's usually quick
      })
      .addCase(getFavoriteCount.fulfilled, (state, action) => {
        const { propertyId, count } = action.payload
        state.favoriteCounts[propertyId] = count
      })
      .addCase(getFavoriteCount.rejected, (state, action) => {
        // Don't set error for this operation as it's not critical
        console.error('Failed to get favorite count:', action.payload)
      })
  },
})

export const {
  clearError,
  clearFavorites,
  setFavoriteStatus,
  updateFavoriteCount,
} = favoriteSlice.actions

export default favoriteSlice.reducer

// Selectors
export const selectFavorites = (state) => state.favorites.favorites
export const selectFavoriteStatus = (state) => state.favorites.favoriteStatus
export const selectFavoriteCounts = (state) => state.favorites.favoriteCounts
export const selectFavoritePagination = (state) => state.favorites.pagination
export const selectFavoriteLoading = (state) => state.favorites.isLoading
export const selectFavoriteError = (state) => state.favorites.error
export const selectFavoriteUpdating = (state) => state.favorites.isUpdating

// Helper selectors
export const selectIsFavorited = (state, propertyId) => 
  state.favorites.favoriteStatus[propertyId] || false

export const selectFavoriteCount = (state, propertyId) => 
  state.favorites.favoriteCounts[propertyId] || 0

export const selectFavoriteProperties = (state) => 
  state.favorites.favorites.map(fav => fav.property)
