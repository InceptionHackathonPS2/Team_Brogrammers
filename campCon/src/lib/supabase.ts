import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get the correct redirect URL based on environment
export function getRedirectUrl(): string {
  // In production (Vercel), use the current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  // Fallback for SSR or if window is not available
  return import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/auth/callback`
    : 'http://localhost:5173/auth/callback'
}

