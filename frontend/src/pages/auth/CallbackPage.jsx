import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const CallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL params
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          setError(errorDescription || errorParam)
          setStatus('error')
          setTimeout(() => {
            navigate('/login?error=auth_failed')
          }, 3000)
          return
        }

        // Wait for auth state to be determined
        if (!loading) {
          if (user) {
            setStatus('success')
            
            // Determine redirect based on user role or default to dashboard
            const redirectTo = localStorage.getItem('auth_redirect') || '/dashboard'
            localStorage.removeItem('auth_redirect')
            
            setTimeout(() => {
              navigate(redirectTo, { replace: true })
            }, 1500)
          } else {
            setStatus('error')
            setError('Authentication failed - no user session found')
            setTimeout(() => {
              navigate('/login?error=no_session')
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Callback error:', error)
        setError('An unexpected error occurred during authentication')
        setStatus('error')
        setTimeout(() => {
          navigate('/login?error=callback_failed')
        }, 3000)
      }
    }

    // Only run callback handling when loading is complete
    if (!loading) {
      handleAuthCallback()
    }
  }, [user, loading, navigate, searchParams])

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Completing authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we sign you in with Google.
            </p>
          </div>
        )
      
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication successful!
            </h2>
            <p className="text-gray-600">
              Welcome! Redirecting you to your dashboard...
            </p>
          </div>
        )
      
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'An error occurred during authentication.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default CallbackPage