import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import propertySlice from './slices/propertySlice'
import favoriteSlice from './slices/favoriteSlice'
import messageSlice from './slices/messageSlice'
import viewingSlice from './slices/viewingSlice'
import reviewSlice from './slices/reviewSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    properties: propertySlice,
    favorites: favoriteSlice,
    messages: messageSlice,
    viewings: viewingSlice,
    reviews: reviewSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectProperties = (state) => state.properties.properties
export const selectFeaturedProperties = (state) => state.properties.featuredProperties
export const selectPropertyLoading = (state) => state.properties.loading
export const selectFavorites = (state) => state.favorites.favorites
export const selectMessages = (state) => state.messages.messages
export const selectViewings = (state) => state.viewings.viewings
export const selectReviews = (state) => state.reviews.reviews
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectTheme = (state) => state.ui.theme
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen

// UI Actions
export const toggleSidebar = () => ({ type: 'ui/toggleSidebar' })

export default store
