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
      text: async () => `You are a senior HR recruiter at Schulte Automotive Tunisia, a German-owned cable assembly factory.
Analyze this candidate's CV against the job requirements with professional depth.

JOB POSITION: {{offerTitle}}
REQUIRED SKILLS: {{requiredSkills}}
MINIMUM EXPERIENCE: {{experienceYears}} years
JOB DESCRIPTION: {{description}}

CANDIDATE CV:
{{cvText}}

Return ONLY valid JSON — no markdown, no backticks, no explanation:
{"thinking":"2-3 sentences showing how score was reached","score":<0-100>,"confidence":"<high|medium|low>","recommendation":"<Hire|Interview|Request More Info|Reject>","reasoning":"<one French paragraph>","tips_for_candidate":["tip1","tip2"],"language":"<detected CV language>","strengths":["s1","s2"],"gaps":["g1","g2"]}`,
    } as any);
    (globalThis as any).window = (globalThis as any).window || {};
  });

  it("merges both providers with conservative recommendation and lower confidence", async () => {
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
              tips_for_candidate: ["Tip A", "Tip B"],
              strengths: ["s1"],
              gaps: ["g1"],
            }),
          ),
        ),
      },
    };

    axiosMocks.post.mockResolvedValue({
      data: {
        score: 74,
        confidence: "medium",
        recommendation: "Interview",
        thinking: "Gemini thinking",
        reasoning: "Raisonnement gemini",
        tipsForCandidate: ["Tip B", "Tip C"],
        strengths: ["s2"],
        gaps: ["g2"],
      },
    });

    const result = await runDualAnalysis("app-1", {
      cvText: "Long enough CV text".repeat(20),
      offerTitle: "Planner",
      requiredSkills: ["sap"],
      experienceYears: 2,
      description: "desc",
    });

    expect(result.providers).toHaveLength(2);
    expect(result.mergedScore).toBe(78);
    expect(result.mergedRecommendation).toBe("Interview");
    expect(result.mergedConfidence).toBe("medium");
    expect(result.agreement).toBe(false);
    expect(result.mergedTips.length).toBeGreaterThan(0);
  });

  it("keeps single provider result when the other fails", async () => {
    (window as any).puter = {
      ai: {
        chat: vi.fn().mockRejectedValue(new Error("Puter unavailable")),
      },
    };

    axiosMocks.post.mockResolvedValue({
      data: {
        score: 66,
        confidence: "medium",
        recommendation: "Interview",
        thinking: "Gemini only",
        reasoning: "Raisonnement",
        tipsForCandidate: ["Tip X"],
        strengths: ["s"],
        gaps: ["g"],
      },
    });

    const result = await runDualAnalysis("app-2", {
      cvText: "Long enough CV text".repeat(20),
      offerTitle: "Planner",
      requiredSkills: ["sap"],
      experienceYears: 2,
      description: "desc",
    });

    expect(result.providers).toHaveLength(1);
    expect(result.mergedScore).toBe(66);
    expect(result.mergedRecommendation).toBe("Interview");
  });

  it("normalizes old single-provider stored analysis", () => {
    const normalized = normalizeStoredDualAnalysis(
      JSON.stringify({
        score: 55,
        confidence: "low",
        recommendation: "Request More Info",
        thinking: "old",
        reasoning: "old reason",
        tipsForCandidate: ["Tip 1"],
      }),
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.providers).toHaveLength(1);
    expect(normalized?.mergedScore).toBe(55);
    expect(normalized?.mergedRecommendation).toBe("Request More Info");
  });
});
