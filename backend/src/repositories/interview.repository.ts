import prisma from '../config/prisma';

export class InterviewRepository {
  static async findById(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            offer: true,
          },
        },
      },
    });
  }

  static async findByApplication(applicationId: string) {
    return prisma.interview.findUnique({
      where: { applicationId },
      include: {
        application: {
          include: {
            candidate: true,
            offer: true,
          },
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
        outcome: null, // Only interviews without outcome yet
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        application: {
          include: {
            candidate: true,
            offer: true,
          },
        },
      },
    });
  }

  static async markOutcome(id: string, outcome: 'pass' | 'fail' | 'no_show') {
    return prisma.interview.update({
      where: { id },
      data: { outcome: outcome as any },
      include: {
        application: {
          include: {
            candidate: true,
            offer: true,
          },
        },
      },
    });
  }
}
