import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, Users, DollarSign, BookOpen,
  Download, RefreshCw, ChevronLeft, Activity,
  Eye, Clock, Award, Target,
  FileText, Calendar, TrendingUp
} from 'lucide-react'
import { api } from '../lib/api'

interface AnalyticsData {
  userStats: {
    totalUsers: number
    newUsers: number
    activeUsers: number
  }
  courseStats: {
    totalCourses: number
    publishedCourses: number
    avgStudents: number
  }
  revenueStats: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
  }
  subscriptionStats: Array<{
    planType: string
    count: number
  }>
  engagementStats: Array<{
    metricType: string
    count: number
    avgValue: number
  }>
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, startDate, endDate])

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }
      
      const data = await api.get(`/admin/analytics?${params}`)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'LOGIN': return <Users className="w-4 h-4" />
      case 'LESSON_COMPLETED': return <BookOpen className="w-4 h-4" />
      case 'QUIZ_SCORE': return <Award className="w-4 h-4" />
      case 'TIME_SPENT': return <Clock className="w-4 h-4" />
      case 'SOCIAL_SHARE': return <Activity className="w-4 h-4" />
      case 'REFERRAL_CLICK': return <Target className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const exportReport = () => {
    if (!analyticsData) return
    
    const reportData = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.userStats.totalUsers.toString()],
      ['New Users', analyticsData.userStats.newUsers.toString()],
      ['Active Users', analyticsData.userStats.activeUsers.toString()],
      ['Total Courses', analyticsData.courseStats.totalCourses.toString()],
      ['Published Courses', analyticsData.courseStats.publishedCourses.toString()],
      ['Average Students per Course', analyticsData.courseStats.avgStudents?.toFixed(1) || '0'],
      ['Total Orders', analyticsData.revenueStats.totalOrders.toString()],
      ['Total Revenue', formatCurrency(analyticsData.revenueStats.totalRevenue)],
      ['Average Order Value', formatCurrency(analyticsData.revenueStats.avgOrderValue)]
    ]
    
    const csv = reportData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
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
            <h1 className="font-display font-bold text-2xl text-navy">Analytics & Reports</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white border-b border-gray-line px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-muted" />
            <span className="font-medium text-navy">Date Range:</span>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
              />
              <span className="text-text-muted">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-line px-6">
        <div className="flex items-center gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'engagement', label: 'Engagement', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple text-purple'
                  : 'border-transparent text-text-muted hover:text-navy'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {analyticsData && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-sm text-green-600 font-semibold">
                        +{analyticsData.userStats.newUsers}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy">
                      {formatNumber(analyticsData.userStats.totalUsers)}
                    </h3>
                    <p className="text-text-muted">Total Users</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-navy">
                      {formatCurrency(analyticsData.revenueStats.totalRevenue)}
                    </h3>
                    <p className="text-text-muted">Total Revenue</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-navy">
                      {analyticsData.courseStats.totalCourses}
                    </h3>
                    <p className="text-text-muted">Total Courses</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-navy">
                      {analyticsData.userStats.activeUsers}
                    </h3>
                    <p className="text-text-muted">Active Users</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <h3 className="font-display font-bold text-lg text-navy mb-4">Subscription Distribution</h3>
                    <div className="space-y-3">
                      {analyticsData.subscriptionStats.map((sub, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              sub.planType === 'BASIC' ? 'bg-blue-500' :
                              sub.planType === 'PREMIUM' ? 'bg-purple-500' :
                              sub.planType === 'ENTERPRISE' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}></div>
                            <span className="text-sm font-medium">{sub.planType}</span>
                          </div>
                          <span className="text-sm text-text-muted">{sub.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <h3 className="font-display font-bold text-lg text-navy mb-4">Revenue Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Total Orders</span>
                        <span className="font-semibold">{analyticsData.revenueStats.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Total Revenue</span>
                        <span className="font-semibold">{formatCurrency(analyticsData.revenueStats.totalRevenue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Average Order Value</span>
                        <span className="font-semibold">{formatCurrency(analyticsData.revenueStats.avgOrderValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">{formatNumber(analyticsData.userStats.totalUsers)}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">New Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">+{formatNumber(analyticsData.userStats.newUsers)}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Eye className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Active Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">{formatNumber(analyticsData.userStats.activeUsers)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Total Courses</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">{analyticsData.courseStats.totalCourses}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Eye className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Published</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{analyticsData.courseStats.publishedCourses}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Avg Students</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">
                      {analyticsData.courseStats.avgStudents?.toFixed(1) || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Total Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">
                      {formatCurrency(analyticsData.revenueStats.totalRevenue)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Total Orders</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">{analyticsData.revenueStats.totalOrders}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy">Avg Order Value</h3>
                    </div>
                    <p className="text-3xl font-bold text-navy">
                      {formatCurrency(analyticsData.revenueStats.avgOrderValue)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Tab */}
            {activeTab === 'engagement' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <h3 className="font-display font-bold text-lg text-navy mb-4">Engagement Metrics</h3>
                  <div className="space-y-4">
                    {analyticsData.engagementStats.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMetricIcon(metric.metricType)}
                          <div>
                            <p className="font-medium text-navy">
                              {metric.metricType.replace('_', ' ').toLowerCase()}
                            </p>
                            <p className="text-sm text-text-muted">
                              {metric.count} interactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-navy">
                            {metric.avgValue?.toFixed(1)}
                          </p>
                          <p className="text-sm text-text-muted">avg value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
