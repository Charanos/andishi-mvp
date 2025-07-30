const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('🌱 Starting developer profiles seeding...');
    
    // Running in development environment with .env.local

    // Create proper dates based on current time (2025-07-30)
    const now = new Date('2025-07-30T14:31:20+03:00');
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const busyUntilDate = new Date('2025-08-15T00:00:00Z');

    // Developer users to create
    const developersToCreate = [
      {
        email: 'amina.diallo@techafrique.io',
        firstName: 'Amina',
        lastName: 'Diallo',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
        status: 'active',
        developerProfileStatus: 'approved',
      },
      {
        email: 'chi.okoye@naijatech.dev',
        firstName: 'Chiamaka',
        lastName: 'Okoye',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
        status: 'active',
        developerProfileStatus: 'approved',
      },
      {
        email: 'sipho.maseko@capetowndevs.co.za',
        firstName: 'Sipho',
        lastName: 'Maseko',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
        status: 'active',
        developerProfileStatus: 'approved',
      },
    ];

    console.log('Creating developer users...');
    const userMap = {};
    for (const userData of developersToCreate) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {
            status: userData.status,
            developerProfileStatus: userData.developerProfileStatus,
          },
          create: userData,
        });
        userMap[user.email] = user;
        console.log(`✅ Created/updated user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error creating/updating user ${userData.email}:`, error.message);
        throw error; // Re-throw to stop execution
      }
    }

    // Developer profiles data
    const developerProfilesToCreate = [
      {
        email: 'amina.diallo@techafrique.io',
        data: {
          id: 'dev_8f3a2b1c',
          personalInfo: {
            firstName: 'Amina',
            lastName: 'Diallo',
            email: 'amina.diallo@techafrique.io',
            location: 'Dakar, Senegal',
            portfolio: 'https://aminadiallo.dev',
            bio: 'Passionate full‑stack engineer with 5 years of experience bringing fintech and e‑commerce ideas to life across West Africa.',
          },
          professionalInfo: {
            title: 'Senior Full‑Stack Developer',
            experienceLevel: 'Senior',
            availability: '20 hrs/week',
            hourlyRate: 45,
            currency: 'USD',
          },
          technicalSkills: {
            primarySkills: [
              {
                name: 'JavaScript',
                level: 9,
                endorsements: 78,
                lastUsed: '2025-06-01',
              },
              {
                name: 'React/Next.js',
                level: 8,
                endorsements: 64,
                lastUsed: '2025-07-01',
              },
              {
                name: 'Node.js',
                level: 8,
                endorsements: 54,
                lastUsed: '2025-06-01',
              },
              {
                name: 'PostgreSQL',
                level: 7,
                endorsements: 32,
                lastUsed: '2025-05-01',
              },
            ],
          },
          stats: {
            totalProjects: 27,
            averageRating: 4.8,
            totalEarnings: 124000,
            clientRetention: 92,
          },
          featuredProjects: [
            {
              name: 'Verdant Fresh Farm‑to‑Table App',
              description: 'Mobile App, React Native & Stripe',
            },
            {
              name: 'Baobab Capital Responsive Redesign',
              description: 'Next.js & D3.js charting',
            },
          ],
          recentActivity: [
            {
              type: 'milestone',
              description: 'Completed Milestone "Checkout Flow" for Fabric & Thread platform',
              date: '2025-07-22',
            },
            {
              type: 'pr',
              description: 'Submitted PR adding SMS notifications in Rift Valley CRM',
              date: '2025-07-15',
            },
          ],
          achievements: [
            'Speaker at DakarJS 2025 on "Scaling Headless Commerce."',
            'Published open‑source React Native payments library.',
          ],
          notifications: [
            {
              type: 'message',
              content: '2 unread messages from potential client "GreenHarvest"',
              unread: true,
            },
            {
              type: 'system',
              content: 'profile completeness 85%',
              unread: true,
            },
          ],
          timeEntries: [
            {
              project: 'Baobab Capital redesign',
              hours: 10,
              week: 'last',
            },
            {
              project: 'Fabric & Thread GraphQL schema',
              hours: 8,
              week: 'last',
            },
            {
              project: 'Rift Valley CRM bugfixes',
              hours: 2,
              week: 'last',
            },
          ],
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
      },
      {
        email: 'chi.okoye@naijatech.dev',
        data: {
          id: 'dev_cd4e7f90',
          personalInfo: {
            firstName: 'Chiamaka',
            lastName: 'Okoye',
            email: 'chi.okoye@naijatech.dev',
            location: 'Lagos, Nigeria',
            portfolio: 'https://chiamaka.dev',
            bio: 'Creative frontend specialist who crafts beautiful, accessible interfaces for African fintech and edtech startups.',
          },
          professionalInfo: {
            title: 'Front‑End Engineer',
            experienceLevel: 'Mid-level',
            availability: '30 hrs/week',
            hourlyRate: 35,
            currency: 'USD',
          },
          technicalSkills: {
            primarySkills: [
              {
                name: 'TypeScript',
                level: 8,
                endorsements: 45,
                lastUsed: '2025-07-01',
              },
              {
                name: 'React',
                level: 9,
                endorsements: 82,
                lastUsed: '2025-07-01',
              },
              {
                name: 'Tailwind CSS',
                level: 7,
                endorsements: 38,
                lastUsed: '2025-06-01',
              },
              {
                name: 'D3.js',
                level: 6,
                endorsements: 20,
                lastUsed: '2025-05-01',
              },
            ],
          },
          stats: {
            totalProjects: 18,
            averageRating: 4.7,
            totalEarnings: 56000,
            clientRetention: 88,
          },
          featuredProjects: [
            {
              name: 'Fabric & Thread Next‑Gen E‑commerce',
              description: 'headless React storefront',
            },
            {
              name: 'Meridian Financial Terminal',
              description: 'Electron chart panels',
            },
          ],
          recentActivity: [
            {
              type: 'code',
              description: 'Pushed updated SVG animations for Baobab Capital charts',
              timestamp: new Date('2025-07-28T13:45:00Z'),
            },
            {
              type: 'review',
              description: 'Joined Rift Valley CRM design review',
              timestamp: new Date('2025-07-20T11:30:00Z'),
            },
          ],
          achievements: [
            'Awarded "Best Front‑end Contribution" at Naija DevCon 2024.',
            'Mentor in Women Who Code Lagos.',
          ],
          notifications: [
            {
              type: 'interview',
              content: '1 interview invite from "AgriConnect"',
              unread: true,
            },
            {
              type: 'feedback',
              content: '1 feedback request on recent PR',
              unread: true,
            },
          ],
          timeEntries: [
            {
              project: 'Fabric & Thread product page UX',
              hours: 12,
              week: 'last',
            },
            {
              project: 'Baobab Capital chart integration',
              hours: 6,
              week: 'last',
            },
            {
              project: 'Code review sessions',
              hours: 4,
              week: 'last',
            },
          ],
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
      },
      {
        email: 'sipho.maseko@capetowndevs.co.za',
        data: {
          id: 'dev_a1b2c3d4',
          personalInfo: {
            firstName: 'Sipho',
            lastName: 'Maseko',
            email: 'sipho.maseko@capetowndevs.co.za',
            location: 'Cape Town, South Africa',
            portfolio: 'https://siphomaseko.dev',
            bio: 'DevOps and cloud infrastructure expert with a passion for building scalable, secure systems for African SaaS companies.',
          },
          professionalInfo: {
            title: 'DevOps & Cloud Engineer',
            experienceLevel: 'Senior',
            availability: '15 hrs/week',
            hourlyRate: 55,
            currency: 'USD',
          },
          technicalSkills: {
            primarySkills: [
              {
                name: 'Docker & Kubernetes',
                level: 9,
                endorsements: 71,
                lastUsed: '2025-07-01',
              },
              {
                name: 'AWS',
                level: 8,
                endorsements: 60,
                lastUsed: '2025-06-01',
              },
              {
                name: 'Terraform',
                level: 7,
                endorsements: 40,
                lastUsed: '2025-05-01',
              },
              {
                name: 'CI/CD',
                level: 8,
                endorsements: 52,
                lastUsed: '2025-07-01',
              },
            ],
          },
          stats: {
            totalProjects: 32,
            averageRating: 4.9,
            totalEarnings: 210000,
            clientRetention: 95,
          },
          featuredProjects: [
            {
              name: 'Rift Valley Unified CRM Portal',
              description: 'Dockerized microservices',
            },
            {
              name: 'Meridian Financial Terminal Deployment',
              description: 'auto‑update pipelines',
            },
          ],
          recentActivity: [
            {
              type: 'deployment',
              description: 'Automated Rift Valley CRM staging deployment',
              timestamp: new Date('2025-07-27T10:30:00Z'),
            },
            {
              type: 'optimization',
              description: 'Optimized Docker images for Fabric & Thread CI/CD',
              timestamp: new Date('2025-07-18T14:15:00Z'),
            },
          ],
          achievements: [
            'Published Terraform modules for multi‑region setups.',
            'Speaker at AWS User Group Cape Town, 2025.',
          ],
          notifications: [
            {
              type: 'endorsement',
              content: '1 pending skill endorsement request (Kubernetes)',
              unread: true,
            },
            {
              type: 'system',
              content: 'verify new email',
              unread: true,
            },
          ],
          timeEntries: [
            {
              project: 'Rift Valley CRM container orchestration',
              hours: 8,
              week: 'last',
            },
            {
              project: 'Fabric & Thread CI/CD optimization',
              hours: 5,
              week: 'last',
            },
            {
              project: 'Meridian auto‑update testing',
              hours: 2,
              week: 'last',
            },
          ],
        },
        status: 'approved',
        isAvailable: false,
        busyUntilDate: busyUntilDate,
        createdAt: twoWeeksAgo,
        updatedAt: now,
      },
    ];

    // Create developer profiles
    console.log('Creating developer profiles...');
    for (const devProfileData of developerProfilesToCreate) {
      try {
        const user = userMap[devProfileData.email];
        
        if (user) {
          // Check if profile already exists
          const existingProfile = await prisma.developerProfile.findUnique({
            where: { userId: user.id },
          });

          if (existingProfile) {
            // Update existing profile
            await prisma.developerProfile.update({
              where: { userId: user.id },
              data: {
                data: devProfileData.data,
                status: devProfileData.status,
                isAvailable: devProfileData.isAvailable,
                busyUntilDate: devProfileData.busyUntilDate,
                updatedAt: devProfileData.updatedAt,
              },
            });
            console.log(`✅ Updated developer profile for ${devProfileData.email}`);
          } else {
            // Create new profile
            await prisma.developerProfile.create({
              data: {
                userId: user.id,
                data: devProfileData.data,
                status: devProfileData.status,
                isAvailable: devProfileData.isAvailable,
                busyUntilDate: devProfileData.busyUntilDate,
                createdAt: devProfileData.createdAt,
                updatedAt: devProfileData.updatedAt,
              },
            });
            console.log(`✅ Created developer profile for ${devProfileData.email}`);
          }
        } else {
          console.warn(`⚠️ User with email ${devProfileData.email} not found. Skipping developer profile creation.`);
        }
      } catch (error) {
        console.error(`❌ Error creating/updating developer profile for ${devProfileData.email}:`, error.message);
      }
    }

    console.log('🎉 Developer profiles seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('- Amina Diallo (Senior Full-Stack, Available, 20hrs/week, $45/hr)');
    console.log('- Chiamaka Okoye (Mid-level Frontend, Available, 30hrs/week, $35/hr)');
    console.log('- Sipho Maseko (Senior DevOps, Busy until 2025-08-15, 15hrs/week, $55/hr)');
    console.log('');
    console.log('✨ You can now view these developers in the admin dashboard!');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run };
