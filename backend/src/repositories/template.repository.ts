import prisma from '../config/prisma';

export class TemplateRepository {
  static async findAll() {
    return prisma.offerTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async findById(id: string) {
    return prisma.offerTemplate.findUnique({ where: { id } });
  }

  static async create(data: {
    titleFr: string;
    titleEn: string;
    contractType: 'CDI' | 'CDD' | 'Stage' | 'Alternance';
    department: string;
    description: string;
    suggestedSkills: string[];
    createdById: string;
  }) {
    return prisma.offerTemplate.create({ data });
  }

  static async update(id: string, data: Record<string, any>) {
    return prisma.offerTemplate.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.offerTemplate.delete({ where: { id } });
  }
}
