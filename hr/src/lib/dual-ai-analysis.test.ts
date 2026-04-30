import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizeStoredDualAnalysis, runDualAnalysis } from "@/lib/dual-ai-analysis";

const axiosMocks = vi.hoisted(() => ({
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({
  api: {
    post: axiosMocks.post,
    patch: axiosMocks.patch,
  },
}));

function streamFromText(text: string): AsyncIterable<{ text?: string }> {
  return {
    async *[Symbol.asyncIterator]() {
      yield { text };
    },
  };
}

describe("dual-ai-analysis", () => {
  beforeEach(() => {
    axiosMocks.post.mockReset();
    axiosMocks.patch.mockReset();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `Tu es un recruteur RH senior chez Schulte Automotive Tunisia, une usine de câblage automobile à capitaux allemands.
Analyse ce CV candidat par rapport aux exigences du poste avec un niveau professionnel.

POSTE : {{offerTitle}}
COMPETENCES REQUISES : {{requiredSkills}}
EXPERIENCE MINIMALE : {{experienceYears}} ans
DESCRIPTION DU POSTE : {{description}}

CV CANDIDAT :
{{cvText}}

Retourne UNIQUEMENT du JSON valide — sans markdown, sans backticks, sans explication :
{"thinking":"2-3 phrases en anglais montrant comment le score a été construit","score":<0-100>,"confidence":"<high|medium|low>","recommendation":"<Hire|Interview|Request More Info|Reject>","reasoning":"<un paragraphe en français>","tips_for_candidate":["conseil1","conseil2"],"language":"<langue détectée du CV>","strengths":["s1","s2"],"gaps":["g1","g2"]}`,
    } as any);
    (globalThis as any).window = (globalThis as any).window || {};
  });

  it("fusionne les deux fournisseurs avec recommandation prudente et confiance réduite", async () => {
    (window as any).puter = {
      ai: {
        chat: vi.fn().mockResolvedValue(
          streamFromText(
            JSON.stringify({
              score: 82,
              confidence: "high",
              recommendation: "Hire",
              thinking: "Puter thinking",
              reasoning: "Raisonnement puter",
              tips_for_candidate: ["Conseil A", "Conseil B"],
              strengths: ["s1"],
              gaps: ["g1"],
            }),
          ),
        ),
      },
    };

    const result = await runDualAnalysis("app-1", {
      cvText: "Texte CV suffisamment long".repeat(20),
      offerTitle: "Planner",
      requiredSkills: ["sap"],
      experienceYears: 2,
      description: "desc",
    }, {
      score: 74,
      confidence: "medium",
      recommendation: "Interview",
      thinking: "Raisonnement Gemini",
      reasoning: "Raisonnement gemini",
      tipsForCandidate: ["Conseil B", "Conseil C"],
      strengths: ["s2"],
      gaps: ["g2"],
      aiProvider: "Gemini cache",
    });

    expect(result.providers).toHaveLength(2);
    expect(result.mergedScore).toBe(78);
    expect(result.mergedRecommendation).toBe("Interview");
    expect(result.mergedConfidence).toBe("medium");
    expect(result.agreement).toBe(false);
    expect(result.mergedTips.length).toBeGreaterThan(0);
    expect(axiosMocks.post).not.toHaveBeenCalled();
  });

  it("conserve le résultat mono-fournisseur quand l'autre échoue", async () => {
    (window as any).puter = {
      ai: {
        chat: vi.fn().mockRejectedValue(new Error("Puter indisponible")),
      },
    };

    axiosMocks.post.mockResolvedValue({
      data: {
        score: 66,
        confidence: "medium",
        recommendation: "Interview",
        thinking: "Gemini seul",
        reasoning: "Raisonnement",
        tipsForCandidate: ["Conseil X"],
        strengths: ["s"],
        gaps: ["g"],
      },
    });

    const result = await runDualAnalysis("app-2", {
      cvText: "Texte CV suffisamment long".repeat(20),
      offerTitle: "Planner",
      requiredSkills: ["sap"],
      experienceYears: 2,
      description: "desc",
    });

    expect(result.providers).toHaveLength(1);
    expect(result.mergedScore).toBe(66);
    expect(result.mergedRecommendation).toBe("Interview");
  });

  it("bascule vers le backend si Puter renvoie un JSON invalide", async () => {
    (window as any).puter = {
      ai: {
        chat: vi.fn().mockResolvedValue(streamFromText("NOT_A_VALID_JSON_PAYLOAD")),
      },
    };

    axiosMocks.post.mockResolvedValue({
      data: {
        score: 71,
        confidence: "medium",
        recommendation: "Interview",
        thinking: "Fallback backend",
        reasoning: "Fallback backend reasoning",
        tipsForCandidate: ["Conseil fallback"],
        strengths: ["s"],
        gaps: ["g"],
      },
    });

    const result = await runDualAnalysis("app-3", {
      cvText: "Texte CV suffisamment long".repeat(20),
      offerTitle: "Planner",
      requiredSkills: ["sap"],
      experienceYears: 2,
      description: "desc",
    });

    expect(axiosMocks.post).toHaveBeenCalledWith("/applications/app-3/analyse");
    expect(result.providers).toHaveLength(1);
    expect(result.mergedScore).toBe(71);
    expect(result.mergedRecommendation).toBe("Interview");
  });

  it("normalise un ancien format d'analyse mono-fournisseur stocké", () => {
    const normalized = normalizeStoredDualAnalysis(
      JSON.stringify({
        score: 55,
        confidence: "low",
        recommendation: "Request More Info",
        thinking: "ancien",
        reasoning: "ancien raisonnement",
        tipsForCandidate: ["Conseil 1"],
      }),
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.providers).toHaveLength(1);
    expect(normalized?.mergedScore).toBe(55);
    expect(normalized?.mergedRecommendation).toBe("Request More Info");
  });
});
