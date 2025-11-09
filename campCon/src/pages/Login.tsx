import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [year, setYear] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Basic client validation
        if (!name.trim() || !college.trim()) {
          setError('Name and College are required')
          setLoading(false)
          return
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address')
          setLoading(false)
          return
        }
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }

        const { error } = await signUp(email.trim(), password, name.trim(), college.trim(), year?.trim(), department?.trim())
        if (error) {
          const msg = (error.message || '').toLowerCase()
          if (msg.includes('too many') || msg.includes('rate limit')) {
            setError('Too many signup attempts. Please wait a few minutes and try again.')
          } else if (msg.includes('confirm') || msg.includes('email')) {
            setError('Email confirmation may be required. Please check your email or disable it in Supabase Auth settings.')
          } else if (msg.includes('already') || msg.includes('registered')) {
            setError('Email already registered. Please sign in instead.')
          } else {
            setError(error.message || 'Unable to sign up. Please try again.')
          }
          setLoading(false)
          return
        }

        // Navigate after successful signup
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      } else {
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address')
          setLoading(false)
          return
        }
        if (!password) {
          setError('Please enter your password')
          setLoading(false)
          return
        }

        const { error } = await signIn(email.trim(), password)
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CC</span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Campus Connect</h1>
          <p className="text-silver-dark">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {error.toLowerCase().includes('rate limit') && (
                  <p className="text-sm mt-2 text-red-600">
                    Tip: If you already have an account, try signing in instead.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2nd Year"
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., CSE"
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
            />
            {isSignUp && (
              <p className="text-xs text-silver-dark mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white py-3 rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="text-navy hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

