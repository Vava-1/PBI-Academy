import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await api.post('/admin/login', {
        email,
        password,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
      })

      // Store admin token
      localStorage.setItem('pbi_admin_token', data.token)
      localStorage.setItem('pbi_admin_user', JSON.stringify(data.adminUser))
      
      navigate('/admin/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Portal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-purple mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy mb-2">Admin Portal</h1>
          <p className="text-text-muted">PBI Academy Management System</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <AlertCircle className="w-4 h-4 mr-1" />
            Restricted Access
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-navy">Welcome Back</h2>
            <p className="text-text-muted mt-2">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple text-white py-3 rounded-lg hover:bg-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-purple hover:text-purple/90 text-sm">
              ← Back to PBI Academy
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-navy mb-3">Demo Credentials</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Admin Email:</span> admin@pbiacademy.com
            </div>
            <div>
              <span className="font-medium">Password:</span> admin123
            </div>
            <div className="text-text-muted text-xs mt-2">
              Note: You'll need to create an admin user in the database first
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
