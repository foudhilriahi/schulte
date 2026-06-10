import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApplicationsController } from '../controllers/applications.controller';
import { ApplicationRepository } from '../repositories/application.repository';
import * as aiService from '../services/ai.service';
import { SocketService } from '../services/socket.service';

vi.mock('../services/ai.service', () => ({
  analyseApplication: vi.fn(),
  CVTextExtractor: { prepareForAnalysis: vi.fn((s: string) => s) },
}));

vi.mock('../services/socket.service', () => ({
  SocketService: { emitToSite: vi.fn(), emitToUser: vi.fn() },
}));

vi.mock('../repositories/application.repository', () => ({
  ApplicationRepository: {
    findById: vi.fn(),
    saveAIResult: vi.fn(),
  },
}));

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { userId: 'hr-1', role: 'HR', site: 'Bouarada' },
    query: {},
    params: {},
    body: {},
    ...overrides,
  } as any;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.application.findUnique).mockResolvedValue({
    offer: { site: 'Bouarada' },
  } as any);
});

describe('ApplicationsController — analyse', () => {
  const mockApp = {
    id: 'app-1',
    candidateId: 'cand-1',
    cvTextSnapshot: 'Ingénieur avec 5 ans dans le câblage automobile. Compétences : CATIA, SAP, Kaizen.',
    candidateCV: null,
    offer: {
      title: 'Ingénieur Qualité',
      site: 'Bouarada',
      requiredSkills: ['CATIA', 'SAP', 'Kaizen'],
      experienceYears: 3,
      description: 'Poste basé à Bouarada.',
    },
  };

  const mockAnalysisResult = {
    thinking: 'Strong match for the position.',
    score: 82,
    confidence: 'high' as const,
    confidenceScore: 85,
    reasoning: 'Le profil correspond bien aux exigences.',
    strengths: ['Expérience en câblage', 'Maîtrise CATIA'],
    gaps: ['Pas d\'expérience Lean'],
    recommendation: 'Interview' as const,
    tipsForCandidate: ['Préparer un cas pratique'],
    aiProvider: 'Gemini 2.5 Flash (Gemini)',
    language: 'Français',
  };

  it('performs full AI analysis: skills, score, recommendation', async () => {
    const req = mockReq({ params: { id: 'app-1' } } as any);
    const res = mockRes();

    vi.mocked(ApplicationRepository.findById).mockResolvedValue(mockApp as any);
    vi.mocked(aiService.analyseApplication).mockResolvedValue(mockAnalysisResult);

    await ApplicationsController.analyse(req, res);

    // AI called with CV + offer details
    expect(aiService.analyseApplication).toHaveBeenCalledWith({
      cvText: mockApp.cvTextSnapshot,
      offerTitle: mockApp.offer.title,
      requiredSkills: mockApp.offer.requiredSkills,
      experienceYears: mockApp.offer.experienceYears,
      description: mockApp.offer.description,
    });

    // Saved to DB with score and full analysis JSON
    expect(ApplicationRepository.saveAIResult).toHaveBeenCalledWith('app-1', {
      score: 82,
      analysis: expect.stringContaining('"score":82'),
    });

    // WebSocket: HR site gets manual_analysis event with strengths + gaps
    expect(SocketService.emitToSite).toHaveBeenCalledWith('Bouarada', 'application:manual_analysis', {
      applicationId: 'app-1',
      candidateId: 'cand-1',
      score: 82,
      recommendation: 'Interview',
      confidence: 'high',
      aiProvider: 'Gemini 2.5 Flash (Gemini)',
      strengths: ['Expérience en câblage', 'Maîtrise CATIA'],
      gaps: ['Pas d\'expérience Lean'],
      analysisType: 'manual_hr',
    });

    // WebSocket: candidate gets tips
    expect(SocketService.emitToUser).toHaveBeenCalledWith('cand-1', 'ai:analysis_updated', {
      applicationId: 'app-1',
      jobTitle: 'Ingénieur Qualité',
      score: 82,
      recommendation: 'Interview',
      tipsForCandidate: ['Préparer un cas pratique'],
      analysisType: 'manual_hr',
    });

    // Response contains full analysis
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 82,
        recommendation: 'Interview',
        confidence: 'high',
        strengths: expect.arrayContaining(['Expérience en câblage']),
        gaps: expect.any(Array),
        aiProvider: expect.any(String),
        language: 'Français',
      }),
    );
  });

  it('returns 404 if application not found', async () => {
    const req = mockReq({ params: { id: 'app-unknown' } } as any);
    const res = mockRes();
    vi.mocked(ApplicationRepository.findById).mockResolvedValue(null);

    await ApplicationsController.analyse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 if no CV text available', async () => {
    const req = mockReq({ params: { id: 'app-1' } } as any);
    const res = mockRes();
    vi.mocked(ApplicationRepository.findById).mockResolvedValue({
      id: 'app-1',
      cvTextSnapshot: null,
      candidateCV: null,
      offer: { title: 'Test', site: 'Bouarada' },
    } as any);

    await ApplicationsController.analyse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 503 when AI service fails', async () => {
    const req = mockReq({ params: { id: 'app-1' } } as any);
    const res = mockRes();
    vi.mocked(ApplicationRepository.findById).mockResolvedValue(mockApp as any);
    vi.mocked(aiService.analyseApplication).mockRejectedValue(new Error('AI service unavailable'));

    await ApplicationsController.analyse(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });
});

describe('ApplicationsController — saveAnalysis', () => {
  it('saves a manually provided AI analysis', async () => {
    const req = mockReq({
      params: { id: 'app-1' } as any,
      body: { aiScore: 75, aiAnalysis: { custom: 'data' } },
    });
    const res = mockRes();
    vi.mocked(ApplicationRepository.findById).mockResolvedValue({ id: 'app-1' } as any);
    vi.mocked(ApplicationRepository.saveAIResult).mockResolvedValue({ id: 'app-1', aiScore: 75 } as any);

    await ApplicationsController.saveAnalysis(req, res);

    expect(ApplicationRepository.saveAIResult).toHaveBeenCalledWith('app-1', {
      score: 75,
      analysis: { custom: 'data' },
    });
    expect(res.json).toHaveBeenCalled();
  });
});
