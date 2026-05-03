import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import StepProgressBar from "@/components/StepProgressBar";
import { mockJobs } from "@/data/mockData";
import { toast } from "sonner";

const stepLabels = ["Infos", "Expérience", "Documents", "Confirmation"];

const ApplyForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const job = mockJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Offre introuvable.</p>
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    toast.success("Candidature envoyée avec succès !", { position: "top-center" });
    setTimeout(() => navigate("/applications"), 1200);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="touch-target p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Postuler</h1>
            <p className="text-[11px] text-muted-foreground">{job.title}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6">
        <StepProgressBar currentStep={step} totalSteps={4} labels={stepLabels} />

        <div className="rounded-md border border-border bg-card p-5">
          {step === 0 && (
            <div className="animate-slide-in-right space-y-4">
              <h3 className="text-base font-semibold text-card-foreground">Informations personnelles</h3>
              <InputField label="Nom complet" placeholder="Ahmed Ben Ali" />
              <InputField label="Email" placeholder="ahmed@email.com" type="email" />
              <InputField label="Téléphone" placeholder="+216 55 123 456" type="tel" />
            </div>
          )}
          {step === 1 && (
            <div className="animate-slide-in-right space-y-4">
              <h3 className="text-base font-semibold text-card-foreground">Expérience professionnelle</h3>
              <InputField label="Poste actuel" placeholder="Ingénieur Qualité" />
              <InputField label="Années d'expérience" placeholder="3" type="number" />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Compétences clés
                </label>
                <textarea
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="ISO 9001, Lean Manufacturing..."
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-slide-in-right space-y-4">
              <h3 className="text-base font-semibold text-card-foreground">Documents</h3>
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Glissez votre CV ici ou appuyez pour parcourir
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, max 5 Mo</p>
              </div>
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Lettre de motivation (optionnel)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, max 5 Mo</p>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-slide-in-right space-y-4">
              <h3 className="text-base font-semibold text-card-foreground">Confirmation</h3>
              <div className="rounded-xl bg-muted p-4 text-sm text-card-foreground">
                <p className="font-semibold">{job.title}</p>
                <p className="text-xs text-muted-foreground">
                  {job.city} · {job.contractType}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                En soumettant votre candidature, vous acceptez que vos informations soient traitées
                conformément à notre politique de confidentialité.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={next}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-md bg-ok py-3 text-sm font-semibold text-white transition-colors hover:bg-okl"
            >
              <Send className="h-4 w-4" />
              Envoyer
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

const InputField = ({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default ApplyForm;
