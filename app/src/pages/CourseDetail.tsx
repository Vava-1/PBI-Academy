import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Star, Clock, BookOpen, Play, CheckCircle,
  Award, Users, MessageCircle, ChevronDown, ChevronUp, ArrowLeft, Loader2
} from 'lucide-react'
import { api } from '../lib/api'

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  durationMin: number
}

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
  category: string
  lessons?: Lesson[]
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>(['m1'])
  const [activeTab, setActiveTab] = useState<'curriculum' | 'reviews' | 'resources'>('curriculum')
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get(`/courses/${slug}`)
      .then((data: Course) => setCourse(data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg pt-[72px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-bg pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-navy mb-2">Course Not Found</h1>
          <p className="text-text-muted mb-4">The course you are looking for does not exist.</p>
          <Link to="/courses" className="text-purple font-semibold hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    )
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  // Build a simple single-module curriculum from fetched lessons
  const curriculum = course.lessons?.length
    ? [{
        id: 'm1',
        title: 'Course Curriculum',
        lessons: course.lessons.map(l => ({
          id: l.id,
          title: l.title,
          duration: `${l.durationMin}:00`,
          free: l.order <= 2,
        }))
      }]
    : []

  const relatedCourses: Course[] = []

  return (
    <div className="min-h-screen bg-gray-bg pt-[72px]">
      {/* Course Hero */}
      <div className="relative bg-gradient-to-br from-purple to-navy py-16 lg:py-20">
        <div className="container-pbi">
          <Link to="/courses" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white uppercase">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white uppercase">
                  {course.level}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white uppercase">
                  {course.testType}
                </span>
              </div>
              <h1 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4">
                {course.title}
              </h1>
              <p className="text-white/80 leading-relaxed mb-6 max-w-lg">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold">{course.rating}</span> (120 reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.studentsCount} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.durationHours} hours
                </span>
              </div>
            </div>
            <div className="relative">
              <img
                src={course.image}
                alt={course.title}
                className="rounded-2xl shadow-2xl w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-purple ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-pbi py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-line mb-8">
              {[
                { key: 'curriculum' as const, label: 'Curriculum', icon: BookOpen },
                { key: 'reviews' as const, label: 'Reviews', icon: MessageCircle },
                { key: 'resources' as const, label: 'Resources', icon: Award },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-purple text-white shadow-button'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                {curriculum.map((module) => (
                  <div key={module.id} className="bg-white rounded-xl border border-gray-line overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-bg/50 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-display font-semibold text-base text-navy">{module.title}</h3>
                        <p className="text-xs text-text-muted mt-0.5">{module.lessons.length} lessons</p>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </button>
                    {expandedModules.includes(module.id) && (
                      <div className="border-t border-gray-line">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-bg/30 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
                              {lesson.free || isEnrolled ? (
                                <Play className="w-3.5 h-3.5 text-purple" />
                              ) : (
                                <Award className="w-3.5 h-3.5 text-text-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${lesson.free || isEnrolled ? 'text-navy' : 'text-text-muted'}`}>
                                {lesson.title}
                              </p>
                            </div>
                            <span className="text-xs text-text-muted flex-shrink-0">{lesson.duration}</span>
                            {lesson.free && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded flex-shrink-0">
                                FREE
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl border border-gray-line p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="font-display font-bold text-4xl text-navy">{course.rating}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-line'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-text-muted mt-1">120 reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-3">{stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-bg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${stars === 5 ? 65 : stars === 4 ? 25 : stars === 3 ? 7 : stars === 2 ? 2 : 1}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'James O.', rating: 5, text: 'Excellent course! The AI tutor helped me improve my weak areas significantly.', date: '2 weeks ago' },
                    { name: 'Amina D.', rating: 5, text: 'Very comprehensive. The instructor explains complex topics in a simple way.', date: '1 month ago' },
                    { name: 'Priya S.', rating: 4, text: 'Great content and practice tests. Would love more speaking exercises.', date: '1 month ago' },
                  ].map((review, i) => (
                    <div key={i} className="border-t border-gray-line pt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center text-purple font-semibold text-sm">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-line'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-text-muted">{review.date}</span>
                      </div>
                      <p className="text-sm text-text-muted">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-white rounded-xl border border-gray-line p-6">
                <h3 className="font-display font-semibold text-lg text-navy mb-4">Course Resources</h3>
                <div className="space-y-3">
                  {[
                    'Study Guide PDF',
                    'Practice Test Answer Keys',
                    'Vocabulary Flashcards',
                    'Grammar Reference Sheet',
                    'Score Calculator Spreadsheet',
                  ].map((resource, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-bg rounded-lg hover:bg-purple/5 transition-colors cursor-pointer">
                      <Award className="w-5 h-5 text-purple" />
                      <span className="text-sm text-navy">{resource}</span>
                      <span className="ml-auto text-xs text-text-muted">PDF</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related courses */}
            {relatedCourses.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display font-semibold text-xl text-navy mb-6">Related Courses</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedCourses.map(rc => (
                    <Link
                      key={rc.id}
                      to={`/courses/${rc.slug}`}
                      className="bg-white rounded-xl border border-gray-line overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
                    >
                      <img src={rc.image} alt={rc.title} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <h4 className="font-display font-semibold text-sm text-navy mb-1">{rc.title}</h4>
                        <p className="text-xs text-purple font-medium">${(rc.price / 100).toFixed(0)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Enrollment card */}
              <div className="bg-white rounded-2xl border border-gray-line p-6 shadow-card">
                <div className="text-center mb-6">
                  <p className="font-display font-bold text-3xl text-navy">
                    ${(course.price / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-text-muted">one-time payment</p>
                </div>
                <button
                  onClick={() => setIsEnrolled(!isEnrolled)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mb-3 ${
                    isEnrolled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-purple text-white hover:bg-purple/90 shadow-button'
                  }`}
                >
                  {isEnrolled ? 'Enrolled ✓' : 'Enroll Now'}
                </button>
                <p className="text-xs text-text-muted text-center">30-day money-back guarantee</p>
                <div className="mt-6 pt-6 border-t border-gray-line space-y-3">
                  {[
                    `${course.durationHours} hours of video content`,
                    `${course.lessonsCount} lessons`,
                    'Full lifetime access',
                    'Certificate of completion',
                    'AI Tutor access',
                    'Downloadable resources',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-text-muted">
                      <CheckCircle className="w-4 h-4 text-purple flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
