import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  BrainCircuit, 
  Award, 
  Video,
  Users,
  Crown,
  Inbox
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'AI Coaching', href: '/ai-coaching', icon: BrainCircuit },
  { name: 'Live Sessions', href: '/live-sessions', icon: Video },
  { name: 'Leaderboard', href: '/leaderboard', icon: Award },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Subscription', href: '/subscription', icon: Crown },
  { name: 'Profile', href: '/profile', icon: Users },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
