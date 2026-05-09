import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'
import { User, Mail, Award, Flame, Target, Edit2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    target_exam: user?.target_exam || ''
  })

  const handleSave = async () => {
    try {
      await api.patch('/users/me', formData)
      updateUser(formData)
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="btn-secondary"
        >
          {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card p-6">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="mt-2 badge badge-primary capitalize">{user?.role}</span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Target Exam:</span>
              <span className="font-medium capitalize">{user?.target_exam || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Level:</span>
              <span className="font-medium">{user?.proficiency_level}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Flame className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Referral Code:</span>
              <span className="font-medium font-mono">{user?.referral_code}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="card p-6 md:col-span-2">
            <h3 className="font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  disabled
                />
              </div>
              <div>
                <label className="label">Target Exam</label>
                <select
                  className="input"
                  value={formData.target_exam}
                  onChange={(e) => setFormData({ ...formData, target_exam: e.target.value })}
                >
                  <option value="">Select exam</option>
                  <option value="toefl">TOEFL iBT</option>
                  <option value="duolingo">Duolingo English Test</option>
                  <option value="tcf">TCF (French)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
