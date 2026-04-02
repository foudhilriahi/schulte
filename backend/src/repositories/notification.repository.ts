import prisma from '../config/prisma';

export class NotificationRepository {
  static async create(data: {
    userId: string;
    type?: string;
    payload: any;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type ?? 'info',
        payload: data.payload,
      },
    });
  }

  static async findByUser(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  static async markOneRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  static async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  static async deleteOne(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
