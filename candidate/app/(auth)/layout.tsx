export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background" suppressHydrationWarning>
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-6 mx-auto md:max-w-4xl md:flex-row">
        <div className="hidden flex-col justify-center flex-1 p-8 text-foreground bg-card border border-border rounded-l-md md:flex h-[600px] overflow-hidden relative">
          <div className="relative z-10 flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight">Schulte Group Tunisie</h1>
            <p className="text-lg text-muted-foreground">
              Rejoignez une équipe dynamique spécialisée dans le secteur de l'automobile et propulsez votre carrière.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Processus de recrutement rapide</span>
              </div>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Avantages compétitifs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 w-full p-8 bg-s2 border rounded-md md:rounded-l-none md:rounded-r-md border-border md:h-[600px]">
          <div className="w-full max-w-[350px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
