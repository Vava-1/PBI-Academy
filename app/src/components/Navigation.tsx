import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, BookOpen, User, LayoutDashboard, Bot, Trophy, Video, LogOut, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navLinks = [
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Live Classes', href: '/live-classes', icon: Video },
  { label: 'AI Tutor', href: '/ai-tutor', icon: Bot },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
]

const userLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Tutor', href: '/ai-tutor', icon: Bot },
  { label: 'My Courses', href: '/dashboard?tab=courses', icon: BookOpen },
  { label: 'Live Classes', href: '/live-classes', icon: Video },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const isActive = (href: string) => {
    if (href === '/dashboard?tab=courses') return location.pathname === '/dashboard'
    return location.pathname === href
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-bg/90 backdrop-blur-xl shadow-sm border-b border-gray-line'
            : 'bg-transparent'
        }`}
      >
        <div className="container-pbi">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-purple flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-navy group-hover:text-purple transition-colors">
                PBI Academy
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors relative ${
                    isActive(link.href)
                      ? 'text-purple'
                      : 'text-navy hover:text-purple'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button className="relative p-2 text-navy hover:text-purple transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple/20"
                      />
                      <span className="text-sm font-medium text-navy">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card-hover border border-gray-line py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-line mb-1">
                          <p className="text-sm font-semibold text-navy">{user?.name}</p>
                          <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                        {userLinks.map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-navy hover:bg-gray-bg transition-colors"
                          >
                            <link.icon className="w-4 h-4 text-purple" />
                            {link.label}
                          </Link>
                        ))}
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-navy hover:text-purple transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-lg hover:bg-purple/90 transition-all hover:-translate-y-0.5 shadow-button hover:shadow-button-hover"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-navy"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 pt-20">
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-bg rounded-xl">
                  <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-navy">{user?.name}</p>
                    <p className="text-xs text-text-muted">Level {user?.level} • {user?.points} pts</p>
                  </div>
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-purple/10 text-purple' : 'text-navy hover:bg-gray-bg'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-line my-2" />
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-navy hover:bg-gray-bg"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <div className="border-t border-gray-line my-2" />
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-navy hover:bg-gray-bg"
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 px-3 py-3 bg-purple text-white rounded-lg text-sm font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
