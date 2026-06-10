import { CheckCircle2, Award, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-[100dvh] w-full bg-page overflow-x-hidden"
      suppressHydrationWarning
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--vb)] blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-[var(--bou-b)] blur-[100px]" />
      </div>

      {/* Outer centering wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-center w-full max-w-6xl mx-auto min-h-[100dvh] md:min-h-0 md:my-auto md:p-6">

        {/* ── Left panel: branding (desktop only) ── */}
        <div className="hidden md:flex flex-col justify-center flex-1 p-10 text-ink bg-card border border-border rounded-xl md:h-[640px] overflow-hidden relative shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
          <div className="relative z-10 flex flex-col gap-8 animate-slide-up-fade">
            <div className="space-y-4">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink leading-tight">
                Schulte Group <br />
                <span className="text-v">Tunisie</span>
              </h1>
              <p className="text-[14px] text-ink3 leading-relaxed max-w-md">
                Rejoignez une équipe spécialisée dans l'industrie automobile et propulsez votre carrière au niveau supérieur.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4 group">
                <Zap className="h-4 w-4 text-v mt-1" />
                <div>
                  <p className="font-semibold text-ink">Recrutement Rapide</p>
                  <p className="text-[13px] text-ink4">Processus digitalisé et transparent.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <Award className="h-4 w-4 text-ok mt-1" />
                <div>
                  <p className="font-semibold text-ink">Avantages Compétitifs</p>
                  <p className="text-[13px] text-ink4">Environnement de travail premium.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <CheckCircle2 className="h-4 w-4 text-bou mt-1" />
                <div>
                  <p className="font-semibold text-ink">Excellence Industrielle</p>
                  <p className="text-[13px] text-ink4">Rejoignez un leader du secteur.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle watermark */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] select-none pointer-events-none">
            <div className="text-[240px] font-semibold">S</div>
          </div>
        </div>

        {/* ── Right panel: auth form ── */}
        <div className="flex flex-col flex-1 w-full bg-card border-t border-border md:border md:border-l-0 md:rounded-xl md:h-[640px] shadow-[0_1px_3px_rgba(15,13,28,0.05)] relative overflow-hidden">
          {/* Mobile top branding strip */}
          <div className="md:hidden flex items-center justify-center pt-10 pb-2 px-6">
            <div className="text-center">
              <span className="font-sans font-semibold text-[13px] tracking-tight text-ink">
                SCHULTE<span className="text-v">&</span><span className="text-ink3">CO</span>
              </span>
              <p className="text-[11px] text-ink4 mt-0.5">Plateforme de recrutement</p>
            </div>
          </div>

          {/* Scrollable form area */}
          <div className="relative z-10 flex-1 flex items-start md:items-center justify-center">
            <div className="w-full max-w-[360px] px-6 py-8 md:py-0 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
