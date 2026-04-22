export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Vous etes hors ligne</h1>
        <p className="text-sm text-muted-foreground">
          Impossible de joindre le reseau pour le moment. Vos dernieres donnees mises en cache restent disponibles.
        </p>
        <p className="text-sm text-muted-foreground">
          Reessayez dans quelques instants pour synchroniser vos candidatures et vos notifications.
        </p>
      </div>
    </main>
  );
}
