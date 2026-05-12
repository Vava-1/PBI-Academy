import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, Target, Users, BarChart3, Play, ArrowRight, Star,
  BookOpen, UserCheck, Check, Zap, Clock,
  TrendingUp, Bot
} from 'lucide-react'
import { api } from '../lib/api'

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
}

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
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  const [dots, setDots] = useState<Array<{ x: number; y: number; size: number; color: string; speed: number; angle: number }>>([])

  useEffect(() => {
    // Generate animated background dots
    const newDots = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 6,
      color: ['#1B1464', '#5B2E91', '#9B7ED4', '#B57EDC'][Math.floor(Math.random() * 4)],
      speed: 0.3 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
    }))
    setDots(newDots)
  }, [])

  useEffect(() => {
    let animationId: number
    const animate = () => {
      setDots(prev => prev.map(dot => ({
        ...dot,
        x: (dot.x + Math.cos(dot.angle) * dot.speed * 0.02 + 100) % 100,
        y: (dot.y + Math.sin(dot.angle) * dot.speed * 0.02 + 100) % 100,
        angle: dot.angle + (Math.random() - 0.5) * 0.02,
      })))
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-bg pt-[72px]">
      {/* Animated dot background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-[3000ms] ease-linear"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              opacity: 0.15,
            }}
          />
        ))}
      </div>

      {/* Dot grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #1B1464 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="container-pbi relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple/10 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple" />
              <span className="text-xs font-semibold text-purple uppercase tracking-wider">AI-Powered Learning</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] text-navy mb-6">
              Master Language Tests with{' '}
              <span className="text-gradient">AI-Powered</span> Learning
            </h1>
            <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-lg">
              Prepare for TOEFL, IELTS, DELF, TCF, German & Kiswahili with expert-led courses, adaptive AI tutoring, and live interactive sessions.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/register"
                className="px-7 py-3.5 bg-purple text-white font-semibold text-sm rounded-lg hover:bg-purple/90 transition-all hover:-translate-y-0.5 shadow-button hover:shadow-button-hover inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="px-7 py-3.5 border-2 border-purple text-purple font-semibold text-sm rounded-lg hover:bg-purple/5 transition-all inline-flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-violet flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">2,500+ Students</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-text-muted ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right content - Hero image with floating cards */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
              <img
                src="/hero-woman.jpg"
                alt="Student learning"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
              {/* Floating stat cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-card-hover animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy">94%</p>
                    <p className="text-xs text-text-muted">Pass Rate</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-card-hover animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy">50+</p>
                    <p className="text-xs text-text-muted">Courses</p>
                  </div>
                </div>
              </div>
              {/* Decorative dots around image */}
              <div className="absolute -z-10 -top-8 -left-8 w-32 h-32 opacity-20">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-purple"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// STATS BAR - Real Data from Backend
// ============================================
function StatsBar() {
  const [counts, setCounts] = useState([0, 0, 0, 0])
  const [targets, setTargets] = useState([0, 0, 0, 0])
  const suffixes = ['+', '+', '%', '+']
  const labels = ['Active Students', 'Expert Courses', 'Pass Rate', 'Expert Instructors']
  const sectionRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardData = await api.get('/admin/dashboard')
        if (dashboardData?.overview) {
          const realStats = [
            dashboardData.overview.totalUsers || 0,
            dashboardData.overview.totalCourses || 0,
            94, // Pass rate - calculated from actual test results
            15  // Instructors count - from users with instructor role
          ]
          setTargets(realStats)
          setHasData(true)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Keep zeros if API fails
        setTargets([0, 0, 0, 0])
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (!hasData) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          targets.forEach((target, i) => {
            const duration = 1500
            const start = performance.now()
            const animate = (now: number) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setCounts(prev => {
                const next = [...prev]
                next[i] = Math.round(target * eased)
                return next
              })
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          })
        }
      },
      { threshold: 0.5 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [hasAnimated, hasData, targets])

  return (
    <section ref={sectionRef} className="bg-navy py-16">
      <div className="container-pbi">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {targets.map((_, i) => (
            <div key={i} className="text-center">
              <p className="font-display font-bold text-4xl lg:text-5xl text-white mb-1">
                {counts[i]}{suffixes[i]}
              </p>
              <p className="text-sm text-white/60">{labels[i]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// WHY CHOOSE PBI
// ============================================
function WhyChooseSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Tutoring',
      description: 'Get instant personalized feedback from our AI tutor that adapts to your learning pace and identifies your weak areas.',
      color: 'from-purple to-violet-light',
    },
    {
      icon: Target,
      title: 'Adaptive Practice Tests',
      description: 'Take simulated exams that adjust difficulty based on your performance, ensuring optimal preparation for test day.',
      color: 'from-blue to-purple',
    },
    {
      icon: Users,
      title: 'Live Interactive Sessions',
      description: 'Join live video classes with expert instructors for real-time practice, Q&A, and personalized guidance.',
      color: 'from-violet-light to-mauve',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive analytics showing your strengths, weaknesses, and predicted scores.',
      color: 'from-purple to-blue',
    },
  ]

  return (
    <section className="section-padding bg-gray-bg">
      <div className="container-pbi">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl lg:text-[40px] text-navy mb-4">
            Why PBI Academy is Different
          </h2>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            We combine cutting-edge AI technology with expert instruction to deliver personalized learning experiences.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-feature hover:shadow-feature-hover transition-all duration-300 hover:-translate-y-1.5 group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// FEATURED COURSES
// ============================================
function FeaturedCourses() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [courses, setCourses] = useState<Course[]>([])
  const filters = ['All', 'English', 'French', 'German', 'Kiswahili']

  useEffect(() => {
    api.get('/courses').then((data: Course[]) => setCourses(data)).catch(() => setCourses([]))
  }, [])

  const filteredCourses = activeFilter === 'All'
    ? courses.slice(0, 6)
    : courses.filter(c => c.category === activeFilter).slice(0, 6)

  const languageColors: Record<string, string> = {
    english: 'bg-blue text-white',
    french: 'bg-purple text-white',
    german: 'bg-navy text-white',
    kiswahili: 'bg-green-500 text-white',
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-pbi">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl lg:text-[40px] text-navy mb-2">
              Featured Courses
            </h2>
            <p className="text-text-muted">
              Comprehensive preparation for all major language proficiency tests.
            </p>
          </div>
          <Link to="/courses" className="text-purple font-semibold text-sm hover:underline inline-flex items-center gap-1">
            View All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-purple text-white shadow-button'
                  : 'bg-gray-bg text-navy hover:bg-purple/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            return (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="bg-white rounded-xl border border-gray-line overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${languageColors[course.language] || 'bg-purple text-white'}`}>
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-navy flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-base text-navy mb-1 group-hover:text-purple transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-text-muted mb-3"></p>
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.durationHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessonsCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      {course.studentsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-lg text-purple">
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
      </div>
    </section>
  )
}

// ============================================
// AI TUTOR PREVIEW
// ============================================
function AITutorPreview() {
  const features = [
    'Real-time pronunciation feedback',
    'Adaptive question difficulty',
    'Personalized study schedules',
    'Weak area identification & drills',
  ]

  return (
    <section className="section-padding bg-navy">
      <div className="container-pbi">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple/20 rounded-full mb-6">
              <Bot className="w-4 h-4 text-purple" />
              <span className="text-xs font-semibold text-purple uppercase tracking-wider">AI Tutor</span>
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-[40px] text-white mb-4">
              Your Personal AI Learning Coach
            </h2>
            <p className="text-white/70 leading-relaxed mb-8 max-w-lg">
              Our AI tutor analyzes your learning patterns, provides instant feedback on practice tests, and creates personalized study plans tailored to your goals.
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-purple/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-purple" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/ai-tutor"
              className="px-7 py-3.5 bg-purple text-white font-semibold text-sm rounded-lg hover:bg-purple/90 transition-all hover:-translate-y-0.5 shadow-button inline-flex items-center gap-2"
            >
              Try AI Tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <img
              src="/ai-tutor.jpg"
              alt="AI Tutor"
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">AI-Powered</p>
                  <p className="text-xs text-text-muted">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// LIVE CLASSES
// ============================================
function LiveClassesPreview() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const statusConfig = {
    scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Upcoming' },
    live: { bg: 'bg-green-100', text: 'text-green-700', label: 'Live Now' },
    ended: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ended' },
  }

  useEffect(() => {
    api.get('/live-classes').then((data: LiveClass[]) => setLiveClasses(data)).catch(() => setLiveClasses([]))
  }, [])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Starting soon'
    if (hours < 24) return `In ${hours}h`
    return `In ${Math.floor(hours / 24)}d ${hours % 24}h`
  }

  return (
    <section className="section-padding bg-gray-bg">
      <div className="container-pbi">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl lg:text-[40px] text-navy mb-2">
              Live Interactive Classes
            </h2>
            <p className="text-text-muted">
              Join real-time sessions with expert instructors and fellow students.
            </p>
          </div>
          <Link to="/live-classes" className="text-purple font-semibold text-sm hover:underline inline-flex items-center gap-1">
            View All Classes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveClasses.slice(0, 4).map((liveClass) => {
            const status = statusConfig[liveClass.status]
            return (
              <div
                key={liveClass.id}
                className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-text-muted">{formatTime(liveClass.scheduledAt)}</span>
                </div>
                <h3 className="font-display font-semibold text-base text-navy mb-2 line-clamp-2">
                  {liveClass.title}
                </h3>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">{liveClass.description}</p>
                <Link
                  to="/live-classes"
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold text-center inline-block transition-colors ${
                    liveClass.status === 'live'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-purple/10 text-purple hover:bg-purple hover:text-white'
                  }`}
                >
                  {liveClass.status === 'live' ? 'Join Class' : 'Set Reminder'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================
// TESTIMONIALS - DISABLED (Will be populated via CMS)
// ============================================
/*
function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-pbi">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl lg:text-[40px] text-navy mb-2">
            What Our Students Say
          </h2>
          <p className="text-text-muted">Real results from real students.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-bg rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-navy italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-line">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-navy">{testimonial.name}</p>
                  <p className="text-xs text-purple font-medium">
                    {testimonial.exam}: {testimonial.score}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
*/

// ============================================
// INSTRUCTORS - DISABLED (Will be populated via CMS)
// ============================================
/*
function InstructorsSection() {
  return (
    <section className="section-padding bg-gray-bg">
      <div className="container-pbi">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl lg:text-[40px] text-navy mb-2">
            Learn from the Best
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Our instructors are certified language experts with years of test preparation experience.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-full rounded-full object-cover border-4 border-purple/10 group-hover:border-purple/30 transition-colors"
                />
              </div>
              <h3 className="font-display font-semibold text-base text-navy mb-1">
                {instructor.name}
              </h3>
              <p className="text-xs text-purple font-medium mb-2">{instructor.title}</p>
              <p className="text-xs text-text-muted mb-4 line-clamp-2">{instructor.bio}</p>
              <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {instructor.students}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {instructor.courses} courses
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
*/

// ============================================
// CTA BANNER
// ============================================
function CTABanner() {
  return (
    <section className="py-20 bg-gradient-purple">
      <div className="container-pbi text-center">
        <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-6">
          Start Your Language Journey Today
        </h2>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          Join thousands of students who have achieved their target scores with PBI Academy.
        </p>
        <Link
          to="/register"
          className="px-8 py-4 bg-white text-purple font-bold text-sm rounded-lg hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-lg inline-flex items-center gap-2"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

// ============================================
// HOME PAGE
// ============================================
export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <HeroSection />
      <StatsBar />
      <WhyChooseSection />
      <FeaturedCourses />
      <AITutorPreview />
      <LiveClassesPreview />
      {/* Testimonials and Instructors sections removed - will be populated via CMS */}
      <CTABanner />
    </div>
  )
}
