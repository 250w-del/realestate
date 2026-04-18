import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import viewingService from '../../services/viewingService'

// Async thunks
export const fetchViewings = createAsyncThunk(
  'viewings/fetchViewings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await viewingService.getViewings(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch viewings')
    }
  }
)

export const scheduleViewing = createAsyncThunk(
  'viewings/scheduleViewing',
  async (viewingData, { rejectWithValue }) => {
    try {
      const response = await viewingService.scheduleViewing(viewingData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule viewing')
    }
  }
)

export const updateViewing = createAsyncThunk(
  'viewings/updateViewing',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await viewingService.updateViewing(id, { status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update viewing')
    }
  }
)

export const cancelViewing = createAsyncThunk(
  'viewings/cancelViewing',
  async (id, { rejectWithValue }) => {
    try {
      const response = await viewingService.cancelViewing(id)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel viewing')
    }
  }
)

// Initial state
const initialState = {
  viewings: [],
  currentViewing: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

// Slice
const viewingSlice = createSlice({
  name: 'viewings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentViewing: (state) => {
      state.currentViewing = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch viewings
      .addCase(fetchViewings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchViewings.fulfilled, (state, action) => {
        state.loading = false
        state.viewings = action.payload.viewings || action.payload
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchViewings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Schedule viewing
      .addCase(scheduleViewing.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(scheduleViewing.fulfilled, (state, action) => {
        state.loading = false
        state.viewings.push(action.payload)
      })
      .addCase(scheduleViewing.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update viewing
      .addCase(updateViewing.fulfilled, (state, action) => {
        const index = state.viewings.findIndex(viewing => viewing.id === action.payload.id)
        if (index !== -1) {
          state.viewings[index] = action.payload
        }
        if (state.currentViewing?.id === action.payload.id) {
          state.currentViewing = action.payload
        }
      })
      // Cancel viewing
      .addCase(cancelViewing.fulfilled, (state, action) => {
        state.viewings = state.viewings.filter(viewing => viewing.id !== action.payload.id)
        if (state.currentViewing?.id === action.payload.id) {
          state.currentViewing = null
        }
      })
  }
})

export default viewingSlice.reducer
