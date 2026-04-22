import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Columns3, Users, CalendarDays, Settings, LogOut,
  Shield, FileText, Home,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import logo from '@/assets/logo.png'

const hrNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/offers', icon: Briefcase, label: 'Offres' },
  { to: '/applications', icon: Columns3, label: 'Candidatures' },
  { to: '/candidates', icon: Users, label: 'Candidats' },
  { to: '/interviews', icon: CalendarDays, label: 'Entretiens' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

const adminNavItems = [
  { to: '/admin', icon: Home, label: 'Vue d\'ensemble' },
  { to: '/admin/hr-accounts', icon: Users, label: 'Comptes RH' },
  { to: '/admin/templates', icon: FileText, label: 'Modeles' },
  { to: '/admin/settings', icon: Settings, label: 'Parametres' },
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[210px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 pb-5 pt-5 border-b border-sidebar-border mb-2">
        <img src={logo} alt="Schulte Tunisia" className="h-9 w-auto" />
        <div>
          <p className="text-[15px] font-bold text-ink">Schulte Tunisia</p>
          <p className="text-[10px] font-mono text-ink4">{isAdmin ? 'ADMIN PANEL' : 'PORTAIL RH'}</p>
        </div>
      </div>

      <nav className="flex-1 px-0 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                isActive
                  ? 'bg-violetl text-violet'
                  : 'text-ink3 hover:bg-card2 hover:text-ink'
              }`}
            >
              {isActive && <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-[3px] bg-violet" />}
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violetl text-xs font-bold text-violet">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user?.name || 'User'}</p>
            <p className="text-[10px] font-mono text-ink4 uppercase">{user?.role?.toLowerCase() || ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {user?.site && (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono tracking-[-0.05em] capitalize ${
                user.site === 'Bouarada'
                  ? 'bg-boul border-[var(--bou-b)] text-primary'
                  : 'bg-zagl border-[var(--zag-b)] text-ok'
              }`}
            >
              {user.site}
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="outline" className="bg-violetl border-[var(--violet-b)] text-violet text-[10px] font-mono">
              <Shield className="h-3 w-3 mr-1" /> Admin
            </Badge>
          )}
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-ink4 hover:text-err transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
