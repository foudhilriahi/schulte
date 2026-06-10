import { useState, useEffect, useRef, type RefObject } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface RecruiterReasoningPanelProps {
  candidateId: string;
  currentHrRating: number;
  currentHrNotes: string;
  notesInputRef?: RefObject<HTMLTextAreaElement>;
}

const RecruiterReasoningPanel = ({
  candidateId,
  currentHrRating,
  currentHrNotes,
  notesInputRef,
}: RecruiterReasoningPanelProps) => {
  const [rating, setRating] = useState(currentHrRating || 0);
  const [notes, setNotes] = useState(currentHrNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedNotesRef = useRef(currentHrNotes || "");
  const saveSeqRef = useRef(0);

  useEffect(() => {
    setRating(currentHrRating || 0);
    setNotes(currentHrNotes || "");
    lastSavedNotesRef.current = currentHrNotes || "";
    setSavedAt(null);
    setSavingNotes(false);
    saveSeqRef.current += 1;
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [currentHrRating, currentHrNotes, candidateId]);

  useEffect(() => {
    if (!savedAt) return;
    const timeoutId = window.setTimeout(() => setSavedAt(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [savedAt]);

  const persistNotes = async (nextNotes: string, showSuccessToast: boolean) => {
    const seq = ++saveSeqRef.current;
    setSavingNotes(true);
    try {
      await api.patch(`/applications/${candidateId}/notes`, { notes: nextNotes });
      if (saveSeqRef.current !== seq) return;
      lastSavedNotesRef.current = nextNotes;
      setSavedAt(Date.now());
      if (showSuccessToast) {
        toast.success("Enregistré.");
      }
    } catch {
      if (saveSeqRef.current !== seq) return;
      toast.error("Échec — réessaie.");
    } finally {
      if (saveSeqRef.current === seq) {
        setSavingNotes(false);
      }
    }
  };

  useEffect(() => {
    if (notes === lastSavedNotesRef.current) return;
    setSavedAt(null);
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      void persistNotes(notes, false);
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [notes, candidateId]);

  const handleRatingChange = async (r: number) => {
    setRating(r);
    try {
      await api.patch(`/applications/${candidateId}/rating`, { rating: r });
      toast.success("Enregistré.");
    } catch {
      toast.error("Échec — réessaie.");
    }
  };

  const handleNotesBlur = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (notes === lastSavedNotesRef.current) return;
    void persistNotes(notes, true);
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
          {savingNotes ? (
            <span className="text-[9px] text-ink4">Enregistrement...</span>
          ) : savedAt ? (
            <span className="text-[9px] text-ink4">Enregistré</span>
          ) : null}
        </div>
        <Textarea
          ref={notesInputRef}
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
