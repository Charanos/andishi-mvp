import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables for development
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedHomepageProjects() {
  try {
    console.log('Seeding homepage projects...');
    
    // Clear existing homepage projects
    await prisma.homepageProject.deleteMany();
    
    // Create mock homepage projects
    const mockProjects = [
      {
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign of a modern e-commerce platform with enhanced user experience and performance optimizations.',
        category: 'Web Development',
        image: '/images/project1.jpg',
        projectImages: [
          '/images/project1-1.jpg',
          '/images/project1-2.jpg',
          '/images/project1-3.jpg'
        ],
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Node.js'],
        gradient: 'from-purple-500/20 to-pink-500/10',
        liveUrl: 'https://ecommerce-demo.example.com',
        githubUrl: 'https://github.com/example/ecommerce-platform',
        projectUrl: '/projects/ecommerce-platform',
        client: 'TechRetail Inc.',
        duration: '3 months',
        teamSize: '4 developers',
        featured: true,
        status: 'completed'
      },
      {
        title: 'Mobile Banking Application',
        description: 'Secure mobile banking application with biometric authentication and real-time transaction monitoring.',
        category: 'Mobile App',
        image: '/images/project2.jpg',
        projectImages: [
          '/images/project2-1.jpg',
          '/images/project2-2.jpg'
        ],
        technologies: ['React Native', 'TypeScript', 'Firebase', 'Redux'],
        gradient: 'from-blue-500/20 to-cyan-500/10',
        liveUrl: 'https://banking-app.example.com',
        githubUrl: 'https://github.com/example/mobile-banking',
        projectUrl: '/projects/mobile-banking',
        client: 'FinSecure Bank',
        duration: '6 months',
        teamSize: '6 developers',
        featured: false,
        status: 'completed'
      },
      {
        title: 'AI-Powered Analytics Dashboard',
        description: 'Real-time analytics dashboard leveraging machine learning to provide actionable insights for business operations.',
        category: 'Data Science',
        image: '/images/project3.jpg',
        projectImages: [
          '/images/project3-1.jpg',
          '/images/project3-2.jpg',
          '/images/project3-3.jpg',
          '/images/project3-4.jpg'
        ],
        technologies: ['Python', 'TensorFlow', 'D3.js', 'FastAPI'],
        gradient: 'from-green-500/20 to-teal-500/10',
        liveUrl: 'https://analytics-demo.example.com',
        githubUrl: 'https://github.com/example/ai-analytics',
        projectUrl: '/projects/ai-analytics',
        client: 'DataInsights Corp',
        duration: '4 months',
        teamSize: '3 developers',
        featured: false,
        status: 'in-progress'
      },
      {
        title: 'Blockchain Voting System',
        description: 'Decentralized voting system ensuring transparency and security in electoral processes using blockchain technology.',
        category: 'Blockchain',
        image: '/images/project4.jpg',
        projectImages: [
          '/images/project4-1.jpg',
          '/images/project4-2.jpg'
        ],
        technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React'],
        gradient: 'from-indigo-500/20 to-purple-500/10',
        liveUrl: '',
        githubUrl: 'https://github.com/example/blockchain-voting',
        projectUrl: '/projects/blockchain-voting',
        client: 'GovTech Solutions',
        duration: '8 months',
        teamSize: '5 developers',
        featured: false,
        status: 'planning'
      },
      {
        title: 'IoT Smart Home Hub',
        description: 'Centralized control system for IoT devices in smart homes with voice recognition and automation features.',
        category: 'IoT',
        image: '/images/project5.jpg',
        projectImages: [
          '/images/project5-1.jpg',
          '/images/project5-2.jpg',
          '/images/project5-3.jpg'
        ],
        technologies: ['Raspberry Pi', 'Python', 'MQTT', 'React Native'],
        gradient: 'from-orange-500/20 to-red-500/10',
        liveUrl: 'https://smarthome-demo.example.com',
        githubUrl: 'https://github.com/example/iot-smarthome',
        projectUrl: '/projects/iot-smarthome',
        client: 'HomeAutomation Ltd',
        duration: '5 months',
        teamSize: '4 developers',
        featured: false,
        status: 'completed'
      }
    ];

    // Insert mock projects
    for (const project of mockProjects) {
      await prisma.homepageProject.create({
        data: project
      });
      console.log(`Created project: ${project.title}`);
    }

    console.log('Homepage projects seeding completed!');
  } catch (error) {
    console.error('Error seeding homepage projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHomepageProjects();
