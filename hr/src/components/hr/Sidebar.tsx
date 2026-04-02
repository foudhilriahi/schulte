import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Columns3, Users, CalendarDays, Settings, LogOut,
  Shield, FileText, Home,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import logo from '@/assets/logo.png'

const hrNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/offers', icon: Briefcase, label: 'Offres' },
  { to: '/applications', icon: Columns3, label: 'Candidatures' },
  { to: '/candidates', icon: Users, label: 'Candidats' },
  { to: '/interviews', icon: CalendarDays, label: 'Entretiens' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

const adminNavItems = [
  { to: '/admin', icon: Home, label: 'Overview' },
  { to: '/admin/hr-accounts', icon: Users, label: 'HR Accounts' },
  { to: '/admin/templates', icon: FileText, label: 'Templates' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? adminNavItems : hrNavItems

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img src={logo} alt="Schulte Tunisia" className="h-9 w-auto" />
        <div>
          <p className="text-sm font-bold text-sidebar-primary">Schulte Tunisia</p>
          <p className="text-xs text-sidebar-muted">{isAdmin ? 'Admin Panel' : 'Portail RH'}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-accent'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-[3px] border-transparent'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-primary">{user?.name || 'User'}</p>
            <p className="text-xs text-sidebar-muted capitalize">{user?.role?.toLowerCase() || ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {user?.site && (
            <Badge variant="outline" className="border-sidebar-border text-sidebar-foreground/80 text-xs capitalize">
              {user.site}
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="outline" className="border-sidebar-border text-sidebar-foreground/80 text-xs">
              <Shield className="h-3 w-3 mr-1" /> Admin
            </Badge>
          )}
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-sidebar-muted hover:text-destructive transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
