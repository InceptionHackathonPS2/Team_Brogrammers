import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    required_skills: '',
    looking_for: '',
    repo_link: '',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            user_id,
            role,
            users (
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return
      }

      if (data) {
        setProjects(data)
      }
    } catch (err) {
      console.error('Error in fetchProjects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `project-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        // If storage bucket doesn't exist, use image URL directly
        return null
      }

      const { data } = supabase.storage.from('project-images').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Error in handleImageUpload:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
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
          // Fallback: use the URL from form if upload fails
          imageUrl = formData.image_url || null
        }
      }

      // Get user profile for owner_name
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

      // Insert project with all required fields
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(t => t),
          domain_tags: formData.tags.split(',').map((t) => t.trim()).filter(t => t),
          required_skills: formData.required_skills.split(',').map((s) => s.trim()).filter(s => s),
          looking_for: formData.looking_for,
          image_url: imageUrl,
          created_by: user.id,
          owner_id: user.id,
          owner_name: userProfile?.name || 'Unknown',
          status: 'idea',
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Add owner to project_members
      await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: user.id,
        role: 'owner',
        is_owner: true,
      })

      // Add repo link if provided
      if (formData.repo_link) {
        await supabase.from('project_private_data').insert({
          project_id: project.id,
          repo_link: formData.repo_link,
        })
      }

      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        tags: '',
        required_skills: '',
        looking_for: '',
        repo_link: '',
        image_url: '',
      })
      setImageFile(null)
      setUploading(false)
      fetchProjects()
      alert('Project created successfully!')
    } catch (error: any) {
      console.error('Error creating project:', error)
      alert('Error creating project: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Projects</h1>
            <p className="text-silver-dark">Discover and collaborate on amazing projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-light transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-silver-dark">Loading...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <span className="text-6xl mb-4 block">💡</span>
            <p className="text-silver-dark text-lg">No projects yet. Create the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-silver flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">Create New Project</h2>
                <p className="text-silver-dark text-sm mt-1">
                  Share your idea and find collaborators
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-silver-dark hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., AI-powered Study Assistant"
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
                  placeholder="Describe your project idea..."
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., AI/ML, Web Dev, Mobile"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.required_skills}
                  onChange={(e) =>
                    setFormData({ ...formData, required_skills: e.target.value })
                  }
                  placeholder="e.g., Python, React, TensorFlow"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Looking For
                </label>
                <textarea
                  value={formData.looking_for}
                  onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                  rows={3}
                  placeholder="What kind of team members are you looking for?"
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Repository Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.repo_link}
                  onChange={(e) => setFormData({ ...formData, repo_link: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Project Image (optional)
                </label>
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
                  {uploading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

