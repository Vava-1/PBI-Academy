import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react'

interface ExamState {
  currentSection: number
  currentQuestion: number
  answers: Record<string, string>
  timeRemaining: number
}

export function ExamSimulationPage() {
  const { examId } = useParams()
  const [examState, setExamState] = useState<ExamState>({
    currentSection: 0,
    currentQuestion: 0,
    answers: {},
    timeRemaining: 3600 // 1 hour default
  })
  const wsRef = useRef<WebSocket | null>(null)

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const res = await api.get(`/exams/${examId}`)
      return res.data
    }
  })

  const startExamMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/exams/${examId}/start`)
      return res.data
    }
  })

  // WebSocket connection for timer
  useEffect(() => {
    if (startExamMutation.data?.attempt_id) {
      const ws = new WebSocket(`ws://localhost:8000/ws/exam/${startExamMutation.data.attempt_id}/timer`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'TIMER_SYNC') {
          setExamState(prev => ({ ...prev, timeRemaining: data.remaining_seconds }))
        }
        if (data.type === 'TIME_WARNING') {
          alert(`Warning: ${data.remaining_seconds} seconds remaining!`)
        }
        if (data.type === 'AUTO_SUBMIT') {
          handleSubmit()
        }
      }

      return () => ws.close()
    }
  }, [startExamMutation.data])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    // Submit exam
    console.log('Submitting exam...')
  }

  if (!startExamMutation.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Start {exam?.name}</h1>
          <p className="text-gray-600 mb-6">
            Duration: {exam?.total_duration_minutes} minutes<br />
            Sections: {exam?.sections?.length || 0}
          </p>
          <button
            onClick={() => startExamMutation.mutate()}
            className="btn-primary w-full"
            disabled={startExamMutation.isPending}
          >
            {startExamMutation.isPending ? 'Starting...' : 'Start Exam'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">{exam?.name}</h1>
          <span className="text-sm text-gray-500">
            Section {examState.currentSection + 1} of {exam?.sections?.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            examState.timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-semibold">{formatTime(examState.timeRemaining)}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question area */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-sm text-gray-500">Question {examState.currentQuestion + 1}</span>
              <h2 className="text-xl font-semibold mt-2">
                Sample question text would appear here...
              </h2>
            </div>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => setExamState(prev => ({
                    ...prev,
                    answers: { ...prev.answers, [examState.currentQuestion]: option }
                  }))}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    examState.answers[examState.currentQuestion] === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold mr-3">{option}.</span>
                  Option {option}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Navigation sidebar */}
        <aside className="w-64 bg-gray-50 border-l p-4">
          <h3 className="font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setExamState(prev => ({ ...prev, currentQuestion: i }))}
                className={`h-10 rounded ${
                  examState.currentQuestion === i
                    ? 'bg-primary-600 text-white'
                    : examState.answers[i]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-green-100 rounded" /> Answered
            <div className="w-4 h-4 bg-primary-600 rounded ml-2" /> Current
          </div>
        </aside>
      </div>

      {/* Footer navigation */}
      <footer className="bg-white border-t px-6 py-4 flex justify-between">
        <button
          onClick={() => setExamState(prev => ({ ...prev, currentQuestion: Math.max(0, prev.currentQuestion - 1) }))}
          disabled={examState.currentQuestion === 0}
          className="btn-secondary"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <button
          onClick={() => setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))}
          className="btn-primary"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </footer>
    </div>
  )
}
