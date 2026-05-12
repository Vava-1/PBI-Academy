import { useState, useEffect } from 'react'
import { Trophy, Flame, TrendingUp, TrendingDown, Medal, Crown, Star, BookOpen } from 'lucide-react'
import { api } from '../lib/api'

type Period = 'all-time' | 'weekly' | 'monthly'

interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  level: number
  points: number
  courses: number
  streak: number
  isCurrentUser?: boolean
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all-time')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    api.get('/leaderboard')
      .then((data: LeaderboardEntry[]) => setLeaderboard(data))
      .catch(() => setLeaderboard([]))
    }, [])

  const periods: { key: Period; label: string }[] = [
    { key: 'all-time', label: 'All Time' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-semibold text-text-muted w-5 text-center">{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
    return 'bg-white border-gray-line'
  }

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px]">
      {/* Header */}
      <div className="bg-navy py-12 lg:py-16">
        <div className="container-pbi text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-white/70 max-w-md mx-auto">
            See how you rank against other students. Compete, learn, and grow together!
          </p>
        </div>
      </div>

      <div className="container-pbi py-8">
        {/* My Rank Card */}
        <div className="bg-gradient-purple rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <img
                src="/instructor-3.jpg"
                alt="You"
                className="w-16 h-16 rounded-full object-cover border-4 border-white"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-white/80 text-sm mb-1">Your Ranking</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 lg:gap-8">
                <div>
                  <p className="font-display font-bold text-3xl text-white">#2</p>
                  <p className="text-xs text-white/70">of 566 students</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <p className="font-display font-bold text-2xl text-white">2,500</p>
                  <p className="text-xs text-white/70">total points</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <p className="font-display font-bold text-2xl text-white">Level 12</p>
                  <p className="text-xs text-white/70">current level</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <p className="font-display font-bold text-2xl text-white">5 days</p>
                  <p className="text-xs text-white/70">streak</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-1">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-xs text-white/70">Top 1%</p>
            </div>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-6">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-purple text-white shadow-button'
                  : 'bg-white text-navy border border-gray-line hover:border-purple'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl border border-gray-line shadow-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-bg border-b border-gray-line text-xs font-semibold text-text-muted uppercase">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Student</div>
            <div className="col-span-1 text-center">Level</div>
            <div className="col-span-2 text-center">Courses</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-line">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-bg/50 ${
                  entry.isCurrentUser ? 'bg-purple/5' : ''
                } ${getRankBg(entry.rank)}`}
              >
                {/* Rank */}
                <div className="col-span-2 lg:col-span-1 flex items-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Student */}
                <div className="col-span-10 lg:col-span-4 flex items-center gap-3">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${entry.isCurrentUser ? 'text-purple' : 'text-navy'}`}>
                      {entry.name} {entry.isCurrentUser && '(You)'}
                    </p>
                    <div className="flex items-center gap-2 lg:hidden">
                      <span className="text-xs text-text-muted">Lvl {entry.level}</span>
                      <span className="text-xs text-text-muted">{entry.points} pts</span>
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="hidden lg:flex col-span-1 items-center justify-center">
                  <span className="px-2.5 py-1 bg-purple/10 text-purple text-xs font-semibold rounded-full">
                    {entry.level}
                  </span>
                </div>

                {/* Courses */}
                <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5 text-sm text-text-muted">
                  <BookOpen className="w-3.5 h-3.5" />
                  {entry.courses}
                </div>

                {/* Streak */}
                <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-navy">{entry.streak}d</span>
                </div>

                {/* Score */}
                <div className="hidden lg:flex col-span-2 items-center justify-end gap-2">
                  <span className="font-display font-bold text-base text-navy">{entry.points.toLocaleString()}</span>
                  {entry.rank <= 3 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Total Students', value: '566', icon: Trophy, color: 'text-purple' },
            { label: 'Active This Week', value: '342', icon: Flame, color: 'text-orange-500' },
            { label: 'Avg. Score', value: '78%', icon: Star, color: 'text-yellow-500' },
            { label: 'Study Hours', value: '12.4K', icon: TrendingUp, color: 'text-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-line shadow-card text-center">
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
              <p className="font-display font-bold text-2xl text-navy">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
