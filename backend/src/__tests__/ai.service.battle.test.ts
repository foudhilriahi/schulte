import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock env with no API keys so AIBattleService falls back to keyword matching
vi.mock('../config/env', () => ({
  env: {
    GEMINI_API_KEY: '',
    OPENROUTER_API_KEY: '',
  },
  __esModule: true,
}));

// Now import after mock
import { AIBattleService, AnalyseInput } from '../services/ai.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AI Service — AIBattleService.battle (fallback path)', () => {
  it('returns keyword-based fallback when no API keys configured', async () => {
    const input: AnalyseInput = {
      cvText: 'Ingénieur en génie mécanique avec 5 ans d\'expérience dans le câblage automobile. Compétences : CATIA, SAP, Kaizen, ISO TS 16949, Lean Manufacturing, Six Sigma. '.repeat(5),
      offerTitle: 'Ingénieur Qualité',
      requiredSkills: ['CATIA', 'SAP', 'Kaizen', 'ISO TS 16949'],
      experienceYears: 3,
      description: 'Poste basé à Bouarada.',
    };

    const result = await AIBattleService.battle(input);

    expect(result.totalFired).toBe(0);
    expect(result.totalSucceeded).toBe(0);
    expect(result.totalFailed).toBe(0);
    expect(result.consensus.aiProvider).toContain('Repli mots-clés');
    expect(result.consensus.score).toBeGreaterThanOrEqual(40);
    expect(result.consensus.score).toBeLessThanOrEqual(70);
    expect(result.consensus.recommendation).toBeDefined();
  });

  it('fallback score reflects skill match ratio', async () => {
    const input: AnalyseInput = {
      cvText: 'Expert in CATIA and SAP. Also skilled in various engineering tools including quality management and process improvement. '.repeat(20),
      offerTitle: 'Test',
      requiredSkills: ['CATIA', 'SAP', 'Kaizen'],
      experienceYears: 2,
      description: 'Test position',
    };

    const result = await AIBattleService.battle(input);
    // 2 out of 3 skills found => ratio=0.66 => score=round(0.66*80+20)=73 -> clamped to [40,70] -> 70
    expect(result.consensus.score).toBe(70);
    expect(result.consensus.recommendation).toBe('Interview');
  });

  it('produces low score when no skills match', async () => {
    const input: AnalyseInput = {
      cvText: 'Junior developer with basic knowledge of Python.',
      offerTitle: 'Test',
      requiredSkills: ['CATIA', 'SAP', 'Kaizen', 'Lean Manufacturing'],
      experienceYears: 5,
      description: 'Test position',
    };

    const result = await AIBattleService.battle(input);
    // 0 out of 4 skills found => ratio=0 => score=round(0*80+20)=20 -> clamped to [40,70] -> 40
    expect(result.consensus.score).toBe(40);
    expect(result.consensus.recommendation).toBe('Request More Info');
  });
});
