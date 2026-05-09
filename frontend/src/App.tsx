import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layouts
import { RootLayout } from './components/layout/RootLayout'
import { ExamLayout } from './components/layout/ExamLayout'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CourseCatalogPage } from './pages/CourseCatalogPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { LearningPage } from './pages/LearningPage'
import { ExamSimulationPage } from './pages/ExamSimulationPage'
import { AICoachingPage } from './pages/AICoachingPage'
import { LiveSessionsPage } from './pages/LiveSessionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { ProfilePage } from './pages/ProfilePage'
import { InboxPage } from './pages/InboxPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with main layout */}
      <Route element={
        <ProtectedRoute>
          <RootLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/learn/:courseId" element={<LearningPage />} />
        <Route path="/ai-coaching" element={<AICoachingPage />} />
        <Route path="/live-sessions" element={<LiveSessionsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Route>

      {/* Exam simulation - fullscreen layout */}
      <Route path="/exam/:examId" element={
        <ProtectedRoute>
          <ExamLayout>
            <ExamSimulationPage />
          </ExamLayout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
