import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()
    if (data) {
      setUserProfile(data)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    // Hard redirect to login to clear protected route state
    window.location.href = '/login'
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/discover', label: 'Discover', icon: '🔍' },
    { path: '/projects', label: 'Projects', icon: '💡' },
    { path: '/events', label: 'Events', icon: '📅' },
    { path: '/procomm', label: 'ProComm', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-silver-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">CC</span>
          </div>
          <span className="text-xl font-bold">Campus Connect</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive(item.path)
                ? 'bg-navy text-white'
                : 'text-silver hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-silver-dark">
        {userProfile && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {userProfile.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {userProfile.name || 'User'}
              </div>
              <div className="text-xs text-silver truncate">
                {userProfile.college || ''}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-silver hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span>→</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

