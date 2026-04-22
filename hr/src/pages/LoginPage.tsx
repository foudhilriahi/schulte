import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import logo from '@/assets/logo.png'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      
      // Only allow HR and ADMIN roles
      if (user?.role !== 'HR' && user?.role !== 'ADMIN') {
        toast.error('Accès refusé. Cette application est réservée au personnel RH et administrateurs.')
        // Force logout
        useAuthStore.getState().logout()
        return
      }
      
      if (user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
      toast.success('Connexion réussie')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Identifiants invalides'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm bg-card rounded-md shadow-card border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Schulte Tunisia" className="h-12 w-auto mb-4" />
          <h1 className="text-xl font-bold text-ink">Schulte Tunisia</h1>
          <p className="text-sm text-ink3 mt-1">Portail Interne — RH & Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-sm border border-input bg-card text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-violetl"
              placeholder="nom@schulte-tun.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">Mot de passe</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-sm border border-input bg-card text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-violetl"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink3 hover:text-ink"
              >
                {showPw ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-violeth transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px] text-ink4">Accès réservé. Compte géré par l'administrateur.</p>
          <p className="text-[11px] text-ink4">Mot de passe oublié ? Contactez l'administrateur.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
