import { Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { mockNotifications } from "@/data/mockData";

const iconMap = {
  info: Bell,
  success: CheckCircle,
  warning: AlertTriangle,
};

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-2 px-4 pt-4">
        {mockNotifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <div
              key={n.id}
              className={`rounded-md border border-border bg-card p-4 transition-colors ${
                !n.read ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    n.type === "success"
                      ? "bg-okl text-ok"
                      : n.type === "warning"
                      ? "bg-warnl text-warn"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-card-foreground">{n.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("fr-TN")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default Notifications;
