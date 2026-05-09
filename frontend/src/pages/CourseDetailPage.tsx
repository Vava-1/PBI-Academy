import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { BookOpen, Clock, CheckCircle, Play } from 'lucide-react'

export function CourseDetailPage() {
  const { courseId } = useParams()
  
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}`)
      return res.data
    }
  })

  if (!course) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
          <BookOpen className="h-24 w-24 text-white/50" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.estimated_hours} hours
                </span>
                <span className="badge badge-primary">{course.difficulty}</span>
              </div>
            </div>
            <Link to={`/learn/${course.id}`} className="btn-primary">
              <Play className="h-4 w-4 mr-2" />
              Start Learning
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Course Content</h2>
        <div className="space-y-4">
          {course.modules?.map((module: any, idx: number) => (
            <div key={module.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <h3 className="font-semibold">{module.title}</h3>
              </div>
              <ul className="ml-11 space-y-2">
                {module.lessons?.map((lesson: any) => (
                  <li key={lesson.id} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
