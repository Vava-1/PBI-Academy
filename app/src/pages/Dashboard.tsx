import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Award, Flame, LayoutDashboard, Bot,
  Video, BarChart3, Settings, ChevronRight,
  Target, Zap, Trophy, CheckCircle, Circle
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import {
  weeklyProgress,
  skillBreakdown,
  scoreHistory,
  achievements,
  dailyChallenges
} from '../data'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

const sidebarLinks = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'courses', label: 'My Courses', icon: BookOpen },
  { key: 'ai-tutor', label: 'AI Tutor', icon: Bot },
  { key: 'live-classes', label: 'Live Classes', icon: Video },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'achievements', label: 'Achievements', icon: Award },
  { key: 'settings', label: 'Settings', icon: Settings },
]

interface DashboardStats {
  coursesInProgress: number
  completedLessons: number
  averageScore: number
  studyStreak: number
  totalPoints: number
  currentLevel: number
  rank: number
  percentile: number
}

interface Enrollment {
  id: string
  progress: number
  course: {
    id: string
    title: string
    slug: string
    image: string
    lessonsCount: number
    durationHours: number
    rating: number
    category: string
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    coursesInProgress: 0,
    completedLessons: 0,
    averageScore: 0,
    studyStreak: 0,
    totalPoints: 0,
    currentLevel: 1,
    rank: 0,
    percentile: 0,
  })
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([
      api.get('/dashboard/stats').then(setStats).catch(() => null),
      api.get('/dashboard/enrollments').then(setEnrollments).catch(() => []),
    ])
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab stats={stats} enrollments={enrollments} />
      case 'courses': return <CoursesTab enrollments={enrollments} />
      case 'ai-tutor': return <AITutorQuickTab />
      case 'live-classes': return <LiveClassesTab />
      case 'analytics': return <AnalyticsTab />
      case 'achievements': return <AchievementsTab />
      case 'settings': return <SettingsTab />
      default: return <OverviewTab stats={stats} enrollments={enrollments} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px]">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[72px] left-0 z-30 w-64 h-[calc(100vh-72px)] bg-white border-r border-gray-line overflow-y-auto transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-gray-bg rounded-xl">
              <img
                src={user?.avatar || '/instructor-3.jpg'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{user?.name}</p>
                <p className="text-xs text-text-muted">Level {stats.currentLevel}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sidebarLinks.map(link => (
                <button
                  key={link.key}
                  onClick={() => {
                    if (link.key === 'ai-tutor') {
                      window.location.href = '/ai-tutor'
                      return
                    }
                    setActiveTab(link.key)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === link.key
                      ? 'bg-purple/10 text-purple'
                      : 'text-navy hover:bg-gray-bg'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Stats mini */}
            <div className="mt-6 pt-6 border-t border-gray-line">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-bg rounded-lg p-3 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">{stats.studyStreak}</p>
                  <p className="text-[10px] text-text-muted">Day Streak</p>
                </div>
                <div className="bg-gray-bg rounded-lg p-3 text-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Points</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-line">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-navy">
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <p className="font-display font-semibold text-navy">Dashboard</p>
            <div className="w-9" />
          </div>

          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

// ============================================
// OVERVIEW TAB
// ============================================
function OverviewTab({ stats, enrollments }: { stats: DashboardStats; enrollments: Enrollment[] }) {
  const { user } = useAuth()
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-purple rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-white/80">
              You are on a {stats.studyStreak}-day streak. Keep it up!
            </p>
          </div>
          <Link
            to="/ai-tutor"
            className="px-5 py-2.5 bg-white text-purple font-semibold text-sm rounded-lg hover:bg-white/90 transition-colors inline-flex items-center gap-2 self-start"
          >
            <Zap className="w-4 h-4" />
            Study with AI Tutor
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Courses in Progress', value: stats.coursesInProgress, icon: BookOpen, color: 'bg-purple/10 text-purple' },
          { label: 'Completed Lessons', value: stats.completedLessons, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
          { label: 'Average Score', value: `${stats.averageScore}%`, icon: Target, color: 'bg-blue-100 text-blue-600' },
          { label: 'Study Streak', value: `${stats.studyStreak} days`, icon: Flame, color: 'bg-orange-100 text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-line shadow-card">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-2xl text-navy">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-navy">Continue Learning</h2>
            <button onClick={() => {}} className="text-sm text-purple hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {enrollments.slice(0, 3).map(enrollment => {
              const course = enrollment.course
              return (
                <Link
                  key={enrollment.id}
                  to={`/courses/${course.slug}`}
                  className="flex gap-4 bg-white rounded-xl p-4 border border-gray-line shadow-card hover:shadow-card-hover transition-all"
                >
                  <img src={course.image} alt={course.title} className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-navy truncate">{course.title}</h3>
                    <p className="text-xs text-text-muted mb-2">{course.category}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-purple rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-navy">{enrollment.progress}%</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Daily Challenges */}
        <div>
          <h2 className="font-display font-semibold text-lg text-navy mb-4">Daily Challenges</h2>
          <div className="bg-white rounded-xl border border-gray-line p-5 shadow-card space-y-4">
            {dailyChallenges.map(challenge => (
              <div key={challenge.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {challenge.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-line" />
                    )}
                    <span className={`text-sm ${challenge.completed ? 'text-text-muted line-through' : 'text-navy'}`}>
                      {challenge.title}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple">+{challenge.points}</span>
                </div>
                {!challenge.completed && (
                  <div className="ml-6">
                    <div className="h-1.5 bg-gray-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple rounded-full"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{challenge.progress}/{challenge.total}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="font-display font-semibold text-lg text-navy mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Start AI Tutor Session', icon: Bot, href: '/ai-tutor' },
                { label: 'Join Live Class', icon: Video, href: '/live-classes' },
                { label: 'View Leaderboard', icon: Trophy, href: '/leaderboard' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.href}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-line shadow-card hover:shadow-card-hover transition-all text-sm text-navy hover:text-purple"
                >
                  <action.icon className="w-5 h-5 text-purple" />
                  {action.label}
                  <ChevronRight className="w-4 h-4 ml-auto text-text-muted" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score Chart */}
      <div className="bg-white rounded-2xl border border-gray-line p-6 shadow-card">
        <h2 className="font-display font-semibold text-lg text-navy mb-6">Score Progression</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFEA" />
              <XAxis dataKey="week" stroke="#6B6689" fontSize={12} />
              <YAxis domain={[50, 100]} stroke="#6B6689" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B1464',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#5B2E91"
                strokeWidth={3}
                dot={{ fill: '#5B2E91', r: 5 }}
                activeDot={{ r: 7, fill: '#2F5BFA' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COURSES TAB
// ============================================
function CoursesTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div>
      <h2 className="font-display font-semibold text-xl text-navy mb-6">My Courses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map(enrollment => {
          const course = enrollment.course
          return (
            <Link
              key={enrollment.id}
              to={`/courses/${course.slug}`}
              className="bg-white rounded-xl border border-gray-line overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
            >
              <div className="relative h-40">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-purple rounded-full" style={{ width: `${enrollment.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-sm text-navy mb-1">{course.title}</h3>
                <p className="text-xs text-text-muted mb-2">{course.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{enrollment.progress}% complete</span>
                  <span className="text-xs font-semibold text-purple">
                    {enrollment.progress === 100 ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// AI TUTOR QUICK TAB
// ============================================
function AITutorQuickTab() {
  return (
    <div className="text-center py-20">
      <Bot className="w-16 h-16 text-purple mx-auto mb-4" />
      <h2 className="font-display font-semibold text-xl text-navy mb-2">AI Tutor</h2>
      <p className="text-text-muted mb-6">Open the full AI Tutor experience.</p>
      <Link
        to="/ai-tutor"
        className="px-6 py-3 bg-purple text-white font-semibold text-sm rounded-lg hover:bg-purple/90 transition-colors"
      >
        Open AI Tutor
      </Link>
    </div>
  )
}

// ============================================
// LIVE CLASSES TAB
// ============================================
function LiveClassesTab() {
  return (
    <div>
      <h2 className="font-display font-semibold text-xl text-navy mb-6">Upcoming Live Classes</h2>
      <div className="space-y-4">
        {[
          { title: 'TOEFL Speaking Practice', time: 'Today, 3:00 PM', status: 'upcoming', instructor: 'Dr. Sarah Chen' },
          { title: 'DELF Writing Workshop', time: 'Tomorrow, 10:00 AM', status: 'upcoming', instructor: 'Prof. Marie Dubois' },
          { title: 'German Conversation Club', time: 'Friday, 2:00 PM', status: 'upcoming', instructor: 'Dr. Klaus Weber' },
        ].map((cls, i) => (
          <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-line shadow-card">
            <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm text-navy">{cls.title}</h3>
              <p className="text-xs text-text-muted">{cls.instructor} • {cls.time}</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              {cls.status === 'upcoming' ? 'Upcoming' : 'Live'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ANALYTICS TAB
// ============================================
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display font-semibold text-xl text-navy">Performance Analytics</h2>

      {/* Skill Radar */}
      <div className="bg-white rounded-2xl border border-gray-line p-6 shadow-card">
        <h3 className="font-display font-semibold text-base text-navy mb-4">Skill Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillBreakdown}>
              <PolarGrid stroke="#E0DFEA" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#1B1464', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B6689', fontSize: 10 }} />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#5B2E91"
                fill="#5B2E91"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B1464',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-2xl border border-gray-line p-6 shadow-card">
        <h3 className="font-display font-semibold text-base text-navy mb-4">Weekly Study Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFEA" />
              <XAxis dataKey="day" stroke="#6B6689" fontSize={12} />
              <YAxis stroke="#6B6689" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B1464',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="minutes" stroke="#5B2E91" strokeWidth={3} dot={{ fill: '#5B2E91', r: 5 }} />
              <Line type="monotone" dataKey="target" stroke="#E0DFEA" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Engagement Score', value: '85%', trend: '+5%', color: 'text-green-600' },
          { label: 'Mastery Score', value: '72%', trend: '+12%', color: 'text-green-600' },
          { label: 'Momentum', value: 'High', trend: 'Stable', color: 'text-blue-600' },
          { label: 'Predicted Score', value: 'Band 7.5', trend: '+0.5', color: 'text-purple' },
        ].map((insight, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-line shadow-card">
            <p className="text-xs text-text-muted mb-1">{insight.label}</p>
            <div className="flex items-end gap-2">
              <p className="font-display font-bold text-2xl text-navy">{insight.value}</p>
              <span className={`text-xs font-semibold ${insight.color} mb-1`}>{insight.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ACHIEVEMENTS TAB
// ============================================
function AchievementsTab() {
  return (
    <div>
      <h2 className="font-display font-semibold text-xl text-navy mb-6">Achievements</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className="bg-white rounded-xl p-5 border border-gray-line shadow-card hover:shadow-card-hover transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display font-semibold text-sm text-navy mb-1">{achievement.title}</h3>
            <p className="text-xs text-text-muted mb-3">{achievement.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple font-semibold">+{achievement.points} pts</span>
              <span className="text-[10px] text-text-muted">{achievement.earnedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// SETTINGS TAB
// ============================================
function SettingsTab() {
  return (
    <div className="max-w-lg">
      <h2 className="font-display font-semibold text-xl text-navy mb-6">Settings</h2>
      <div className="bg-white rounded-2xl border border-gray-line p-6 shadow-card space-y-6">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Display Name</label>
          <input
            type="text"
            defaultValue="Valentin Umuhire"
            className="w-full px-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Email</label>
          <input
            type="email"
            defaultValue="umuhirevalentin2004@gmail.com"
            className="w-full px-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Target Test</label>
          <select className="w-full px-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy focus:outline-none focus:border-purple">
            <option>TOEFL iBT</option>
            <option>IELTS Academic</option>
            <option>DELF B2</option>
            <option>TCF Canada</option>
            <option>Goethe B1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Target Score</label>
          <input
            type="text"
            defaultValue="100+"
            className="w-full px-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
          />
        </div>
        <button className="w-full py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  )
}
