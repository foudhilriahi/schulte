import { useState } from "react";
import { Star, Phone, Mail, MapPin, Briefcase, X, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { authSession } from "@/lib/authSession";
import { toast } from "sonner";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import PuterAIBattle from "./PuterAIBattle";

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
  const [aiResult, setAiResult] = useState<any>(null);
  const [analysing, setAnalysing] = useState(false);
  const [aiSource, setAiSource] = useState<'backend' | 'puter' | null>(null);
  const [puterResults, setPuterResults] = useState<any[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Sync local state when candidate changes
  if (candidate && notes === "" && candidate.notes) setNotes(candidate.notes);
  if (candidate && rating === 0 && candidate.starRating)
    setRating(candidate.starRating);

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

  const runBackendAI = async () => {
    setAnalysing(true);
    setAiResult(null);
    setAiSource(null);
    
    try {
      // Call backend API for AI analysis (Gemini + OpenRouter battle)
      const response = await api.post(`/applications/${candidate.id}/analyse`);
      const result = response.data;
      
      setAiResult(result);
      setAiSource('backend');
      
      toast.success(`✨ Backend AI Analysis Complete (${result.aiProvider})`);
    } catch (error: any) {
      console.error('Backend AI analysis error:', error);
      const errorMsg = error.response?.data?.error || 'Backend AI analysis unavailable';
      toast.error(errorMsg);
    } finally {
      setAnalysing(false);
    }
  };

  // Parse existing AI analysis from database
  const parseExistingAnalysis = (aiAnalysis: string) => {
    try {
      const parsed = JSON.parse(aiAnalysis);
      return parsed;
    } catch {
      return null;
    }
  };

  // Get current AI result (either fresh or from database)
  const getCurrentAIResult = () => {
    if (aiResult) return aiResult;
    if (candidate.aiAnalysis) {
      const parsed = parseExistingAnalysis(candidate.aiAnalysis);
      if (parsed) return parsed;
    }
    return null;
  };

  const currentAIResult = getCurrentAIResult();

  const handlePuterResults = (results: any[]) => {
    setPuterResults(results);
    // If we don't have backend results, use Puter consensus as main result
    if (!aiResult && results.length > 0) {
      setAiResult(results[0]); // Use first result or create consensus
      setAiSource('puter');
    }
  };

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

            {/* Backend AI Analysis */}
            <section>
              <h3 className="text-sm font-semibold text-[#1A2B4A] mb-2">
                Backend AI Analysis
              </h3>
              {!currentAIResult ? (
                <Button
                  onClick={runBackendAI}
                  disabled={analysing}
                  className="w-full gap-2 bg-[#1A2B4A]"
                >
                  {analysing ? (
                    <>
                      <Bot className="h-4 w-4 animate-pulse" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyse with Backend AI
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                        (currentAIResult?.score || candidate.aiScore || 0) >= 70
                          ? "bg-emerald-100 text-emerald-800"
                          : (currentAIResult?.score || candidate.aiScore || 0) >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {currentAIResult?.score || candidate.aiScore || 0}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={`${
                          currentAIResult?.recommendation === "Hire"
                            ? "bg-emerald-100 text-emerald-800"
                            : currentAIResult?.recommendation === "Interview"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {currentAIResult?.recommendation || "—"}
                      </Badge>
                      {aiSource && (
                        <Badge variant="outline" className="text-xs">
                          {aiSource === 'backend' ? '🤖 Backend AI' : '✨ Puter.js'}
                        </Badge>
                      )}
                      {(currentAIResult?.confidence || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {currentAIResult.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Detailed Analysis Breakdown */}
                  {currentAIResult?.detailedAnalysis && (
                    <div className="space-y-3 border-t pt-3">
                      <h4 className="text-xs font-semibold text-[#1A2B4A]">Detailed Analysis</h4>
                      
                      {/* Technical Skills */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-blue-800">Technical Skills Match</p>
                          <Badge variant="outline" className="text-xs">
                            {currentAIResult.detailedAnalysis.technicalSkillsMatch.score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-700 mb-2">
                          {currentAIResult.detailedAnalysis.technicalSkillsMatch.reasoning}
                        </p>
                        {currentAIResult.detailedAnalysis.technicalSkillsMatch.matchedSkills.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-green-700">✅ Matched Skills:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {currentAIResult.detailedAnalysis.technicalSkillsMatch.matchedSkills.map((skill: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentAIResult.detailedAnalysis.technicalSkillsMatch.missingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-700">❌ Missing Skills:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {currentAIResult.detailedAnalysis.technicalSkillsMatch.missingSkills.map((skill: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-red-100 text-red-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Experience */}
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-purple-800">Experience Relevance</p>
                          <Badge variant="outline" className="text-xs">
                            {currentAIResult.detailedAnalysis.experienceRelevance.score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-700 mb-2">
                          {currentAIResult.detailedAnalysis.experienceRelevance.reasoning}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Years Found:</span> {currentAIResult.detailedAnalysis.experienceRelevance.yearsFound}
                          </div>
                          <div>
                            <span className="font-medium">Industry:</span> {currentAIResult.detailedAnalysis.experienceRelevance.industryMatch}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Career Progression:</span> {currentAIResult.detailedAnalysis.experienceRelevance.careerProgression}
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-indigo-800">Education Fit</p>
                          <Badge variant="outline" className="text-xs">
                            {currentAIResult.detailedAnalysis.educationFit.score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-indigo-700 mb-2">
                          {currentAIResult.detailedAnalysis.educationFit.reasoning}
                        </p>
                        <div className="text-xs">
                          <div className="mb-1">
                            <span className="font-medium">Degree Relevance:</span> {currentAIResult.detailedAnalysis.educationFit.degreeRelevance}
                          </div>
                          {currentAIResult.detailedAnalysis.educationFit.certifications.length > 0 && (
                            <div>
                              <span className="font-medium">Certifications:</span> {currentAIResult.detailedAnalysis.educationFit.certifications.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Soft Skills */}
                      <div className="p-3 bg-teal-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-teal-800">Soft Skills</p>
                          <Badge variant="outline" className="text-xs">
                            {currentAIResult.detailedAnalysis.softSkills.score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-teal-700 mb-2">
                          {currentAIResult.detailedAnalysis.softSkills.reasoning}
                        </p>
                        <div className="text-xs">
                          <div className="mb-1">
                            <span className="font-medium">Communication:</span> {currentAIResult.detailedAnalysis.softSkills.communicationSkills}
                          </div>
                          {currentAIResult.detailedAnalysis.softSkills.languages.length > 0 && (
                            <div>
                              <span className="font-medium">Languages:</span> {currentAIResult.detailedAnalysis.softSkills.languages.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Overall Assessment */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-800 mb-2">Overall Assessment</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {currentAIResult.detailedAnalysis.overallAssessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Basic Analysis (fallback) */}
                  {!currentAIResult?.detailedAnalysis && (
                    <>
                      {currentAIResult?.strengths && (
                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <p className="text-xs font-semibold text-emerald-800 mb-1">
                            Strengths
                          </p>
                          <ul className="text-xs text-emerald-700 space-y-0.5">
                            {currentAIResult.strengths.map((s: string, i: number) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {currentAIResult?.gaps && (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-1">
                            Gaps
                          </p>
                          <ul className="text-xs text-amber-700 space-y-0.5">
                            {currentAIResult.gaps.map((g: string, i: number) => (
                              <li key={i}>• {g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    AI is a suggestion. The final decision is yours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runBackendAI}
                    disabled={analysing}
                    className="text-xs"
                  >
                    {analysing ? "Re-analysing..." : "Re-analyse"}
                  </Button>
                </div>
              )}
            </section>

            {/* Puter.js AI Battle - Second Opinion */}
            <section>
              <PuterAIBattle
                cvText={candidate.cvText || ''}
                jobTitle={candidate.jobTitle || ''}
                requiredSkills={candidate.requiredSkills || []}
                experienceYears={candidate.experienceYears || 0}
                description={candidate.description || ''}
                onResults={handlePuterResults}
              />
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
