import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Video, Calendar, Users, Play, Clock, Plus, Filter, MapPin, Bell, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export function LiveSessionsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'recorded'>('upcoming')
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const { data: sessions } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: async () => {
      const res = await api.get('/live/')
      return res.data
    }
  })

  const filteredSessions = sessions?.filter((session: any) => {
    if (filter === 'all') return true
    if (filter === 'live') return session.status === 'live'
    if (filter === 'upcoming') return session.status === 'upcoming'
    if (filter === 'recorded') return session.status === 'ended'
    return true
  }) || []

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'speaking_practice':
        return 'from-purple-500 to-pink-500'
      case 'workshop':
        return 'from-blue-500 to-cyan-500'
      case 'qa':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-primary-500 to-primary-700'
    }
  }

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'speaking_practice':
        return 'Speaking Practice'
      case 'workshop':
        return 'Workshop'
      case 'qa':
        return 'Q&A Session'
      default:
        return 'Live Class'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600">Join live classes with expert instructors 3x per week</p>
        </div>
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          Schedule Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('live')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'live'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Live Now
        </button>
        <button
          onClick={() => setFilter('recorded')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'recorded'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recorded
        </button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-600">Check back later for upcoming live sessions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session: any) => (
            <div key={session.id} className="card overflow-hidden hover:shadow-lg transition">
              <div className={`h-48 bg-gradient-to-br ${getSessionTypeColor(session.session_type)} flex items-center justify-center relative`}>
                <Video className="h-16 w-16 text-white/50" />
                {session.status === 'live' && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {getSessionTypeLabel(session.session_type)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {format(new Date(session.scheduled_at), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {format(new Date(session.scheduled_at), 'h:mm a')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    {session.attendees_count || 0} / {session.max_participants} participants
                  </div>
                  {session.instructor_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {session.instructor_name}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {session.status === 'live' ? (
                    <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" />
                      Join Now
                    </button>
                  ) : session.status === 'upcoming' ? (
                    <>
                      <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2">
                        <Bell className="h-4 w-4" />
                        Remind Me
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                        Details
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" />
                      Watch Recording
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal (placeholder - would need full implementation) */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Live Session</h2>
            <p className="text-gray-600 mb-6">
              Schedule a live session for your students. Sessions can be speaking practice, workshops, or Q&A sessions.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., TOEFL Speaking Practice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="speaking_practice">Speaking Practice</option>
                  <option value="workshop">Workshop</option>
                  <option value="qa">Q&A Session</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  defaultValue={50}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition">
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
