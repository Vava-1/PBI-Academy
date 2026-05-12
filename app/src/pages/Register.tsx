import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting registration with:', { name, email })
      const success = await register(name, email, password)
      console.log('Registration result:', success)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-navy">PBI Academy</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-line shadow-card p-8">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-2xl text-navy mb-2">Get Started Free</h1>
            <p className="text-sm text-text-muted">Create your account and start learning today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-bg border border-gray-line rounded-xl text-navy placeholder:text-text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-line text-purple focus:ring-purple" required />
              <span className="text-xs text-text-muted">
                I agree to the{' '}
                <a href="#" className="text-purple hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-purple text-white font-semibold rounded-xl hover:bg-purple/90 transition-all shadow-button hover:shadow-button-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-purple font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted mb-3">Trusted by 2,500+ students worldwide</p>
          <div className="flex items-center justify-center gap-6">
            {['TOEFL', 'IELTS', 'DELF', 'Goethe'].map((org) => (
              <span key={org} className="text-xs font-semibold text-navy/40">{org}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
