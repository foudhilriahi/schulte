import prisma from '../config/prisma';
import type { Role, Site } from '@prisma/client';

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  static async create(data: {
    email: string;
    passwordHash: string;
    role: Role;
    name: string;
    phone?: string;
    site?: Site;
    city?: string;
  }) {
    return prisma.user.create({ data });
  }

  static async update(id: string, data: Record<string, any>) {
    return prisma.user.update({ where: { id }, data });
  }

  static async findAllByRole(role: Role, includeInactive = true) {
    return prisma.user.findMany({
      where: includeInactive
        ? { role }
        : {
            role,
            isActive: true,
            deletedAt: null,
          },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        site: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Refresh token management
  static async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  static async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  static async deleteRefreshToken(tokenHash: string) {
    return prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  static async deleteAllRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  // Password reset token management
  static async findByResetToken(resetToken: string) {
    return prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });
  }

  static async findByVerifyToken(userId: string, verifyToken: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        verifyToken,
        verifyTokenExpiry: { gt: new Date() },
      },
    });
  }

  static async findActiveAdminIds() {
    const rows = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  static async findActiveHRIds(site?: Site, excludeUserId?: string) {
    const rows = await prisma.user.findMany({
      where: {
        role: 'HR',
        isActive: true,
        deletedAt: null,
        ...(site ? { site } : {}),
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
