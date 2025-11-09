import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getRedirectUrl } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string, college: string, year?: string, department?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    name: string,
    college: string,
    year?: string,
    department?: string
  ) => {
    // Validate email
    const trimmedEmail = email?.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { error: { message: 'Please enter a valid email address' } }
    }

    // Validate password
    if (!password || password.length < 6) {
      return { error: { message: 'Password must be at least 6 characters' } }
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (existingUser) {
      return { error: { message: 'Email already registered. Please sign in instead.' } }
    }

    // Create auth user
    const redirectUrl = getRedirectUrl()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, college },
      },
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() || ''
      if (msg.includes('rate limit')) {
        return { error: { ...authError, message: 'Too many attempts. Wait a few minutes and try again.' } }
      }
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return { error: { ...authError, message: 'Email already registered. Please sign in instead.' } }
      }
      return { error: authError }
    }

    // Insert user profile
    if (authData.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: trimmedEmail,
          name,
          college,
          year,
          department,
        })

      if (userError) return { error: userError }

      // Ensure we have a session; if not, sign in explicitly
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        })
        if (signInError) return { error: signInError }
      }
    }

    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email?.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { error: { message: 'Please enter a valid email address' } }
    }

    if (!password || password.length < 1) {
      return { error: { message: 'Please enter your password' } }
    }

    // Sign in with email and password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    })

    if (signInError) {
      const msg = signInError.message?.toLowerCase() || ''
      if (msg.includes('invalid login') || msg.includes('invalid') || msg.includes('user not found')) {
        return { error: { message: 'Invalid email or password. Please check your credentials.' } }
      }
      if (msg.includes('confirm') || msg.includes('email')) {
        return { error: { message: 'Email confirmation required. Please check your email and verify your account.' } }
      }
      return { error: { message: signInError.message || 'Unable to sign in. Please try again.' } }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

