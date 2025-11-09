import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import EventCard from '../components/EventCard'

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [eventTypeFilter, setEventTypeFilter] = useState('All Types')
  const [domainFilter, setDomainFilter] = useState('All Domains')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Hackathon',
    date: '',
    domains: '',
    location: '',
    organizer: '',
    registration_link: '',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [eventTypeFilter, domainFilter])

  const fetchEvents = async () => {
    let query = supabase.from('events').select('*').order('date', { ascending: true })

    if (eventTypeFilter !== 'All Types') {
      query = query.eq('event_type', eventTypeFilter)
    }

    const { data } = await query

    if (data) {
      let filtered = data
      if (domainFilter !== 'All Domains') {
        filtered = data.filter((event) => {
          const eventDomains = event.domains || []
          return eventDomains.includes(domainFilter)
        })
      }
      setEvents(filtered)
    }
    setLoading(false)
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `event-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return null
      }

      const { data } = supabase.storage.from('event-images').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Error in handleImageUpload:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setUploading(true)

      // Upload image if provided
      let imageUrl: string | null = formData.image_url || null
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          imageUrl = formData.image_url || null
        }
      }

      const { error } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        date: formData.date,
        event_date: formData.date,
        domains: formData.domains.split(',').map((d) => d.trim()).filter(d => d),
        location: formData.location,
        organizer: formData.organizer,
        organizer_id: user.id,
        registration_link: formData.registration_link,
        image_url: imageUrl,
        created_by: user.id,
      })

      if (error) throw error

      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        event_type: 'Hackathon',
        date: '',
        domains: '',
        location: '',
        organizer: '',
        registration_link: '',
        image_url: '',
      })
      setImageFile(null)
      fetchEvents()
      alert('Event created successfully!')
    } catch (error: any) {
      console.error('Error creating event:', error)
      alert('Error creating event: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const eventTypes = ['All Types', 'Hackathon', 'Workshop', 'Competition', 'Seminar', 'Other']
  const allDomains = Array.from(
    new Set(
      events.flatMap((e) => e.domains || []).filter((d: string) => d && d.trim())
    )
  )

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Events</h1>
            <p className="text-silver-dark">Discover hackathons, workshops, and competitions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-light transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Event</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h2 className="text-xl font-bold text-black">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Event Type</label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Domain</label>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="All Domains">All Domains</option>
                {allDomains.map((domain: string) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-silver-dark">Loading...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-silver-dark text-lg">
              No events found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onUpdate={fetchEvents} />
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-silver flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">Add New Event</h2>
                <p className="text-silver-dark text-sm mt-1">
                  Share an upcoming event with the community
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-silver-dark hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., HackMIT 2025"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe the event..."
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Competition">Competition</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Domains (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.domains}
                  onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                  placeholder="e.g., AI/ML, Web Dev, IoT"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Online / Cambridge, MA"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Organizer</label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  required
                  placeholder="e.g., MIT Computer Science Club"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Registration Link
                </label>
                <input
                  type="url"
                  value={formData.registration_link}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_link: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Event Image (optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({ ...formData, image_url: reader.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {formData.image_url && !imageFile && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-silver rounded-lg text-black hover:bg-silver-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Creating...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

