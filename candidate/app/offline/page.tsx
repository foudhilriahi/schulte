export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-page text-ink px-6 py-10">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-[20px] font-semibold">Vous êtes hors ligne</h1>
        <p className="text-[13px] text-ink3">
          Impossible de joindre le réseau pour le moment. Vos dernières données mises en cache restent disponibles.
        </p>
        <p className="text-[13px] text-ink3">
          Réessayez dans quelques instants pour synchroniser vos candidatures et vos notifications.
        </p>
      </div>
    </main>
  );
}
