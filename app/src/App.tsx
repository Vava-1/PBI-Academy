import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Dashboard from './pages/Dashboard'
import AITutor from './pages/AITutor'
import LeaderboardPage from './pages/LeaderboardPage'
import LiveClasses from './pages/LiveClasses'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminApp from './pages/AdminApp'
import { AuthProvider } from './hooks/useAuth'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isAdminPage = location.pathname.startsWith('/admin')

  // Admin pages have their own layout, no Navigation/Footer
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-bg">
        {children}
      </div>
    )
  }

  // Main app layout
  return (
    <div className="min-h-screen bg-gray-bg">
      {!isAuthPage && <Navigation />}
      <main>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-bg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-navy text-lg font-semibold">PBI Academy</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Panel Routes - All handled by AdminApp */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  )
}

export default App
