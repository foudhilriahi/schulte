"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOffer } from "@/hooks/useOffers";
import { useSubmitFormApplication } from "@/hooks/useApplications";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  loadJobDraft,
  saveJobDraft,
  clearJobDraft,
  saveLatestDraft,
  loadStoredCVs,
  saveStoredCVs,
} from "@/lib/cv-storage";
import { useAuthStore } from "@/store/auth";

const stepLabels = ["Personal", "Edu", "Exp", "Skills", "Review"];
const languages = ["Arabic", "French", "English", "German"];
const proficiencies = ["Native", "Fluent", "Intermediate", "Beginner"];

export default function ManualFormApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { jobId } = use(params);
  const { data: job } = useOffer(jobId);
  const mutation = useSubmitFormApplication();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form State
  const [draft, setDraft] = useState(() => {
    const saved = loadJobDraft(jobId, user?.id);
    if (saved) return saved;

    return {
      personal: { name: "", email: "", phone: "", dob: "", city: "" },
      education: [{ degree: "", field: "", institution: "", year: "" }],
      experience: [],
      skills: [],
      skillInput: "",
      langs: [],
      template: "modern",
    };
  });

  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    return !!loadJobDraft(jobId, user?.id);
  });

  useEffect(() => {
    saveJobDraft(jobId, user?.id, draft);
  }, [draft, jobId, user?.id]);

  useEffect(() => {
    const saved = loadJobDraft(jobId, user?.id);
    if (saved) {
      setDraft(saved as typeof draft);
      setHasSavedDraft(true);
    }
  }, [jobId, user?.id]);

  // Show a toast once on mount when a saved draft was detected
  useEffect(() => {
    if (hasSavedDraft) {
      toast.info("Brouillon restauré. Continuez votre candidature.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStep = () => {
    if (step < 5) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    } else {
      router.push(`/jobs/${jobId}`);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync({ offerId: jobId, formData: draft });

      const existingCVs = loadStoredCVs(user?.id);
      const newCV = {
        id: `generated-${Date.now()}`,
        name: `Generated CV - ${job?.title || "Application"}`,
        type: "generated" as const,
        createdAt: new Date().toISOString(),
        isDefault: existingCVs.length === 0,
        template:
          draft?.template === "classic" || draft?.template === "modern"
            ? draft.template
            : "modern",
        data: draft,
      };

      saveStoredCVs(user?.id, [...existingCVs, newCV]);
      saveLatestDraft(user?.id, draft);
      clearJobDraft(jobId, user?.id);
      setHasSavedDraft(false);
      toast.success("Application submitted successfully!");
      router.push("/applications");
    } catch (e) {
      // handled
    }
  };

  const updatePersonal = (field: string, val: string) => {
    setDraft((prev: any) => ({
      ...prev,
      personal: { ...prev.personal, [field]: val },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-muted-foreground min-h-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </button>
            {hasSavedDraft && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline hover:text-red-500 transition-colors"
                onClick={() => {
                  clearJobDraft(jobId, user?.id);
                  setDraft({
                    personal: {
                      name: "",
                      email: "",
                      phone: "",
                      dob: "",
                      city: "",
                    },
                    education: [
                      { degree: "", field: "", institution: "", year: "" },
                    ],
                    experience: [],
                    skills: [],
                    skillInput: "",
                    langs: [],
                    template: "modern",
                  });
                  setHasSavedDraft(false);
                  toast.success("Brouillon effacé.");
                }}
              >
                Effacer le brouillon
              </button>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            {stepLabels.map((lbl, i) => (
              <div key={lbl} className="flex flex-col items-center flex-1">
                <div
                  className={`w-3 h-3 rounded-full mb-1 transition-colors ${step >= i + 1 ? "bg-blue-600" : "bg-slate-200"}`}
                />
                <span
                  className={`text-[10px] ${step === i + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-x-4 top-6"
          >
            {step === 1 && (
              <div className="space-y-4 pb-20">
                <h2 className="text-xl font-bold">Personal Details</h2>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={draft.personal.name}
                    onChange={(e) => updatePersonal("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={draft.personal.email}
                    onChange={(e) => updatePersonal("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={draft.personal.phone}
                    onChange={(e) => updatePersonal("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={draft.personal.dob}
                    onChange={(e) => updatePersonal("dob", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={draft.personal.city}
                    onChange={(e) => updatePersonal("city", e.target.value)}
                  />
                </div>
                <Button className="w-full mt-6" onClick={nextStep}>
                  Next: Education
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 pb-20">
                <h2 className="text-xl font-bold">Education</h2>
                {draft.education.map((edu: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-white border rounded-xl space-y-3 relative"
                  >
                    {i > 0 && (
                      <button
                        onClick={() =>
                          setDraft((p: any) => ({
                            ...p,
                            education: p.education.filter(
                              (_: any, idx: number) => idx !== i,
                            ),
                          }))
                        }
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Degree</Label>
                      <Input
                        placeholder="e.g. Master, Bac"
                        value={edu.degree}
                        onChange={(e) => {
                          const n = [...draft.education];
                          n[i].degree = e.target.value;
                          setDraft((p: any) => ({ ...p, education: n }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const n = [...draft.education];
                          n[i].institution = e.target.value;
                          setDraft((p: any) => ({ ...p, education: n }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const n = [...draft.education];
                          n[i].year = e.target.value;
                          setDraft((p: any) => ({ ...p, education: n }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() =>
                    setDraft((p: any) => ({
                      ...p,
                      education: [
                        ...p.education,
                        { degree: "", field: "", institution: "", year: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
                <Button className="w-full mt-6" onClick={nextStep}>
                  Next: Experience
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 pb-20">
                <h2 className="text-xl font-bold">Experience</h2>
                {draft.experience.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-white border rounded-xl space-y-3 relative"
                  >
                    <button
                      onClick={() =>
                        setDraft((p: any) => ({
                          ...p,
                          experience: p.experience.filter(
                            (_: any, idx: number) => idx !== i,
                          ),
                        }))
                      }
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <Label className="text-xs">Job Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => {
                          const n = [...draft.experience];
                          n[i].title = e.target.value;
                          setDraft((p: any) => ({ ...p, experience: n }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const n = [...draft.experience];
                          n[i].company = e.target.value;
                          setDraft((p: any) => ({ ...p, experience: n }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input
                        placeholder="e.g. 2020 - 2022"
                        value={exp.duration}
                        onChange={(e) => {
                          const n = [...draft.experience];
                          n[i].duration = e.target.value;
                          setDraft((p: any) => ({ ...p, experience: n }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() =>
                    setDraft((p: any) => ({
                      ...p,
                      experience: [
                        ...p.experience,
                        { title: "", company: "", duration: "", desc: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Experience
                </Button>
                <Button className="w-full mt-6" onClick={nextStep}>
                  Next: Skills
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 pb-20">
                <h2 className="text-xl font-bold">Skills & Languages</h2>

                <div className="space-y-2">
                  <Label>Technical Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type skill and press Enter"
                      value={draft.skillInput}
                      onChange={(e) =>
                        setDraft((p: any) => ({
                          ...p,
                          skillInput: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && draft.skillInput.trim()) {
                          e.preventDefault();
                          if (!draft.skills.includes(draft.skillInput.trim())) {
                            setDraft((p: any) => ({
                              ...p,
                              skills: [...p.skills, p.skillInput.trim()],
                              skillInput: "",
                            }));
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (
                          draft.skillInput.trim() &&
                          !draft.skills.includes(draft.skillInput.trim())
                        ) {
                          setDraft((p: any) => ({
                            ...p,
                            skills: [...p.skills, p.skillInput.trim()],
                            skillInput: "",
                          }));
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {draft.skills.map((s: string) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {s}{" "}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() =>
                            setDraft((p: any) => ({
                              ...p,
                              skills: p.skills.filter((sk: string) => sk !== s),
                            }))
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-8" onClick={nextStep}>
                  Next: Review
                </Button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 pb-20">
                <h2 className="text-xl font-bold">Review Application</h2>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">
                    CV Template
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() =>
                        setDraft((p: any) => ({ ...p, template: "modern" }))
                      }
                      className={`p-3 border rounded-xl cursor-pointer flex flex-col items-center ${draft.template === "modern" ? "border-blue-500 bg-blue-50" : ""}`}
                    >
                      <div className="w-10 h-14 bg-slate-200 mb-2 rounded border border-slate-300"></div>
                      <span className="text-sm font-medium">Modern</span>
                    </div>
                    <div
                      onClick={() =>
                        setDraft((p: any) => ({ ...p, template: "classic" }))
                      }
                      className={`p-3 border rounded-xl cursor-pointer flex flex-col items-center ${draft.template === "classic" ? "border-blue-500 bg-blue-50" : ""}`}
                    >
                      <div className="w-10 h-14 bg-white mb-2 rounded border border-slate-300"></div>
                      <span className="text-sm font-medium">Classic</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={async () => {
                      try {
                        const { generateCV } =
                          await import("@/lib/cv-generator");
                        const doc = generateCV(draft, draft.template);
                        doc.save(
                          `CV_${draft.personal.name || "Application"}.pdf`,
                        );
                        toast.success(
                          "CV generated and downloaded successfully!",
                        );
                      } catch (err) {
                        toast.error("Failed to generate CV. Please try again.");
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    Generate & Download My CV
                  </Button>
                  <Button
                    className="w-full h-12 shadow-md"
                    onClick={handleSubmit}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? "Submitting..."
                      : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
