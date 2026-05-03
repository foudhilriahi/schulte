import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { ShieldCheck, LogIn, Eye, EyeOff } from 'lucide-react'
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
        useAuthStore.getState().logout()
        return
      }

      if (user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/applications')
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
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-white overflow-hidden">

      {/* SECTION GAUCHE : Branding & Ambiance (60% de l'écran sur desktop) */}
      <div className="hidden md:flex md:w-[60%] relative bg-[#0a0a0a] overflow-hidden items-center justify-center p-12">
        {/* Background Image with Premium Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background-hr.png"
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Schulte Tunisia Office"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>

        {/* Branding Content */}
        <div className="relative z-10 w-full max-w-xl animate-slide-up-fade">

          <h2 className="text-6xl font-black text-white tracking-tighter leading-[1.05] mb-8">
            Gérer l'excellence <br />
            <span className="text-violet">industrielle.</span>
          </h2>
          <p className="text-xl text-ink4 max-w-md leading-relaxed font-medium">
            Accédez au centre de commandement RH de Schulte Tunisie pour piloter vos recrutements et vos talents.
          </p>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 p-12 flex gap-12 border-t border-white/10 w-full">

          </div>
        </div>
      </div>

      {/* SECTION DROITE : Formulaire (40% de l'écran) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card relative">
        {/* Mobile accent bar */}
        <div className="md:hidden absolute top-0 left-0 w-full h-1.5 bg-violet" />

        <div className="w-full max-w-[360px] animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-ink mb-3 tracking-tight">Connexion RH</h1>
            <p className="text-ink3 text-sm font-semibold opacity-70">Entrez vos accès privilégiés ci-dessous.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2.5">
              <label className="text-[12px] font-black text-ink px-1 uppercase tracking-widest opacity-50">Email Professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-13 px-4 rounded-xl border-2 border-border bg-white text-sm transition-all focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/10 font-bold"
                placeholder="nom@schulte-tun.com"
                required
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-black text-ink uppercase tracking-widest opacity-50">Mot de passe</label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-13 px-4 pr-12 rounded-xl border-2 border-border bg-white text-sm transition-all focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/10 font-bold"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink3 hover:text-violet transition-colors p-1"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 rounded-2xl bg-violet text-white text-sm font-black shadow-xl shadow-violet/25 hover:bg-violeth hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Accéder au portail</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center gap-3 text-ink4">
              <ShieldCheck size={18} className="text-violet" />
              <p className="text-[11px] font-black uppercase tracking-widest leading-none">Système de sécurité actif</p>
            </div>
            <p className="mt-4 text-[11px] text-ink4 leading-relaxed font-medium">
              Accès strictement réservé au personnel autorisé de Schulte Tunisie.
              Toute tentative d'accès non autorisée sera enregistrée.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
