import { mockApplications } from "@/data/mockData";
import ApplicationTimeline from "@/components/ApplicationTimeline";

const MyApplications = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Mes Candidatures</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {mockApplications.map((app) => (
          <div
            key={app.id}
            className={`rounded-2xl border border-border bg-card p-4 ${
              app.city === "Bouarada" ? "card-bouarada" : "card-zaghouan"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  app.city === "Bouarada"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary"
                }`}
              >
                {app.city}
              </span>
              <h3 className="text-sm font-bold text-card-foreground">{app.jobTitle}</h3>
            </div>
            <ApplicationTimeline application={app} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default MyApplications;
