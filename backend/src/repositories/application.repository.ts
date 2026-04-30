import prisma from "../config/prisma";
import type { ApplicationStatus } from "@prisma/client";

const candidateSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  skills: true,
  experience: true,
  city: true,
  role: true,
  site: true,
  cvUrl: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
  isActive: true,
} as const;

export class ApplicationRepository {
  static async findByCandidate(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        offer: {
          select: {
            title: true,
            site: true,
            contractType: true,
            department: true,
          },
        },
        interview: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  static async findByOffer(offerId: string) {
    return prisma.application.findMany({
      where: { offerId },
      include: {
        candidate: {
          select: candidateSafeSelect,
        },
        interview: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  static async findAllBySite(site: string) {
    return prisma.application.findMany({
      where: { offer: { site: site as any } },
      include: {
        candidate: {
          select: candidateSafeSelect,
        },
        candidateCV: {
          select: {
            id: true,
            cvText: true,
            name: true,
            source: true,
          },
        },
        offer: {
          select: {
            id: true,
            title: true,
            site: true,
            contractType: true,
            department: true,
            requiredSkills: true,
            experienceYears: true,
          },
        },
        interview: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: candidateSafeSelect,
        },
        offer: true,
        candidateCV: {
          select: {
            id: true,
            cvText: true,
            name: true,
            source: true,
          },
        },
        interview: true,
      },
    });
  }

  static async create(data: {
    candidateId: string;
    offerId: string;
    candidateCVId?: string;
    cvUrl?: string;
    cvText?: string;
    cvTextSnapshot?: string;
    formData?: any;
    cvTemplate?: string;
    coverNote?: string;
  }) {
    return prisma.application.create({
      data,
      include: {
        offer: { select: { title: true, site: true } },
      },
    });
  }

  static async updateStatus(
    id: string,
    status: ApplicationStatus,
    extra?: Record<string, any>,
  ) {
    return prisma.application.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  static async updateNotes(id: string, notes: string) {
    return prisma.application.update({
      where: { id },
      data: { hrNotes: notes },
    });
  }

  static async updateRating(id: string, rating: number) {
    return prisma.application.update({
      where: { id },
      data: { hrRating: rating },
    });
  }

  static async updateTags(id: string, tags: string[]) {
    return prisma.application.update({
      where: { id },
      data: { hrTags: tags },
    });
  }

  static async saveAIResult(
    id: string,
    result: { score: number; analysis: any },
  ) {
    return prisma.application.update({
      where: { id },
      data: {
        aiScore: result.score,
        aiAnalysis:
          typeof result.analysis === "string"
            ? result.analysis
            : JSON.stringify(result.analysis),
      },
    });
  }

  static async checkDuplicate(candidateId: string, offerId: string) {
    return prisma.application.findUnique({
      where: { candidateId_offerId: { candidateId, offerId } },
    });
  }

  static async countActiveByCandidate(candidateId: string) {
    return prisma.application.count({
      where: {
        candidateId,
        status: { in: ["new", "reviewing", "interview"] },
      },
    });
  }
}
