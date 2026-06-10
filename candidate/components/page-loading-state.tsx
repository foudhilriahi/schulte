interface PageLoadingStateProps {
  label?: string;
}

export function PageLoadingState({ label = "Chargement..." }: PageLoadingStateProps) {
  return (
    <main className="min-h-screen bg-page px-6 py-12">
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--vb)] border-t-v" />
          <span className="text-[13px] font-medium text-ink">{label}</span>
        </div>
      </div>
    </main>
  );
}
