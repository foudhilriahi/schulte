export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background md:bg-muted/30" suppressHydrationWarning>
      {/* Dynamic Background for Auth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-6 mx-auto md:max-w-4xl md:flex-row">
        {/* Left Branding Panel (Hidden on Mobile) */}
        <div className="hidden flex-col justify-center flex-1 p-8 text-primary-foreground bg-primary rounded-l-2xl md:flex h-[600px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600 opacity-90 z-0" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

          <div className="relative z-10 flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight">Schulte Group Tunisie</h1>
            <p className="text-lg text-primary-foreground/80">
              Rejoignez une équipe dynamique spécialisée dans le secteur de l'automobile et propulsez votre carrière.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span>Processus de recrutement rapide</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span>Avantages compétitifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms Container */}
        <div className="flex items-center justify-center flex-1 w-full p-8 bg-background border rounded-2xl md:rounded-l-none md:rounded-r-2xl border-border/50 shadow-xl shadow-border/20 md:h-[600px]">
          <div className="w-full max-w-[350px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
