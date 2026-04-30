import prisma from "../config/prisma";

interface CreateCandidateCVInput {
  candidateId: string;
  name: string;
  type: "uploaded" | "generated";
  source: "profile_upload" | "application_upload" | "application_generated" | "profile_generated";
  cvUrl?: string;
  formData?: any;
  cvText: string;
  cvTemplate?: string;
  size?: number;
  isDefault?: boolean;
}

export class CandidateCVRepository {
  static async findByIdForCandidate(candidateId: string, cvId: string) {
    return prisma.candidateCV.findFirst({
      where: { id: cvId, candidateId },
    });
  }

  static async findByCandidate(candidateId: string) {
    return prisma.candidateCV.findMany({
      where: { candidateId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  static async create(input: CreateCandidateCVInput) {
    const shouldBeDefault = await prisma.$transaction(async (tx) => {
      const hasAny = await tx.candidateCV.count({ where: { candidateId: input.candidateId } });
      const nextIsDefault = input.isDefault ?? hasAny === 0;

      if (nextIsDefault) {
        await tx.candidateCV.updateMany({
          where: { candidateId: input.candidateId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return nextIsDefault;
    });

    return prisma.candidateCV.create({
      data: {
        candidateId: input.candidateId,
        name: input.name,
        type: input.type,
        source: input.source,
        cvUrl: input.cvUrl,
        formData: input.formData,
        cvText: input.cvText,
        cvTemplate: input.cvTemplate,
        size: input.size,
        isDefault: shouldBeDefault,
      },
    });
  }

  static async setDefault(candidateId: string, cvId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.candidateCV.findFirst({
        where: { id: cvId, candidateId },
      });
      if (!existing) return null;

      await tx.candidateCV.updateMany({
        where: { candidateId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.candidateCV.update({
        where: { id: cvId },
        data: { isDefault: true },
      });
    });
  }

  static async delete(candidateId: string, cvId: string) {
    const deleted = await prisma.candidateCV.findFirst({
      where: { id: cvId, candidateId },
    });

    if (!deleted) return null;

    const activeLinkedApplications = await prisma.application.count({
      where: {
        candidateId,
        candidateCVId: cvId,
        status: { in: ["new", "reviewing", "interview"] },
      },
    });

    if (activeLinkedApplications > 0) {
      throw new Error("CV_LINKED_TO_ACTIVE_APPLICATION");
    }

    await prisma.candidateCV.delete({ where: { id: cvId } });

    if (deleted.isDefault) {
      const replacement = await prisma.candidateCV.findFirst({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
      });

      if (replacement) {
        await prisma.candidateCV.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }

    return deleted;
  }
}
