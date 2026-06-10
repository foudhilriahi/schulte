import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import {
  buildPrompt,
  parseAIResponse,
  AnalyseInput,
  CVTextExtractor,
  AIBattleService,
} from '../services/ai.service';

const sampleInput: AnalyseInput = {
  cvText: 'Ingénieur en génie mécanique avec 5 ans d\'expérience dans le câblage automobile. Compétences : CATIA, SAP, Kaizen, ISO TS 16949, Lean Manufacturing, Six Sigma. ' +
    'Expérience chez Schulte Tunisia et Valeo. Gestion de la qualité fournisseur et audit interne. Formation continue en management de la qualité.'.repeat(10),
  offerTitle: 'Ingénieur Qualité Fournisseur',
  requiredSkills: ['CATIA', 'SAP', 'Kaizen', 'ISO TS 16949', 'Lean Manufacturing'],
  experienceYears: 3,
  description: 'Nous recherchons un Ingénieur Qualité Fournisseur pour notre site de Bouarada.',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AI Service — buildPrompt', () => {
  it('injects all input variables into the prompt template', () => {
    const prompt = buildPrompt(sampleInput);
    expect(prompt).toContain(sampleInput.offerTitle);
    expect(prompt).toContain(sampleInput.requiredSkills.join(', '));
    expect(prompt).toContain(String(sampleInput.experienceYears));
    expect(prompt).toContain(sampleInput.description);
    expect(prompt).toContain(sampleInput.cvText.substring(0, 5000));
  });

  it('truncates cvText to 5000 characters', () => {
    const longCv = 'A'.repeat(10000);
    const prompt = buildPrompt({ ...sampleInput, cvText: longCv });
    expect(prompt.length - prompt.replace('{{cvText}}', '').length).toBeLessThanOrEqual(5000);
  });
});

describe('AI Service — parseAIResponse', () => {
  it('parses a valid AI response correctly', () => {
    const raw = JSON.stringify({
      thinking: 'The candidate has 5 years experience matching the requirements.',
      score: 78,
      confidence: 'high',
      recommendation: 'Interview',
      reasoning: 'Le profil correspond aux compétences requises pour le poste.',
      tips_for_candidate: ['Mettre en avant SAP', 'Préparer un cas pratique'],
      language: 'Français',
      strengths: ['5 ans expérience câblage', 'Maîtrise CATIA'],
      gaps: ['Pas d\'expérience Lean'],
    });

    const result = parseAIResponse(raw, 'Gemini 2.5 Flash (Gemini)', sampleInput);

    expect(result.score).toBe(78);
    expect(result.confidence).toBe('high');
    expect(result.recommendation).toBe('Interview');
    expect(result.strengths).toContain('5 ans expérience câblage');
    expect(result.gaps).toContain('Pas d\'expérience Lean');
    expect(result.tipsForCandidate).toHaveLength(2);
    expect(result.aiProvider).toBe('Gemini 2.5 Flash (Gemini)');
    expect(result.language).toBe('Français');
    expect(result.confidenceScore).toBe(85);
  });

  it('handles markdown-fenced JSON', () => {
    const raw = '```json\n{"score": 92, "recommendation": "Hire", "thinking": "Great match", "reasoning": "Excellent profil"}\n```';
    const result = parseAIResponse(raw, 'Test', sampleInput);
    expect(result.score).toBe(92);
    expect(result.recommendation).toBe('Hire');
  });

  it('falls back to default values for missing fields', () => {
    const raw = JSON.stringify({ score: 60 });
    const result = parseAIResponse(raw, 'Test', sampleInput);
    expect(result.score).toBe(60);
    expect(result.strengths).toHaveLength(1);
    expect(result.gaps).toHaveLength(1);
    expect(result.tipsForCandidate).toHaveLength(2);
    expect(result.confidence).toBe('high');
  });

  it('clamps score to 0-100 range', () => {
    expect(parseAIResponse(JSON.stringify({ score: -10 }), 'Test', sampleInput).score).toBe(0);
    expect(parseAIResponse(JSON.stringify({ score: 150 }), 'Test', sampleInput).score).toBe(100);
  });

  it('forces "Request More Info" for low confidence', () => {
    const shortCv = { ...sampleInput, cvText: 'Short CV' };
    const raw = JSON.stringify({ score: 90, recommendation: 'Hire', thinking: 'x', reasoning: 'x' });
    const result = parseAIResponse(raw, 'Test', shortCv);
    expect(result.confidence).toBe('low');
    expect(result.recommendation).toBe('Request More Info');
  });

  it('maps recommendation from score when invalid recommendation given', () => {
    const raw = JSON.stringify({ score: 45, recommendation: 'Maybe', thinking: 'x', reasoning: 'x', confidence: 'high' });
    const result = parseAIResponse(raw, 'Test', sampleInput);
    expect(result.recommendation).toBe('Reject');
  });
});

describe('AI Service — CVTextExtractor.assembleFromFormData', () => {
  it('assembles a full Markdown CV from structured form data', () => {
    const formData = {
      personal: {
        name: 'Ahmed Ben Salem',
        email: 'ahmed@example.com',
        phone: '+216 99 999 999',
        city: 'Tunis',
      },
      education: [
        { degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' },
      ],
      experience: [
        {
          title: 'Ingénieur Qualité',
          company: 'Schulte Tunisia',
          startDate: '2020-01',
          endDate: '2024-12',
          description: 'Gestion de la qualité fournisseur.',
        },
      ],
      skills: ['CATIA', 'SAP', 'Kaizen', 'ISO TS 16949'],
      languages: [{ name: 'Français', level: 'Courant' }, { name: 'Anglais', level: 'Intermédiaire' }],
      links: [{ name: 'LinkedIn', url: 'https://linkedin.com/in/ahmed' }],
      coverNote: 'Passionné par l\'industrie automobile.',
    };

    const result = CVTextExtractor.assembleFromFormData(formData);

    expect(result).toContain('# Ahmed Ben Salem');
    expect(result).toContain('ahmed@example.com');
    expect(result).toContain('+216 99 999 999');
    expect(result).toContain('Tunis');
    expect(result).toContain('Ingénieur');
    expect(result).toContain('Génie Mécanique');
    expect(result).toContain('ENIT');
    expect(result).toContain('2020');
    expect(result).toContain('Schulte Tunisia');
    expect(result).toContain('CATIA');
    expect(result).toContain('SAP');
    expect(result).toContain('Français');
    expect(result).toContain('Courant');
    expect(result).toContain('linkedin.com/in/ahmed');
    expect(result).toContain('Passionné par l\'industrie automobile');
  });

  it('returns empty string for null form data', () => {
    expect(CVTextExtractor.assembleFromFormData(null as any)).toBe('');
    expect(CVTextExtractor.assembleFromFormData(undefined as any)).toBe('');
  });

  it('handles minimal form data gracefully', () => {
    const result = CVTextExtractor.assembleFromFormData({});
    expect(result).toContain('# Candidat Anonyme');
  });
});

describe('AI Service — CVTextExtractor.prepareForAnalysis', () => {
  it('truncates text longer than 5000 characters', () => {
    const longText = 'A'.repeat(10000);
    const result = CVTextExtractor.prepareForAnalysis(longText);
    expect(result.length).toBeGreaterThan(5000);
    expect(result.length).toBeLessThanOrEqual(5100);
    expect(result).toContain('[CV tronqué');
  });

  it('normalizes whitespace', () => {
    const result = CVTextExtractor.prepareForAnalysis('  Hello   World  ');
    expect(result).toBe('Hello World');
  });
});

describe('AI Service — CVTextExtractor.extractFromPDF', () => {
  it('returns fallback message for very short extracted text', async () => {
    // Minimal valid base64 that pdf-parse would fail on
    const result = await CVTextExtractor.extractFromPDF('AAAA');
    expect(result).toContain('[Échec');
  });

  it('handles empty base64 gracefully', async () => {
    const result = await CVTextExtractor.extractFromPDF('');
    expect(result).toContain('[Échec');
  });
});
