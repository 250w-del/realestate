import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error.message)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session.user.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Email sign in error:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Email sign up error:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error.message)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error.message)
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Update password error:', error.message)
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    // Helper properties
    isAuthenticated: !!user,
    isLoading: loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}