import prisma from '../config/prisma';
import type { OfferStatus, Site, ContractType } from '@prisma/client';

export class OfferRepository {
  static async findAll(filters?: { site?: Site; status?: OfferStatus }) {
    return prisma.jobOffer.findMany({
      where: {
        ...(filters?.site && { site: filters.site }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.jobOffer.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });
  }

  static async create(data: {
    title: string;
    site: Site;
    contractType: ContractType;
    department: string;
    description: string;
    requiredSkills: string[];
    seats?: number;
    deadline: Date;
    createdById: string;
    templateId?: string;
    experienceYears?: number;
    salaryRange?: string;
    showSalary?: boolean;
  }) {
    return prisma.jobOffer.create({ 
      data: {
        ...data,
        seats: data.seats || 1,
        experienceYears: data.experienceYears || 0,
        showSalary: data.showSalary ?? true,
      }
    });
  }

  static async update(id: string, data: Record<string, any>) {
    return prisma.jobOffer.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.jobOffer.delete({ where: { id } });
  }
}
