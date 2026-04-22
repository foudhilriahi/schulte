interface PageLoadingStateProps {
  label?: string;
}

export function PageLoadingState({ label = "Chargement..." }: PageLoadingStateProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      </div>
    </main>
  );
}
