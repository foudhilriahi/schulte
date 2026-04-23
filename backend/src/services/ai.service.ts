// ============================================================
// AI ANALYSIS SERVICE
// Cost-safe strategy:
// - run one primary model first
// - try backups only if the previous attempt fails
// - keep deterministic fallback when providers are unavailable
// ============================================================

import fs from 'fs';
import path from 'path';
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
  thinking: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore?: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'Hire' | 'Interview' | 'Request More Info' | 'Reject';
  tipsForCandidate: string[];
  tips_for_candidate?: string[];
  aiProvider?: string;
  language?: string;
}
export interface BattleResult {
  results: AnalysisResult[];
  consensus: AnalysisResult;
  totalFired: number;
  totalSucceeded: number;
  totalFailed: number;
}

// ─── Descripteur interne de modèle ────────────────────────

interface AIModel {
  id: string;
  label: string;
  provider: string;
  type: 'gemini' | 'openrouter';
  modelId: string;
}

// ─── Model lists (ordered by cost-efficiency) ─────────────

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
];

const OR_MODELS: AIModel[] = [
  {
    id: 'or-free-auto',
    label: 'OpenRouter Auto (free)',
    provider: 'OpenRouter',
    type: 'openrouter',
    modelId: 'openrouter/free',
  },
];
// ─── Prompt ───────────────────────────────────────────────

let sharedPromptTemplate: string | null = null;
const FALLBACK_PROMPT_TEMPLATE = `Tu es un assistant RH. Evalue la correspondance entre ce CV et le poste, puis retourne UNIQUEMENT un JSON valide.

Contexte offre:
- Titre: {{offerTitle}}
- Competences requises: {{requiredSkills}}
- Experience requise: {{experienceYears}} ans
- Description: {{description}}

CV:
{{cvText}}

Format JSON attendu:
{"thinking":"2-3 phrases en anglais montrant comment le score a ete construit","score":<0-100>,"confidence":"<high|medium|low>","recommendation":"<Hire|Interview|Request More Info|Reject>","reasoning":"<un paragraphe en francais>","tips_for_candidate":["conseil1","conseil2"],"language":"<langue detectee du CV>","strengths":["s1","s2"],"gaps":["g1","g2"]}`;

function getSharedPromptTemplate(): string {
  if (sharedPromptTemplate) return sharedPromptTemplate;

  const candidatePaths = [
    path.resolve(process.cwd(), '../hr/public/shared/analysis-prompt.txt'),
    path.resolve(process.cwd(), 'hr/public/shared/analysis-prompt.txt'),
    path.resolve(process.cwd(), 'public/shared/analysis-prompt.txt'),
  ];

  const promptPath = candidatePaths.find((p) => fs.existsSync(p));
  if (!promptPath) {
    logger.warn('Shared prompt template not found; using embedded fallback template');
    sharedPromptTemplate = FALLBACK_PROMPT_TEMPLATE;
    return sharedPromptTemplate;
  }

  sharedPromptTemplate = fs.readFileSync(promptPath, 'utf8');
  return sharedPromptTemplate;
}

function injectPromptValue(template: string, token: string, value: string): string {
  return template.split(token).join(value);
}

export function buildPrompt(input: AnalyseInput): string {
  let prompt = getSharedPromptTemplate();
  prompt = injectPromptValue(prompt, '{{offerTitle}}', input.offerTitle);
  prompt = injectPromptValue(prompt, '{{requiredSkills}}', input.requiredSkills.join(', '));
  prompt = injectPromptValue(prompt, '{{experienceYears}}', String(input.experienceYears));
  prompt = injectPromptValue(prompt, '{{description}}', input.description);
  prompt = injectPromptValue(prompt, '{{cvText}}', input.cvText.substring(0, 5000));
  return prompt;
}

function toConfidenceLevel(cvText: string): 'high' | 'medium' | 'low' {
  const len = (cvText || '').trim().length;
  if (len < 200) return 'low';
  if (len < 1200) return 'medium';
  return 'high';
}

function toConfidenceScore(level: 'high' | 'medium' | 'low'): number {
  if (level === 'high') return 85;
  if (level === 'medium') return 60;
  return 30;
}

function recommendationFromScore(
  score: number,
  confidence: 'high' | 'medium' | 'low',
): AnalysisResult['recommendation'] {
  if (confidence === 'low') return 'Request More Info';
  if (score >= 85) return 'Hire';
  if (score >= 60) return 'Interview';
  return 'Reject';
}

// ─── Parseur JSON ─────────────────────────────────────────

export function parseAIResponse(raw: string, provider: string, input?: AnalyseInput): AnalysisResult {
  let s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a !== -1 && b !== -1) s = s.substring(a, b + 1);

  const p = JSON.parse(s);

  const score = Math.max(0, Math.min(100, Math.round(Number(p.score) || 60)));
  const confidenceFromText = toConfidenceLevel(input?.cvText || '');
  const confidence: AnalysisResult['confidence'] = confidenceFromText;

  const validRecs = ['Hire', 'Interview', 'Request More Info', 'Reject'];
  let recommendation: AnalysisResult['recommendation'] = validRecs.includes(p.recommendation)
    ? (p.recommendation as AnalysisResult['recommendation'])
    : recommendationFromScore(score, confidence);

  if (confidence === 'low') {
    recommendation = 'Request More Info';
  } else if (recommendation === 'Request More Info') {
    recommendation = recommendationFromScore(score, confidence);
  }

  const defaultLowConfidenceReasoning =
    "Le CV fourni contient des informations limitees, ce qui rend une evaluation complete difficile. Cette analyse est basee sur les elements disponibles et peut ne pas refleter tout le profil du candidat.";
  const rawReasoning = String(p.reasoning || '').trim();
  const reasoning =
    confidence === 'low'
      ? rawReasoning
        ? rawReasoning
        : defaultLowConfidenceReasoning
      : rawReasoning ||
        'Le profil semble globalement pertinent, mais une validation humaine reste necessaire avant la decision finale.';

  const tips = Array.isArray(p.tips_for_candidate)
    ? p.tips_for_candidate.slice(0, 3).map(String)
    : Array.isArray(p.tipsForCandidate)
      ? p.tipsForCandidate.slice(0, 3).map(String)
      : ['Mettre clairement en avant les compétences pertinentes', 'Quantifier l’expérience avec des exemples concrets'];

  return {
    thinking: String(p.thinking || 'Les compétences techniques, l’expérience et la qualité du CV ont été évaluées avant de produire le score final.'),
    score,
    confidence,
    confidenceScore: toConfidenceScore(confidence),
    reasoning,
    strengths: Array.isArray(p.strengths)
      ? p.strengths.slice(0, 5).map(String)
      : ['Profil reçu et traité'],
    gaps: Array.isArray(p.gaps)
      ? p.gaps.slice(0, 3).map(String)
      : ['Revue manuelle recommandée'],
    recommendation,
    tipsForCandidate: tips,
    tips_for_candidate: tips,
    aiProvider: provider,
    language: String(p.language || 'Inconnue'),
  };
}
// ─── Appel Gemini ─────────────────────────────────────────

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

  return parseAIResponse(text, `${model.label} (Gemini)`, input);
}

// ─── Appel OpenRouter ─────────────────────────────────────

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

  return parseAIResponse(text, `${model.label} (OpenRouter)`, input);
}
// ─── Routeur ──────────────────────────────────────────────

function callModel(model: AIModel, input: AnalyseInput): Promise<AnalysisResult> {
  switch (model.type) {
    case 'gemini':     return callGemini(model, input);
    case 'openrouter': return callOpenRouter(model, input);
    default:           throw new Error(`Type de modèle inconnu : ${(model as any).type}`);
  }
}

// ─── Construction du consensus ────────────────────────────

function buildConsensus(results: AnalysisResult[]): AnalysisResult {
  if (results.length === 1) return results[0];

  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;

  const tally: Record<string, number> = {};
  results.forEach(r => { tally[r.recommendation] = (tally[r.recommendation] || 0) + 1; });
  const topRec = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])[0][0] as AnalysisResult['recommendation'];

  const confidenceTally: Record<'high' | 'medium' | 'low', number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  results.forEach((r) => {
    confidenceTally[r.confidence] += 1;
  });
  const confidence = (Object.entries(confidenceTally)
    .sort((a, b) => b[1] - a[1])[0][0] || 'medium') as AnalysisResult['confidence'];

  const representative = results.reduce((best, r) =>
    Math.abs(r.score - avgScore) < Math.abs(best.score - avgScore) ? r : best
  );

  return {
    ...representative,
    score: Math.round(avgScore),
    recommendation: topRec,
    confidence,
    confidenceScore: toConfidenceScore(confidence),
    aiProvider: `Consensus (${results.length} modèles) : ${results.map(r => r.aiProvider).join(', ')}`,
  };
}

// ─── Repli par mots-clés ──────────────────────────────────

function buildFallback(input: AnalyseInput): AnalysisResult {
  const cv    = input.cvText.toLowerCase();
  const found = input.requiredSkills.filter(s => cv.includes(s.toLowerCase()));
  const ratio = found.length / Math.max(input.requiredSkills.length, 1);
  const score = Math.max(40, Math.min(70, Math.round(ratio * 80 + 20)));

  return {
    thinking: 'Le recouvrement des compétences techniques est estimé via des mots-clés, puis ajusté selon l’adéquation au poste et la qualité du contexte.',
    score,
    confidence: toConfidenceLevel(input.cvText),
    confidenceScore: toConfidenceScore(toConfidenceLevel(input.cvText)),
    reasoning: 'Le systeme automatique detecte certains elements compatibles avec le poste, mais l evaluation reste limitee sans analyse IA complete. Une revue RH est recommandee pour confirmer les points cles.',
    strengths: [
      'CV reçu et traité',
      found.length > 0 ? `Compétences correspondantes détectées : ${found.join(', ')}` : 'Profil transmis pour revue',
      'Candidature mise en file pour revue RH manuelle',
    ],
    gaps: [
      input.requiredSkills.length > found.length ? 'Certaines compétences requises ne sont pas mentionnées explicitement' : 'Écarts mineurs identifiés',
      'Analyse IA temporairement indisponible — revue manuelle requise',
    ],
    recommendation: recommendationFromScore(score, toConfidenceLevel(input.cvText)),
    tipsForCandidate: [
      'Lister explicitement toutes les compétences techniques et métier dans le CV',
      'Mettre en avant toute expérience en automobile ou en industrie',
    ],
    tips_for_candidate: [
      'Lister explicitement toutes les compétences techniques et métier dans le CV',
      'Mettre en avant toute expérience en automobile ou en industrie',
    ],
    aiProvider: 'Repli mots-clés (tous les services IA indisponibles)',
    language: 'Détection automatique',
  };
}
// ─── Utilitaires de texte CV ──────────────────────────────

export class CVTextExtractor {
  /** Extrait le texte d'un PDF encodé en base64 */
  static async extractFromPDF(base64Data: string): Promise<string> {
    try {
      const { PDFParse } = await import('pdf-parse');
      const buffer = Buffer.from(base64Data, 'base64');
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      if (typeof parser.destroy === 'function') await parser.destroy();
      const text     = data.text.replace(/\s+/g, ' ').trim();

      logger.info(`📄 PDF extrait : ${text.length} caractères`);

      if (!text || text.length < 50) {
        return `[PDF traité — texte minimal détecté. Le fichier peut être une image scannée. Taille : ${Math.round(base64Data.length * 0.75)} octets. Revue manuelle recommandée.]`;
      }
      return text;
    } catch (err) {
      logger.error('PDF extraction failed:', err);
      return `[Échec d'extraction PDF : ${err instanceof Error ? err.message : 'inconnu'}. Revue manuelle requise.]`;
    }
  }

  /** Assemble une chaîne CV en Markdown strict depuis un objet form-data structuré */
  static assembleFromFormData(form: Record<string, any>): string {
    if (!form) return '';
    const parts: string[] = [];

    const get = (...keys: string[]) => keys.reduce<any>((o, k) => o?.[k], form);

    const name  = get('name')  ?? get('personal', 'name') ?? 'Candidat Anonyme';
    parts.push(`# ${name}\n`);

    parts.push(`## Informations de Contact`);
    const email = get('email') ?? get('personal', 'email');
    const phone = get('phone') ?? get('personal', 'phone');
    const city  = get('city')  ?? get('personal', 'city');
    if (email) parts.push(`- **Email :** ${email}`);
    if (phone) parts.push(`- **Téléphone :** ${phone}`);
    if (city)  parts.push(`- **Ville :** ${city}`);

    const links = form.links;
    if (Array.isArray(links) && links.length > 0) {
      parts.push(`\n## Liens Professionnels`);
      links.forEach((l: any) => {
        parts.push(`- **${l.name ?? 'Lien'}** : ${l.url ?? ''}`);
      });
    }

    const exp = form.experience;
    if (Array.isArray(exp) && exp.length > 0) {
      parts.push('\n## Expérience Professionnelle');
      exp.forEach((e: any) => {
        parts.push(`### ${e.title ?? 'Poste'} chez ${e.company ?? 'Entreprise'}`);
        parts.push(`*Durée : ${e.duration ?? 'Non précisée'}*`);
        if (e.description) {
          parts.push(`**Description :**\n${e.description}`);
        }
        parts.push('');
      });
    }

    const edu = form.education;
    if (Array.isArray(edu) && edu.length > 0) {
      parts.push('## Formation');
      edu.forEach((e: any) => {
        parts.push(`- **${e.degree ?? 'Diplôme'} en ${e.field ?? 'Domaine'}** à ${e.institution ?? 'Établissement'} (${e.year ?? ''})`);
      });
    }

    if (Array.isArray(form.skills) && form.skills.length > 0) {
      parts.push(`\n## Compétences Techniques et Métier`);
      parts.push(form.skills.map(s => `- ${s}`).join('\n'));
    }

    const langs = form.languages;
    if (Array.isArray(langs) && langs.length > 0) {
      parts.push(`\n## Langues`);
      langs.forEach((l: any) => {
        parts.push(`- **${l.name ?? 'Langue'}** : ${l.level ?? 'Non précisé'}`);
      });
    }

    if (form.coverNote) {
      parts.push(`\n## Note de Motivation`);
      parts.push(form.coverNote);
    }

    return parts.filter(Boolean).join('\n');
  }

  /** Nettoie + normalise une chaîne CV avant envoi à l'IA */
  static prepareForAnalysis(cvText: string): string {
    let s = cvText.replace(/\s+/g, ' ').trim();
    if (s.length > 5000) {
      s = s.substring(0, 5000) + '\n[CV tronqué — version complète disponible pour revue manuelle]';
    }
    return s;
  }
}
// ══════════════════════════════════════════════════════════
// 🏆  MOTEUR PRINCIPAL DE BATAILLE
// ══════════════════════════════════════════════════════════

export class AIBattleService {

  /**
   * Runs providers in sequence and stops at the first successful result.
   * This preserves reliability while reducing token consumption.
   */
  static async battle(rawInput: AnalyseInput): Promise<BattleResult> {
    logger.info(`⚔️  Bataille IA — "${rawInput.offerTitle}" | CV ${rawInput.cvText.length} caractères`);

    const input: AnalyseInput = {
      ...rawInput,
      cvText: CVTextExtractor.prepareForAnalysis(rawInput.cvText),
    };

    // Build execution plan in ascending token-cost order.
    const models: AIModel[] = [];

    if (env.GEMINI_API_KEY) {
      models.push(...GEMINI_MODELS);
      logger.info(`🔵 Gemini configured: ${GEMINI_MODELS.length} model(s) ready`);
    } else {
      logger.warn('⚠️  GEMINI_API_KEY non définie');
    }

    if (env.OPENROUTER_API_KEY) {
      models.push(...OR_MODELS);
      logger.info(`🟠 OpenRouter configured: ${OR_MODELS.length} fallback model(s) ready`);
    } else {
      logger.warn('⚠️  OPENROUTER_API_KEY non définie');
    }

    if (models.length === 0) {
      logger.warn('⚠️  Aucune clé API configurée — retour du repli mots-clés');
      const fb = buildFallback(rawInput);
      return { results: [fb], consensus: fb, totalFired: 0, totalSucceeded: 0, totalFailed: 0 };
    }

    logger.info(`💰 Token-saver mode: run until first successful provider (max ${models.length} attempts)`);

    const results: AnalysisResult[] = [];
    let attempted = 0;
    let failed = 0;

    for (const model of models) {
      attempted += 1;
      try {
        const result = await callModel(model, input);
        logger.info(`✅ ${model.label}: score=${result.score} rec=${result.recommendation}`);
        results.push(result);
        break;
      } catch (err: any) {
        failed += 1;
        logger.warn(`❌ ${model.label}: ${err?.message || 'unknown error'}`);
      }
    }

    logger.info(`📊 Analysis complete: ${results.length} succeeded, ${failed} failed / ${attempted} attempted`);

    if (results.length === 0) {
      logger.warn('⚠️  Tous les modèles ont échoué — retour du repli mots-clés');
      const fb = buildFallback(rawInput);
      return { results: [fb], consensus: fb, totalFired: attempted, totalSucceeded: 0, totalFailed: failed };
    }

    const consensus = buildConsensus(results);
    logger.info(`🏆 Consensus : score=${consensus.score} rec=${consensus.recommendation} confiance=${consensus.confidence}%`);

    return {
      results,
      consensus,
      totalFired: attempted,
      totalSucceeded: results.length,
      totalFailed: failed,
    };
  }

  /**
   * Wrapper pratique — retourne uniquement le résultat de consensus.
   */
  static async analyse(input: AnalyseInput): Promise<AnalysisResult> {
    const battle = await this.battle(input);
    return battle.consensus;
  }
}
// ─── Exports rétrocompatibles ─────────────────────────────

export async function analyseApplication(input: AnalyseInput): Promise<AnalysisResult> {
  return AIBattleService.analyse(input);
}

export function assembleFormText(formData: any): string {
  return CVTextExtractor.assembleFromFormData(formData);
}

export default AIBattleService;
