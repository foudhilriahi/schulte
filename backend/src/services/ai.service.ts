// ============================================================
// AI BATTLE SERVICE  —  Production Ready  —  March 2026
// Fires ALL available models simultaneously (Promise.allSettled)
// Sources: Gemini Direct API + OpenRouter Free
//
// ⚠️  Puter.js is BROWSER-ONLY — keep it in your HTML file.
//     It cannot be called from Node.js backend.
//
// VERIFIED MODEL IDs as of March 14, 2026:
//
//  GEMINI (free tier, resets midnight Pacific):
//    gemini-2.5-flash       — 250 req/day, 10 RPM  ← primary
//    gemini-2.5-flash-lite  — 1000 req/day, 15 RPM ← most generous
//    gemini-2.5-pro         — 100 req/day, 5 RPM
//    gemini-2.0-flash       — still alive (deprecated June 1 2026)
//    ❌ gemini-1.5-flash-8b  — REMOVED April 2025
//    ❌ gemini-2.0-flash-lite — deprecated June 1 2026, avoid
//
//  OPENROUTER (free, ~200 req/day, 20 RPM per model):
//    openrouter/free                          ← magic auto-router
//    meta-llama/llama-4-maverick:free         ← best quality free
//    meta-llama/llama-4-scout:free
//    meta-llama/llama-3.3-70b-instruct:free
//    mistralai/mistral-small-3.1-24b-instruct:free
//    deepseek/deepseek-chat-v3-0324:free
//    deepseek/deepseek-r1-zero:free
//    nvidia/nemotron-3-super-120b-a12b:free
//    google/gemini-2.5-pro-exp-03-25:free
//    ❌ gemma-3-4b-it:free        — removed
//    ❌ deepseek-r1-distill:free  — removed
//    ❌ qwen3-8b:free             — removed
// ============================================================

import { env } from '../config/env';
import logger from '../utils/logger';

// ─── Types ────────────────────────────────────────────────

export interface AnalyseInput {
  cvText: string;
  offerTitle: string;
  requiredSkills: string[];
  experienceYears: number;
  description: string;
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'Hire' | 'Interview' | 'Reject';
  tipsForCandidate: string[];
  aiProvider?: string;
  confidence?: number;
  language?: string;
}
export interface BattleResult {
  results: AnalysisResult[];
  consensus: AnalysisResult;
  totalFired: number;
  totalSucceeded: number;
  totalFailed: number;
}

// ─── Internal model descriptor ────────────────────────────

interface AIModel {
  id: string;
  label: string;
  provider: string;
  type: 'gemini' | 'openrouter';
  modelId: string;
}

// ─── Model lists — verified March 2026 ───────────────────

const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gem-25-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    type: 'gemini',
    modelId: 'gemini-2.5-flash-lite',
  },
  {
    id: 'gem-25-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
    type: 'gemini',
    modelId: 'gemini-2.5-flash',
  },
  {
    id: 'gem-25-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    type: 'gemini',
    modelId: 'gemini-2.5-pro',
  },
  {
    id: 'gem-20-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'Google',
    type: 'gemini',
    modelId: 'gemini-2.0-flash',
  },
];

const OR_MODELS: AIModel[] = [
  {
    id: 'or-free-auto',
    label: 'OpenRouter Auto (free)',
    provider: 'OpenRouter',
    type: 'openrouter',
    modelId: 'openrouter/free',
  },
  {
    id: 'or-llama4-maverick',
    label: 'Llama 4 Maverick',
    provider: 'Meta',
    type: 'openrouter',
    modelId: 'meta-llama/llama-4-maverick:free',
  },
];
// ─── Prompt ───────────────────────────────────────────────

export function buildPrompt(input: AnalyseInput): string {
  return `You are a senior HR recruiter at Schulte Automotive Tunisia, a German-owned cable assembly factory.
Analyze this candidate's CV against the job requirements with professional depth.

JOB POSITION: ${input.offerTitle}
REQUIRED SKILLS: ${input.requiredSkills.join(', ')}
MINIMUM EXPERIENCE: ${input.experienceYears} years
JOB DESCRIPTION: ${input.description}

CANDIDATE CV:
${input.cvText.substring(0, 5000)}

EVALUATION CRITERIA:
1. TECHNICAL SKILLS MATCH (40%): required skills present? proficiency level? certifications?
2. EXPERIENCE RELEVANCE (30%): years vs required, industry fit (automotive preferred), progression
3. EDUCATION (15%): degree relevance, certifications
4. SOFT SKILLS (15%): French/English/German/Arabic, teamwork, leadership, communication

SCORING:
- 85–100 → Hire
- 70–84  → Interview
- 50–69  → Interview (conditional)
- <50    → Reject

Return ONLY valid JSON — no markdown, no backticks, no explanation:
{"score":<0-100>,"strengths":["s1","s2","s3"],"gaps":["g1","g2"],"recommendation":"<Hire|Interview|Reject>","tipsForCandidate":["t1","t2"],"confidence":<0-100>,"language":"<detected CV language>"}`;
}

// ─── JSON parser ──────────────────────────────────────────

export function parseAIResponse(raw: string, provider: string): AnalysisResult {
  let s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a !== -1 && b !== -1) s = s.substring(a, b + 1);

  const p = JSON.parse(s);

  const score = Math.max(0, Math.min(100, Math.round(Number(p.score) || 60)));
  const validRecs = ['Hire', 'Interview', 'Reject'];
  const recommendation: AnalysisResult['recommendation'] = validRecs.includes(p.recommendation)
    ? (p.recommendation as AnalysisResult['recommendation'])
    : 'Interview';

  return {
    score,
    strengths: Array.isArray(p.strengths)
      ? p.strengths.slice(0, 5).map(String)
      : ['Profile received and processed'],
    gaps: Array.isArray(p.gaps)
      ? p.gaps.slice(0, 3).map(String)
      : ['Manual review recommended'],
    recommendation,
    tipsForCandidate: Array.isArray(p.tipsForCandidate)
      ? p.tipsForCandidate.slice(0, 3).map(String)
      : ['Highlight relevant skills clearly'],
    aiProvider: provider,
    confidence: Math.max(0, Math.min(100, Math.round(Number(p.confidence) || 75))),
    language: String(p.language || 'Unknown'),
  };
}
// ─── Gemini caller ───────────────────────────────────────

async function callGemini(model: AIModel, input: AnalyseInput): Promise<AnalysisResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.modelId}:generateContent?key=${env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const retryMatch = body.match(/retryDelay['":\s]+(\d+)s/);
    const hint = res.status === 429
      ? retryMatch ? ` (retry in ${retryMatch[1]}s)` : ' (quota exhausted)'
      : '';
    throw new Error(`Gemini ${res.status}${hint}: ${body.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error(`Gemini ${model.modelId}: empty response`);

  return parseAIResponse(text, `${model.label} (Gemini)`);
}

// ─── OpenRouter caller ────────────────────────────────────

async function callOpenRouter(model: AIModel, input: AnalyseInput): Promise<AnalysisResult> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://schulte-tunisia.com',
      'X-Title': 'Schulte Tunisia Recruitment',
    },
    body: JSON.stringify({
      model: model.modelId,
      messages: [{ role: 'user', content: buildPrompt(input) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error(`OpenRouter ${model.modelId}: empty response`);

  return parseAIResponse(text, `${model.label} (OpenRouter)`);
}
// ─── Router ───────────────────────────────────────────────

function callModel(model: AIModel, input: AnalyseInput): Promise<AnalysisResult> {
  switch (model.type) {
    case 'gemini':     return callGemini(model, input);
    case 'openrouter': return callOpenRouter(model, input);
    default:           throw new Error(`Unknown model type: ${(model as any).type}`);
  }
}

// ─── Consensus builder ────────────────────────────────────

function buildConsensus(results: AnalysisResult[]): AnalysisResult {
  if (results.length === 1) return results[0];

  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;

  const tally: Record<string, number> = {};
  results.forEach(r => { tally[r.recommendation] = (tally[r.recommendation] || 0) + 1; });
  const topRec = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])[0][0] as AnalysisResult['recommendation'];

  const representative = results.reduce((best, r) =>
    Math.abs(r.score - avgScore) < Math.abs(best.score - avgScore) ? r : best
  );

  return {
    ...representative,
    score: Math.round(avgScore),
    recommendation: topRec,
    confidence: Math.round(results.reduce((s, r) => s + (r.confidence ?? 75), 0) / results.length),
    aiProvider: `Consensus (${results.length} models): ${results.map(r => r.aiProvider).join(', ')}`,
  };
}

// ─── Keyword fallback ────────────────────────────────────

function buildFallback(input: AnalyseInput): AnalysisResult {
  const cv    = input.cvText.toLowerCase();
  const found = input.requiredSkills.filter(s => cv.includes(s.toLowerCase()));
  const ratio = found.length / Math.max(input.requiredSkills.length, 1);
  const score = Math.max(40, Math.min(70, Math.round(ratio * 80 + 20)));

  return {
    score,
    strengths: [
      'CV received and processed',
      found.length > 0 ? `Matching skills detected: ${found.join(', ')}` : 'Profile submitted for review',
      'Application queued for manual HR review',
    ],
    gaps: [
      input.requiredSkills.length > found.length ? 'Some required skills not explicitly mentioned' : 'Minor gaps identified',
      'AI analysis temporarily unavailable — manual review required',
    ],
    recommendation: score >= 60 ? 'Interview' : 'Reject',
    tipsForCandidate: [
      'List all technical and domain skills explicitly in your CV',
      'Highlight any automotive or manufacturing experience',
    ],
    aiProvider: 'Keyword Fallback (all AI services unavailable)',
    confidence: 40,
    language: 'Auto-detected',
  };
}
// ─── CV text utilities ────────────────────────────────────

export class CVTextExtractor {
  /** Extract text from a base64-encoded PDF buffer */
  static async extractFromPDF(base64Data: string): Promise<string> {
    try {
      const pdfParse = require('pdf-parse');
      const buffer   = Buffer.from(base64Data, 'base64');
      const data     = await pdfParse(buffer);
      const text     = data.text.replace(/\s+/g, ' ').trim();

      logger.info(`📄 PDF extracted: ${text.length} chars`);

      if (!text || text.length < 50) {
        return `[PDF processed — minimal text found. May be a scanned image. File size: ${Math.round(base64Data.length * 0.75)} bytes. Manual review recommended.]`;
      }
      return text;
    } catch (err) {
      logger.error('PDF extraction failed:', err);
      return `[PDF extraction failed: ${err instanceof Error ? err.message : 'unknown'}. Manual review required.]`;
    }
  }

  /** Assemble a readable CV string from a structured form-data object */
  static assembleFromFormData(form: Record<string, any>): string {
    if (!form) return '';
    const parts: string[] = [];

    const get = (...keys: string[]) => keys.reduce<any>((o, k) => o?.[k], form);

    const name  = get('name')  ?? get('personal', 'name');
    const email = get('email') ?? get('personal', 'email');
    const phone = get('phone') ?? get('personal', 'phone');
    const city  = get('city')  ?? get('personal', 'city');

    if (name)  parts.push(`Name: ${name}`);
    if (email) parts.push(`Email: ${email}`);
    if (phone) parts.push(`Phone: ${phone}`);
    if (city)  parts.push(`Location: ${city}`);

    const edu = form.education;
    if (Array.isArray(edu) && edu.length) {
      parts.push('\nEducation:');
      edu.forEach((e: any) =>
        parts.push(`- ${e.degree ?? e.level ?? ''} in ${e.field ?? ''} at ${e.institution ?? ''} (${e.year ?? ''})`)
      );
    }

    const exp = form.experience;
    if (Array.isArray(exp) && exp.length) {
      parts.push('\nProfessional Experience:');
      exp.forEach((e: any) => {
        parts.push(`- ${e.title ?? ''} at ${e.company ?? ''} (${e.startDate ?? e.duration ?? ''} – ${e.endDate ?? 'Present'})`);
        if (e.description) parts.push(`  ${e.description}`);
      });
    }

    if (Array.isArray(form.skills) && form.skills.length)
      parts.push(`\nSkills: ${form.skills.join(', ')}`);

    if (Array.isArray(form.languages) && form.languages.length)
      parts.push(`\nLanguages: ${(form.languages as any[]).map(l => `${l.language ?? l.name ?? ''} (${l.level ?? ''})`).join(', ')}`);

    if (form.coverNote) parts.push(`\nCover Note: ${form.coverNote}`);

    return parts.filter(Boolean).join('\n');
  }

  /** Trim + normalise a CV string before sending to AI */
  static prepareForAnalysis(cvText: string): string {
    let s = cvText.replace(/\s+/g, ' ').trim();
    if (s.length > 5000) {
      s = s.substring(0, 5000) + '\n[CV truncated — full version available for manual review]';
    }
    return s;
  }
}
// ══════════════════════════════════════════════════════════
// 🏆  MAIN BATTLE ENGINE
// ══════════════════════════════════════════════════════════

export class AIBattleService {

  /**
   * Fire all available models simultaneously.
   * Returns every individual result + a consensus.
   */
  static async battle(rawInput: AnalyseInput): Promise<BattleResult> {
    logger.info(`⚔️  AI Battle — "${rawInput.offerTitle}" | CV ${rawInput.cvText.length} chars`);

    const input: AnalyseInput = {
      ...rawInput,
      cvText: CVTextExtractor.prepareForAnalysis(rawInput.cvText),
    };

    // Build active model list based on which keys are configured
    const models: AIModel[] = [];

    if (env.GEMINI_API_KEY) {
      models.push(...GEMINI_MODELS);
      logger.info(`🔵 Gemini: queuing ${GEMINI_MODELS.length} models`);
    } else {
      logger.warn('⚠️  GEMINI_API_KEY not set');
    }

    if (env.OPENROUTER_API_KEY) {
      models.push(...OR_MODELS);
      logger.info(`🟠 OpenRouter: queuing ${OR_MODELS.length} models`);
    } else {
      logger.warn('⚠️  OPENROUTER_API_KEY not set');
    }

    if (models.length === 0) {
      logger.warn('⚠️  No API keys configured — returning keyword fallback');
      const fb = buildFallback(rawInput);
      return { results: [fb], consensus: fb, totalFired: 0, totalSucceeded: 0, totalFailed: 0 };
    }

    logger.info(`🚀 Firing ${models.length} models simultaneously…`);

    // Fire ALL at the same time — failures don't block successes
    const settled = await Promise.allSettled(
      models.map(model =>
        callModel(model, input)
          .then(result => {
            logger.info(`✅ ${model.label}: score=${result.score} rec=${result.recommendation}`);
            return result;
          })
          .catch(err => {
            logger.warn(`❌ ${model.label}: ${err.message}`);
            throw err;
          })
      )
    );

    const results = settled
      .filter((s): s is PromiseFulfilledResult<AnalysisResult> => s.status === 'fulfilled')
      .map(s => s.value);

    const failed = settled.filter(s => s.status === 'rejected').length;

    logger.info(`📊 Battle complete: ${results.length} succeeded, ${failed} failed / ${models.length} total`);

    if (results.length === 0) {
      logger.warn('⚠️  All models failed — returning keyword fallback');
      const fb = buildFallback(rawInput);
      return { results: [fb], consensus: fb, totalFired: models.length, totalSucceeded: 0, totalFailed: failed };
    }

    const consensus = buildConsensus(results);
    logger.info(`🏆 Consensus: score=${consensus.score} rec=${consensus.recommendation} confidence=${consensus.confidence}%`);

    return {
      results,
      consensus,
      totalFired: models.length,
      totalSucceeded: results.length,
      totalFailed: failed,
    };
  }

  /**
   * Convenience wrapper — returns only the consensus result.
   */
  static async analyse(input: AnalyseInput): Promise<AnalysisResult> {
    const battle = await this.battle(input);
    return battle.consensus;
  }
}
// ─── Backwards-compatible exports ────────────────────────

export async function analyseApplication(input: AnalyseInput): Promise<AnalysisResult> {
  return AIBattleService.analyse(input);
}

export class AIService {
  static analyseWithGemini  = (i: AnalyseInput) => AIBattleService.analyse(i);
  static buildPromptForFrontend   = buildPrompt;
  static parseResponseFromFrontend = (raw: string) => parseAIResponse(raw, 'Frontend');
}

export class DualAIService {
  static analyseWithFallback = (i: AnalyseInput) => AIBattleService.analyse(i);
}

export class IntelligentAIService {
  static analyzeInBackground = (i: AnalyseInput) => AIBattleService.analyse(i);
}

export function assembleFormText(formData: any): string {
  return CVTextExtractor.assembleFromFormData(formData);
}

export default AIBattleService;