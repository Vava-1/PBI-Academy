import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, Users, DollarSign, BookOpen, Activity,
  Settings, FileText, Shield, Bell, Search,
  CheckCircle, XCircle,
  Home, Package, CreditCard,
  ChevronRight, Menu, X, LogOut, User
} from 'lucide-react'
import { api } from '../lib/api'

interface DashboardData {
  overview: {
    totalUsers: number
    newUsers30Days: number
    totalRevenue: number
    revenue30Days: number
    totalCourses: number
    activeSubscriptions: number
    revenueGrowth: number
  }
  charts: {
    userGrowth: Array<{ date: string, count: number }>
    revenueData: Array<{ date: string, revenue: number }>
  }
  recentActivity: Array<{
    id: string
    action: string
    resource: string
    adminName: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const data = await api.get('/admin/dashboard')
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'LOGIN_FAILED': return <XCircle className="w-4 h-4 text-red-500" />
      case 'USER_CREATED': return <User className="w-4 h-4 text-blue-500" />
      case 'PAGE_CREATED': return <FileText className="w-4 h-4 text-purple-500" />
      case 'SETTINGS_UPDATED': return <Settings className="w-4 h-4 text-orange-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-bg flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-line transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h2 className="font-display font-bold text-xl text-navy mb-6">Admin Panel</h2>
          
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 bg-purple/10 text-purple rounded-lg">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link to="/admin/users" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            
            <Link to="/admin/content" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <FileText className="w-5 h-5" />
              <span>Content</span>
            </Link>
            
            <Link to="/admin/courses" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <BookOpen className="w-5 h-5" />
              <span>Courses</span>
            </Link>
            
            <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            
            <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            
            <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            
            <Link to="/admin/security" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </Link>
            
            <Link to="/admin/notifications" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-text-muted">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-line px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="font-display font-bold text-2xl text-navy">Dashboard Overview</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {dashboardData && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-green-600 font-semibold">+{dashboardData.overview.newUsers30Days}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-navy">{dashboardData.overview.totalUsers.toLocaleString()}</h3>
                  <p className="text-text-muted">Total Users</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <span className={`text-sm font-semibold ${dashboardData.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.overview.revenueGrowth >= 0 ? '+' : ''}{dashboardData.overview.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-navy">{formatCurrency(dashboardData.overview.totalRevenue)}</h3>
                  <p className="text-text-muted">Total Revenue</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-navy">{dashboardData.overview.totalCourses}</h3>
                  <p className="text-text-muted">Total Courses</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-navy">{dashboardData.overview.activeSubscriptions}</h3>
                  <p className="text-text-muted">Active Subscriptions</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <h3 className="font-display font-bold text-lg text-navy mb-4">User Growth (30 Days)</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {dashboardData.charts.userGrowth.slice(-10).map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-purple rounded-t"
                          style={{ height: `${(data.count / Math.max(...dashboardData.charts.userGrowth.map(d => d.count))) * 100}%` }}
                        ></div>
                        <span className="text-xs text-text-muted mt-2">
                          {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-card">
                  <h3 className="font-display font-bold text-lg text-navy mb-4">Revenue (30 Days)</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {dashboardData.charts.revenueData.slice(-10).map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${(data.revenue / Math.max(...dashboardData.charts.revenueData.map(d => d.revenue))) * 100}%` }}
                        ></div>
                        <span className="text-xs text-text-muted mt-2">
                          {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg text-navy">Recent Activity</h3>
                  <button className="text-purple hover:text-purple/90 text-sm font-semibold">
                    View All <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-line last:border-0">
                      <div className="flex items-center gap-3">
                        {getActionIcon(activity.action)}
                        <div>
                          <p className="font-medium text-navy text-sm">{activity.action.replace('_', ' ')}</p>
                          <p className="text-xs text-text-muted">{activity.resource} • {activity.adminName}</p>
                        </div>
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Link to="/admin/users/new" className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-navy">Add User</h3>
                  </div>
                  <p className="text-sm text-text-muted">Create new user account</p>
                </Link>

                <Link to="/admin/content/new" className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-navy">Create Page</h3>
                  </div>
                  <p className="text-sm text-text-muted">Add new content page</p>
                </Link>

                <Link to="/admin/settings" className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Settings className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-navy">Settings</h3>
                  </div>
                  <p className="text-sm text-text-muted">Configure platform settings</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
