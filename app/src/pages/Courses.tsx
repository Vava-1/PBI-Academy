import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, BookOpen, UserCheck, Filter, Search, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

const languages = ['All', 'English', 'French', 'German', 'Kiswahili']
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const testTypes = ['All Tests', 'TOEFL', 'IELTS', 'Duolingo', 'DELF', 'DALF', 'TCF Canada', 'TEF Canada', 'Goethe', 'General']

interface Course {
  id: string
  title: string
  slug: string
  description: string
  language: string
  testType: string
  level: string
  image: string
  durationHours: number
  lessonsCount: number
  studentsCount: number
  instructorId: string
  price: number
  rating: number
  isPublished: boolean
  category: string
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [selectedTest, setSelectedTest] = useState('All Tests')
  const [showFilters, setShowFilters] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses')
      .then((data: Course[]) => {
        setCourses(data)
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedLanguage !== 'All' && course.category !== selectedLanguage) return false
      if (selectedLevel !== 'All Levels' && course.level !== selectedLevel.toLowerCase()) return false
      if (selectedTest !== 'All Tests' && course.testType !== selectedTest) return false
      return true
    })
  }, [courses, searchQuery, selectedLanguage, selectedLevel, selectedTest])

  const languageColors: Record<string, string> = {
    english: 'bg-blue text-white',
    french: 'bg-purple text-white',
    german: 'bg-navy text-white',
    kiswahili: 'bg-green-500 text-white',
  }

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px]">
      {/* Header */}
      <div className="bg-navy py-16 lg:py-20">
        <div className="container-pbi text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
            All Courses
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Comprehensive preparation for every major language proficiency test.
          </p>
        </div>
      </div>

      <div className="container-pbi py-12">
        {/* Search and filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-4 py-3 bg-white border border-gray-line rounded-xl text-navy font-medium flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Desktop filters */}
          <div className={`flex flex-wrap gap-4 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedLanguage === lang
                      ? 'bg-purple text-white'
                      : 'bg-white text-navy border border-gray-line hover:border-purple'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="w-px h-8 bg-gray-line hidden sm:block" />
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedLevel === level
                      ? 'bg-purple text-white'
                      : 'bg-white text-navy border border-gray-line hover:border-purple'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Test type filter */}
          <div className={`mt-4 flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            {testTypes.map(test => (
              <button
                key={test}
                onClick={() => setSelectedTest(test)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTest === test
                    ? 'bg-purple/10 text-purple border border-purple/30'
                    : 'bg-white text-text-muted border border-gray-line hover:border-purple/30'
                }`}
              >
                {test}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted mb-6">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple animate-spin" />
          </div>
        )}

        {/* Course grid */}
        {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            return (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="bg-white rounded-xl border border-gray-line overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${languageColors[course.language] || 'bg-purple text-white'}`}>
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-navy flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-bg rounded text-[10px] font-semibold text-text-muted uppercase">
                      {course.level}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-bg rounded text-[10px] font-semibold text-text-muted uppercase">
                      {course.testType}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-navy mb-1 group-hover:text-purple transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-text-muted mb-3"></p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.durationHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.lessonsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {course.studentsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-purple">
                      ${(course.price / 100).toFixed(0)}
                    </span>
                    <span className="text-xs font-medium text-purple bg-purple/10 px-3 py-1.5 rounded-lg group-hover:bg-purple group-hover:text-white transition-colors">
                      Enroll Now
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">No courses found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedLanguage('All')
                setSelectedLevel('All Levels')
                setSelectedTest('All Tests')
              }}
              className="mt-4 text-purple font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
