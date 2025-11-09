import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    college: '',
    year: '',
    department: '',
    bio: '',
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setUserProfile(data)
      setEditForm({
        name: data.name || '',
        college: data.college || '',
        year: data.year || '',
        department: data.department || '',
        bio: data.bio || '',
      })
    }
    setLoading(false)
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update(editForm)
        .eq('id', user.id)

      if (error) throw error

      setIsEditing(false)
      fetchProfile()
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    }
  }

  const handleAddSkill = async () => {
    if (!user || !newSkill.trim()) return

    try {
      const currentSkills = userProfile?.skills || []
      const updatedSkills = [...currentSkills, newSkill.trim()]

      const { error } = await supabase
        .from('users')
        .update({ skills: updatedSkills })
        .eq('id', user.id)

      if (error) throw error

      setNewSkill('')
      setShowSkillsModal(false)
      fetchProfile()
    } catch (error: any) {
      alert('Error adding skill: ' + error.message)
    }
  }

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user) return

    try {
      const currentSkills = userProfile?.skills || []
      const updatedSkills = currentSkills.filter((s: string) => s !== skillToRemove)

      const { error } = await supabase
        .from('users')
        .update({ skills: updatedSkills })
        .eq('id', user.id)

      if (error) throw error

      fetchProfile()
    } catch (error: any) {
      alert('Error removing skill: ' + error.message)
    }
  }

  const handleAddInterest = async () => {
    if (!user || !newInterest.trim()) return

    try {
      const currentInterests = userProfile?.interests || []
      const updatedInterests = [...currentInterests, newInterest.trim()]

      const { error } = await supabase
        .from('users')
        .update({ interests: updatedInterests })
        .eq('id', user.id)

      if (error) throw error

      setNewInterest('')
      setShowInterestsModal(false)
      fetchProfile()
    } catch (error: any) {
      alert('Error adding interest: ' + error.message)
    }
  }

  const handleRemoveInterest = async (interestToRemove: string) => {
    if (!user) return

    try {
      const currentInterests = userProfile?.interests || []
      const updatedInterests = currentInterests.filter((i: string) => i !== interestToRemove)

      const { error } = await supabase
        .from('users')
        .update({ interests: updatedInterests })
        .eq('id', user.id)

      if (error) throw error

      fetchProfile()
    } catch (error: any) {
      alert('Error removing interest: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-silver-light min-h-screen flex items-center justify-center">
        <p className="text-silver-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Profile</h1>
            <p className="text-silver-dark">Manage your account and showcase your skills</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-lg p-8 shadow-md mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">College</label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Year</label>
                  <input
                    type="text"
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    placeholder="e.g., 2nd Year"
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    placeholder="e.g., CSE"
                    className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateProfile}
                  className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    fetchProfile()
                  }}
                  className="px-6 py-2 border border-silver rounded-lg hover:bg-silver-light transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-black mb-2">
                  {userProfile?.name || 'User'}
                </h2>
                <div className="space-y-1 text-silver-dark">
                  {userProfile?.college && (
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <span>{userProfile.college}</span>
                    </div>
                  )}
                  {(userProfile?.year || userProfile?.department) && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>
                        {userProfile?.department}
                        {userProfile?.year && ` - ${userProfile.year}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Card */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span>💻</span>
                <h2 className="text-xl font-bold text-black">Skills</h2>
              </div>
              <p className="text-sm text-silver-dark">Your technical expertise</p>
            </div>
            <button
              onClick={() => setShowSkillsModal(true)}
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy-light transition-colors"
            >
              + Add Skills
            </button>
          </div>
          {userProfile?.skills && userProfile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-silver-light text-black rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-silver-dark hover:text-black"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-silver-dark mb-4">No skills added yet</p>
            </div>
          )}
        </div>

        {/* Interests Card */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span>❤️</span>
                <h2 className="text-xl font-bold text-black">Interests</h2>
              </div>
              <p className="text-sm text-silver-dark">What you're passionate about</p>
            </div>
            <button
              onClick={() => setShowInterestsModal(true)}
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy-light transition-colors"
            >
              + Add Interest
            </button>
          </div>
          {userProfile?.interests && userProfile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-silver-light text-black rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-silver-dark hover:text-black"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">❤️</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Add Skill</h2>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="text-silver-dark hover:text-black text-2xl"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., React, Python, Machine Learning"
              className="w-full px-4 py-2 border border-silver rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-navy"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSkill()
                }
              }}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowSkillsModal(false)}
                className="flex-1 px-4 py-2 border border-silver rounded-lg hover:bg-silver-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="flex-1 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Interests Modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Add Interest</h2>
              <button
                onClick={() => setShowInterestsModal(false)}
                className="text-silver-dark hover:text-black text-2xl"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="e.g., AI/ML, Web Development, Photography"
              className="w-full px-4 py-2 border border-silver rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-navy"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddInterest()
                }
              }}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowInterestsModal(false)}
                className="flex-1 px-4 py-2 border border-silver rounded-lg hover:bg-silver-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInterest}
                className="flex-1 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

