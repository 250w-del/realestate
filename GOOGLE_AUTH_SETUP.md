# 🔐 Google Authentication Setup Guide

## Step 1: Configure Google OAuth in Supabase Dashboard

### 1.1 Go to Supabase Authentication Settings

1. Open your Supabase dashboard: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi
2. Click **Authentication** in the sidebar
3. Click **Providers** tab
4. Find **Google** and click the toggle to enable it

### 1.2 Get Google OAuth Credentials

You need to create a Google OAuth app:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Set **Authorized redirect URIs**:
   ```
   https://rmqmvkaerxxjqxxybkqi.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**

### 1.3 Configure in Supabase

Back in Supabase Authentication → Providers → Google:

1. **Enable Google provider**: Toggle ON
2. **Client ID**: Paste your Google Client ID
3. **Client Secret**: Paste your Google Client Secret
4. **Redirect URL**: Should auto-fill as:
   ```
   https://rmqmvkaerxxjqxxybkqi.supabase.co/auth/v1/callback
   ```
5. Click **Save**

## Step 2: Update Frontend for Google Auth

### 2.1 Install Supabase Client (if not already installed)

```bash
cd frontend
npm install @supabase/supabase-js
```

### 2.2 Create Supabase Client

Create `frontend/src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.3 Add Google Login Button

Example login component:

```jsx
import { supabase } from '../lib/supabase'

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Error:', error.message)
      }
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  return (
    <button 
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  )
}
```

### 2.4 Handle Auth Callback

Create `frontend/src/pages/auth/CallbackPage.jsx`:

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const CallbackPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error.message)
          navigate('/login?error=auth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Callback error:', error)
        navigate('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default CallbackPage
```

## Step 3: Backend Integration (Optional)

If you want to sync Google users with your existing user system:

### 3.1 Create Supabase Auth Webhook

Create `backend/routes/authWebhook.js`:

```javascript
const express = require('express');
const { insert, findOne, update } = require('../config/database');
const router = express.Router();

// Webhook to sync Supabase users with your database
router.post('/supabase-webhook', async (req, res) => {
  try {
    const { type, record } = req.body;
    
    if (type === 'INSERT' && record.table === 'auth.users') {
      // New user registered via Google
      const { id, email, user_metadata } = record;
      
      // Check if user already exists
      const existingUser = await findOne('users', { email });
      
      if (!existingUser) {
        // Create new user in your database
        await insert('users', {
          supabase_id: id,
          name: user_metadata.full_name || user_metadata.name || 'Google User',
          email: email,
          avatar: user_metadata.avatar_url || user_metadata.picture,
          role: 'user',
          is_verified: true, // Google users are pre-verified
          is_active: true
        });
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 3.2 Add Webhook Route

In `backend/server.js`, add:

```javascript
const authWebhook = require('./routes/authWebhook');
app.use('/api/webhook', authWebhook);
```

## Step 4: Frontend Auth Context

Create `frontend/src/contexts/AuthContext.jsx`:

```jsx
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Step 5: Update App.jsx

Wrap your app with the AuthProvider:

```jsx
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CallbackPage from './pages/auth/CallbackPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your existing routes */}
          <Route path="/auth/callback" element={<CallbackPage />} />
          {/* Other routes */}
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
```

## Step 6: Test Google Authentication

1. **Configure Google OAuth** in Google Cloud Console
2. **Enable Google provider** in Supabase
3. **Add Google login button** to your login page
4. **Test the flow**:
   - Click "Continue with Google"
   - Authorize with Google
   - Get redirected back to your app
   - User should be logged in

## Benefits of Supabase Google Auth

✅ **Secure**: OAuth 2.0 standard
✅ **No backend code needed**: Handled by Supabase
✅ **User management**: Automatic user creation
✅ **Session management**: Built-in JWT tokens
✅ **Profile data**: Access to Google profile info
✅ **Mobile ready**: Works with React Native too

## Next Steps

After setup:
1. Test Google login flow
2. Update your existing login/register pages
3. Handle user profiles from Google data
4. Optionally sync with your existing user system