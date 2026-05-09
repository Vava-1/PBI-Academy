import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { LayoutDashboard, BookOpen, Trophy, Flame, TrendingUp, Target } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuthStore()
  
  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await api.get('/gamification/me')
      return res.data
    }
  })

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/ai/analytics/me')
      return res.data
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
          <p className="text-gray-600">Here's your learning progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Current Streak" value={`${gamification?.streak?.current_streak_days || 0} days`} color="orange" />
        <StatCard icon={Trophy} label="Total Points" value={gamification?.points?.total_points || 0} color="yellow" />
        <StatCard icon={Target} label="Level" value={gamification?.points?.level || 1} color="purple" />
        <StatCard icon={TrendingUp} label="Mastery Score" value={`${Math.round(analytics?.mastery_score || 0)}%`} color="green" />
      </div>

      {analytics && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary-600" />
            AI Learning Insights
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreBar label="Engagement" value={analytics.engagement_score} color="blue" />
            <ScoreBar label="Mastery" value={analytics.mastery_score} color="green" />
            <ScoreBar label="Momentum" value={analytics.momentum_score} color="purple" />
            <ScoreBar label="Confidence" value={analytics.confidence_score} color="yellow" />
            <ScoreBar label="Dropout Risk" value={analytics.dropout_risk} color="red" />
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-600" />
          Continue Learning
        </h2>
        <p className="text-gray-600">Your enrolled courses will appear here</p>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Flame, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
    yellow: 'bg-yellow-500', red: 'bg-red-500',
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}
