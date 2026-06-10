import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { CandidateCVController } from '../controllers/candidate-cv.controller';
import { CandidateCVRepository } from '../repositories/candidate-cv.repository';
import * as uploadService from '../services/upload.service';
import { CVTextExtractor } from '../services/ai.service';

vi.mock('../repositories/candidate-cv.repository', () => ({
  CandidateCVRepository: {
    findByCandidate: vi.fn(),
    create: vi.fn(),
    setDefault: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../services/upload.service', () => ({
  extractTextFromPDF: vi.fn(),
}));

vi.mock('../services/ai.service', () => ({
  CVTextExtractor: {
    assembleFromFormData: vi.fn(),
  },
}));

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { userId: 'cand-1', role: 'CANDIDATE', site: null },
    query: {},
    params: {},
    body: {},
    file: undefined,
    ...overrides,
  } as any;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CandidateCVController', () => {
  describe('getMine', () => {
    it('returns candidate CVs', async () => {
      const req = mockReq();
      const res = mockRes();
      const mockCVs = [{ id: 'cv-1', name: 'Mon CV' }];
      vi.mocked(CandidateCVRepository.findByCandidate).mockResolvedValue(mockCVs as any);

      await CandidateCVController.getMine(req, res);

      expect(CandidateCVRepository.findByCandidate).toHaveBeenCalledWith('cand-1');
      expect(res.json).toHaveBeenCalledWith(mockCVs);
    });

    it('returns 500 on error', async () => {
      const req = mockReq();
      const res = mockRes();
      vi.mocked(CandidateCVRepository.findByCandidate).mockRejectedValue(new Error('DB error'));

      await CandidateCVController.getMine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('upload', () => {
    it('uploads a PDF CV and extracts text successfully', async () => {
      const req = mockReq({
        file: {
          path: '/uploads/test.pdf',
          originalname: 'mon-cv.pdf',
          filename: 'uuid-test.pdf',
          size: 12345,
          mimetype: 'application/pdf',
        } as any,
      });
      const res = mockRes();
      vi.mocked(uploadService.extractTextFromPDF).mockResolvedValue(
        'Extracted CV text with skills and experience. Ingénieur en génie mécanique avec 5 ans dans le câblage automobile. Compétences : CATIA, SAP, Kaizen.'
      );
      vi.mocked(CandidateCVRepository.create).mockResolvedValue({ id: 'cv-1', name: 'mon-cv' } as any);

      await CandidateCVController.upload(req, res);

      expect(uploadService.extractTextFromPDF).toHaveBeenCalledWith('/uploads/test.pdf');
      expect(CandidateCVRepository.create).toHaveBeenCalledWith({
        candidateId: 'cand-1',
        name: 'mon-cv',
        type: 'uploaded',
        source: 'profile_upload',
        cvUrl: '/uploads/uuid-test.pdf',
        cvText: expect.stringContaining('Extracted CV text'),
        size: 12345,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rejects upload without file', async () => {
      const req = mockReq({ file: undefined });
      const res = mockRes();

      await CandidateCVController.upload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('rejects PDF with insufficient extracted text', async () => {
      const req = mockReq({
        file: { path: '/uploads/test.pdf', originalname: 'cv.pdf', filename: 'f.pdf', size: 100 } as any,
      });
      const res = mockRes();
      vi.mocked(uploadService.extractTextFromPDF).mockResolvedValue('Short');

      await CandidateCVController.upload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('trop court'),
      });
    });
  });

  describe('createGenerated', () => {
    const validBody = {
      name: 'Mon CV Généré',
      formData: {
        personal: { name: 'Ahmed Test', email: 'ahmed@test.com', phone: '+21699123456', city: 'Tunis' },
        education: [{ degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' }],
        experience: [{
          title: 'Ingénieur', company: 'Schulte', startDate: '2020-01', endDate: '2024-12',
          description: 'Gestion qualité.',
        }],
        skills: ['CATIA', 'SAP'],
      },
      template: 'modern',
      isDefault: true,
    };

    it('creates a generated CV with validated form data', async () => {
      const req = mockReq({ body: validBody });
      const res = mockRes();
      vi.mocked(CVTextExtractor.assembleFromFormData).mockReturnValue('# Ahmed Test\n\n## Compétences\n- CATIA\n- SAP');
      vi.mocked(CandidateCVRepository.create).mockResolvedValue({ id: 'cv-gen-1' } as any);

      await CandidateCVController.createGenerated(req, res);

      expect(CVTextExtractor.assembleFromFormData).toHaveBeenCalled();
      expect(CandidateCVRepository.create).toHaveBeenCalledWith({
        candidateId: 'cand-1',
        name: 'Mon CV Généré',
        type: 'generated',
        source: 'profile_generated',
        formData: expect.objectContaining({
          personal: expect.objectContaining({ name: 'Ahmed Test' }),
        }),
        cvText: expect.any(String),
        cvTemplate: 'modern',
        isDefault: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rejects missing formData', async () => {
      const req = mockReq({ body: { name: 'CV' } });
      const res = mockRes();

      await CandidateCVController.createGenerated(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects invalid personal info (missing name)', async () => {
      const req = mockReq({
        body: {
          formData: {
            personal: { email: 'ahmed@test.com', phone: '+21699123456', city: 'Tunis' },
            education: [{ degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' }],
            skills: ['CATIA'],
          },
        },
      });
      const res = mockRes();

      await CandidateCVController.createGenerated(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('nom') });
    });

    it('rejects invalid city', async () => {
      const req = mockReq({
        body: {
          formData: {
            personal: { name: 'Ahmed Test', email: 'ahmed@test.com', phone: '+21699123456', city: 'Paris' },
            education: [{ degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' }],
            skills: ['CATIA'],
          },
        },
      });
      const res = mockRes();

      await CandidateCVController.createGenerated(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('ville') });
    });

    it('rejects empty skills', async () => {
      const req = mockReq({
        body: {
          formData: {
            personal: { name: 'Ahmed Test', email: 'ahmed@test.com', phone: '+21699123456', city: 'Tunis' },
            education: [{ degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' }],
            skills: [],
          },
        },
      });
      const res = mockRes();

      await CandidateCVController.createGenerated(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects too many skills (>40)', async () => {
      const req = mockReq({
        body: {
          formData: {
            personal: { name: 'Ahmed Test', email: 'ahmed@test.com', phone: '+21699123456', city: 'Tunis' },
            education: [{ degree: 'Ingénieur', field: 'Génie Mécanique', institution: 'ENIT', year: '2020' }],
            skills: Array.from({ length: 41 }, (_, i) => `Skill ${i}`),
          },
        },
      });
      const res = mockRes();

      await CandidateCVController.createGenerated(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('setDefault', () => {
    it('marks a CV as default', async () => {
      const req = mockReq({ params: { id: 'cv-1' } } as any);
      const res = mockRes();
      vi.mocked(CandidateCVRepository.setDefault).mockResolvedValue({ id: 'cv-1', isDefault: true } as any);

      await CandidateCVController.setDefault(req, res);

      expect(CandidateCVRepository.setDefault).toHaveBeenCalledWith('cand-1', 'cv-1');
      expect(res.json).toHaveBeenCalledWith({ id: 'cv-1', isDefault: true });
    });

    it('returns 404 if CV not found', async () => {
      const req = mockReq({ params: { id: 'cv-unknown' } } as any);
      const res = mockRes();
      vi.mocked(CandidateCVRepository.setDefault).mockResolvedValue(null);

      await CandidateCVController.setDefault(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('remove', () => {
    it('deletes a CV successfully', async () => {
      const req = mockReq({ params: { id: 'cv-1' } } as any);
      const res = mockRes();
      vi.mocked(CandidateCVRepository.delete).mockResolvedValue({ id: 'cv-1' } as any);

      await CandidateCVController.remove(req, res);

      expect(CandidateCVRepository.delete).toHaveBeenCalledWith('cand-1', 'cv-1');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('returns 404 if CV not found', async () => {
      const req = mockReq({ params: { id: 'cv-unknown' } } as any);
      const res = mockRes();
      vi.mocked(CandidateCVRepository.delete).mockResolvedValue(null);

      await CandidateCVController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 409 if CV linked to active application', async () => {
      const req = mockReq({ params: { id: 'cv-1' } } as any);
      const res = mockRes();
      vi.mocked(CandidateCVRepository.delete).mockRejectedValue(new Error('CV_LINKED_TO_ACTIVE_APPLICATION'));

      await CandidateCVController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
