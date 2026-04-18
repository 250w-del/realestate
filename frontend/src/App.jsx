import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Layout components
import Layout from './components/Layout/Layout'
import PublicLayout from './components/Layout/PublicLayout'

// Pages
import HomePage from './pages/HomePage'
import PropertyListingPage from './pages/PropertyListingPage'
import PropertyDetailsPage from './pages/PropertyDetailsPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CallbackPage from './pages/auth/CallbackPage'
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AgentDashboard from './pages/agent/AgentDashboard'
import AddPropertyPage from './pages/agent/AddPropertyPage'
import EditPropertyPage from './pages/agent/EditPropertyPage'
import AgentProfilePage from './pages/agent/AgentProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import MessagesPage from './pages/MessagesPage'
import ViewingsPage from './pages/ViewingsPage'
import ReviewsPage from './pages/ReviewsPage'
import SettingsPage from './pages/SettingsPage'

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated: reduxAuth, user: reduxUser, token, isLoading } = useSelector(state => state.auth)
  const { isAuthenticated: supabaseAuth, user: supabaseUser, loading: supabaseLoading } = useAuth()

  // Check if user is authenticated via either system
  const isAuthenticated = reduxAuth || supabaseAuth
  const user = reduxUser || supabaseUser
  const loading = isLoading || supabaseLoading

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <div className="spinner spinner-md" />
          <span className="text-sm">Loading your account...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If we have a token but user isn't loaded yet, wait.
  // This avoids blank/incorrect redirects on hard refresh.
  if (token && !reduxUser && !supabaseUser) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <div className="spinner spinner-md" />
          <span className="text-sm">Loading your account...</span>
        </div>
      </div>
    )
  }

  // For Supabase users, we don't have role-based access yet
  // So we'll allow access to all protected routes
  if (supabaseUser && !reduxUser) {
    return children
  }

  // For Redux users, check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

// Redirect /dashboard based on role (admin/agent/user)
const DashboardIndex = () => {
  const { user: reduxUser } = useSelector(state => state.auth)
  const { user: supabaseUser } = useAuth()

  const user = reduxUser || supabaseUser

  // For Supabase users (Google auth), show user dashboard by default
  if (supabaseUser && !reduxUser) {
    return <UserDashboard />
  }

  // For Redux users, redirect based on role
  if (user?.role === 'admin') {
    return <Navigate to="admin-dashboard" replace />
  }

  if (user?.role === 'agent') {
    return <Navigate to="agent-dashboard" replace />
  }

  return <UserDashboard />
}

// Public route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated: reduxAuth } = useSelector(state => state.auth)
  const { isAuthenticated: supabaseAuth, loading } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <div className="spinner spinner-md" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  const isAuthenticated = reduxAuth || supabaseAuth

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="properties" element={<PropertyListingPage />} />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
            <Route path="agents/:id" element={<AgentProfilePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
          </Route>

          {/* Auth routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Auth callback route */}
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Role-based dashboard (default) */}
            <Route index element={<DashboardIndex />} />
            
            {/* User specific routes */}
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="viewings" element={<ViewingsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Agent specific routes */}
            <Route path="add-property" element={
              <ProtectedRoute requiredRole="agent">
                <AddPropertyPage />
              </ProtectedRoute>
            } />
            
            <Route path="edit-property/:id" element={
              <ProtectedRoute requiredRole="agent">
                <EditPropertyPage />
              </ProtectedRoute>
            } />

            <Route path="agent-dashboard" element={
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            } />

            {/* Admin specific routes */}
            <Route path="admin-dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="btn btn-primary"
                >
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
