import { api } from "@/lib/axios";
import { recommendationToFrench } from "@/lib/recommendation-labels";

export type ConfidenceLevel = "high" | "medium" | "low";
export type Recommendation = "Hire" | "Interview" | "Request More Info" | "Reject";

export interface AnalyseInput {
  cvText: string;
  offerTitle: string;
  requiredSkills: string[];
  experienceYears: number;
  description: string;
}

export interface ProviderAnalysis {
  name: string;
  source: "puter" | "gemini";
  score: number;
  confidence: ConfidenceLevel;
  recommendation: Recommendation;
  thinking: string;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  tipsForCandidate: string[];
  language?: string;
}

export interface DualAnalysisResult {
  mergedScore: number;
  mergedConfidence: ConfidenceLevel;
  mergedRecommendation: Recommendation;
  mergedTips: string[];
  agreement: boolean;
  disagreementNote?: string;
  providers: ProviderAnalysis[];
  analysisType: "dual_parallel_hr";
  analysisDate: string;
}

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (
          prompt: string,
          options?: {
            model?: string;
            stream?: boolean;
            temperature?: number;
            max_tokens?: number;
          },
        ) => Promise<string> | AsyncIterable<{ text?: string }>;
      };
    };
  }
}

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const RECOMMENDATION_ORDER: Record<Recommendation, number> = {
  Reject: 0,
  "Request More Info": 1,
  Interview: 2,
  Hire: 3,
};

function safeArray(value: unknown, max = 3): string[] {
  return Array.isArray(value) ? value.slice(0, max).map(String) : [];
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  const raw = String(value || "").toLowerCase();
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  return "medium";
}

function normalizeRecommendation(value: unknown): Recommendation {
  const raw = String(value || "");
  if (
    raw === "Hire" ||
    raw === "Interview" ||
    raw === "Request More Info" ||
    raw === "Reject"
  ) {
    return raw;
  }
  return "Interview";
}

function parseRawJSON(raw: string): any {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Reponse IA non conforme (JSON invalide)");
  }
}

function parseStoredAnalysis(value: unknown): any | null {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return null;
}

function extractCachedBackendProvider(value: unknown): ProviderAnalysis | null {
  const parsed = parseStoredAnalysis(value);
  if (!parsed) return null;

  if (Array.isArray(parsed.providers)) {
    const providerCandidate =
      parsed.providers.find((p: any) => p?.source === "gemini") ||
      parsed.providers.find((p: any) => String(p?.source || "").toLowerCase() !== "puter");

    if (providerCandidate) {
      return normalizeProviderAnalysis(
        {
          ...providerCandidate,
          tipsForCandidate: providerCandidate?.tipsForCandidate ?? providerCandidate?.tips_for_candidate,
        },
        String(
          providerCandidate?.name ||
            providerCandidate?.aiProvider ||
            "Analyse backend (cache)",
        ),
        "gemini",
      );
    }
  }

  if (typeof parsed?.score === "number" && parsed?.recommendation) {
    return normalizeProviderAnalysis(
      parsed,
      String(parsed?.aiProvider || "Analyse backend (cache)"),
      "gemini",
    );
  }

  if (typeof parsed?.mergedScore === "number" && parsed?.mergedRecommendation) {
    return normalizeProviderAnalysis(
      {
        score: parsed.mergedScore,
        recommendation: parsed.mergedRecommendation,
        confidence: parsed.mergedConfidence,
        tipsForCandidate: parsed.mergedTips,
        reasoning:
          parsed.disagreementNote ||
          "Résultat fusionné déjà disponible depuis une analyse précédente.",
      },
      "Analyse fusionnee (cache)",
      "gemini",
    );
  }

  return null;
}

let sharedPromptTemplate: string | null = null;

async function loadSharedPromptTemplate(): Promise<string> {
  if (sharedPromptTemplate) return sharedPromptTemplate;

  const response = await fetch("/shared/analysis-prompt.txt");
  if (!response.ok) {
    throw new Error("Echec du chargement du template de prompt partagé");
  }

  sharedPromptTemplate = await response.text();
  return sharedPromptTemplate;
}

async function buildPrompt(input: AnalyseInput): Promise<string> {
  const template = await loadSharedPromptTemplate();
  return [
    ["{{offerTitle}}", input.offerTitle],
    ["{{requiredSkills}}", input.requiredSkills.join(", ")],
    ["{{experienceYears}}", String(input.experienceYears)],
    ["{{description}}", input.description],
    ["{{cvText}}", input.cvText.substring(0, 5000)],
  ].reduce((prompt, [token, value]) => prompt.split(token).join(value), template);
}

function normalizeProviderAnalysis(parsed: any, providerName: string, source: "puter" | "gemini"): ProviderAnalysis {
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed?.score) || 60)));
  const confidence = normalizeConfidence(parsed?.confidence);
  const recommendation = normalizeRecommendation(parsed?.recommendation);

  const tips = safeArray(parsed?.tips_for_candidate, 4);
  const camelTips = safeArray(parsed?.tipsForCandidate, 4);
  const mergedTips = [...tips, ...camelTips];

  return {
    name: providerName,
    source,
    score,
    confidence,
    recommendation,
    thinking: String(parsed?.thinking || "Aucun détail de raisonnement n'a été retourné."),
    reasoning: String(parsed?.reasoning || "Aucune justification detaillee n'a ete retournee."),
    strengths: safeArray(parsed?.strengths, 5),
    gaps: safeArray(parsed?.gaps, 4),
    tipsForCandidate: mergedTips.length > 0 ? mergedTips.slice(0, 4) : ["Préciser des réalisations directement liées au poste."],
    language: String(parsed?.language || "Inconnue"),
  };
}

function conservativeRecommendation(recommendations: Recommendation[]): Recommendation {
  return recommendations.sort((a, b) => RECOMMENDATION_ORDER[a] - RECOMMENDATION_ORDER[b])[0] || "Interview";
}

function mergedConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  return levels.sort((a, b) => CONFIDENCE_ORDER[a] - CONFIDENCE_ORDER[b])[0] || "medium";
}

function dedupeTips(providers: ProviderAnalysis[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const provider of providers) {
    for (const tip of provider.tipsForCandidate) {
      const key = tip.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(tip.trim());
      if (out.length >= 3) return out;
    }
  }
  return out;
}

async function collectPuterResponse(prompt: string): Promise<string> {
  if (typeof window === "undefined" || !window.puter?.ai?.chat) {
    throw new Error("Puter.js n'est pas disponible dans cette session navigateur");
  }

  const response = await window.puter.ai.chat(prompt, {
    model: "gpt-4o",
    stream: true,
    temperature: 0.2,
    max_tokens: 2000,
  });

  if (typeof response === "string") {
    return response;
  }

  let text = "";
  for await (const part of response) {
    text += part?.text || "";
  }
  return text;
}

export async function runDualAnalysis(
  applicationId: string,
  input: AnalyseInput,
  existingAnalysis?: unknown,
): Promise<DualAnalysisResult> {
  const prompt = await buildPrompt(input);
  const providers: ProviderAnalysis[] = [];

  // Reuse previously stored backend analysis to avoid re-spending API tokens.
  const cachedBackend = extractCachedBackendProvider(existingAnalysis);
  if (cachedBackend) {
    providers.push(cachedBackend);
  }

  let puterError: unknown = null;

  try {
    const puterRaw = await collectPuterResponse(prompt);
    const parsed = parseRawJSON(puterRaw);
    providers.push(normalizeProviderAnalysis(parsed, "GPT-4o (Puter.js)", "puter"));
  } catch (error) {
    puterError = error;
  }

  // Safety net: keep the workflow functional if Puter fails and no cached analysis exists.
  if (providers.length === 0) {
    try {
      const backendResult = await api.post(`/applications/${applicationId}/analyse`).then((r) => r.data);
      providers.push(
        normalizeProviderAnalysis(backendResult, "Gemini 2.5 Flash (backend fallback)", "gemini"),
      );
    } catch (backendError: any) {
      const puterMessage =
        puterError instanceof Error
          ? puterError.message
          : puterError
            ? String(puterError)
            : "inconnu";
      const backendMessage = backendError?.response?.data?.error || backendError?.message || "inconnu";
      throw new Error(
        `Aucun fournisseur IA disponible (Puter: ${puterMessage}; Backend: ${backendMessage})`,
      );
    }
  }

  const mergedScore =
    providers.length === 1
      ? providers[0].score
      : Math.round(providers.reduce((sum, p) => sum + p.score, 0) / providers.length);

  const mergedRecommendation = conservativeRecommendation(
    providers.map((p) => p.recommendation),
  );

  const confidence = mergedConfidence(providers.map((p) => p.confidence));
  const agreement =
    providers.length > 1 && providers[0].recommendation === providers[1].recommendation;

  const disagreementNote =
    providers.length > 1 && !agreement
      ? `${providers[0].name} recommande ${recommendationToFrench(providers[0].recommendation)}, tandis que ${providers[1].name} recommande ${recommendationToFrench(providers[1].recommendation)}.`
      : undefined;

  return {
    mergedScore,
    mergedConfidence: confidence,
    mergedRecommendation,
    mergedTips: dedupeTips(providers),
    agreement,
    disagreementNote,
    providers,
    analysisType: "dual_parallel_hr",
    analysisDate: new Date().toISOString(),
  };
}

export async function persistDualAnalysis(
  applicationId: string,
  analysis: DualAnalysisResult,
): Promise<void> {
  // Keep legacy-friendly fields so candidate views can still read tips directly.
  const persistedPayload = {
    ...analysis,
    score: analysis.mergedScore,
    confidence: analysis.mergedConfidence,
    recommendation: analysis.mergedRecommendation,
    tipsForCandidate: analysis.mergedTips,
    tips_for_candidate: analysis.mergedTips,
  };

  await api.patch(`/applications/${applicationId}/analysis`, {
    aiScore: analysis.mergedScore,
    aiAnalysis: persistedPayload,
  });
}

export function normalizeStoredDualAnalysis(value: unknown): DualAnalysisResult | null {
  if (!value) return null;

  let parsed: any;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  } else {
    parsed = value;
  }

  if (Array.isArray(parsed?.providers) && typeof parsed?.mergedScore === "number") {
    return {
      mergedScore: parsed.mergedScore,
      mergedConfidence: normalizeConfidence(parsed.mergedConfidence),
      mergedRecommendation: normalizeRecommendation(parsed.mergedRecommendation),
      mergedTips: safeArray(parsed.mergedTips, 6),
      agreement: Boolean(parsed.agreement),
      disagreementNote: parsed.disagreementNote ? String(parsed.disagreementNote) : undefined,
      providers: parsed.providers.map((p: any) =>
        normalizeProviderAnalysis(
          {
            ...p,
            tipsForCandidate: p?.tipsForCandidate,
          },
          String(p?.name || "Fournisseur IA"),
          p?.source === "puter" ? "puter" : "gemini",
        ),
      ),
      analysisType: "dual_parallel_hr",
      analysisDate: String(parsed.analysisDate || new Date().toISOString()),
    };
  }

  // Compatibilité ascendante : ancien format mono-fournisseur provenant du backend
  if (typeof parsed?.score === "number" && parsed?.recommendation) {
    const single = normalizeProviderAnalysis(parsed, "Gemini 2.5 Flash", "gemini");
    return {
      mergedScore: single.score,
      mergedConfidence: single.confidence,
      mergedRecommendation: single.recommendation,
      mergedTips: dedupeTips([single]),
      agreement: true,
      providers: [single],
      analysisType: "dual_parallel_hr",
      analysisDate: String(parsed?.analysisDate || new Date().toISOString()),
    };
  }

  return null;
}
