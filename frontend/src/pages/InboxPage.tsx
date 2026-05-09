import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { Mail, Inbox, Check, Archive, TrendingUp, Brain, Award, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'performance' | 'ai'>('all')
  const queryClient = useQueryClient()

  const { data: inbox, isLoading } = useQuery({
    queryKey: ['inbox', filter],
    queryFn: async () => {
      const params: any = {}
      if (filter === 'unread') params.status_filter = 'unread'
      if (filter === 'performance') params.message_type = 'performance_analysis'
      if (filter === 'ai') params.message_type = 'ai_insight'
      
      const res = await api.get('/messages/inbox', { params })
      return res.data
    }
  })

  const markReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.patch(`/messages/${messageId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
      toast.success('Message marked as read')
    }
  })

  const archiveMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.patch(`/messages/${messageId}/archive`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
      toast.success('Message archived')
    }
  })

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'performance_analysis':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'ai_insight':
        return <Brain className="h-5 w-5 text-purple-600" />
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-600" />
      case 'system_notification':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Mail className="h-5 w-5 text-gray-600" />
    }
  }

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'performance_analysis':
        return 'Performance Analysis'
      case 'ai_insight':
        return 'AI Insight'
      case 'achievement':
        return 'Achievement'
      case 'system_notification':
        return 'Notification'
      default:
        return 'Message'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">
            {inbox?.unread_count || 0} unread messages
          </p>
        </div>
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
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('performance')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'performance'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setFilter('ai')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'ai'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          AI Insights
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-3">
            {inbox?.messages?.length === 0 ? (
              <div className="card p-8 text-center">
                <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              inbox?.messages?.map((message: any) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`card p-4 cursor-pointer transition hover:shadow-md ${
                    selectedMessage?.id === message.id
                      ? 'ring-2 ring-primary-600'
                      : ''
                  } ${message.status === 'unread' ? 'border-l-4 border-l-primary-600' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getMessageIcon(message.message_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-primary-600">
                          {getMessageTypeLabel(message.message_type)}
                        </span>
                        {message.status === 'unread' && (
                          <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {message.body.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getMessageIcon(selectedMessage.message_type)}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      <span className="text-sm text-primary-600">
                        {getMessageTypeLabel(selectedMessage.message_type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => markReadMutation.mutate(selectedMessage.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => archiveMutation.mutate(selectedMessage.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Archive"
                    >
                      <Archive className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.body}
                  </p>
                </div>

                {/* Performance Data */}
                {selectedMessage.performance_data && Object.keys(selectedMessage.performance_data).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Performance Data</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedMessage.performance_data).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analytics Summary */}
                {selectedMessage.analytics_summary && Object.keys(selectedMessage.analytics_summary).length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      AI Analytics
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMessage.analytics_summary).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-gray-900">{typeof value === 'number' ? `${Math.round(value)}%` : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedMessage.recommendations && selectedMessage.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedMessage.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-6">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                  {selectedMessage.is_ai_generated && (
                    <span className="ml-2 text-purple-600">• AI-generated</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
