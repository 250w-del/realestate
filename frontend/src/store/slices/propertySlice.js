import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import propertyService from '../../services/propertyService'

// Async thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await propertyService.getProperties(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties')
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyService.getPropertyById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property')
    }
  }
)

export const fetchProperty = createAsyncThunk(
  'properties/fetchProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyService.getPropertyById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property')
    }
  }
)

export const getPropertyById = createAsyncThunk(
  'properties/getPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyService.getPropertyById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property')
    }
  }
)

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, propertyData }, { rejectWithValue }) => {
    try {
      const response = await propertyService.updateProperty(id, propertyData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property')
    }
  }
)

export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeaturedProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await propertyService.getFeaturedProperties(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties')
    }
  }
)

export const fetchPropertiesByAgent = createAsyncThunk(
  'properties/fetchPropertiesByAgent',
  async ({ agentId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await propertyService.getPropertiesByAgent(agentId, params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent properties')
    }
  }
)

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await propertyService.createProperty(propertyData)
      return response.data
    } catch (error) {
      const data = error.response?.data
      const detail =
        Array.isArray(data?.errors) && data.errors.length
          ? data.errors.join(' ')
          : null
      return rejectWithValue(
        detail || data?.message || 'Failed to create property'
      )
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await propertyService.deleteProperty(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property')
    }
  }
)

export const searchProperties = createAsyncThunk(
  'properties/searchProperties',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await propertyService.searchProperties(searchParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

// Initial state
const initialState = {
  properties: [],
  featuredProperties: [],
  currentProperty: null,
  agentProperties: [],
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 12,
    has_next: false,
    has_prev: false,
  },
  searchFilters: {
    search: '',
    property_type: '',
    status: '',
    bedrooms: '',
    bathrooms: '',
    min_price: '',
    max_price: '',
    min_size: '',
    max_size: '',
    location: '',
    sort_by: 'created_at',
    sort_order: 'DESC',
  },
  isLoading: false,
  error: null,
  isSearching: false,
  searchResults: [],
}

// Slice
const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null
    },
    updateSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload }
    },
    resetSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    updatePropertyInList: (state, action) => {
      const { id, updatedProperty } = action.payload
      const index = state.properties.findIndex(p => p.id === id)
      if (index !== -1) {
        state.properties[index] = { ...state.properties[index], ...updatedProperty }
      }
    },
    removePropertyFromList: (state, action) => {
      const id = action.payload
      state.properties = state.properties.filter(p => p.id !== id)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false
        state.properties = action.payload.properties
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProperty = action.payload.property
        state.error = null
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.currentProperty = null
      })

      .addCase(getPropertyById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProperty = action.payload.property
        state.error = null
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.currentProperty = null
      })
      
      // Fetch Featured Properties
      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.isLoading = false
        state.featuredProperties = action.payload.properties
        state.error = null
      })
      .addCase(fetchFeaturedProperties.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.featuredProperties = []
      })
      
      // Fetch Properties by Agent
      .addCase(fetchPropertiesByAgent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPropertiesByAgent.fulfilled, (state, action) => {
        state.isLoading = false
        state.agentProperties = action.payload.properties
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchPropertiesByAgent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.agentProperties = []
      })
      
      // Create Property
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false
        state.properties.unshift(action.payload.property)
        state.error = null
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.properties.findIndex(p => p.id === action.payload.property.id)
        if (index !== -1) {
          state.properties[index] = action.payload.property
        }
        if (state.currentProperty?.id === action.payload.property.id) {
          state.currentProperty = action.payload.property
        }
        state.error = null
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isLoading = false
        state.properties = state.properties.filter(p => p.id !== action.payload)
        if (state.currentProperty?.id === action.payload) {
          state.currentProperty = null
        }
        state.error = null
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Search Properties
      .addCase(searchProperties.pending, (state) => {
        state.isSearching = true
        state.error = null
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.isSearching = false
        state.searchResults = action.payload.properties
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.isSearching = false
        state.error = action.payload
        state.searchResults = []
      })
  },
})

export const {
  clearError,
  clearCurrentProperty,
  updateSearchFilters,
  resetSearchFilters,
  clearSearchResults,
  updatePropertyInList,
  removePropertyFromList,
} = propertySlice.actions

export default propertySlice.reducer

// Selectors
export const selectProperties = (state) => state.properties.properties
export const selectFeaturedProperties = (state) => state.properties.featuredProperties
export const selectCurrentProperty = (state) => state.properties.currentProperty
export const selectAgentProperties = (state) => state.properties.agentProperties
export const selectPagination = (state) => state.properties.pagination
export const selectSearchFilters = (state) => state.properties.searchFilters
export const selectPropertyLoading = (state) => state.properties.isLoading
export const selectPropertyError = (state) => state.properties.error
export const selectIsSearching = (state) => state.properties.isSearching
export const selectSearchResults = (state) => state.properties.searchResults
