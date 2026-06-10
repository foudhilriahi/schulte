import prisma from '../config/prisma';

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

const applicationInclude = {
  candidate: { select: candidateSafeSelect },
  offer: true,
} as const;

export class InterviewRepository {
  static async findById(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: applicationInclude,
        },
      },
    });
  }

  static async findByApplication(applicationId: string) {
    return prisma.interview.findUnique({
      where: { applicationId },
      include: {
        application: {
          include: applicationInclude,
        },
      },
    });
  }

  static async findTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);

    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

    return prisma.interview.findMany({
      where: {
        outcome: null,       // Only interviews without outcome yet
        reminderSent: false, // Don't re-send if already reminded
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        application: {
          include: applicationInclude,
        },
      },
    });
  }

  static async markOutcome(id: string, outcome: 'pass' | 'fail' | 'no_show') {
    return prisma.interview.update({
      where: { id },
      data: {
        outcome: outcome as any,
        ...(outcome === 'no_show' ? { noShowCount: { increment: 1 } } : {}),
      },
      include: {
        application: {
          include: applicationInclude,
        },
      },
    });
  }
}
