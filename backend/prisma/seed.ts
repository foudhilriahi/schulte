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
      description: 'Planification et ordonnancement de la production industrielle en coordination avec les équipes méthodes, qualité et logistique. Vous assurerez l\'optimisation des flux de fabrication, le respect des délais clients et l\'équilibre charge/capacité. Vous participerez également à l\'amélioration continue des processus via des indicateurs de performance (TRS, OTD) et travaillerez en interface avec le siège allemand pour aligner les plannings sur les besoins du groupe.',
      suggestedSkills: ['Planification industrielle', 'ERP/SAP PP', 'ordonnancement avancé', 'gestion de production', 'méthodes SMED/5S', 'analyse de données', 'anglais technique'],
    },
    {
      id: 'acheteur-strategique',
      titleFr: 'Acheteur Stratégique',
      titleEn: 'Strategic Purchaser',
      contractType: 'CDI' as const,
      department: 'Achats',
      description: 'Pilotage de la stratégie d\'achats pour des familles de composants critiques (mécanique, électronique, sous-ensembles). Vous mènerez des analyses de marché, des appels d\'offres internationaux et des négociations contractuelles avec un focus sur la réduction des coûts totaux (TCO), la sécurisation des approvisionnements et le développement de partenariats long terme. Vous collaborerez étroitement avec les équipes techniques, qualité et le siège pour garantir la conformité aux standards du groupe.',
      suggestedSkills: ['Achats stratégiques', 'négociation internationale', 'analyse TCO/should-cost', 'SAP MM', 'gestion de projet achats', 'anglais courant', 'connaissance secteur automobile'],
    },
    {
      id: 'chef-equipe-achats',
      titleFr: 'Chef d\'Équipe Achats',
      titleEn: 'Team Leader Purchasing',
      contractType: 'CDI' as const,
      department: 'Achats',
      description: 'Management opérationnel d\'une équipe d\'acheteurs et coordination des activités d\'approvisionnement au quotidien. Vous garantirez le respect des procédures achats, le suivi des performances (KPIs : délais, économies, qualité fournisseurs) et le développement des compétences de votre équipe. Vous serez également l\'interface privilégiée avec les départements Production, Qualité et Logistique pour anticiper les besoins et résoudre les écarts d\'approvisionnement.',
      suggestedSkills: ['Management d\'équipe', 'pilotage de KPIs', 'processus achats industriels', 'SAP', 'communication transverse', 'résolution de problèmes', 'leadership opérationnel'],
    },
    {
      id: 'mecanicien-industriel',
      titleFr: 'Mécanicien Industriel Production',
      titleEn: 'Industrial Mechanic Production',
      contractType: 'CDI' as const,
      department: 'Maintenance',
      description: 'Maintenance préventive et curative des équipements mécaniques de production (presses, convoyeurs, systèmes de transfert). Vous interviendrez sur les pannes, réaliserez des diagnostics techniques, des réparations et des améliorations pour maximiser la disponibilité des lignes. Vous participerez également aux projets d\'installation de nouveaux équipements et à la rédaction de gammes de maintenance en lien avec le bureau d\'études et le support technique allemand.',
      suggestedSkills: ['Maintenance mécanique industrielle', 'pneumatique/hydraulique', 'lecture de plans techniques', 'soudure TIG/MIG', 'diagnostic de pannes', 'sécurité machines', 'autonomie terrain'],
    },
    {
      id: 'operateur-machines',
      titleFr: 'Opérateur de Machines',
      titleEn: 'Machine and Plant Operator',
      contractType: 'CDI' as const,
      department: 'Production',
      description: 'Conduite, surveillance et réglage de machines de production automatisées pour la fabrication de composants automobiles (sertissage, assemblage, contrôle). Vous assurerez le respect des cadences, des consignes qualité et des règles de sécurité. Vous participerez aux activités de démarrage/arrêt de ligne, au premier niveau de maintenance et à l\'amélioration continue (remontée d\'anomalies, propositions d\'optimisation). Formation interne assurée sur les équipements spécifiques.',
      suggestedSkills: ['Conduite de machines industrielles', 'contrôle qualité visuel/dimensionnel', 'respect des procédures', 'travail en équipe postée', 'rigueur et réactivité', 'sens de la sécurité', 'apprentissage technique'],
    },
    {
      id: 'technicien-electronique',
      titleFr: 'Technicien Électronique',
      titleEn: 'Electronics Technician',
      contractType: 'CDI' as const,
      department: 'Maintenance',
      description: 'Maintenance, dépannage et optimisation des systèmes électroniques et automatisés de production (automates, capteurs, variateurs, interfaces homme-machine). Vous réaliserez des diagnostics électriques, des réparations de cartes, des mises à jour de firmware et participerez aux projets d\'évolution des lignes. Vous travaillerez en étroite collaboration avec les équipes Production, Méthodes et le support technique du groupe pour garantir la performance et la fiabilité des installations.',
      suggestedSkills: ['Électronique industrielle', 'diagnostic de pannes complexes', 'soudure composants CMS', 'lecture de schémas électriques', 'automates (Siemens/Allen-Bradley)', 'normes de sécurité électrique', 'anglais technique'],
    },
    {
      id: 'responsable-rh',
      titleFr: 'Responsable Ressources Humaines',
      titleEn: 'HR Officer',
      contractType: 'CDI' as const,
      department: 'RH',
      description: 'Gestion globale des ressources humaines du site : recrutement, intégration, administration du personnel, formation et développement des compétences. Vous piloterez la politique sociale en lien avec la direction et le siège, garantirez la conformité au droit du travail tunisien et aux standards du groupe, et accompagnerez les managers dans la gestion de leurs équipes. Vous serez également force de proposition sur les sujets QVT, marque employeur et transformation RH.',
      suggestedSkills: ['Recrutement industriel', 'droit du travail tunisien', 'SIRH (paie, temps, compétences)', 'gestion de la formation', 'communication interne', 'conduite du changement', 'discrétion et éthique professionnelle'],
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
