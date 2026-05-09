import { useParams, useState } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Play, CheckCircle, Lock, ChevronRight, BookOpen, FileText, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function LearningPage() {
  const { courseId } = useParams()
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'video' | 'docs'>('video')

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}`)
      return res.data
    }
  })

  if (!course) return <div>Loading...</div>

  // Get all lessons in order
  const allLessons = course.modules?.flatMap((module: any) => 
    module.lessons?.map((lesson: any) => ({ ...lesson, moduleTitle: module.title }))
  ) || []

  const currentLesson = currentLessonId 
    ? allLessons.find((l: any) => l.id === currentLessonId)
    : allLessons[0]

  const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson?.id)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video player / Content viewer */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'video' && currentLesson?.video_url ? (
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <video 
                className="w-full h-full"
                controls
                src={currentLesson.video_url}
              >
                <Play className="h-16 w-16 text-white/50" />
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No video available for this lesson</p>
              </div>
            </div>
          )}

          {/* Lesson content */}
          <div className="p-8 max-w-4xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-primary-600 font-medium">{currentLesson?.moduleTitle}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentLesson?.title}</h1>
            
            {/* View mode toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setViewMode('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'video'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Play className="h-4 w-4" />
                Video
              </button>
              <button
                onClick={() => setViewMode('docs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'docs'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documentation
              </button>
            </div>

            {/* Documentation content */}
            {viewMode === 'docs' && currentLesson?.content && (
              <div className="prose prose-lg max-w-none bg-gray-50 rounded-lg p-8">
                <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
              </div>
            )}

            {/* Resources */}
            {currentLesson?.resources && Object.keys(currentLesson.resources).length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Lesson Resources
                </h3>
                <div className="space-y-2">
                  {Object.entries(currentLesson.resources).map(([key, value]: [string, any]) => (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-4 w-4" />
                      {key}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Lesson
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === allLessons.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Course content */}
      <div className="w-96 bg-white border-l overflow-y-auto">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.estimated_hours}h total
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {Math.round(course.progress || 0)}% complete
            </span>
          </div>
        </div>
        <div className="divide-y">
          {course.modules?.map((module: any, idx: number) => (
            <div key={module.id}>
              <button
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                <h3 className="font-medium text-sm flex items-center justify-between">
                  <span>Module {idx + 1}: {module.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </h3>
                <p className="text-xs text-gray-500 mt-1">{module.lessons?.length} lessons • {module.estimated_minutes}m</p>
              </button>
              {module.lessons?.map((lesson: any) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonId(lesson.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 text-left transition ${
                    currentLesson?.id === lesson.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block truncate">{lesson.title}</span>
                    <span className="text-xs text-gray-500">{Math.floor(lesson.duration_seconds / 60)}m</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
