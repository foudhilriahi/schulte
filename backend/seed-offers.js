const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding job offers...');
  
  const offers = [
    {
      title: 'CNC Machine Operator',
      city: 'Bouarada',
      contractType: 'CDI',
      department: 'Production',
      openPositions: 3,
      description: 'We are looking for an experienced CNC Machine Operator to join our production team. You will be responsible for setting up and operating computer numerical control (CNC) machines to fabricate metallic and non-metallic parts.',
      requirements: ['3+ years experience with CNC machinery', 'Ability to read technical drawings', 'Knowledge of safety protocols', 'Attention to detail'],
      status: 'active',
      deadline: new Date('2026-12-31')
    },
    {
      title: 'Quality Assurance Specialist',
      city: 'Zaghouan',
      contractType: 'CDI',
      department: 'Quality',
      openPositions: 1,
      description: 'Join our quality assurance team to ensure all products meet our high standards before shipping to clients in the automotive industry.',
      requirements: ['Degree in Engineering or related field', 'Experience with ISO 9001', 'Strong analytical skills', 'Fluency in French and English'],
      status: 'active',
      deadline: new Date('2026-10-15')
    },
    {
      title: 'Maintenance Technician',
      city: 'Bouarada',
      contractType: 'CDD',
      department: 'Maintenance',
      openPositions: 2,
      description: 'Seeking a proactive maintenance technician to perform preventive and corrective maintenance on our production equipment.',
      requirements: ['Technical diploma in industrial maintenance', 'Knowledge of electrical and mechanical systems', 'Available for shift work'],
      status: 'active',
      deadline: new Date('2026-08-30')
    },
    {
      title: 'Production Intern',
      city: 'Zaghouan',
      contractType: 'Stage',
      department: 'Production',
      openPositions: 5,
      description: 'Excellent opportunity for engineering students to gain hands-on experience in a modern manufacturing environment.',
      requirements: ['Currently enrolled in an engineering program', 'Eagerness to learn', 'Good communication skills'],
      status: 'active',
      deadline: new Date('2026-06-01')
    }
  ];

  for (const offer of offers) {
    const createdOffer = await prisma.jobOffer.create({
      data: offer
    });
    console.log(`Created offer: ${createdOffer.title}`);
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
