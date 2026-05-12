import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Filter, Download, RefreshCw, Eye, Edit, Trash2,
  MoreVertical, ChevronLeft, ChevronRight,
  Shield, Lock, Unlock, Crown, Star, TrendingUp, DollarSign,
  BookOpen, Activity, Settings, UserPlus, Calendar
} from 'lucide-react'
import { api } from '../lib/api'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  loyaltyTier: string
  points: number
  totalSpent: number
  createdAt: string
  lastActiveAt: string | null
  adminRole?: string
  isLocked?: boolean
  enrollmentsCount: number
  totalSpentOnCourses: number
}

interface UsersResponse {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminUsers() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, selectedRole])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole })
      })
      
      const data = await api.get(`/admin/users?${params}`)
      setUsersData(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return <Shield className="w-4 h-4 text-amber-600" />
      case 'SILVER': return <Star className="w-4 h-4 text-gray-400" />
      case 'GOLD': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'PLATINUM': return <TrendingUp className="w-4 h-4 text-purple-500" />
      case 'DIAMOND': return <Activity className="w-4 h-4 text-blue-500" />
      default: return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700'
      case 'ADMIN': return 'bg-orange-100 text-orange-700'
      case 'EDITOR': return 'bg-blue-100 text-blue-700'
      case 'MODERATOR': return 'bg-green-100 text-green-700'
      case 'VIEWER': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleToggleLock = async (userId: string, isLocked: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/lock`, { isLocked: !isLocked })
      fetchUsers()
    } catch (error) {
      console.error('Failed to toggle user lock:', error)
    }
  }

  const handleRoleUpdate = async (userId: string, role: string, permissions: string[]) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role, permissions })
      setShowRoleModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const exportUsers = () => {
    if (!usersData) return
    
    const csv = [
      ['Name', 'Email', 'Role', 'Loyalty Tier', 'Points', 'Total Spent', 'Enrollments', 'Created', 'Last Active'],
      ...usersData.users.map(user => [
        user.name,
        user.email,
        user.adminRole || 'User',
        user.loyaltyTier,
        user.points.toString(),
        `$${user.totalSpent.toFixed(2)}`,
        user.enrollmentsCount.toString(),
        formatDate(user.createdAt),
        formatDate(user.lastActiveAt)
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-line px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-purple hover:text-purple/90">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-2xl text-navy">User Management</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportUsers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-line px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Loyalty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-line">
                {usersData?.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-navy">{user.name}</div>
                          <div className="text-sm text-text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        {user.adminRole && (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.adminRole)}`}>
                            {user.adminRole.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTierIcon(user.loyaltyTier)}
                        <div>
                          <div className="text-sm font-medium text-navy">{user.loyaltyTier}</div>
                          <div className="text-xs text-text-muted">{user.points.toLocaleString()} pts</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm text-navy">${user.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-purple" />
                          <span className="text-sm text-text-muted">{user.enrollmentsCount} courses</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">Joined {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">Last {formatDate(user.lastActiveAt)}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.adminRole && (
                          <button
                            onClick={() => handleToggleLock(user.id, user.isLocked || false)}
                            className={`p-2 rounded-lg ${user.isLocked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-text-muted'} hover:bg-opacity-80`}
                          >
                            {user.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowRoleModal(true)
                          }}
                          className="p-2 bg-gray-100 text-text-muted rounded-lg hover:bg-gray-200"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        <div className="relative group">
                          <button className="p-2 bg-gray-100 text-text-muted rounded-lg hover:bg-gray-200">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-line opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Edit User
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {usersData && (
            <div className="px-6 py-4 border-t border-gray-line flex items-center justify-between">
              <div className="text-sm text-text-muted">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, usersData.pagination.total)} of {usersData.pagination.total} users
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(5, usersData.pagination.pages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${page === currentPage ? 'bg-purple text-white' : 'hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === usersData.pagination.pages}
                  className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-display font-bold text-xl text-navy mb-4">Update User Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">User</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-text-muted">{selectedUser.email}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Admin Role</label>
                <select className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple">
                  <option value="">No Admin Access</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Permissions</label>
                <div className="space-y-2">
                  {['View Dashboard', 'Manage Users', 'Edit Content', 'View Analytics'].map((permission) => (
                    <label key={permission} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-line rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoleUpdate(selectedUser.id, 'ADMIN', ['dashboard', 'users'])}
                className="flex-1 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
