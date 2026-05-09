import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Star } from 'lucide-react'

export function CourseCatalogPage() {
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses/')
      return res.data
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
        <p className="text-gray-600">Explore our available courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses?.map((course: any) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <div className="card hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary-400" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">{course.category}</span>
                  <span className="badge badge-secondary">{course.language}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.estimated_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {course.difficulty}
                  </span>
                </div>
                <p className="mt-2 text-primary-600 font-medium">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
