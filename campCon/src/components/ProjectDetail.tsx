import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface ProjectDetailProps {
  project: any
  onClose: () => void
  onUpdate?: () => void
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const [projectData, setProjectData] = useState<any>(project)
  const [repoLink, setRepoLink] = useState<string>('')
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectDetails()
  }, [project.id])

  const fetchProjectDetails = async () => {
    try {
      // Fetch repo link from project_private_data
      const { data: privateData } = await supabase
        .from('project_private_data')
        .select('repo_link')
        .eq('project_id', project.id)
        .single()

      if (privateData?.repo_link) {
        setRepoLink(privateData.repo_link)
      }

      // Fetch project members with user details
      const { data: membersData } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)

      if (membersData) {
        // Fetch user details for each member
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

      // Fetch updated project data
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single()

      if (projectData) {
        setProjectData(projectData)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching project details:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <p className="text-silver-dark">Loading...</p>
        </div>
      </div>
    )
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-silver p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-black mb-2">{projectData.title}</h2>
            <p className="text-silver-dark text-sm">
              Created {new Date(projectData.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-silver-dark hover:text-black text-3xl font-light ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-silver-light transition-colors cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {projectData.image_url && (
            <div className="w-full h-64 bg-silver-light rounded-lg overflow-hidden">
              <img
                src={projectData.image_url}
                alt={projectData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Multiple Images */}
          {projectData.image_urls && projectData.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {projectData.image_urls.map((url: string, idx: number) => (
                <div key={idx} className="w-full h-48 bg-silver-light rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`${projectData.title} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* GitHub Link */}
          {repoLink && (
            <div className="flex items-center gap-3 p-4 bg-silver-light rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-silver-dark">GitHub Repository</p>
                <a
                  href={repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy hover:underline font-medium"
                >
                  {repoLink}
                </a>
              </div>
              <a
                href={repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Open GitHub
              </a>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-black mb-3">Description</h3>
            <p className="text-silver-dark whitespace-pre-wrap">{projectData.description}</p>
          </div>

          {/* Tags */}
          {projectData.tags && projectData.tags.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-black mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {projectData.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-navy text-white rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {projectData.required_skills && projectData.required_skills.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-black mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {projectData.required_skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-silver-light text-black rounded-lg text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {projectData.looking_for && (
            <div>
              <h3 className="text-xl font-bold text-black mb-3">Looking For</h3>
              <p className="text-silver-dark whitespace-pre-wrap">{projectData.looking_for}</p>
            </div>
          )}

          {/* Team Members */}
          {members.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-black mb-3">Team Members ({members.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-silver-light rounded-lg"
                  >
                    <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black text-sm">
                        {member.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-silver-dark">{member.role}</p>
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
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-silver">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{members.length}</p>
              <p className="text-sm text-silver-dark">Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">
                {new Date(projectData.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-silver-dark">Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">
                {projectData.status || 'Active'}
              </p>
              <p className="text-sm text-silver-dark">Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

