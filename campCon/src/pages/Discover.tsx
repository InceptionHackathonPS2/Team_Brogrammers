import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Discover() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
  const [suggestedEvents, setSuggestedEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDiscoverData()
    }
  }, [user])

  const fetchDiscoverData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        await fetchSuggestedUsers(profile)
        await fetchSuggestedEvents(profile)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching discover data:', err)
      setLoading(false)
    }
  }

  const fetchSuggestedUsers = async (profile: any) => {
    if (!user || !profile) return

    try {
      // Get user's skills and interests
      const userSkills = (profile.skills || []).map((s: string) => s.toLowerCase())
      const userInterests = (profile.interests || []).map((i: string) => i.toLowerCase())

      // Fetch all other users
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .limit(50)

      if (!allUsers) return

      // Score users based on matching skills and interests
      const scoredUsers = allUsers.map((otherUser: any) => {
        const otherSkills = (otherUser.skills || []).map((s: string) => s.toLowerCase())
        const otherInterests = (otherUser.interests || []).map((i: string) => i.toLowerCase())

        // Calculate match score
        let score = 0
        const matchingSkills = userSkills.filter((skill: string) =>
          otherSkills.some((os: string) => os.includes(skill) || skill.includes(os))
        )
        const matchingInterests = userInterests.filter((interest: string) =>
          otherInterests.some((oi: string) => oi.includes(interest) || interest.includes(oi))
        )

        score = matchingSkills.length * 2 + matchingInterests.length

        return {
          ...otherUser,
          matchScore: score,
          matchingSkills,
          matchingInterests,
        }
      })

      // Sort by score and get top 6
      const suggested = scoredUsers
        .filter((u) => u.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6)

      setSuggestedUsers(suggested)
    } catch (err) {
      console.error('Error fetching suggested users:', err)
    }
  }

  const fetchSuggestedEvents = async (profile: any) => {
    if (!user || !profile) return

    try {
      // Get user's skills and interests
      const userSkills = (profile.skills || []).map((s: string) => s.toLowerCase())
      const userInterests = (profile.interests || []).map((i: string) => i.toLowerCase())
      const allUserTags = [...userSkills, ...userInterests]

      // Fetch upcoming events
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20)

      if (!allEvents) return

      // Score events based on matching domains
      const scoredEvents = allEvents.map((event: any) => {
        const eventDomains = (event.domains || []).map((d: string) => d.toLowerCase())

        // Calculate match score
        let score = 0
        const matchingDomains = allUserTags.filter((tag: string) =>
          eventDomains.some((domain: string) => domain.includes(tag) || tag.includes(domain))
        )

        score = matchingDomains.length

        return {
          ...event,
          matchScore: score,
          matchingDomains,
        }
      })

      // Sort by score and date, get top 6
      const suggested = scoredEvents
        .filter((e) => e.matchScore > 0)
        .sort((a, b) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore
          }
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
        .slice(0, 6)

      setSuggestedEvents(suggested)
    } catch (err) {
      console.error('Error fetching suggested events:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-silver-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-silver-dark">Loading suggestions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Discover</h1>
          <p className="text-silver-dark text-lg">
            Find people and events that match your interests
          </p>
        </div>

        {/* Suggested People */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Suggested People</h2>
              <p className="text-silver-dark text-sm mt-1">
                Based on your skills and interests
              </p>
            </div>
          </div>

          {suggestedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedUsers.map((suggestedUser: any) => (
                <div
                  key={suggestedUser.id}
                  className="border border-silver rounded-lg p-4 hover:shadow-md transition-shadow bg-silver-light"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">
                        {suggestedUser.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black text-lg truncate">
                        {suggestedUser.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-silver-dark truncate">
                        {suggestedUser.college || 'Unknown College'}
                      </p>
                      {suggestedUser.department && (
                        <p className="text-xs text-silver-dark">{suggestedUser.department}</p>
                      )}
                    </div>
                  </div>

                  {suggestedUser.bio && (
                    <p className="text-sm text-silver-dark mb-3 line-clamp-2">
                      {suggestedUser.bio}
                    </p>
                  )}

                  {/* Matching Skills */}
                  {suggestedUser.matchingSkills && suggestedUser.matchingSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-silver-dark mb-1">Common Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedUser.matchingSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-navy text-white text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Skills */}
                  {suggestedUser.skills && suggestedUser.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {suggestedUser.skills.slice(0, 4).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-silver-light text-black text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {suggestedUser.skills.length > 4 && (
                          <span className="px-2 py-1 text-silver-dark text-xs">
                            +{suggestedUser.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-silver">
                    <span className="text-xs text-silver-dark">
                      {suggestedUser.matchScore} match{suggestedUser.matchScore !== 1 ? 'es' : ''}
                    </span>
                    <button
                      onClick={() => navigate(`/procomm`)}
                      className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <p className="text-silver-dark">
                No suggestions available. Update your skills and interests in your profile!
              </p>
            </div>
          )}
        </div>

        {/* Suggested Events */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Suggested Events</h2>
              <p className="text-silver-dark text-sm mt-1">
                Based on your skills and interests
              </p>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-navy hover:underline text-sm"
            >
              View All Events
            </button>
          </div>

          {suggestedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="border border-silver rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
                  onClick={() => navigate(`/events`)}
                >
                  {/* Event Image */}
                  {event.image_url && (
                    <div className="w-full h-40 bg-silver-light overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-black text-lg flex-1">{event.title}</h3>
                      <span className="px-2 py-1 bg-navy text-white text-xs rounded flex-shrink-0 ml-2">
                        {event.event_type}
                      </span>
                    </div>

                    <p className="text-sm text-silver-dark mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-1 text-sm text-silver-dark mb-3">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Matching Domains */}
                    {event.matchingDomains && event.matchingDomains.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-silver-dark mb-1">Matches your interests:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.matchingDomains.slice(0, 2).map((domain: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event Domains */}
                    {event.domains && event.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.domains.slice(0, 3).map((domain: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-silver-light text-black text-xs rounded"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-silver">
                      <span className="text-xs text-silver-dark">
                        {event.matchScore} match{event.matchScore !== 1 ? 'es' : ''}
                      </span>
                      {event.registration_link && (
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                        >
                          Register
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📅</span>
              <p className="text-silver-dark">
                No suggested events. Update your skills and interests to see personalized recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

