import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Activity, AlertTriangle, Users, Lock, Search,
  Filter, Download, RefreshCw, ChevronLeft, ChevronRight,
  Clock, Globe, CheckCircle, XCircle,
  Key, Database, Settings, Info
} from 'lucide-react'
import { api } from '../lib/api'

interface ActivityLog {
  id: string
  action: string
  resource: string
  resourceId?: string
  adminName: string
  adminEmail: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

interface SecurityStats {
  totalLogins: number
  failedLogins: number
  uniqueIPs: number
  suspiciousActivity: number
  activeUsers: number
  lockedAccounts: number
}

export default function AdminSecurity() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [dateRange, setDateRange] = useState('24hours')

  useEffect(() => {
    fetchSecurityData()
  }, [currentPage, searchTerm, selectedAction, dateRange])

  const fetchSecurityData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedAction && { action: selectedAction })
      })
      
      const [logsData, statsData] = await Promise.all([
        api.get(`/admin/activity-logs?${params}`),
        // Mock security stats for now
        Promise.resolve({
          totalLogins: 1234,
          failedLogins: 45,
          uniqueIPs: 89,
          suspiciousActivity: 3,
          activeUsers: 156,
          lockedAccounts: 2
        })
      ])
      
      setActivityLogs(logsData.logs)
      setSecurityStats(statsData)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'LOGIN_FAILED': return <XCircle className="w-4 h-4 text-red-500" />
      case 'USER_LOCKED': return <Lock className="w-4 h-4 text-red-600" />
      case 'USER_UNLOCKED': return <Lock className="w-4 h-4 text-green-600" />
      case 'PASSWORD_RESET': return <Key className="w-4 h-4 text-orange-500" />
      case 'SECURITY_ALERT': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'DATA_EXPORT': return <Download className="w-4 h-4 text-blue-500" />
      case 'SETTINGS_UPDATED': return <Settings className="w-4 h-4 text-purple-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'text-green-600 bg-green-50'
      case 'LOGIN_FAILED': return 'text-red-600 bg-red-50'
      case 'USER_LOCKED': return 'text-red-600 bg-red-50'
      case 'USER_UNLOCKED': return 'text-green-600 bg-green-50'
      case 'PASSWORD_RESET': return 'text-orange-600 bg-orange-50'
      case 'SECURITY_ALERT': return 'text-red-600 bg-red-50'
      case 'DATA_EXPORT': return 'text-blue-600 bg-blue-50'
      case 'SETTINGS_UPDATED': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskLevel = (log: ActivityLog) => {
    if (log.action === 'LOGIN_FAILED' && log.ipAddress) return 'high'
    if (log.action === 'SECURITY_ALERT') return 'critical'
    if (log.action === 'USER_LOCKED') return 'medium'
    return 'low'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const exportLogs = () => {
    if (!activityLogs.length) return
    
    const csv = [
      ['Timestamp', 'Action', 'Admin', 'Email', 'IP Address', 'User Agent', 'Resource'],
      ...activityLogs.map(log => [
        formatDate(log.createdAt),
        log.action,
        log.adminName,
        log.adminEmail,
        log.ipAddress,
        log.userAgent,
        log.resource
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`
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
            <h1 className="font-display font-bold text-2xl text-navy">Security & Access Logs</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
            <button
              onClick={fetchSecurityData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      {securityStats && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  {securityStats.activeUsers} active
                </span>
              </div>
              <h3 className="text-2xl font-bold text-navy">{securityStats.totalLogins}</h3>
              <p className="text-text-muted">Total Logins</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-red-600 font-semibold">
                  {securityStats.failedLogins} failed
                </span>
              </div>
              <h3 className="text-2xl font-bold text-navy">{securityStats.failedLogins}</h3>
              <p className="text-text-muted">Failed Logins</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm text-orange-600 font-semibold">
                  {securityStats.suspiciousActivity} alerts
                </span>
              </div>
              <h3 className="text-2xl font-bold text-navy">{securityStats.suspiciousActivity}</h3>
              <p className="text-text-muted">Suspicious Activity</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-navy">{securityStats.uniqueIPs}</h3>
              <p className="text-text-muted">Unique IP Addresses</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-navy">{securityStats.lockedAccounts}</h3>
              <p className="text-text-muted">Locked Accounts</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-navy">System Status</h3>
              <p className="text-green-600 font-semibold">Secure</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-line px-6 py-4 mb-6 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search logs by admin name, email, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>
              
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
              >
                <option value="">All Actions</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="USER_LOCKED">User Locked</option>
                <option value="USER_UNLOCKED">User Unlocked</option>
                <option value="PASSWORD_RESET">Password Reset</option>
                <option value="SECURITY_ALERT">Security Alert</option>
                <option value="SETTINGS_UPDATED">Settings Updated</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
              >
                <option value="1hour">Last Hour</option>
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-line">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-muted" />
                          <span className="text-sm text-navy">{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-navy">{log.adminName}</div>
                          <div className="text-xs text-text-muted">{log.adminEmail}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-text-muted" />
                          <span className="text-sm text-navy">{log.ipAddress}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-muted">{log.resource}</span>
                        {log.resourceId && (
                          <span className="text-xs text-purple ml-1">#{log.resourceId}</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRiskColor(getRiskLevel(log))}`}>
                          {getRiskLevel(log).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-line flex items-center justify-between">
              <div className="text-sm text-text-muted">
                Showing page {currentPage} of activity logs
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 rounded-lg hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-card">
            <h3 className="font-display font-bold text-lg text-navy mb-4">Security Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Strengthen account security by requiring 2FA for all admin users
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Review Failed Login Attempts</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {securityStats.failedLogins} failed logins detected - investigate suspicious activity
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Regular Security Audits</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Schedule monthly security reviews and log analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">Update Password Policies</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Enforce strong password requirements and regular updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
