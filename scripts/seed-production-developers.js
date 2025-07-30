const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedDevelopers() {
  try {
    console.log('🌱 Starting developer profiles seeding...');
    
    // Create proper dates based on current time (2025-07-30)
    const now = new Date('2025-07-30T15:17:36+03:00');
    
    // Developer profiles to create
    const developersToCreate = [
      {
        email: 'dindijjames@gmail.com',
        firstName: 'James',
        lastName: 'Dindi',
        role: 'developer',
        password: 'tempPassword123!',
        isActive: true,
        accountCreated: false,
        passwordGenerated: false,
        data: {
          personalInfo: {
            firstName: 'James',
            lastName: 'Dindi',
            email: 'dindijjames@gmail.com',
            phone: '+254704182018',
            location: 'Nairobi, Kenya',
            timeZone: 'EAT',
            linkedin: 'https://www.linkedin.com/in/james-dindi/',
            github: 'https://github.com/daktari01',
            portfolio: '',
          },
          professionalInfo: {
            title: 'Fullstack software engineer',
            experienceLevel: 'Senior Level (6-10 years)',
            yearsOfExperience: '6',
            currentRole: 'Senior Fullstack Engineer',
            currentCompany: 'Freelancer',
            availability: 'immediately',
            workType: ['Full-time Remote', 'Contract'],
            languages: ['English', 'Swahili'],
            bio: 'Creative and detail-oriented full-stack developer with 6+ years of experience building robust, user-friendly web applications using Ruby on Rails, JavaScript (React, Next.js), and PostgreSQL. Skilled in both backend and frontend development, with a focus on building scalable REST APIs, optimizing performance, and delivering high-quality, maintainable code. Collaborative and agile-minded, with a strong passion for improving digital health experiences.\n',
          },
          technicalSkills: {
            primarySkills: ['JavaScript', 'Ruby'],
            secondarySkills: [],
            frameworks: ['React', 'Next.js', 'Ruby on Rails'],
            databases: ['PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Elasticsearch'],
            tools: ['Git', 'Docker', 'Webpack', 'Figma', 'GitHub Actions'],
            certifications: [],
          },
          workExperience: [
            {
              id: '1751430224603',
              company: 'Langify',
              position: 'Fullstack Software Engineer',
              duration: 'April 2021 - Present',
              description: 'Designed and shipped new features using Ruby on Rails and React.\nImproved load times and app performance using lazy loading and memoization.\nAutomated tests for frontend and backend to improve code quality and maintainability.\nProvided support directly to users, resolving issues and improving experience.\n',
              technologies: ['React | Ruby on Rails '],
            },
            {
              id: '1751430383804',
              company: 'Beazy',
              position: 'Fullstack Software Engineer (Parttime Contract)',
              duration: 'November 2022 - April 2023',
              description: 'Developed reusable React components to streamline the frontend.\nDebugged and fixed critical issues in close collaboration with the product team.\n',
              technologies: ['Ruby on Rails | React | Antdesign'],
            },
            {
              id: '1751430498743',
              company: 'Nobilis',
              position: 'Fullstack Software Engineer',
              duration: 'May 2020 - March 2021',
              description: 'Built PWA features to enhance mobile experience.\nWrote extensive automated tests to boost stability and developer confidence.\n',
              technologies: ['Ruby on Rails | React'],
            },
            {
              id: '1751430587334',
              company: 'Firstup (Formally SocialChorus)',
              position: 'Fullstack Software Engineer',
              duration: 'April 2019 - November 2019',
              description: 'Improved page performance on high-traffic Rails app.\nContributed to feature development across the full stack using Rails and React.\n',
              technologies: ['Ruby on Rails | React '],
            },
            {
              id: '1751430710802',
              company: 'Andela',
              position: 'Software Engineer',
              duration: 'May 2018 - March 2020',
              description: 'Increased backend test coverage to 95% using RSpec.\nCollaborated across teams to optimize backend services and speed up delivery cycles.\n',
              technologies: ['Ruby on Rails | Python | React'],
            }
          ],
          projects: [],
        },
        status: 'pending',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: new Date('2025-07-02T04:33:09.098Z'),
        updatedAt: now,
      },
      {
        email: 'gideonkngetich86@gmail.com',
        firstName: 'Gideon',
        lastName: 'Ngetich',
        role: 'developer',
        password: 'tempPassword123!',
        isActive: true,
        accountCreated: false,
        passwordGenerated: false,
        data: {
          personalInfo: {
            firstName: 'Gideon',
            lastName: 'Ngetich',
            email: 'gideonkngetich86@gmail.com',
            phone: '+254742252910',
            location: 'Nairobi',
            timeZone: 'EAT',
            linkedin: 'https://www.linkedin.com/in/gideon-ngetich-6b7a96253/',
            github: 'https://github.com/Ngetich-86',
            portfolio: 'https://www.gideonngetich.me/',
          },
          professionalInfo: {
            title: 'Full-stack developer',
            experienceLevel: 'Mid Level (3-5 years)',
            yearsOfExperience: '3',
            currentRole: '',
            currentCompany: '',
            availability: 'immediately',
            workType: ['Full-time Remote', 'Contract'],
            languages: ['English', 'Swahili'],
            bio: "I'm Gideon Ngetich, a full-stack developer and cloud enthusiast with a passion for building efficient, scalable solutions. I work with a wide range of technologies, including Spring Boot, Angular, React, Next.js, Node.js, and .NET, and I've deployed apps using Docker and followed DevOps best practices for CI/CD and cloud hosting.\n\nI've built and deployed full-stack applications such as a task manager using Angular and Spring Boot, a Firebase-based gallery app, and a portfolio site with Next.js. I'm also skilled in cloud platforms like AWS and Azure, having completed the AWS Re/Start program and hosted cloud events as a Microsoft Student Ambassador.\n\nWhat sets me apart is my ability to combine strong backend engineering with clean, user-focused frontends, while also understanding how to manage cloud deployments, containerization, and integration pipelines.\n\nI love working with mission-driven teams and clients who value clean architecture, performance, and long-term maintainability.\n📁 View my work here:\nhttps://www.gideonngetich.me/",
          },
          technicalSkills: {
            primarySkills: ['JavaScript', 'TypeScript', 'Java', 'C#'],
            secondarySkills: [],
            frameworks: ['React', 'Angular', 'Django', 'Next.js', 'Express.js', 'ASP.NET'],
            databases: ['PostgreSQL', 'Firebase', 'Redis', 'SQL Server', 'MongoDB'],
            tools: ['Docker', 'Git', 'Azure', 'AWS', 'Kubernetes'],
            certifications: [
              'AWS Cloud Practitioner (CLF-C01)',
              'Certified Software Developer',
              'Microsoft Azure Fundamentals (AZ-900)',
              'Foundational C# with Microsoft',
              'MLSA Student Trainer Ambassadors Projects Participant',
              'Microsoft Azure AI Fundamentals (AI-900)',
              'Azure Responsible AI Workshop'
            ],
          },
          workExperience: [
            {
              id: '1751448195881',
              company: '',
              position: '',
              duration: '',
              description: '',
              technologies: []
            }
          ],
          projects: [
            {
              id: '1751448210390',
              name: 'Automated Seat Reservation System',
              description: 'Built a web-based seat reservation system for public service vehicles, enabling users to view, select, and \nbook seats in real time. Integrated M-Pesa Daraja API for seamless mobile payments and used mapping \nlogic to visually represent available and booked seats. \n▪ Tech Stack: React.js, Node.js, PostgreSQL, Hono.js, Drizzle ORM. Implemented backend seat-locking  logic to prevent double booking.',
              technologies: [' React.js', 'Node.js', 'PostgreSQL', 'Hono.js', 'Drizzle ORM. '],
              role: 'Full-stack developer',
              githubUrl: 'https://github.com/Ngetich-86/Auto-seat-psv-Client',
              liveUrl: 'https://www.loom.com/share/4bd7baef319640b4a4e07a385d232b2b?sid=4aa7d828-7f8a-42a8-b8a3-6a491b93c740'
            }
          ],
        },
        status: 'pending',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: new Date('2025-07-02T09:25:49.636Z'),
        updatedAt: now,
      },
      {
        email: 'brian.kiremu@gmail.com',
        firstName: 'Brian',
        lastName: 'Kiremu',
        role: 'developer',
        password: 'tempPassword123!',
        isActive: true,
        accountCreated: false,
        passwordGenerated: false,
        data: {
          personalInfo: {
            firstName: 'Brian',
            lastName: 'Kiremu',
            email: 'brian.kiremu@gmail.com',
            phone: '+254725101670',
            location: 'Nairobi, Kenya',
            timeZone: 'EAT',
            linkedin: 'https://ke.linkedin.com/in/briankiremu',
            github: 'https://github.com/bankai254',
            portfolio: '',
          },
          professionalInfo: {
            title: 'Full Stack Engineer',
            experienceLevel: 'Lead/Architect (10+ years)',
            yearsOfExperience: '13',
            currentRole: '',
            currentCompany: '',
            availability: 'immediately',
            workType: ['Full-time Remote', 'Contract'],
            languages: ['English', 'Swahili'],
            bio: 'Engineering leader and solution architect with 10+ years building cloud‑native, AI & data‑driven platforms with Python, Node.js, JavaScript, ReactJS, Next.js and PHP. \n\nAn all-rounder who is a fast learner, problem solver, adaptive and capable of establishing credibility & influence with stakeholders & team members early on in a new position, has substantial professional experience and possesses a real desire to succeed and make a difference.',
          },
          technicalSkills: {
            primarySkills: ['JavaScript', 'TypeScript', 'Python', 'Ruby', 'PHP'],
            secondarySkills: [],
            frameworks: ['React', 'Next.js', 'Node.js', 'Express.js', 'Laravel', 'Flask', 'Django', 'Ruby on Rails', 'React Native'],
            databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'SQL Server', 'SQLite', 'Elasticsearch', 'Oracle'],
            tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GitHub Actions', 'Vite', 'Webpack', 'Terraform', 'Figma'],
            certifications: [],
          },
          workExperience: [
            {
              id: '1751451476074',
              company: 'University of  Nicosia',
              position: 'Backend Engineer',
              duration: 'Oct 2024 to Jun 2025',
              description: '',
              technologies: ['Node.js,Python,AWS,Neptune,Lambda,MySQL']
            },
            {
              id: '1751451545578',
              company: 'Job&Talent',
              position: 'Senior Frontend Engineer',
              duration: 'Sept 2022 to Feb 2024',
              description: '',
              technologies: ['React,Node.js,JavaScript,TypeScript,Ruby,AWS,Next.js,MySQL']
            },
            {
              id: '1751451589521',
              company: 'Tezza Business Solutions',
              position: 'Frontend Developer',
              duration: 'Nov 2017 to Sept 2022',
              description: '',
              technologies: ['React,Node.js,JavaScript,TypeScript,Ruby,AWS,Next.js']
            },
            {
              id: '1751451674108',
              company: 'The Mahogany Group',
              position: 'Full Stack Software Engineer',
              duration: 'Jan 2011 to Nov 2017',
              description: '',
              technologies: ['React,Node.js,JavaScript,TypeScript,Ruby,AWS,Next.js,PHP,MySQL']
            }
          ],
          projects: [],
        },
        status: 'pending',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: new Date('2025-07-02T10:22:06.029Z'),
        updatedAt: now,
      },
      // Continue with all other developers in the same format...
      // Ubirajara Silva
      {
        email: 'contatomercalize@gmail.com',
        firstName: 'Ubirajara',
        lastName: 'Silva',
        role: 'developer',
        password: 'tempPassword123!',
        isActive: true,
        accountCreated: false,
        passwordGenerated: false,
        data: {
          personalInfo: {
            firstName: 'Ubirajara',
            lastName: 'Silva',
            email: 'contatomercalize@gmail.com',
            phone: '555198335525',
            location: 'Brazil',
            timeZone: 'UTC',
            linkedin: '',
            github: '',
            portfolio: '',
          },
          professionalInfo: {
            title: 'AWS',
            experienceLevel: 'Mid Level (3-5 years)',
            yearsOfExperience: '3',
            currentRole: 'Data Scientist',
            currentCompany: 'Renner',
            availability: '2weeks',
            workType: ['Contract'],
            languages: ['English', 'Portuguese'],
            bio: '',
          },
          technicalSkills: {
            primarySkills: ['Python', 'Scala'],
            secondarySkills: [],
            frameworks: [],
            databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL Server', 'Oracle', 'SQLite', 'Elasticsearch', 'DynamoDB'],
            tools: ['AWS'],
            certifications: [],
          },
          workExperience: [],
          projects: [],
        },
        status: 'pending',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: new Date('2025-07-02T16:45:21.491Z'),
        updatedAt: now,
      },
      // Samuel Kiragu
      {
        email: 'info.samkiragu@gmail.com',
        firstName: 'Samuel',
        lastName: 'Kiragu',
        role: 'developer',
        password: 'tempPassword123!',
        isActive: true,
        accountCreated: false,
        passwordGenerated: false,
        data: {
          personalInfo: {
            firstName: 'Samuel',
            lastName: 'Kiragu',
            email: 'info.samkiragu@gmail.com',
            phone: '0716816982',
            location: 'Nairobi',
            timeZone: 'EAT',
            linkedin: 'https://www.linkedin.com/in/skiragu/',
            github: 'https://github.com/sskiragu',
            portfolio: 'https://portfolio-gules-tau-89.vercel.app/',
          },
          professionalInfo: {
            title: 'Software Engineer',
            experienceLevel: 'Mid Level (3-5 years)',
            yearsOfExperience: '5',
            currentRole: 'Software Engineer',
            currentCompany: 'Intellspark Limited',
            availability: 'immediately',
            workType: ['Full-time Remote'],
            languages: ['English', 'Swahili'],
            bio: 'I am a results-driven Software Engineer with a strong foundation in JavaScript and TypeScript, complemented by hands-on experience as an Oracle Database Developer. I also have practical skills in DevOps and Cloud technologies, enabling me to build, deploy, and manage modern software solutions with scalability and reliability in mind.\n\nWhat makes me unique is my ability to bridge the gap between development and infrastructure — ensuring efficient, secure, and high-performing applications. I\'m passionate about solving real-world problems through code, collaborating across teams, and continuously learning to bring impactful solutions that deliver tangible value to businesses.',
          },
          technicalSkills: {
            primarySkills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'PHP'],
            secondarySkills: [],
            frameworks: ['React', 'Angular', 'Next.js', 'Vue.js', 'Node.js', 'Laravel'],
            databases: ['MySQL', 'Oracle', 'MongoDB', 'Redis'],
            tools: ['Git', 'Docker', 'AWS', 'GitHub Actions'],
            certifications: ['Certified Member AWS Certified CommunityPractitioner PRINCE2® Project Management'],
          },
          workExperience: [
            {
              id: '1751536353823',
              company: 'Intellspark Limited',
              position: 'Software Engineer',
              duration: 'June/2025 - Present',
              description: 'Responsible for defining software requirements and translating them into functional, working systems tailored to client needs. I collaborate closely with stakeholders to gather clear specifications, then design, develop, and deliver solutions that align with both technical and business objectives.\n\nAchievement: Successfully led the development of a Water Vendor Management System, streamlining vendor registration, order tracking, and payment processes. This solution improved service delivery, increased transparency, and enhanced operational efficiency for the client.',
              technologies: ['React.js', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Axios', 'Redux', 'React Router', 'Node.js', 'Express.js', 'JWT', 'Passport.js', 'MySQL', 'Prisma', 'Sequelize', 'Knex.js', 'Docker', 'Docker Compose', 'NGINX', 'AWS', 'Azure', 'GCP', 'EC2', 'RDS', 'Cloud SQL', 'GitHub Actions', 'Jenkins', 'Postman', 'Insomnia', 'Git', 'GitHub', 'ESLint', 'Prettier', 'Jest', 'Mocha', 'Chai', 'Swagger', 'OpenAPI']
            },
            {
              id: '1751536851381',
              company: 'Institute of Software Technologies',
              position: 'Software Engineer',
              duration: 'March 2018 - May 2025',
              description: 'Responsible for creating and maintaining internal systems for the institute, while also teaching Oracle Database Administration and Development, DevOps, and Cloud Computing.\nSuccessfully designed and implemented a Project Management System tailored to the institute\'s operations, improving task tracking, project visibility, and team collaboration.',
              technologies: ['Oracle Database', 'Laravel', 'React', 'Node.js', 'MySQL', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Axios', 'Express.js', 'JWT', 'Docker', 'Docker Compose', 'NGINX', 'AWS (EC2', 'RDS', 'S3)', 'Git', 'GitHub', 'GitHub Actions', 'Postman', 'ESLint', 'Prettier', 'Jest', 'Swagger', 'Prisma']
            },
            {
              id: '1751537272961',
              company: 'Novel Limited Group',
              position: 'Software Engineer',
              duration: 'June/2016 - Feb/2018',
              description: 'Involved in collecting and analyzing system requirements from stakeholders and transforming them into a fully functional software solution.\nSuccessfully developed a school management system using Laravel, designed to handle student registration, class scheduling, fee tracking, and reporting—streamlining operations and improving administrative efficiency.',
              technologies: ['Laravel', 'PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Git', 'GitHub', 'Postman']
            },
            {
              id: '1751537444098',
              company: 'Systech Africa Limited',
              position: 'Software Engineer Inter',
              duration: 'Jan/2015 - May/2015',
              description: 'Responsible for maintaining and supporting a pension management system, ensuring system stability, data accuracy, and compliance with regulatory requirements.\nHandled updates, bug fixes, and performance optimizations to support seamless pension processing, reporting, and user access.',
              technologies: ['Oracle Database', 'PL/SQL', 'Java', 'JavaScript', 'HTML', 'CSS', 'Git', 'Linux', 'Shell Scripting']
            }
          ],
          projects: [
            {
              id: '1751536799902',
              name: 'Student Feedback',
              description: 'Developed a Student Feedback System to collect, manage, and analyze student feedback within an institute. The system streamlines the feedback process for courses, instructors, and facilities—enabling administrators to make data-driven decisions and improve service delivery. This project contributed significantly to operational efficiency, transparency, and continuous improvement in academic and administrative functions.',
              technologies: ['TypeScript', 'Next.js', 'React', 'Node.js', 'Express.js', 'AWS (EC2', 'S3', 'RDS', 'CloudFront', 'IAM)', 'Docker', 'Docker Compose', 'GitHub Actions', 'NGINX', 'Tailwind CSS', 'HTML5', 'CSS3', 'REST APIs', 'JWT', 'PostgreSQL', 'MySQL', 'Prisma', 'ESLint', 'Prettier', 'Postman'],
              role: 'Fullstack ',
              liveUrl: 'https://feedback.isteducation.com/'
            },
            {
              id: '1751537903751',
              name: 'Student Courses Management System',
              description: 'Developed a Student Courses Management System that allows students to view available courses, check course details, and apply online. The system simplifies course selection and enrollment processes, enhancing the overall student experience and reducing administrative workload.\nAdmins can manage course listings, monitor applications, and generate reports—contributing to a more efficient and transparent academic registration workflow.',
              technologies: ['React', 'Node.js', 'Express.js', 'TypeScript', 'MySQL', 'Prisma', 'Tailwind CSS', 'HTML5', 'CSS3', 'JWT', 'REST API', 'Docker', 'Git', 'GitHub', 'Postman'],
              role: '',
              liveUrl: 'https://projects.isteducation.com/'
            }
          ],
        },
        status: 'pending',
        isAvailable: true,
        busyUntilDate: null,
        createdAt: new Date('2025-07-03T10:21:37.752Z'),
        updatedAt: now,
      },
      // ... Continue with all remaining developers in the same format
    ];

    console.log('Creating developer users...');

    // Create or update each developer
    for (const devProfileData of developersToCreate) {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email: devProfileData.email },
        });

        if (!user) {
          // Create new user
          const hashedPassword = await bcrypt.hash(devProfileData.password, 10);
          user = await prisma.user.create({
            data: {
              email: devProfileData.email,
              firstName: devProfileData.firstName,
              lastName: devProfileData.lastName,
              role: devProfileData.role,
              password: hashedPassword,
              isActive: devProfileData.isActive,
              accountCreated: devProfileData.accountCreated,
              passwordGenerated: devProfileData.passwordGenerated,
              createdAt: devProfileData.createdAt,
              updatedAt: devProfileData.updatedAt,
            },
          });
          console.log(`✅ Created user for ${devProfileData.email}`);
        } else {
          console.log(`ℹ️  User ${devProfileData.email} already exists`);
        }

        // Check if developer profile already exists
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
      } catch (error) {
        console.error(`❌ Error creating/updating developer profile for ${devProfileData.email}:`, error.message);
      }
    }

    console.log('🎉 Developer profiles seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDevelopers();