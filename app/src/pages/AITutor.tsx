import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot, Send, User, Sparkles, BookOpen, Mic, BarChart3,
  Target, Lightbulb, ArrowLeft, Zap,
  TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react'
import { api } from '../lib/api'

const quickActions = [
  { label: 'Explain a concept', icon: Lightbulb, prompt: 'Can you explain the difference between "affect" and "effect"?' },
  { label: 'Practice speaking', icon: Mic, prompt: 'Give me a TOEFL independent speaking practice question.' },
  { label: 'Take a quiz', icon: Target, prompt: 'Generate a 5-question quiz on IELTS reading strategies.' },
  { label: 'Study plan', icon: BookOpen, prompt: 'Create a 4-week study plan for my TOEFL preparation.' },
]

const aiInsights = {
  emotionalState: {
    sentiment: 'Neutral',
    motivation: 65,
    frustrations: 0,
    risk: 'Low',
  },
  intelligence: {
    engagement: 85,
    mastery: 72,
    momentum: 78,
    confidence: 68,
    dropoutRisk: 12,
  },
  masteredTopics: ['Basic Grammar', 'Reading Comprehension', 'Vocabulary Building'],
  difficultTopics: ['Speaking Fluency', 'Advanced Writing', 'Listening for Details'],
  nextActions: [
    'Practice speaking for 15 minutes',
    'Complete the writing exercise in Module 3',
    'Review listening strategies lesson',
  ],
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Create a new chat session on mount
    api.post('/ai/sessions', {})
      .then((data: { id: string }) => {
        setSessionId(data.id)
      })
      .catch(() => {
        // Fallback: use local-only messages if API fails
      })
  }, [])

  const handleSend = async (text: string) => {
    if (!text.trim() || !sessionId) return

    const tempId = Date.now().toString()
    const userMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const aiMsg: ChatMessage = await api.post('/ai/chat', { sessionId, message: text })
      setMessages(prev => [...prev, aiMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure you are logged in and the server is running.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt)
  }

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px] flex flex-col lg:flex-row">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-72px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-line">
          <div className="flex items-center gap-3">
            <Link to="/" className="lg:hidden p-2 -ml-2 text-navy hover:text-purple">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm text-navy">PBI AI Tutor</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-text-muted">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="lg:hidden p-2 text-navy hover:text-purple"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-purple/10'
                  : 'bg-gradient-purple'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-purple" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple text-white'
                  : 'bg-white border border-gray-line text-navy'
              }`}>
                <div className="text-sm whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-line rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length < 3 && (
          <div className="px-4 lg:px-6 pb-2">
            <p className="text-xs text-text-muted mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-line rounded-lg text-xs text-navy hover:border-purple hover:text-purple transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 lg:px-6 py-3 bg-white border-t border-gray-line">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 px-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 bg-purple rounded-xl flex items-center justify-center text-white hover:bg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Insights Sidebar */}
      <aside className={`
        fixed lg:sticky top-[72px] right-0 z-20 w-80 h-[calc(100vh-72px)] bg-white border-l border-gray-line overflow-y-auto
        transition-transform lg:translate-x-0
        ${showInsights ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 space-y-6">
          {/* Close button (mobile) */}
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-display font-semibold text-sm text-navy">AI Insights</h3>
            <button onClick={() => setShowInsights(false)} className="p-1 text-text-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Emotional State */}
          <div>
            <h3 className="font-display font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple" />
              Emotional State
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Sentiment', value: aiInsights.emotionalState.sentiment, color: 'text-blue-600' },
                { label: 'Motivation', value: `${aiInsights.emotionalState.motivation}%`, color: 'text-green-600' },
                { label: 'Dropout Risk', value: aiInsights.emotionalState.risk, color: 'text-green-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-line last:border-0">
                  <span className="text-xs text-text-muted">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Scores */}
          <div>
            <h3 className="font-display font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple" />
              Intelligence Scores
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Engagement', value: aiInsights.intelligence.engagement, color: 'bg-blue-500' },
                { label: 'Mastery', value: aiInsights.intelligence.mastery, color: 'bg-purple' },
                { label: 'Momentum', value: aiInsights.intelligence.momentum, color: 'bg-green-500' },
                { label: 'Confidence', value: aiInsights.intelligence.confidence, color: 'bg-yellow-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted">{item.label}</span>
                    <span className="text-xs font-semibold text-navy">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mastered Topics */}
          <div>
            <h3 className="font-display font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Mastered Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiInsights.masteredTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Difficult Topics */}
          <div>
            <h3 className="font-display font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Focus Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiInsights.difficultTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Next Actions */}
          <div>
            <h3 className="font-display font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple" />
              Recommended Next Steps
            </h3>
            <div className="space-y-2">
              {aiInsights.nextActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-bg rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-purple">{i + 1}</span>
                  </span>
                  <span className="text-xs text-navy">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {showInsights && (
        <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setShowInsights(false)} />
      )}
    </div>
  )
}
