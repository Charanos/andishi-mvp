const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

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

    // Seed users (clients and developers)
    const usersToCreate = [
      // Client users
      {
        email: 'priya.mehta@verdantfresh.com',
        firstName: 'Priya',
        lastName: 'Mehta',
        role: 'client',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'jordan.okafor@fabricthread.com',
        firstName: 'Jordan',
        lastName: 'Okafor',
        role: 'client',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'catherine.wanjiku@baobabcapital.co.ke',
        firstName: 'Catherine',
        lastName: 'Wanjiku',
        role: 'client',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'samuel.rotich@riftvalleylogistics.com',
        firstName: 'Samuel',
        lastName: 'Rotich',
        role: 'client',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'viktor.petrov@meridianfs.com',
        firstName: 'Viktor',
        lastName: 'Petrov',
        role: 'client',
        password: await bcrypt.hash('password123', 10),
      },
      // Developer users
      {
        email: 'amina.diallo@techafrique.io',
        firstName: 'Amina',
        lastName: 'Diallo',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'chi.okoye@naijatech.dev',
        firstName: 'Chiamaka',
        lastName: 'Okoye',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'sipho.maseko@capetowndevs.co.za',
        firstName: 'Sipho',
        lastName: 'Maseko',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
      },
    ];

    console.log('Creating users...');
    const userMap = {};
    for (const userData of usersToCreate) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: userData.id, // may be undefined – Prisma will auto-generate
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          password: userData.password,
          status: 'active',
          developerProfileStatus: userData.role === 'developer' ? 'approved' : 'pending',
        },
      });
      userMap[user.email] = user;
    }

    // Create proper dates
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const eightWeeksFromNow = new Date(now.getTime() + 56 * 24 * 60 * 60 * 1000);
    const sevenWeeksFromNow = new Date(now.getTime() + 49 * 24 * 60 * 60 * 1000);

    // Seed sample projects with detailed specifications
    const projectsToCreate = [
      {
        projectDetails: {
          title: 'Verdant Fresh Farm-to-Table App',
          description: 'Build a mobile marketplace connecting local farmers with urban consumers in real time, featuring in-app ordering, payment, and delivery tracking.',
          category: 'Mobile App Development',
          timeline: '8 weeks',
          priority: 'high',
          techStack: ['React Native', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe API'],
          requirements: 'User authentication, geolocation-based vendor discovery, push notifications',
        },
        status: 'pending',
        priority: 'high',
        budget: 28000,
        timeline: '8 weeks',
        techStack: ['React Native', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe API'],
        requiredSkills: ['React Native', 'TypeScript', 'Node.js', 'MongoDB', 'Payment Integration'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 2,
        progress: 0,
        estimatedCompletionDate: eightWeeksFromNow,
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Priya",
          lastName: "Mehta",
          email: "priya.mehta@verdantfresh.com",
          phone: "+1-555-0123",
          company: "Verdant Fresh",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "fixed",
          currency: "USD",
          fixedBudget: 28000,
          milestones: []
        },
        files: [],
        payments: [],
        updates: [{
          id: now.toISOString(),
          title: "Project Created",
          description: "Farm-to-table mobile marketplace project has been created and is ready for development team assignment.",
          type: "general",
          author: "System",
          createdAt: now
        }],
      },
      {
        projectDetails: {
          title: 'Fabric & Thread Next-Gen E-commerce Platform',
          description: 'Replace legacy Magento with a headless React storefront and Node.js back end, adding one-click upsells and real-time inventory sync.',
          category: 'E-commerce Overhaul',
          timeline: '6 weeks',
          priority: 'critical',
          techStack: ['Next.js', 'GraphQL', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
          requirements: 'Headless CMS integration, abandoned-cart recovery workflow, A/B testing setup',
        },
        status: 'in-progress',
        priority: 'critical',
        budget: 35000,
        timeline: '6 weeks',
        techStack: ['Next.js', 'GraphQL', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
        requiredSkills: ['Next.js', 'GraphQL', 'Node.js', 'PostgreSQL', 'E-commerce'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 3,
        progress: 35,
        estimatedCompletionDate: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000),
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Jordan",
          lastName: "Okafor",
          email: "jordan.okafor@fabricthread.com",
          phone: "+1-555-0456",
          company: "Fabric & Thread",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [
          {
            id: "milestone_1",
            title: "Design & architecture review",
            description: "Complete system architecture and design review",
            percentage: 15,
            amount: 5250,
            status: "completed",
            dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            completedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            id: "milestone_2",
            title: "API & GraphQL schema",
            description: "Develop GraphQL schema and API endpoints",
            percentage: 25,
            amount: 8750,
            status: "in-progress",
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            completedDate: null
          }
        ],
        pricing: {
          type: "milestone",
          currency: "USD",
          milestones: [
            { title: "Design & architecture review", percentage: 15, amount: 5250 },
            { title: "API & GraphQL schema", percentage: 25, amount: 8750 },
            { title: "Front-end implementation", percentage: 30, amount: 10500 },
            { title: "Checkout & upsells", percentage: 20, amount: 7000 },
            { title: "Performance tuning & launch", percentage: 10, amount: 3500 }
          ]
        },
        files: [],
        payments: [],
        updates: [
          {
            id: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            title: "Milestone Completed",
            description: "Design & architecture review milestone has been successfully completed.",
            type: "milestone",
            author: "Amina Diallo",
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        ],
      },
      {
        projectDetails: {
          title: 'Baobab Capital Responsive Website Redesign',
          description: 'Craft a high-performance, fully responsive corporate site with streamlined lead capture and rich data visualizations.',
          category: 'Corporate Website Redesign',
          timeline: '4 weeks',
          priority: 'medium',
          techStack: ['Next.js', 'Tailwind CSS', 'D3.js', 'Netlify'],
          requirements: 'Custom analytics dashboard, dynamic form workflows, SVG chart animations',
        },
        status: 'in-progress',
        priority: 'medium',
        budget: 1800000,
        timeline: '4 weeks',
        techStack: ['Next.js', 'Tailwind CSS', 'D3.js', 'Netlify'],
        requiredSkills: ['Next.js', 'Tailwind CSS', 'D3.js', 'Data Visualization'],
        experienceLevel: 'Mid-level',
        maxTeamSize: 2,
        progress: 60,
        estimatedCompletionDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        actualCompletionDate: null,
        currency: 'KES',
        userInfo: {
          firstName: "Catherine",
          lastName: "Wanjiku",
          email: "catherine.wanjiku@baobabcapital.co.ke",
          phone: "+254-700-123456",
          company: "Baobab Capital",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "fixed",
          currency: "KES",
          fixedBudget: 1800000,
          milestones: []
        },
        files: [],
        payments: [],
        updates: [
          {
            id: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
            title: "Progress Update",
            description: "Chart animations and responsive design implementation in progress.",
            type: "progress",
            author: "Chiamaka Okoye",
            createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
          }
        ],
      },
      {
        projectDetails: {
          title: 'Rift Valley Unified CRM Portal',
          description: 'Develop a centralized CRM dashboard that consolidates orders, client communications, and delivery tracking into a single pane of glass.',
          category: 'Custom CRM Solution',
          timeline: '5 weeks',
          priority: 'high',
          techStack: ['React', 'Redux', 'Node.js', 'MySQL', 'RabbitMQ', 'Docker'],
          requirements: 'Role-based access, email/SMS integrations, real-time order updates',
        },
        status: 'in-progress',
        priority: 'high',
        budget: 13000,
        timeline: '5 weeks',
        techStack: ['React', 'Redux', 'Node.js', 'MySQL', 'RabbitMQ', 'Docker'],
        requiredSkills: ['React', 'Redux', 'Node.js', 'MySQL', 'Docker', 'DevOps'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 2,
        progress: 40,
        estimatedCompletionDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Samuel",
          lastName: "Rotich",
          email: "samuel.rotich@riftvalleylogistics.com",
          phone: "+254-722-987654",
          company: "Rift Valley Logistics",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [],
        pricing: {
          type: "hourly",
          currency: "USD",
          hourlyRate: 65,
          estimatedHours: 200,
          milestones: []
        },
        files: [],
        payments: [],
        updates: [
          {
            id: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            title: "Container Orchestration Progress",
            description: "Docker containerization and orchestration setup completed.",
            type: "technical",
            author: "Sipho Maseko",
            createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
          }
        ],
      },
      {
        projectDetails: {
          title: 'Meridian Financial Cross-Platform Terminal',
          description: 'Build a desktop trading terminal for Windows/macOS with real-time data feeds, charting, and order execution modules.',
          category: 'Desktop Application Build',
          timeline: '7 weeks',
          priority: 'critical',
          techStack: ['Electron', 'React', 'TypeScript', 'WebSockets', 'SQLite'],
          requirements: 'Market data API integration, offline caching, auto-update mechanism',
        },
        status: 'pending',
        priority: 'critical',
        budget: 42000,
        timeline: '7 weeks',
        techStack: ['Electron', 'React', 'TypeScript', 'WebSockets', 'SQLite'],
        requiredSkills: ['Electron', 'React', 'TypeScript', 'WebSockets', 'Desktop Development'],
        experienceLevel: 'Senior-level',
        maxTeamSize: 2,
        progress: 0,
        estimatedCompletionDate: sevenWeeksFromNow,
        actualCompletionDate: null,
        currency: 'USD',
        userInfo: {
          firstName: "Viktor",
          lastName: "Petrov",
          email: "viktor.petrov@meridianfs.com",
          phone: "+1-555-0789",
          company: "Meridian Financial Services",
          role: "client"
        },
        createdAt: oneWeekAgo,
        updatedAt: now,
        milestones: [
          {
            id: "milestone_1",
            title: "Core framework & boilerplate",
            description: "Setup Electron framework and basic application structure",
            percentage: 20,
            amount: 8400,
            status: "pending",
            dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            completedDate: null
          },
          {
            id: "milestone_2",
            title: "Data feed & charting",
            description: "Implement real-time data feeds and charting components",
            percentage: 30,
            amount: 12600,
            status: "pending",
            dueDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
            completedDate: null
          }
        ],
        pricing: {
          type: "milestone",
          currency: "USD",
          milestones: [
            { title: "Core framework & boilerplate", percentage: 20, amount: 8400 },
            { title: "Data feed & charting", percentage: 30, amount: 12600 },
            { title: "Order execution module", percentage: 25, amount: 10500 },
            { title: "Packaging & auto-updates", percentage: 15, amount: 6300 },
            { title: "Final QA & delivery", percentage: 10, amount: 4200 }
          ]
        },
        files: [],
        payments: [],
        updates: [{
          id: now.toISOString(),
          title: "Project Created",
          description: "Trading terminal project created and awaiting development team assignment.",
          type: "general",
          author: "System",
          createdAt: now
        }],
      },
    ];

    // Create projects
    console.log('Creating projects...');
    const projectPromises = projectsToCreate.map(async (project) => {
      const clientUser = userMap[project.userInfo.email];
      if (!clientUser) {
        console.warn(`Client user with email ${project.userInfo.email} not found for project '${project.projectDetails.title}'. Skipping project.`);
        return null;
      }

      const projectData = {
        ...project,
        clientId: clientUser.id,
      };

      const existingForClient = await prisma.project.findMany({
        where: { clientId: clientUser.id },
      });
      const existing = existingForClient.find((p) => p.projectDetails?.title === project.projectDetails.title);

      if (existing) {
        return prisma.project.update({
          where: { id: existing.id },
          data: projectData,
        });
      }

      return prisma.project.create({ data: projectData });
    }).filter(Boolean);

    await Promise.all(projectPromises);
    console.log('Projects seeded ✅');

    // Seed sample developer profiles with comprehensive data
    const developerProfilesToCreate = [
      {
        email: 'amina.diallo@techafrique.io',
        data: {
          personalInfo: {
            firstName: 'Amina',
            lastName: 'Diallo',
            email: 'amina.diallo@techafrique.io',
            phone: '+221 77 123 4567',
            location: 'Dakar, Senegal',
            timeZone: 'GMT',
            linkedin: 'linkedin.com/in/amina-diallo-dev',
            github: 'github.com/amina-diallo',
            portfolio: 'https://aminadiallo.dev',
            experienceLevel: 'Senior Level (6-10 years)',
            yearsOfExperience: '5',
            currentRole: 'Senior Full-Stack Developer',
            currentCompany: 'TechAfrique',
            availability: '20hrs',
            workType: ['Part-time Remote'],
            languages: ['English', 'French', 'Wolof'],
            bio: 'Passionate full-stack engineer with 5 years of experience bringing fintech and e-commerce ideas to life across West Africa.'
          },
          professionalInfo: {
            title: 'Senior Full-Stack Developer',
            experienceLevel: 'Senior',
            availability: '20 hrs/week',
            hourlyRate: 45,
            currency: 'USD'
          },
          technicalSkills: {
            primarySkills: [
              { name: 'JavaScript', level: 9, endorsements: 78, lastUsed: 'June 2025' },
              { name: 'React/Next.js', level: 8, endorsements: 64, lastUsed: 'July 2025' },
              { name: 'Node.js', level: 8, endorsements: 54, lastUsed: 'June 2025' },
              { name: 'PostgreSQL', level: 7, endorsements: 32, lastUsed: 'May 2025' }
            ],
            secondarySkills: ['TypeScript', 'MongoDB', 'GraphQL'],
            frameworks: ['React', 'Next.js', 'Express', 'Stripe API'],
            databases: ['PostgreSQL', 'MongoDB', 'Redis'],
            tools: ['Docker', 'AWS', 'Git', 'Netlify'],
            certifications: ['AWS Certified Developer', 'React Advanced Certification']
          },
          workExperience: [{
            id: '1751444122613',
            company: 'TechAfrique',
            position: 'Senior Full-Stack Developer',
            duration: 'Jan 2021 – Present',
            description: 'Led development of fintech solutions across West Africa. Built scalable e-commerce platforms serving 50K+ users. Mentored junior developers in modern web technologies.',
            technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe']
          }],
          projects: [
            {
              id: '1751444266924',
              name: 'Verdant Fresh Farm-to-Table App',
              description: 'Mobile marketplace connecting farmers with consumers featuring React Native & Stripe integration.',
              technologies: ['React Native', 'Node.js', 'MongoDB', 'Stripe'],
              role: 'Lead Developer',
              liveUrl: 'https://verdantfresh.demo.andishi.dev',
              githubUrl: 'https://github.com/amina-diallo/verdant-fresh'
            },
            {
              id: '1751444266925',
              name: 'Baobab Capital Responsive Redesign',
              description: 'High-performance corporate website with Next.js & D3.js charting visualizations.',
              technologies: ['Next.js', 'D3.js', 'Tailwind CSS'],
              role: 'Frontend Lead',
              liveUrl: 'https://baobabcapital.demo.andishi.dev'
            }
          ],
          stats: {
            totalProjects: 27,
            averageRating: 4.8,
            totalEarnings: 124000,
            clientRetention: 92
          },
          achievements: [
            'Speaker at DakarJS 2025 on "Scaling Headless Commerce"',
            'Published open-source React Native payments library'
          ],
          notifications: [
            { id: '1', message: '2 unread messages from potential client "GreenHarvest"', type: 'message' },
            { id: '2', message: 'Profile completeness 85%', type: 'system' }
          ],
          timeEntries: [
            { project: 'Baobab Capital redesign', hours: 10, week: 'last' },
            { project: 'Fabric & Thread GraphQL schema', hours: 8, week: 'last' },
            { project: 'Rift Valley CRM bugfixes', hours: 2, week: 'last' }
          ]
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: oneWeekAgo,
        updatedAt: now,
      },
      {
        email: 'chi.okoye@naijatech.dev',
        data: {
          personalInfo: {
            firstName: 'Chiamaka',
            lastName: 'Okoye',
            email: 'chi.okoye@naijatech.dev',
            phone: '+234 803 123 4567',
            location: 'Lagos, Nigeria',
            timeZone: 'WAT',
            linkedin: 'linkedin.com/in/chiamaka-okoye',
            github: 'github.com/chiamaka-codes',
            portfolio: 'https://chiamaka.codes',
            experienceLevel: 'Mid Level (3-5 years)',
            yearsOfExperience: '4',
            currentRole: 'Front-End Engineer',
            currentCompany: 'NaijaTech',
            availability: '30hrs',
            workType: ['Full-time Remote'],
            languages: ['English', 'Igbo', 'Hausa'],
            bio: 'Front-end enthusiast specializing in interactive UI/UX and performance optimization for African startups.'
          },
          professionalInfo: {
            title: 'Front-End Engineer',
            experienceLevel: 'Mid-level',
            availability: '30 hrs/week',
            hourlyRate: 35,
            currency: 'USD'
          },
          technicalSkills: {
            primarySkills: [
              { name: 'TypeScript', level: 8, endorsements: 45, lastUsed: 'July 2025' },
              { name: 'React', level: 9, endorsements: 82, lastUsed: 'July 2025' },
              { name: 'Tailwind CSS', level: 7, endorsements: 38, lastUsed: 'June 2025' },
              { name: 'D3.js', level: 6, endorsements: 20, lastUsed: 'May 2025' }
            ],
            secondarySkills: ['Vue.js', 'SASS', 'WebGL'],
            frameworks: ['React', 'Next.js', 'Tailwind CSS', 'D3.js'],
            databases: ['Firebase', 'MongoDB'],
            tools: ['Figma', 'Adobe XD', 'Webpack', 'Vite'],
            certifications: ['Google UX Design Certificate', 'React Professional Certificate']
          },
          workExperience: [{
            id: '1751448195881',
            company: 'NaijaTech',
            position: 'Front-End Engineer',
            duration: 'Mar 2021 – Present',
            description: 'Specialized in building interactive UI/UX for African startups. Optimized web performance achieving 40% faster load times. Led design system implementation.',
            technologies: ['React', 'TypeScript', 'Tailwind CSS', 'D3.js']
          }],
          projects: [
            {
              id: '1751448210390',
              name: 'Fabric & Thread Next-Gen E-commerce',
              description: 'Headless React storefront with modern UI/UX and performance optimizations.',
              technologies: ['React', 'Next.js', 'Tailwind CSS', 'GraphQL'],
              role: 'Frontend Lead',
              liveUrl: 'https://fabricthread.demo.andishi.dev',
              githubUrl: 'https://github.com/chiamaka-codes/fabric-thread'
            },
            {
              id: '1751448210391',
              name: 'Meridian Financial Terminal',
              description: 'Electron-based desktop application with advanced charting panels.',
              technologies: ['Electron', 'React', 'D3.js', 'TypeScript'],
              role: 'UI/UX Developer',
              githubUrl: 'https://github.com/chiamaka-codes/meridian-terminal'
            }
          ],
          stats: {
            totalProjects: 18,
            averageRating: 4.7,
            totalEarnings: 56000,
            clientRetention: 88
          },
          achievements: [
            'Awarded "Best Front-end Contribution" at Naija DevCon 2024',
            'Mentor in Women Who Code Lagos'
          ],
          notifications: [
            { id: '1', message: 'Interview invite from "AgriConnect"', type: 'interview' },
            { id: '2', message: 'Feedback request on recent PR', type: 'review' }
          ],
          timeEntries: [
            { project: 'Fabric & Thread product page UX', hours: 12, week: 'last' },
            { project: 'Baobab Capital chart integration', hours: 6, week: 'last' },
            { project: 'Code review sessions', hours: 4, week: 'last' }
          ]
        },
        status: 'approved',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: oneWeekAgo,
        updatedAt: now,
      },
      {
        email: 'sipho.maseko@capetowndevs.co.za',
        data: {
          personalInfo: {
            firstName: 'Sipho',
            lastName: 'Maseko',
            email: 'sipho.maseko@capetowndevs.co.za',
            phone: '+27 82 123 4567',
            location: 'Cape Town, South Africa',
            timeZone: 'SAST',
            linkedin: 'linkedin.com/in/sipho-maseko-devops',
            github: 'github.com/siphomaseko-dev',
            portfolio: 'https://siphomaseko.dev',
            experienceLevel: 'Senior Level (6-10 years)',
            yearsOfExperience: '7',
            currentRole: 'DevOps & Cloud Engineer',
            currentCompany: 'Cape Town Devs',
            availability: '15hrs',
            workType: ['Part-time Remote'],
            languages: ['English', 'Afrikaans', 'Zulu'],
            bio: 'DevOps-minded full-stack dev focused on cloud-native apps and continuous delivery pipelines.'
          },
          professionalInfo: {
            title: 'DevOps & Cloud Engineer',
            experienceLevel: 'Senior',
            availability: '15 hrs/week',
            hourlyRate: 55,
            currency: 'USD'
          },
          technicalSkills: {
            primarySkills: [
              { name: 'Docker & Kubernetes', level: 9, endorsements: 71, lastUsed: 'July 2025' },
              { name: 'AWS', level: 8, endorsements: 60, lastUsed: 'June 2025' },
              { name: 'Terraform', level: 7, endorsements: 40, lastUsed: 'May 2025' },
              { name: 'CI/CD', level: 8, endorsements: 52, lastUsed: 'July 2025' }
            ],
            secondarySkills: ['Python', 'Go', 'Bash'],
            frameworks: ['Express', 'FastAPI', 'Serverless'],
            databases: ['PostgreSQL', 'Redis', 'DynamoDB'],
            tools: ['Jenkins', 'GitLab CI', 'Prometheus', 'Grafana'],
            certifications: ['AWS Solutions Architect', 'Certified Kubernetes Administrator']
          },
          workExperience: [{
            id: '1751448195882',
            company: 'Cape Town Devs',
            position: 'DevOps & Cloud Engineer',
            duration: 'Jun 2018 – Present',
            description: 'Architected cloud-native solutions for enterprise clients. Built CI/CD pipelines reducing deployment time by 80%. Managed Kubernetes clusters serving 1M+ requests daily.',
            technologies: ['Docker', 'Kubernetes', 'AWS', 'Terraform']
          }],
          projects: [
            {
              id: '1751448210392',
              name: 'Rift Valley Unified CRM Portal',
              description: 'Dockerized microservices architecture with container orchestration.',
              technologies: ['Docker', 'Kubernetes', 'React', 'Node.js'],
              role: 'DevOps Lead',
              liveUrl: 'https://riftvalley.demo.andishi.dev',
              githubUrl: 'https://github.com/siphomaseko-dev/rift-valley-crm'
            },
            {
              id: '1751448210393',
              name: 'Meridian Financial Terminal Deployment',
              description: 'Auto-update pipelines and deployment automation for desktop trading application.',
              technologies: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
              role: 'DevOps Engineer',
              githubUrl: 'https://github.com/siphomaseko-dev/meridian-deploy'
            }
          ],
          stats: {
            totalProjects: 32,
            averageRating: 4.9,
            totalEarnings: 210000,
            clientRetention: 95
          },
          achievements: [
            'Published Terraform modules for multi-region setups',
            'Speaker at AWS User Group Cape Town, 2025'
          ],
          notifications: [
            { id: '1', message: 'Pending skill endorsement request (Kubernetes)', type: 'endorsement' },
            { id: '2', message: 'Verify new email', type: 'system' }
          ],
          timeEntries: [
            { project: 'Rift Valley CRM container orchestration', hours: 8, week: 'last' },
            { project: 'Fabric & Thread CI/CD optimization', hours: 5, week: 'last' },
            { project: 'Meridian auto-update testing', hours: 2, week: 'last' }
          ]
        },
        status: 'approved',
        isAvailable: false,
        busyUntilDate: new Date('2025-08-15'),
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

    // Create some project assignments to show relationships
    console.log('Creating project assignments...');
    
    const createdProjects = await prisma.project.findMany({
      include: { client: true }
    });
    
    const createdDevelopers = await prisma.developerProfile.findMany({
      include: { user: true }
    });

    // Assign developers to projects based on skills match
    const projectAssignments = [
      {
        // Assign Amina to Fabric & Thread (her React/Next.js skills match)
        projectTitle: 'Fabric & Thread Next-Gen E-commerce Platform',
        developerEmail: 'amina.diallo@techafrique.io',
        role: 'Lead Developer',
        hourlyRate: 45,
        assignedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        // Assign Chiamaka to Baobab Capital (her front-end + D3.js skills match)
        projectTitle: 'Baobab Capital Responsive Website Redesign',
        developerEmail: 'chi.okoye@naijatech.dev',
        role: 'Frontend Developer',
        hourlyRate: 35,
        assignedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        // Assign Sipho to Rift Valley CRM (his DevOps + Docker skills match)
        projectTitle: 'Rift Valley Unified CRM Portal',
        developerEmail: 'sipho.maseko@capetowndevs.co.za',
        role: 'DevOps Engineer',
        hourlyRate: 55,
        assignedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const assignment of projectAssignments) {
      try {
        const project = createdProjects.find(p => p.projectDetails?.title === assignment.projectTitle);
        const developer = createdDevelopers.find(d => d.user.email === assignment.developerEmail);

        if (project && developer) {
          await prisma.projectAssignment.create({
            data: {
              projectId: project.id,
              developerId: developer.id,
              clientId: project.clientId,
              role: assignment.role,
              hourlyRate: assignment.hourlyRate,
              currency: 'USD',
              status: 'active',
              assignedAt: assignment.assignedAt,
              createdAt: assignment.assignedAt,
              updatedAt: now,
            }
          });
          console.log(`✅ Assigned ${developer.user.email} to project "${assignment.projectTitle}"`);
        } else {
          console.warn(`⚠️ Could not find project or developer for assignment: ${assignment.projectTitle} <-> ${assignment.developerEmail}`);
        }
      } catch (error) {
        console.error(`❌ Error creating project assignment:`, error.message);
      }
    }

    console.log('Project assignments created ✅');
    console.log('🎉 All seeding completed successfully!');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

run().catch(console.error);