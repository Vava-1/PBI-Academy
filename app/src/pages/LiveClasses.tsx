import { useState, useEffect } from 'react'
import { Video, Clock, Users, Calendar, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

type FilterStatus = 'all' | 'upcoming' | 'live' | 'ended'

interface LiveClass {
  id: string
  title: string
  description: string
  courseId: string
  instructorId: string
  scheduledAt: string
  durationMinutes: number
  status: 'scheduled' | 'live' | 'ended'
  maxStudents: number
  registeredCount: number
  roomUrl: string | null
  course?: { title: string; slug: string }
}

export default function LiveClasses() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])

  useEffect(() => {
    api.get('/live-classes')
      .then((data: LiveClass[]) => setLiveClasses(data))
      .catch(() => setLiveClasses([]))
  }, [])

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'live', label: 'Live Now' },
    { key: 'ended', label: 'Ended' },
  ]

  const filteredClasses = liveClasses.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString()

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) return `Today, ${timeStr}`
    if (isTomorrow) return `Tomorrow, ${timeStr}`
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return {
          badge: 'bg-red-100 text-red-700',
          icon: Play,
          buttonText: 'Join Now',
          buttonClass: 'bg-red-500 text-white hover:bg-red-600',
        }
      case 'scheduled':
        return {
          badge: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
          buttonText: 'Set Reminder',
          buttonClass: 'bg-purple/10 text-purple hover:bg-purple hover:text-white',
        }
      case 'ended':
        return {
          badge: 'bg-gray-100 text-gray-600',
          icon: CheckCircle,
          buttonText: 'Watch Replay',
          buttonClass: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-600',
          icon: Clock,
          buttonText: 'Set Reminder',
          buttonClass: 'bg-purple/10 text-purple hover:bg-purple hover:text-white',
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px]">
      {/* Header */}
      <div className="bg-navy py-12 lg:py-16">
        <div className="container-pbi text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-purple" />
          </div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-white mb-2">
            Live Classes
          </h1>
          <p className="text-white/70 max-w-md mx-auto">
            Join real-time interactive sessions with expert instructors and fellow students.
          </p>
        </div>
      </div>

      <div className="container-pbi py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Live Now', value: '0', color: 'text-red-500' },
            { label: 'Upcoming', value: liveClasses.filter(c => c.status === 'scheduled').length.toString(), color: 'text-yellow-500' },
            { label: 'Completed', value: '12', color: 'text-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-line shadow-card text-center">
              <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-purple text-white shadow-button'
                  : 'bg-white text-navy border border-gray-line hover:border-purple'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Classes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((liveClass) => {
            const status = getStatusConfig(liveClass.status)

            return (
              <div
                key={liveClass.id}
                className="bg-white rounded-2xl border border-gray-line overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
              >
                {/* Thumbnail area */}
                <div className="relative h-44 bg-gradient-to-br from-purple/20 to-blue/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-lg">
                    <Video className="w-8 h-8 text-purple" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.badge}`}>
                      {liveClass.status === 'scheduled' ? 'Upcoming' : liveClass.status === 'live' ? 'Live Now' : 'Ended'}
                    </span>
                  </div>
                  {liveClass.status === 'live' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-semibold text-white">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs text-purple font-semibold mb-1.5">{liveClass.course?.title || 'Live Class'}</p>
                  <h3 className="font-display font-semibold text-base text-navy mb-2">
                    {liveClass.title}
                  </h3>
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">{liveClass.description}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(liveClass.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {liveClass.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {liveClass.registeredCount}/{liveClass.maxStudents}
                    </span>
                  </div>

                  {/* Action */}
                  <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${status.buttonClass}`}>
                    {status.buttonText}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">No classes found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
