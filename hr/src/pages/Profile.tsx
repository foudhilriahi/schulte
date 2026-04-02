import { User, Mail, Phone, MapPin, FileText, ChevronRight } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Mon Profil</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">Ahmed Ben Ali</h2>
          <p className="text-sm text-muted-foreground">Ingénieur Qualité</p>
        </div>

        {/* Info */}
        <div className="space-y-2">
          {[
            { icon: Mail, label: "ahmed.benali@email.com" },
            { icon: Phone, label: "+216 55 123 456" },
            { icon: MapPin, label: "Tunis, Tunisie" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-card-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          {["Mon CV", "Paramètres", "Aide & Support"].map((item) => (
            <button
              key={item}
              className="touch-target flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">{item}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
