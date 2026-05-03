import { CheckCircle2, Award, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full bg-[var(--page)] overflow-hidden" suppressHydrationWarning>
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--violet-b)] blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-[var(--bou-b)] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl p-6 mx-auto md:flex-row gap-0">
        {/* Left Side: Branding & Info */}
        <div className="hidden flex-col justify-center flex-1 p-12 text-foreground bg-card border border-border rounded-l-2xl md:flex h-[640px] overflow-hidden relative shadow-xl">
          <div className="relative z-10 flex flex-col gap-8 animate-slide-up-fade">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-ink leading-tight">
                Schulte Group <br/>
                <span className="text-violet">Tunisie</span>
              </h1>
              <p className="text-lg text-ink3 leading-relaxed max-w-md">
                Rejoignez une équipe spécialisée dans l'industrie automobile et propulsez votre carrière au niveau supérieur.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4 group">
                <div className="mt-1 h-8 w-8 rounded-lg bg-violetl flex items-center justify-center text-violet border border-[var(--violet-b)] group-hover:scale-110 transition-transform">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Recrutement Rapide</p>
                  <p className="text-sm text-ink4">Processus digitalisé et transparent.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="mt-1 h-8 w-8 rounded-lg bg-okl flex items-center justify-center text-ok border border-[var(--ok-b)] group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Avantages Compétitifs</p>
                  <p className="text-sm text-ink4">Environnement de travail premium.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="mt-1 h-8 w-8 rounded-lg bg-boul flex items-center justify-center text-bou border border-[var(--bou-b)] group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Excellence Industrielle</p>
                  <p className="text-sm text-ink4">Rejoignez un leader du secteur.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle logo background mark */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] select-none pointer-events-none">
            <div className="text-[240px] font-bold">S</div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex items-center justify-center flex-1 w-full p-8 bg-card2 border border-border rounded-2xl md:rounded-l-none md:rounded-r-2xl md:h-[640px] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none" />
          <div className="w-full max-w-[340px] relative z-10 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
