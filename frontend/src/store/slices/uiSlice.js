import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
  theme: 'light', // 'light' | 'dark'
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchModalOpen: false,
  propertyModalOpen: false,
  loading: false,
  notifications: [],
  currentPage: 1,
  itemsPerPage: 12,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  filters: {
    propertyType: '',
    status: '',
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    location: '',
  },
  mapSettings: {
    center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
    zoom: 12,
    showMap: false,
  },
  propertyView: 'grid', // 'grid' | 'list' | 'map'
  language: 'en',
  currency: 'USD',
}

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },

    // Mobile Menu
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload
    },

    // Modals
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = action.payload
    },

    togglePropertyModal: (state) => {
      state.propertyModalOpen = !state.propertyModalOpen
    },
    setPropertyModalOpen: (state, action) => {
      state.propertyModalOpen = action.payload
    },

    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        autoClose: 5000,
        ...action.payload,
      }
      state.notifications.unshift(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload
    },

    // Sorting
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },

    // Filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },
    removeFilter: (state, action) => {
      const key = action.payload
      state.filters[key] = ''
    },

    // Map Settings
    updateMapSettings: (state, action) => {
      state.mapSettings = { ...state.mapSettings, ...action.payload }
    },
    setMapCenter: (state, action) => {
      state.mapSettings.center = action.payload
    },
    setMapZoom: (state, action) => {
      state.mapSettings.zoom = action.payload
    },
    toggleMapView: (state) => {
      state.mapSettings.showMap = !state.mapSettings.showMap
    },
    setMapView: (state, action) => {
      state.mapSettings.showMap = action.payload
    },

    // Property View
    setPropertyView: (state, action) => {
      state.propertyView = action.payload
    },

    // Language & Currency
    setLanguage: (state, action) => {
      state.language = action.payload
    },
    setCurrency: (state, action) => {
      state.currency = action.payload
    },

    // Reset UI state
    resetUIState: (state) => {
      return { ...initialState, theme: state.theme } // Preserve theme
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearchModal,
  setSearchModalOpen,
  togglePropertyModal,
  setPropertyModalOpen,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setCurrentPage,
  setItemsPerPage,
  setSortBy,
  setSortOrder,
  updateFilters,
  resetFilters,
  setFilter,
  removeFilter,
  updateMapSettings,
  setMapCenter,
  setMapZoom,
  toggleMapView,
  setMapView,
  setPropertyView,
  setLanguage,
  setCurrency,
  resetUIState,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen
export const selectSearchModalOpen = (state) => state.ui.searchModalOpen
export const selectPropertyModalOpen = (state) => state.ui.propertyModalOpen
export const selectLoading = (state) => state.ui.loading
export const selectNotifications = (state) => state.ui.notifications
export const selectCurrentPage = (state) => state.ui.currentPage
export const selectItemsPerPage = (state) => state.ui.itemsPerPage
export const selectSortBy = (state) => state.ui.sortBy
export const selectSortOrder = (state) => state.ui.sortOrder
export const selectFilters = (state) => state.ui.filters
export const selectMapSettings = (state) => state.ui.mapSettings
export const selectPropertyView = (state) => state.ui.propertyView
export const selectLanguage = (state) => state.ui.language
export const selectCurrency = (state) => state.ui.currency

// Helper selectors
export const selectActiveFilters = (state) => {
  const filters = state.ui.filters
  return Object.entries(filters).filter(([_, value]) => value !== '')
}

export const selectFilterCount = (state) => {
  return selectActiveFilters(state).length
}

export const selectIsDarkMode = (state) => state.ui.theme === 'dark'

export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(notification => !notification.read)
