const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  try {
    // Clear existing data in correct order to avoid foreign key constraints
    await prisma.projectAssignment.deleteMany({});
    console.log('Cleared existing project assignments.');

    await prisma.developerProfile.deleteMany({});
    console.log('Cleared existing developer profiles.');

    await prisma.project.deleteMany({});
    console.log('Cleared existing projects.');

    await prisma.developer.deleteMany({});
    console.log('Cleared existing Developer collection (if any).');

    // Create proper dates
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Seed sample projects - Fixed to match schema exactly
    const projectsToCreate = [
      {
        projectDetails: {
          title: 'Kanza',
          description: 'Kanza is a web based application that connects investors with real estate developers.',
          category: 'Real Estate Platform',
          timeline: '3-4 weeks',
          priority: 'high',
          techStack: ['React/Next.js', 'Node.js/Express'],
          requirements: 'Full-stack development with modern React framework',
        },
        status: 'pending',
        priority: 'high',
        budget: 2000,
        timeline: '3-4 weeks',
        techStack: ['React/Next.js', 'Node.js/Express'],
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Database Design'],
        experienceLevel: 'Mid-level',
        maxTeamSize: 2,
        progress: 0,
        clientId: '686cc750a146f88ed818689a',
        estimatedCompletionDate: twoWeeksFromNow,
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Abdirisak",
          lastName: "Abdi",
          email: "abdirisak11@gmail.com",
          phone: "+254745404347",
          company: "Kanza Limited",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        // Schema has milestones as separate field - keep it empty for now
        milestones: [],
        // Pricing object matching the Pricing type
        pricing: {
          type: "hourly",
          currency: "USD",
          hourlyRate: 20,
          estimatedHours: 40,
          milestones: [] // Empty milestones array in pricing
        },
        files: [],
        payments: [],
        updates: [{
          id: now.toISOString(),
          title: "Project Created",
          description: "Project has been successfully created and is awaiting assignment.",
          type: "general",
          author: "System",
          createdAt: now
        }],
      },
      {
        projectDetails: {
          title: 'Casedok',
          description: 'Smart Patient Portal for national detection of all known personal health information with one-click patient HITECH right of access portal.',
          category: 'Healthcare Solution',
          timeline: '3-4 weeks',
          priority: 'medium',
          techStack: ['Web Development', 'Node.js/Express', 'React/Next.js'],
          requirements: '3rd party integrations eg payment, OCR and other APIs',
        },
        status: 'in-progress',
        priority: 'medium',
        budget: 4000,
        timeline: '3-4 weeks',
        techStack: ['Web Development', 'Node.js/Express', 'React/Next.js'],
        requiredSkills: ['JavaScript', 'React', 'API Integration', 'Healthcare Compliance'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 3,
        progress: 25,
        clientId: '686e4c19a146f88ed81868a0',
        estimatedCompletionDate: oneMonthFromNow,
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Eric",
          lastName: "Kibuchi",
          email: "ericgithaiga007@gmail.com",
          phone: "+254700272040",
          company: "HealthTech Solutions",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "fixed",
          currency: "USD",
          fixedBudget: 4000,
          milestones: []
        },
        files: [],
        payments: [],
        updates: [],
      },
      {
        projectDetails: {
          title: 'Whale AI',
          description: 'Whale AI project - Advanced AI solution for data processing and analytics with machine learning capabilities.',
          category: 'AI/ML Platform',
          timeline: '1-2 weeks',
          priority: 'medium',
          techStack: ['Python/Django', 'AI/Machine Learning'],
          requirements: 'AI model development and deployment',
        },
        status: 'in-progress',
        priority: 'medium',
        budget: 300,
        timeline: '1-2 weeks',
        techStack: ['Python/Django', 'AI/Machine Learning'],
        requiredSkills: ['Python', 'Machine Learning', 'Django', 'Data Science'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 1,
        progress: 50,
        clientId: '686e4c19a146f88ed81868a0',
        estimatedCompletionDate: twoWeeksFromNow,
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Eric",
          lastName: "Kibuchi",
          email: "ericgithaiga007@gmail.com",
          phone: "+254700272040",
          company: "AI Innovations",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "fixed",
          currency: "USD",
          fixedBudget: 300,
          milestones: []
        },
        files: [],
        payments: [],
        updates: [],
      },
      {
        projectDetails: {
          title: 'Business Management System',
          description: 'Comprehensive business management system with mobile integration and payment processing.',
          category: 'Business Management System',
          timeline: '3-4 weeks',
          priority: 'low',
          techStack: ['Mobile Apps (iOS/Android)', 'Payment Gateway Integration'],
          requirements: 'Mobile app development with payment gateway integration',
        },
        status: 'pending',
        priority: 'low',
        budget: 50000,
        timeline: '3-4 weeks',
        techStack: ['Mobile Apps (iOS/Android)', 'Payment Gateway Integration'],
        requiredSkills: ['Mobile Development', 'Payment Integration', 'iOS', 'Android'],
        experienceLevel: 'Mid-level',
        maxTeamSize: 2,
        progress: 0,
        clientId: '68792570cbd5ca01266a4e2c',
        estimatedCompletionDate: null,
        actualCompletionDate: null,
        currency: 'KES',
        userInfo: {
          firstName: "Business",
          lastName: "Owner",
          email: "business@test.com",
          phone: "78787878",
          company: "Business Corp",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "fixed",
          currency: "KES",
          fixedBudget: 50000,
          milestones: []
        },
        files: [{
          id: "68793864457ea739f5a0d321",
          fileName: "Business_Requirements.pdf",
          fileUrl: "/uploads/business-requirements.pdf",
          fileSize: 317122,
          fileType: "application/pdf",
          createdAt: oneWeekAgo,
          updatedAt: now
        }],
        payments: [],
        updates: [],
      },
    ];

    // Create projects - ONLY ONCE
    console.log('Creating projects...');
    for (const projectData of projectsToCreate) {
      try {
        const project = await prisma.project.create({ data: projectData });
        console.log(`✅ Created project: ${project.projectDetails.title}`);
      } catch (error) {
        console.error(`❌ Error creating project ${projectData.projectDetails.title}:`, error.message);
      }
    }

    console.log('Projects seeded ✅');

    // Seed sample developer profiles
    const developerProfilesToCreate = [
      {
        email: 'jojocarter@gmail.com',
        data: {
          personalInfo: {
            firstName: 'Jordan',
            lastName: 'Carter',
            email: 'jojocarter@gmail.com',
            phone: '+1 (512) 555-0147',
            location: 'Austin, Texas, USA',
            timeZone: 'UTC-6',
            linkedin: 'linkedin.com/in/jordancarter-ai',
            github: 'github.com/jordancarter-ai',
            portfolio: 'www.jordancarter.dev'
          },
          professionalInfo: {
            title: 'Senior AI Engineer',
            experienceLevel: 'Senior Level (6-10 years)',
            yearsOfExperience: '8',
            currentRole: 'Lead AI Engineer',
            currentCompany: 'NeuroSpark HealthTech',
            availability: '2weeks',
            workType: ['Full-time Remote'],
            languages: ['English', 'Spanish'],
            bio: "I'm a Senior AI Engineer with 8+ years of experience building and deploying real-world machine learning systems that scale. My focus lies in NLP, computer vision, and custom LLM development — helping companies turn raw data into smart, usable products."
          },
          technicalSkills: {
            primarySkills: ['Python', 'C++', 'TypeScript'],
            secondarySkills: ['Java', 'Go'],
            frameworks: ['TensorFlow', 'PyTorch', 'FastAPI', 'React'],
            databases: ['PostgreSQL', 'MongoDB', 'Redis'],
            tools: ['Docker', 'Kubernetes', 'AWS', 'Git'],
            certifications: ['TensorFlow Developer Certificate', 'AWS Certified Machine Learning']
          },
          workExperience: [{
            id: '1751444122613',
            company: 'NeuroSpark HealthTech',
            position: 'Lead AI Engineer',
            duration: 'May 2021 – Present',
            description: 'Architected and led the development of a deep learning pipeline for medical image analysis. Integrated LLM features for patient intake processing (HIPAA-compliant). Scaled ML services to support 200K+ users/month.',
            technologies: ['Python', 'TensorFlow', 'AWS']
          }],
          projects: [{
            id: '1751444266924',
            name: 'ConversoAI – GPT-Driven HR Assistant',
            description: 'Automates 60% of HR helpdesk queries using GPT-3.',
            technologies: ['Python', 'OpenAI API', 'FastAPI'],
            role: 'Lead Developer',
            liveUrl: 'https://conversoai-demo.andishi.dev',
            githubUrl: 'https://github.com/jordancarter-ai/conversoai'
          }],
          stats: {
            totalProjects: 0,
            averageRating: 0,
            totalEarnings: 0,
            clientRetention: 0
          }
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: oneWeekAgo,
        updatedAt: now,
      },
      {
        email: 'gideonkngetich86@gmail.com',
        data: {
          personalInfo: {
            firstName: 'Gideon',
            lastName: 'Ngetich',
            email: 'gideonkngetich86@gmail.com',
            phone: '+254742252910',
            location: 'Nairobi, Kenya',
            timeZone: 'EAT',
            linkedin: 'https://www.linkedin.com/in/gideon-ngetich-6b7a96253/',
            github: 'https://github.com/Ngetich-86',
            portfolio: 'https://www.gideonngetich.me/'
          },
          professionalInfo: {
            title: 'Full-stack Developer',
            experienceLevel: 'Mid Level (3-5 years)',
            yearsOfExperience: '3',
            currentRole: 'Full-stack Developer',
            currentCompany: 'Freelance',
            availability: 'immediately',
            workType: ['Full-time Remote'],
            languages: ['English', 'Swahili'],
            bio: "I'm Gideon Ngetich, a full-stack developer and cloud enthusiast with a passion for building efficient, scalable solutions. I work with a wide range of technologies, including Spring Boot, Angular, React, Next.js, Node.js, and .NET."
          },
          technicalSkills: {
            primarySkills: ['JavaScript', 'TypeScript', 'Java', 'C#'],
            secondarySkills: ['Python', 'Go'],
            frameworks: ['React', 'Angular', 'Next.js', 'Spring Boot', 'ASP.NET'],
            databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase'],
            tools: ['Docker', 'AWS', 'Azure', 'Git', 'Kubernetes'],
            certifications: ['AWS Cloud Practitioner', 'Microsoft Azure Fundamentals']
          },
          workExperience: [{
            id: '1751448195881',
            company: 'Freelance',
            position: 'Full-stack Developer',
            duration: '2022 – Present',
            description: 'Developed and deployed full-stack applications for various clients using modern web technologies.',
            technologies: ['React', 'Node.js', 'PostgreSQL']
          }],
          projects: [{
            id: '1751448210390',
            name: 'Automated Seat Reservation System',
            description: 'Built a web-based seat reservation system for public service vehicles, enabling users to view, select, and book seats in real time.',
            technologies: ['React.js', 'Node.js', 'PostgreSQL', 'Hono.js'],
            role: 'Full-stack Developer',
            githubUrl: 'https://github.com/Ngetich-86/Auto-seat-psv-Client',
            liveUrl: 'https://www.loom.com/share/4bd7baef319640b4a4e07a385d232b2b'
          }],
          stats: {
            totalProjects: 0,
            averageRating: 0,
            totalEarnings: 0,
            clientRetention: 0
          }
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: oneWeekAgo,
        updatedAt: now,
      },
    ];

    // Create developer profiles
    console.log('Creating developer profiles...');
    for (const devProfileData of developerProfilesToCreate) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: devProfileData.email },
        });

        if (user) {
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
        } else {
          console.warn(`⚠️ User with email ${devProfileData.email} not found. Skipping developer profile creation.`);
        }
      } catch (error) {
        console.error(`❌ Error creating developer profile for ${devProfileData.email}:`, error.message);
      }
    }

    console.log('Developer Profiles seeded ✅');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

run().catch(console.error);