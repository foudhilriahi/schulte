import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create ADMIN user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@schulte-tunisia.com' },
    update: {},
    create: {
      email: 'admin@schulte-tunisia.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Super Admin',
      phone: '+216 70 000 000',
      isActive: true,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 2. Create 7 offer templates (German-aligned positions)
  const templates = [
    {
      id: 'planificateur-production',
      titleFr: 'Planificateur de Production',
      titleEn: 'Production Planner',
      contractType: 'CDI' as const,
      department: 'Production',
      description: 'Planification et ordonnancement de la production pour optimiser les flux et respecter les delais clients.',
      suggestedSkills: ['Planification', 'ERP/SAP', 'ordonnancement', 'gestion de production'],
    },
    {
      id: 'acheteur-strategique',
      titleFr: 'Acheteur Strategique',
      titleEn: 'Strategic Purchaser',
      contractType: 'CDI' as const,
      department: 'Achats',
      description: 'Gestion strategique des achats et negociation avec les fournisseurs pour optimiser les couts.',
      suggestedSkills: ['Achats strategiques', 'negociation', 'analyse fournisseurs', 'SAP MM'],
    },
    {
      id: 'chef-equipe-achats',
      titleFr: 'Chef d\'Equipe Achats',
      titleEn: 'Team Leader Purchasing',
      contractType: 'CDI' as const,
      department: 'Achats',
      description: 'Management d\'equipe achats et coordination des activites d\'approvisionnement.',
      suggestedSkills: ['Management d\'equipe', 'achats', 'reporting', 'leadership'],
    },
    {
      id: 'mecanicien-industriel',
      titleFr: 'Mecanicien Industriel Production',
      titleEn: 'Industrial Mechanic Production',
      contractType: 'CDI' as const,
      department: 'Maintenance',
      description: 'Maintenance mecanique des equipements de production et intervention sur pannes.',
      suggestedSkills: ['Maintenance mecanique', 'pneumatique', 'hydraulique', 'lecture de plans'],
    },
    {
      id: 'operateur-machines',
      titleFr: 'Operateur de Machines',
      titleEn: 'Machine and Plant Operator',
      contractType: 'CDI' as const,
      department: 'Production',
      description: 'Conduite et surveillance des machines de production pour la fabrication de composants automobiles.',
      suggestedSkills: ['Conduite de machines', 'sertissage', 'cablage', 'controle qualite'],
    },
    {
      id: 'technicien-electronique',
      titleFr: 'Technicien Electronique',
      titleEn: 'Electronics Technician',
      contractType: 'CDI' as const,
      department: 'Maintenance',
      description: 'Maintenance et reparation des systemes electroniques et automatises de production.',
      suggestedSkills: ['Electronique', 'diagnostic', 'soudure', 'lecture de schemas electriques'],
    },
    {
      id: 'responsable-rh',
      titleFr: 'Responsable Ressources Humaines',
      titleEn: 'HR Officer',
      contractType: 'CDI' as const,
      department: 'RH',
      description: 'Gestion des ressources humaines, recrutement et administration du personnel.',
      suggestedSkills: ['Recrutement', 'droit du travail tunisien', 'SIRH', 'paie'],
    },
  ];

  for (const tpl of templates) {
    await prisma.offerTemplate.upsert({
      where: { id: tpl.id },
      update: {},
      create: {
        ...tpl,
        createdById: admin.id,
        isActive: true,
      },
    });
  }
  console.log(`${templates.length} templates seeded`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
