import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          navigate('/login?error=auth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session, redirect to login
          navigate('/login')
        }
      } catch (err) {
        console.error('Error in auth callback:', err)
        navigate('/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-silver-light">
      <div className="text-center">
        <p className="text-silver-dark">Verifying your email...</p>
      </div>
    </div>
  )
}

