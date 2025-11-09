import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [repoLink, setRepoLink] = useState<string>('')
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    if (!id) return

    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) {
        console.error('Error fetching project:', projectError)
        setLoading(false)
        return
      }

      if (projectData) {
        setProject(projectData)
      }

      // Fetch repo link
      const { data: privateData } = await supabase
        .from('project_private_data')
        .select('repo_link')
        .eq('project_id', id)
        .single()

      if (privateData?.repo_link) {
        setRepoLink(privateData.repo_link)
      }

      // Fetch project members
      const { data: membersData } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', id)

      if (membersData) {
        const membersWithUsers = await Promise.all(
          membersData.map(async (member) => {
            const { data: userData } = await supabase
              .from('users')
              .select('id, name, email, avatar_url, college')
              .eq('id', member.user_id)
              .single()

            return {
              ...member,
              user: userData || { id: member.user_id, name: 'Unknown', email: '', avatar_url: null, college: '' },
            }
          })
        )
        setMembers(membersWithUsers)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching project details:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-silver-light min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-silver-dark">Loading project details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 bg-silver-light min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-silver-dark text-lg mb-4">Project not found</p>
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="mb-6 flex items-center gap-2 text-silver-dark hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with Image */}
          {project.image_url && (
            <div className="w-full h-64 bg-silver-light overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="p-8">
            {/* Title and Metadata */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-black mb-3">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm text-silver-dark">
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                {project.status && (
                  <span className="px-3 py-1 bg-silver-light rounded-full">{project.status}</span>
                )}
              </div>
            </div>

            {/* GitHub Link */}
            {repoLink && (
              <div className="mb-6 p-4 bg-silver-light rounded-lg flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-silver-dark mb-1">GitHub Repository</p>
                  <a
                    href={repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy hover:underline font-medium break-all"
                  >
                    {repoLink}
                  </a>
                </div>
                <a
                  href={repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex-shrink-0"
                >
                  Open GitHub
                </a>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-3">Description</h2>
              <p className="text-silver-dark whitespace-pre-wrap leading-relaxed">{project.description}</p>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {project.required_skills && project.required_skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-silver-light text-black rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Looking For */}
            {project.looking_for && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-3">Looking For</h2>
                <p className="text-silver-dark whitespace-pre-wrap leading-relaxed">{project.looking_for}</p>
              </div>
            )}

            {/* Team Members */}
            {members.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-3">Team Members ({members.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 bg-silver-light rounded-lg"
                    >
                      <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-bold">
                          {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black">
                          {member.user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-silver-dark">{member.role}</p>
                        {member.user?.college && (
                          <p className="text-xs text-silver-dark">{member.user.college}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-silver">
              <div className="text-center">
                <p className="text-3xl font-bold text-black">{members.length}</p>
                <p className="text-sm text-silver-dark mt-1">Members</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-black">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-silver-dark mt-1">Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-black">
                  {project.status || 'Active'}
                </p>
                <p className="text-sm text-silver-dark mt-1">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

