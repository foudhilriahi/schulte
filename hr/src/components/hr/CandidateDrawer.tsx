import { useEffect, useState } from "react";
import { Star, Phone, Mail, MapPin, Briefcase, X, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { authSession } from "@/lib/authSession";
import { toast } from "sonner";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import {
  runDualAnalysis,
  persistDualAnalysis,
  normalizeStoredDualAnalysis,
  type DualAnalysisResult,
} from "@/lib/dual-ai-analysis";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

interface CandidateDrawerProps {
  candidate: any;
  open: boolean;
  onClose: () => void;
}

const CandidateDrawer = ({
  candidate,
  open,
  onClose,
}: CandidateDrawerProps) => {
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [analysis, setAnalysis] = useState<DualAnalysisResult | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    if (!open || !candidate) return;
    setNotes(candidate.notes || "");
    setRating(candidate.starRating || 0);
    setAnalysis(normalizeStoredDualAnalysis(candidate.aiAnalysis));
  }, [candidate?.id, open]);

  if (!open || !candidate) return null;

  const saveNotes = async () => {
    try {
      await api.patch(`/applications/${candidate.id}/notes`, { notes });
      toast.success("Notes saved.");
    } catch {
      toast.error("Error saving notes");
    }
  };

  const saveRating = async (r: number) => {
    setRating(r);
    try {
      await api.patch(`/applications/${candidate.id}/rating`, { rating: r });
      toast.success("Rating saved.");
    } catch {
      toast.error("Error saving rating");
    }
  };

  const runDualAI = async () => {
    setAnalysing(true);
    
    try {
      const dualResult = await runDualAnalysis(candidate.id, {
        cvText: candidate.analysisText || "",
        offerTitle: candidate.jobTitle || "",
        requiredSkills: candidate.requiredSkills || [],
        experienceYears: candidate.experienceYears || 0,
        description: candidate.description || "",
      });

      await persistDualAnalysis(candidate.id, dualResult);
      setAnalysis(dualResult);

      if (dualResult.providers.length === 1) {
        toast.success(`Dual analysis complete (single provider succeeded: ${dualResult.providers[0].name})`);
      } else {
        toast.success("Dual analysis complete and saved.");
      }
    } catch (error: any) {
      console.error("Dual AI analysis error:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Dual AI analysis unavailable";
      toast.error(errorMsg);
    } finally {
      setAnalysing(false);
    }
  };

  const confidenceLevel = analysis?.mergedConfidence || "";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-[860px] bg-white border-l border-slate-200 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{candidate.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Panel — Profile */}
          <div className="space-y-5">
            {/* Identity */}
            <section>
              <h3 className="text-sm font-semibold text-[#1A2B4A] mb-2">
                Identity
              </h3>
              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {candidate.phone || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {candidate.email || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {candidate.city || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  {candidate.jobTitle} — {candidate.contractType}
                </p>
              </div>
            </section>

            {/* Skills */}
            {candidate.skills?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-[#1A2B4A] mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* HR Actions */}
            <section>
              <h3 className="text-sm font-semibold text-[#1A2B4A] mb-2">
                HR Actions
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Star Rating
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 cursor-pointer transition-colors ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                        onClick={() => saveRating(s)}
                      />
                    ))}
                  </div>
                </div>

                {/* Schedule Interview Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => setScheduleModalOpen(true)}
                >
                  📅 Planifier un entretien
                </Button>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Notes privées
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={saveNotes}
                    className="min-h-[80px] text-sm"
                    placeholder="Write notes..."
                  />
                </div>
              </div>
            </section>

            {/* Dual AI Analysis */}
            <section>
              <h3 className="text-sm font-semibold text-[#1A2B4A] mb-2">
                Dual AI Analysis
              </h3>
              {!analysis ? (
                <Button
                  onClick={runDualAI}
                  disabled={analysing}
                  className="w-full gap-2 bg-[#1A2B4A]"
                >
                  {analysing ? (
                    <>
                      <Bot className="h-4 w-4 animate-pulse" />
                      Analysing in parallel...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Run Dual Analysis (Puter + Gemini)
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  {/* Merged Score */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                        analysis.mergedScore >= 70
                          ? "bg-emerald-100 text-emerald-800"
                          : analysis.mergedScore >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {analysis.mergedScore}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={`${
                          analysis.mergedRecommendation === "Hire"
                            ? "bg-emerald-100 text-emerald-800"
                            : analysis.mergedRecommendation === "Interview"
                              ? "bg-amber-100 text-amber-800"
                            : analysis.mergedRecommendation === "Request More Info"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {analysis.mergedRecommendation}
                      </Badge>
                      {confidenceLevel ? (
                        <Badge variant="outline" className="text-xs">
                          Confidence: {confidenceLevel}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {analysis.providers.length > 1 && (analysis.agreement ? (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                      Both AI providers reached the same recommendation.
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                      <p className="font-semibold mb-1">The two assessments disagree.</p>
                      <p>{analysis.disagreementNote}</p>
                      <p className="mt-1">Read both reasoning sections and make your own judgment.</p>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {analysis.providers.map((provider) => (
                      <div key={provider.name} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-blue-900">{provider.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {provider.score}/100 • {provider.recommendation}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-900 leading-relaxed">{provider.reasoning}</p>

                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                            Show thinking
                          </summary>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{provider.thinking}</p>
                        </details>
                      </div>
                    ))}
                  </div>

                  {analysis.mergedTips.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="text-xs font-semibold text-slate-800 mb-1">Merged candidate tips</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {analysis.mergedTips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    AI is a suggestion. The final decision is yours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runDualAI}
                    disabled={analysing}
                    className="text-xs"
                  >
                    {analysing ? "Re-analysing..." : "Re-analyse with both providers"}
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Right Panel — CV */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#1A2B4A]">
              CV / Application Data
            </h3>
            {candidate.cvUrl ? (
              <div className="border rounded-xl overflow-hidden bg-slate-50 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <p className="text-sm text-muted-foreground">PDF uploaded</p>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const token = authSession.getAccessToken()
                        const filename = candidate.cvUrl?.replace('/uploads/', '') || ''
                        const response = await fetch(`${API_BASE}/uploads/${filename}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
                        if (!response.ok) throw new Error('Failed to download')
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `CV_${candidate.name}.pdf`
                        a.click()
                        window.URL.revokeObjectURL(url)
                      } catch (err) {
                        console.error('Download error:', err)
                        alert('Failed to download CV')
                      }
                    }}
                  >
                    View / Download PDF
                  </Button>
                </div>
              </div>
            ) : candidate.formData ? (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Personal</p>
                  <p>
                    {candidate.formData.personal?.name} —{" "}
                    {candidate.formData.personal?.city}
                  </p>
                </div>
                {candidate.formData.education?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold mb-1">Education</p>
                    {candidate.formData.education.map((e: any, i: number) => (
                      <p key={i}>
                        {e.degree} — {e.institution} ({e.year})
                      </p>
                    ))}
                  </div>
                )}
                {candidate.formData.experience?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold mb-1">Experience</p>
                    {candidate.formData.experience.map((e: any, i: number) => (
                      <p key={i}>
                        {e.title} at {e.company}
                      </p>
                    ))}
                  </div>
                )}
                {candidate.formData.skills?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.formData.skills.map((s: string) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-slate-50 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  No CV/form data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        applicationId={candidate.id}
        candidateName={candidate.name}
        onSuccess={() => {
          setScheduleModalOpen(false);
          toast.success("Entretien planifié depuis le drawer.");
        }}
      />
    </>
  );
};

export default CandidateDrawer;
