import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface RecruiterReasoningPanelProps {
  candidateId: string;
  currentHrRating: number;
  currentHrNotes: string;
}

const RecruiterReasoningPanel = ({
  candidateId,
  currentHrRating,
  currentHrNotes,
}: RecruiterReasoningPanelProps) => {
  const [rating, setRating] = useState(currentHrRating || 0);
  const [notes, setNotes] = useState(currentHrNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setRating(currentHrRating || 0);
    setNotes(currentHrNotes || "");
  }, [currentHrRating, currentHrNotes]);

  const handleRatingChange = async (r: number) => {
    setRating(r);
    try {
      await api.patch(`/applications/${candidateId}/rating`, { rating: r });
      toast.success("Enregistré.");
    } catch {
      toast.error("Échec — réessaie.");
    }
  };

  const handleNotesBlur = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/applications/${candidateId}/notes`, { notes });
      toast.success("Enregistré.");
    } catch {
      toast.error("Échec — réessaie.");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4 mb-2">Décision HR</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleRatingChange(1)}
            className={`flex-1 rounded-md border py-1.5 text-[11px] font-semibold transition-colors ${
              rating === 1 ? "bg-errl border-err text-err" : "bg-card2 border-border text-ink3 hover:border-border2"
            }`}
          >
            Non
          </button>
          <button
            onClick={() => handleRatingChange(2)}
            className={`flex-1 rounded-md border py-1.5 text-[11px] font-semibold transition-colors ${
              rating === 2 ? "bg-warnl border-warn text-warn" : "bg-card2 border-border text-ink3 hover:border-border2"
            }`}
          >
            Hésitant
          </button>
          <button
            onClick={() => handleRatingChange(3)}
            className={`flex-1 rounded-md border py-1.5 text-[11px] font-semibold transition-colors ${
              rating === 3 ? "bg-okl border-ok text-ok" : "bg-card2 border-border text-ink3 hover:border-border2"
            }`}
          >
            Retenir
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink4">Raisonnement (Notes privées)</p>
          {savingNotes && <span className="text-[9px] text-ink4">Enregistrement...</span>}
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Justifiez la décision par rapport au profil..."
          className="min-h-[80px] text-[12px] bg-card2 border-border"
        />
      </div>
    </div>
  );
};

export default RecruiterReasoningPanel;
