import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers'
import AdminContent from './AdminContent'
import AdminAnalytics from './AdminAnalytics'
import AdminSettings from './AdminSettings'
import AdminSecurity from './AdminSecurity'
import AdminLogin from './AdminLogin'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/content" element={<AdminContent />} />
      <Route path="/analytics" element={<AdminAnalytics />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/security" element={<AdminSecurity />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}
