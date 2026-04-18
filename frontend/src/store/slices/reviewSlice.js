import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import reviewService from '../../services/reviewService'

// Async thunks
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviews(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews')
    }
  }
)

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview(reviewData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review')
    }
  }
)

export const approveReview = createAsyncThunk(
  'reviews/approveReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewService.approveReview(reviewId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve review')
    }
  }
)

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(id, reviewData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review')
    }
  }
)

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review')
    }
  }
)

// Initial state
const initialState = {
  reviews: [],
  currentReview: null,
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
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentReview: (state) => {
      state.currentReview = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload.reviews || action.payload
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false
        state.reviews.unshift(action.payload)
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(review => review.id === action.payload.id)
        if (index !== -1) {
          state.reviews[index] = action.payload
        }
        if (state.currentReview?.id === action.payload.id) {
          state.currentReview = action.payload
        }
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(review => review.id !== action.payload)
        if (state.currentReview?.id === action.payload) {
          state.currentReview = null
        }
      })
      // Approve review
      .addCase(approveReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(review => review.id === action.payload.id)
        if (index !== -1) {
          state.reviews[index] = action.payload
        }
      })
  }
})

export default reviewSlice.reducer
