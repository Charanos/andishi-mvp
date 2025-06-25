"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DevProfileModal from "../components/DevProfileModal";

// Define types
interface Developer {
  id: number;
  name: string;
  role: string;
  experience: string;
  location: string;
  avatar: string;
  skills: string[];
  specialties: string[];
  availability: string;
  rating: number;
  projectsCompleted: number;
  gradient: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  bio: string;
  about: string;
  languages: string[];
  education: string;
  certifications: string[];
  projectHighlights: Array<{
    title: string;
    description: string;
    tech: string[];
    duration: string;
  }>;
  testimonials: Array<{
    client: string;
    feedback: string;
    project: string;
    rating: number;
  }>;
  workHistory: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
}

export default function TechTalentPool() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null
  );

  // Skill colors for badges
  const skillColors: { [key: string]: string } = {
    React:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Next.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Node.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    TypeScript:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Python:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Tailwind CSS":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    MongoDB:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    PostgreSQL:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Firebase:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    AWS: "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Vue.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Blockchain:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    DevOps:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Machine Learning":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "React Native":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Docker:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Kubernetes:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    GraphQL:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
  };

  const developers: Developer[] = [
    {
      id: 1,
      name: "Felix Nthiwa",
      role: "Full Stack Developer",
      experience: "5+ years",
      location: "Nairobi, KE",
      avatar: "/images/dev1.jpg",
      skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
      specialties: ["E-commerce", "Real-time Systems", "API Design"],
      availability: "Available",
      rating: 4.9,
      projectsCompleted: 47,
      gradient: "from-blue-500/20 to-cyan-500/10",
      portfolioUrl: "/talent/Felix-nthiwa",
      githubUrl: "https://github.com/FelixNthiwa",
      linkedinUrl: "https://linkedin.com/in/FelixNthiwa",
      bio: "Passionate full-stack developer with expertise in building scalable web applications and modern user interfaces.",
      about:
        "I'm a dedicated full-stack developer with over 5 years of experience creating robust, scalable web applications. My journey began with a Computer Science degree, and I've since worked with startups and enterprises alike, helping them build digital solutions that drive growth. I'm particularly passionate about e-commerce platforms and real-time systems, having architected several high-traffic applications that serve thousands of users daily. When I'm not coding, you'll find me contributing to open-source projects or mentoring junior developers.",
      languages: [
        "English (Native)",
        "Swahili (Fluent)",
        "Spanish (Conversational)",
      ],
      education: "B.S. Computer Science, Kenyatta University",
      certifications: [
        "AWS Solutions Architect",
        "Google Cloud Professional",
        "React Developer Certification",
      ],
      projectHighlights: [
        {
          title: "E-commerce Platform Redesign",
          description:
            "Led the complete overhaul of a major e-commerce platform, improving performance by 40% and user engagement by 60%.",
          tech: ["React", "Node.js", "PostgreSQL", "AWS", "Redis"],
          duration: "6 months",
        },
        {
          title: "Real-time Trading Dashboard",
          description:
            "Built a real-time financial trading dashboard handling 10k+ concurrent users with sub-100ms latency.",
          tech: ["React", "WebSocket", "Node.js", "MongoDB", "Docker"],
          duration: "4 months",
        },
        {
          title: "Microservices API Gateway",
          description:
            "Designed and implemented a scalable API gateway for a fintech startup, reducing response times by 50%.",
          tech: ["Node.js", "Express", "AWS Lambda", "DynamoDB"],
          duration: "3 months",
        },
      ],
      testimonials: [
        {
          client: "TechCorp Solutions",
          feedback:
            "Felix delivered exceptional results on our e-commerce platform. Her technical expertise and attention to detail exceeded our expectations.",
          project: "E-commerce Platform",
          rating: 5.0,
        },
        {
          client: "FinanceFlow Inc",
          feedback:
            "Outstanding work on our trading dashboard. Felix's real-time expertise was exactly what we needed.",
          project: "Trading Dashboard",
          rating: 4.9,
        },
      ],
      workHistory: [
        {
          company: "Airtel KE",
          position: "Senior Full Stack Developer",
          duration: "2022 - 2024",
          description:
            "Led development of core e-commerce features, mentored junior developers, and improved system performance by 35%.",
        },
        {
          company: "Kenya Revenue Authority (KRA)",
          position: "Full Stack Developer",
          duration: "2020 - 2022",
          description:
            "Built payment processing systems and APIs, working with high-volume financial transactions.",
        },
        {
          company: "Startup Hub Africa",
          position: "Frontend Developer",
          duration: "2019 - 2020",
          description:
            "Developed responsive web applications using React and modern JavaScript frameworks.",
        },
      ],
    },
    {
      id: 2,
      name: "Daniel Kemboi",
      role: "Frontend Developer",
      experience: "4+ years",
      location: "Nakuru, KE",
      avatar: "/images/dev2.jpg",
      skills: ["React", "Next.js", "Tailwind CSS", "TypeScript", "Vue.js"],
      specialties: [
        "UI/UX Implementation",
        "Performance Optimization",
        "Mobile-First Design",
      ],
      availability: "Available",
      rating: 4.8,
      projectsCompleted: 32,
      gradient: "from-purple-500/20 to-pink-500/10",
      portfolioUrl: "https://marcusrodriguez.com",
      githubUrl: "https://github.com/marcusrodriguez",
      linkedinUrl: "https://linkedin.com/in/marcusrodriguez",
      bio: "Creative frontend developer focused on crafting beautiful, responsive user experiences with modern technologies.",
      about:
        "I'm a creative frontend developer who believes that great user interfaces are the bridge between complex technology and human needs. With 4+ years of experience, I specialize in transforming design concepts into pixel-perfect, performant web applications. My background in graphic design gives me a unique perspective on UI/UX implementation, allowing me to work closely with designers while ensuring technical feasibility. I'm passionate about accessibility, performance optimization, and creating mobile-first experiences that work seamlessly across all devices.",
      languages: [
        "English (Native)",
        "Swahili (Native)",
        "French (Intermediate)",
      ],
      education: "B.A. Graphic Design & Computer Science, Egerton University",
      certifications: [
        "Google UX Design Certificate",
        "React Advanced Patterns",
        "Web Performance Optimization",
      ],
      projectHighlights: [
        {
          title: "Healthcare App Redesign",
          description:
            "Complete UI/UX overhaul of a healthcare application, improving user satisfaction scores by 85%.",
          tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
          duration: "5 months",
        },
        {
          title: "E-learning Platform",
          description:
            "Built responsive frontend for an e-learning platform serving 50k+ students with 99.9% uptime.",
          tech: ["Next.js", "React", "Styled Components", "PWA"],
          duration: "4 months",
        },
        {
          title: "Fintech Dashboard",
          description:
            "Created an intuitive financial dashboard with complex data visualizations and real-time updates.",
          tech: ["Vue.js", "D3.js", "WebSocket", "Vuetify"],
          duration: "3 months",
        },
      ],
      testimonials: [
        {
          client: "HealthTech Solutions",
          feedback:
            "Marcus transformed our outdated interface into a modern, intuitive experience. Our users love the new design!",
          project: "Healthcare App Redesign",
          rating: 5.0,
        },
        {
          client: "EduPlatform",
          feedback:
            "Exceptional attention to detail and mobile responsiveness. The platform performs beautifully on all devices.",
          project: "E-learning Platform",
          rating: 4.8,
        },
      ],
      workHistory: [
        {
          company: "Jumia KE",
          position: "Senior Frontend Developer",
          duration: "2023 - Present",
          description:
            "Developing user interfaces for creative tools, focusing on performance optimization and accessibility.",
        },
        {
          company: "Salem Innovations",
          position: "Frontend Developer",
          duration: "2021 - 2023",
          description:
            "Built responsive web applications for music streaming platform, improving user engagement metrics.",
        },
        {
          company: "E-mobilis Institute",
          position: "Junior Frontend Developer",
          duration: "2020 - 2021",
          description:
            "Converted design mockups to responsive websites for various clients in different industries.",
        },
      ],
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Backend Developer",
      experience: "6+ years",
      location: "New Delhi, IN",
      avatar: "/images/dev6.jpg",
      skills: ["Python", "Node.js", "MongoDB", "AWS", "Docker"],
      specialties: ["Microservices", "Database Design", "Cloud Architecture"],
      availability: "Busy until Oct 2025",
      rating: 5.0,
      projectsCompleted: 58,
      gradient: "from-green-500/20 to-emerald-500/10",
      portfolioUrl: "https://priyapatel.dev",
      githubUrl: "https://github.com/priyapatel",
      linkedinUrl: "https://linkedin.com/in/priyapatel",
      bio: "Senior backend engineer specializing in scalable server architectures and high-performance database systems.",
      about:
        "I'm a senior backend engineer with 6+ years of experience building robust, scalable server architectures that power modern applications. My expertise lies in designing microservices architectures, optimizing database performance, and implementing cloud-native solutions. I've worked with companies ranging from early-stage startups to Fortune 500 enterprises, helping them scale their backend systems to handle millions of users. I'm particularly passionate about database design and performance optimization, having reduced query times by up to 90% in several projects. My approach combines solid engineering principles with pragmatic solutions that deliver real business value.",
      languages: ["English (Fluent)", "Hindi (Native)", "Gujarati (Native)"],
      education: "M.S. Computer Science, University of India",
      certifications: [
        "AWS Solutions Architect Professional",
        "MongoDB Certified Developer",
        "Docker Certified Associate",
        "Kubernetes Administrator",
      ],
      projectHighlights: [
        {
          title: "Banking System Microservices",
          description:
            "Architected and implemented a complete microservices backend for a digital banking platform, handling 1M+ transactions daily.",
          tech: ["Python", "FastAPI", "PostgreSQL", "Redis", "Kubernetes"],
          duration: "8 months",
        },
        {
          title: "IoT Data Processing Pipeline",
          description:
            "Built a real-time data processing system for IoT devices, processing 100k+ events per second with 99.99% reliability.",
          tech: ["Python", "Apache Kafka", "MongoDB", "Docker", "AWS"],
          duration: "5 months",
        },
        {
          title: "E-commerce Backend Optimization",
          description:
            "Optimized an e-commerce backend system, reducing API response times by 75% and improving throughput by 200%.",
          tech: ["Node.js", "MongoDB", "Redis", "AWS Lambda", "CloudFront"],
          duration: "4 months",
        },
      ],
      testimonials: [
        {
          client: "SecureBank Corp",
          feedback:
            "Priya's microservices architecture exceeded our scalability requirements. Her expertise in banking systems was invaluable.",
          project: "Banking System",
          rating: 5.0,
        },
        {
          client: "IoT Solutions Inc",
          feedback:
            "Delivered a rock-solid data processing pipeline that handles our growing IoT network flawlessly. Exceptional work!",
          project: "IoT Data Pipeline",
          rating: 5.0,
        },
      ],
      workHistory: [
        {
          company: "Mahindra Tech",
          position: "Senior Backend Engineer",
          duration: "2021 - Present",
          description:
            "Leading backend development for high-traffic e-commerce services, focusing on scalability and performance optimization.",
        },
        {
          company: "Alibaba Cloud",
          position: "Backend Engineer",
          duration: "2019 - 2021",
          description:
            "Developed real-time location services and payment processing systems for ride-sharing platform.",
        },
        {
          company: "Smirtrack Technologies",
          position: "Software Engineer",
          duration: "2018 - 2019",
          description:
            "Built and maintained backend services for e-commerce platform, working with merchant-facing APIs.",
        },
      ],
    },
    {
      id: 4,
      name: "James Kim",
      role: "Mobile Developer",
      experience: "4+ years",
      location: "Seattle, WA",
      avatar: "/images/dev3.jpg",
      skills: ["React Native", "TypeScript", "Firebase", "Node.js"],
      specialties: [
        "Cross-platform Apps",
        "Push Notifications",
        "App Store Optimization",
      ],
      availability: "Available",
      rating: 4.9,
      projectsCompleted: 28,
      gradient: "from-orange-500/20 to-red-500/10",
      portfolioUrl: "https://jameskim.dev",
      githubUrl: "https://github.com/jameskim",
      linkedinUrl: "https://linkedin.com/in/jameskim",
      bio: "Mobile development specialist creating native-quality cross-platform applications for iOS and Android.",
      about:
        "I'm a mobile development specialist with 4+ years of experience creating high-quality cross-platform applications that deliver native-like experiences on both iOS and Android. My journey in mobile development started with native iOS development, but I quickly recognized the power of React Native for building efficient, maintainable cross-platform solutions. I specialize in creating apps that not only look great but also perform exceptionally well, with particular expertise in push notifications, real-time features, and app store optimization. I've helped numerous startups and established companies launch successful mobile applications that have collectively been downloaded over 2 million times.",
      languages: [
        "English (Fluent)",
        "Korean (Native)",
        "Japanese (Conversational)",
      ],
      education: "B.S. Computer Science, University of Washington",
      certifications: [
        "React Native Certified Developer",
        "Firebase Certified",
        "Apple Developer Program",
        "Google Play Console Certified",
      ],
      projectHighlights: [
        {
          title: "Social Fitness App",
          description:
            "Developed a social fitness tracking app with real-time workout sharing, achieving 500k+ downloads in first year.",
          tech: ["React Native", "Firebase", "Redux", "Socket.io"],
          duration: "6 months",
        },
        {
          title: "Food Delivery Platform",
          description:
            "Built cross-platform food delivery app with real-time tracking, payment integration, and push notifications.",
          tech: ["React Native", "TypeScript", "Stripe", "Google Maps API"],
          duration: "5 months",
        },
        {
          title: "Healthcare Monitoring App",
          description:
            "Created HIPAA-compliant healthcare app for patient monitoring with secure data transmission and offline capabilities.",
          tech: ["React Native", "SQLite", "AWS Amplify", "GraphQL"],
          duration: "4 months",
        },
      ],
      testimonials: [
        {
          client: "FitSocial Inc",
          feedback:
            "James delivered an outstanding fitness app that exceeded our user engagement goals. His expertise in push notifications was game-changing.",
          project: "Social Fitness App",
          rating: 5.0,
        },
        {
          client: "QuickEats Delivery",
          feedback:
            "The food delivery app James built is smooth, fast, and our users love it. Great attention to UX details.",
          project: "Food Delivery Platform",
          rating: 4.9,
        },
      ],
      workHistory: [
        {
          company: "Shangai Holding LTD",
          position: "Senior Mobile Developer",
          duration: "2022 - Present",
          description:
            "Leading mobile app development for productivity suite, focusing on cross-platform React Native solutions.",
        },
        {
          company: "XenoTech Solutions",
          position: "Mobile Developer",
          duration: "2020 - 2022",
          description:
            "Developed features for the Xen mobile app, including payment systems and loyalty program integration.",
        },
        {
          company: "Local Startup",
          position: "iOS Developer",
          duration: "2019 - 2020",
          description:
            "Built native iOS applications for various clients, gaining experience in Swift and iOS development patterns.",
        },
      ],
    },
    {
      id: 5,
      name: "Elena Njeri",
      role: "DevOps Engineer",
      experience: "3+ years",
      location: "Thika, KE",
      avatar: "/images/dev5.jpg",
      skills: ["AWS", "Docker", "Kubernetes", "Python", "DevOps"],
      specialties: [
        "CI/CD Pipelines",
        "Infrastructure as Code",
        "Monitoring & Logging",
      ],
      availability: "Available",
      rating: 4.9,
      projectsCompleted: 41,
      gradient: "from-indigo-500/20 to-blue-500/10",
      portfolioUrl: "https://elenavolkov.dev",
      githubUrl: "https://github.com/elenavolkov",
      linkedinUrl: "https://linkedin.com/in/elenavolkov",
      bio: "DevOps engineer with extensive experience in cloud infrastructure and automated deployment strategies.",
      about:
        "I'm a DevOps engineer with 3+ years of experience building robust, scalable cloud infrastructure that enables development teams to deploy with confidence. My expertise spans the entire DevOps lifecycle, from setting up CI/CD pipelines to implementing comprehensive monitoring and logging solutions. I believe in Infrastructure as Code and have helped numerous organizations transition from manual deployment processes to fully automated, reliable systems. My experience includes working with both startups needing to scale quickly and large enterprises requiring bulletproof reliability. I'm passionate about creating systems that not only work flawlessly but also provide clear visibility into their operation.",
      languages: [
        "English (Fluent)",
        "Swahili (Native)",
        "Spanish (Intermediate)",
      ],
      education: "M.S. Systems Engineering, Technical University of Thika",
      certifications: [
        "AWS Solutions Architect Professional",
        "Certified Kubernetes Administrator",
        "HashiCorp Terraform Associate",
        "Docker Certified Associate",
        "Google Cloud Professional DevOps Engineer",
      ],
      projectHighlights: [
        {
          title: "Multi-Cloud Infrastructure Migration",
          description:
            "Led the migration of a fintech company's infrastructure from on-premise to multi-cloud setup, reducing costs by 40%.",
          tech: ["AWS", "GCP", "Terraform", "Kubernetes", "Helm"],
          duration: "8 months",
        },
        {
          title: "CI/CD Pipeline Optimization",
          description:
            "Redesigned CI/CD pipelines for a major e-commerce platform, reducing deployment time from 2 hours to 15 minutes.",
          tech: ["Jenkins", "Docker", "Kubernetes", "ArgoCD", "Prometheus"],
          duration: "3 months",
        },
        {
          title: "Disaster Recovery System",
          description:
            "Implemented comprehensive disaster recovery solution with 99.99% uptime SLA and automated failover capabilities.",
          tech: ["AWS", "Terraform", "Ansible", "CloudFormation", "Route53"],
          duration: "5 months",
        },
      ],
      testimonials: [
        {
          client: "FinTech Global",
          feedback:
            "Elena's cloud migration strategy saved us significant costs while improving our system reliability. Exceptional technical leadership.",
          project: "Multi-Cloud Migration",
          rating: 5.0,
        },
        {
          client: "E-commerce Corp",
          feedback:
            "The CI/CD improvements Elena implemented transformed our deployment process. We now deploy with confidence multiple times per day.",
          project: "CI/CD Optimization",
          rating: 4.9,
        },
      ],
      workHistory: [
        {
          company: "SAP",
          position: "Senior DevOps Engineer",
          duration: "2021 - Present",
          description:
            "Leading cloud infrastructure initiatives for enterprise software solutions, managing multi-region deployments.",
        },
        {
          company: "Zalando",
          position: "DevOps Engineer",
          duration: "2019 - 2021",
          description:
            "Built and maintained CI/CD pipelines for Europe's largest fashion e-commerce platform.",
        },
        {
          company: "AMG Group",
          position: "Cloud Engineer",
          duration: "2017 - 2019",
          description:
            "Implemented cloud solutions for automotive manufacturing systems and IoT device management.",
        },
      ],
    },
    {
      id: 6,
      name: "Chinedu Okafor ",
      role: "Blockchain Developer",
      experience: "3+ years",
      location: "Lagos, Nigeria",
      avatar: "/images/dev7.jpg",
      skills: ["Blockchain", "TypeScript", "Next.js", "Node.js"],
      specialties: ["Smart Contracts", "DeFi Protocols", "Web3 Integration"],
      availability: "Available",
      rating: 4.7,
      projectsCompleted: 19,
      gradient: "from-violet-500/20 to-purple-500/10",
      portfolioUrl: "https://alexthompson.dev",
      githubUrl: "https://github.com/alexthompson",
      linkedinUrl: "https://linkedin.com/in/alexthompson",
      bio: "Blockchain developer building next-generation decentralized applications and smart contract solutions.",
      about:
        "I'm a blockchain developer with 3+ years of experience building cutting-edge decentralized applications and smart contract solutions. My journey into blockchain began during my computer science studies when I became fascinated by the potential of decentralized systems. Since then, I've worked on various DeFi protocols, NFT marketplaces, and Web3 applications that have collectively processed over $50M in transactions. I specialize in Ethereum and Layer 2 solutions, with expertise in Solidity smart contract development and Web3 frontend integration. I'm passionate about creating user-friendly interfaces that make blockchain technology accessible to mainstream users while maintaining the security and decentralization principles that make this technology revolutionary.",
      languages: [
        "English (Native)",
        "French (Fluent)",
        "German (Conversational)",
      ],
      education: "B.S. Computer Science, Imperial College London",
      certifications: [
        "Certified Ethereum Developer",
        "ConsenSys Blockchain Developer",
        "Chainlink Developer",
        "Web3 Foundation Certified",
      ],
      projectHighlights: [
        {
          title: "DeFi Lending Protocol",
          description:
            "Built a decentralized lending protocol on Ethereum with $10M+ TVL, featuring automated liquidations and yield farming.",
          tech: ["Solidity", "React", "Web3.js", "Hardhat", "IPFS"],
          duration: "6 months",
        },
        {
          title: "NFT Marketplace",
          description:
            "Developed a gas-efficient NFT marketplace with lazy minting, royalty distribution, and multi-chain support.",
          tech: ["Solidity", "Next.js", "ethers.js", "The Graph", "Polygon"],
          duration: "4 months",
        },
        {
          title: "DAO Governance Platform",
          description:
            "Created a comprehensive DAO governance platform with proposal voting, treasury management, and delegation features.",
          tech: ["Solidity", "TypeScript", "React", "Aragon", "Gnosis Safe"],
          duration: "5 months",
        },
      ],
      testimonials: [
        {
          client: "CryptoVentures DAO",
          feedback:
            "Chinedu built an exceptional DeFi protocol that exceeded our security and performance requirements. His Web3 expertise is outstanding.",
          project: "DeFi Lending Protocol",
          rating: 5.0,
        },
        {
          client: "ArtBlock NFT",
          feedback:
            "The NFT marketplace Chinedu developed is elegant and gas-efficient. Great attention to user experience in the Web3 space.",
          project: "NFT Marketplace",
          rating: 4.7,
        },
      ],
      workHistory: [
        {
          company: "Consensys",
          position: "Blockchain Developer",
          duration: "2022 - Present",
          description:
            "Developing enterprise blockchain solutions and smart contracts for various DeFi and Web3 projects.",
        },
        {
          company: "Chainlink Labs",
          position: "Smart Contract Developer",
          duration: "2021 - 2022",
          description:
            "Built oracle integrations and smart contract solutions connecting real-world data to blockchain applications.",
        },
        {
          company: "Blockchain Startup",
          position: "Junior Developer",
          duration: "2020 - 2021",
          description:
            "Started blockchain development journey, learning Solidity and building first smart contracts and dApps.",
        },
      ],
    },
    {
      id: 7,
      name: "Mary Wanga",
      role: "AI/ML Engineer",
      experience: "4+ years",
      location: "Nairobi, KE",
      avatar: "/images/dev4.jpg",
      skills: ["Python", "Machine Learning", "React", "AWS"],
      specialties: [
        "Computer Vision",
        "NLP",
        "Data Pipeline",
        "Model Deployment",
      ],
      availability: "Available",
      rating: 4.8,
      projectsCompleted: 35,
      gradient: "from-pink-500/20 to-rose-500/10",
      portfolioUrl: "/talent/maria-santos",
      githubUrl: "https://github.com/mariasantos",
      linkedinUrl: "https://linkedin.com/in/mariasantos",
      bio: "AI/ML engineer passionate about building intelligent systems that solve real-world problems.",
      about:
        "I'm an AI/ML engineer with 5+ years of experience developing intelligent systems that solve complex real-world problems. My passion for artificial intelligence began during my PhD research in computer vision, where I published several papers on image recognition algorithms. Since then, I've applied machine learning to diverse domains including healthcare, finance, retail, and autonomous systems. I specialize in computer vision, natural language processing, and building end-to-end ML pipelines that can scale to production. My approach combines strong theoretical foundations with practical engineering skills, ensuring that the AI solutions I build are not only accurate but also maintainable and deployable at scale.",
      languages: [
        "English (Fluent)",
        "Swahili (Fluent)",
        "German (Intermediate)",
      ],
      education: "Masters Computer Vision, University of Nairobi",
      certifications: [
        "TensorFlow Developer Certificate",
        "AWS Machine Learning Specialty",
        "Google Cloud ML Engineer",
        "NVIDIA Deep Learning Institute",
      ],
      projectHighlights: [
        {
          title: "Medical Image Analysis System",
          description:
            "Developed an AI system for analyzing medical images with 95% accuracy, helping radiologists detect early-stage diseases.",
          tech: ["Python", "TensorFlow", "OpenCV", "Flask", "AWS SageMaker"],
          duration: "8 months",
        },
        {
          title: "Retail Recommendation Engine",
          description:
            "Built a personalized recommendation system for e-commerce platform, increasing sales conversion by 35%.",
          tech: ["Python", "Scikit-learn", "Apache Spark", "Redis", "Docker"],
          duration: "4 months",
        },
        {
          title: "NLP Customer Support Bot",
          description:
            "Created an intelligent chatbot using NLP that handles 80% of customer inquiries automatically with high satisfaction scores.",
          tech: ["Python", "Transformers", "BERT", "FastAPI", "MongoDB"],
          duration: "5 months",
        },
      ],
      testimonials: [
        {
          client: "MedTech Solutions",
          feedback:
            "Maria's medical AI system has revolutionized our diagnostic process. Her expertise in computer vision is world-class.",
          project: "Medical Image Analysis",
          rating: 5.0,
        },
        {
          client: "RetailGiant Corp",
          feedback:
            "The recommendation engine Maria built significantly improved our customer engagement and sales. Excellent work!",
          project: "Recommendation Engine",
          rating: 4.8,
        },
      ],
      workHistory: [
        {
          company: "Aga Khan University",
          position: "Senior ML Engineer",
          duration: "2021 - Present",
          description:
            "Leading development of computer vision models for Google Photos and developing ML infrastructure for model deployment.",
        },
        {
          company: "Kilimall ",
          position: "ML Engineer",
          duration: "2019 - 2021",
          description:
            "Built machine learning models for demand forecasting, route optimization, and fraud detection systems.",
        },
        {
          company: "University of Nairobi",
          position: "Research Scientist",
          duration: "2016 - 2019",
          description:
            "Conducted research in computer vision and deep learning, publishing papers in top-tier conferences.",
        },
      ],
    },
    {
      id: 8,
      name: "David Park",
      role: "Full Stack Developer",
      experience: "6+ years",
      location: "Vancouver, BC",
      avatar: "/images/dev8.jpg",
      skills: ["React", "Python", "PostgreSQL", "GraphQL", "Docker"],
      specialties: [
        "API Development",
        "Database Optimization",
        "System Architecture",
      ],
      availability: "Available",
      rating: 4.9,
      projectsCompleted: 52,
      gradient: "from-teal-500/20 to-cyan-500/10",
      portfolioUrl: "https://davidpark.dev",
      githubUrl: "https://github.com/davidpark",
      linkedinUrl: "https://linkedin.com/in/davidpark",
      bio: "Full-stack developer with a passion for clean code and scalable architectures in modern web applications.",
      about:
        "I'm a full-stack developer with 6+ years of experience building modern web applications from concept to deployment. My journey in software development has taken me through various industries, from fintech startups to large-scale SaaS platforms, where I've learned to balance rapid development with long-term maintainability. I specialize in API development, database optimization, and system architecture, with a particular focus on creating clean, testable code that can scale with business growth. My approach emphasizes collaboration with both technical and non-technical stakeholders, ensuring that the solutions I build not only meet technical requirements but also deliver real business value.",
      languages: [
        "English (Native)",
        "Korean (Fluent)",
        "French (Conversational)",
      ],
      education: "B.S. Software Engineering, University of British Columbia",
      certifications: [
        "AWS Solutions Architect",
        "GraphQL Certified Developer",
        "PostgreSQL Professional",
        "Agile Certified Practitioner",
      ],
      projectHighlights: [
        {
          title: "SaaS Platform Architecture",
          description:
            "Architected and built a multi-tenant SaaS platform serving 100k+ users with 99.9% uptime and sub-200ms response times.",
          tech: ["React", "Python", "PostgreSQL", "GraphQL", "AWS", "Docker"],
          duration: "10 months",
        },
        {
          title: "Financial Trading API",
          description:
            "Developed high-frequency trading API processing 50k+ transactions per second with strict latency requirements.",
          tech: ["Python", "FastAPI", "Redis", "PostgreSQL", "WebSocket"],
          duration: "6 months",
        },
        {
          title: "Content Management System",
          description:
            "Built a headless CMS with GraphQL API, serving content to multiple frontend applications with advanced caching.",
          tech: ["React", "Node.js", "GraphQL", "MongoDB", "Redis"],
          duration: "5 months",
        },
      ],
      testimonials: [
        {
          client: "TechScale Inc",
          feedback:
            "David's SaaS architecture has been rock-solid since launch. His attention to scalability and performance is exceptional.",
          project: "SaaS Platform",
          rating: 5.0,
        },
        {
          client: "TradeFlow Systems",
          feedback:
            "The trading API David built handles our high-frequency requirements flawlessly. Outstanding technical expertise.",
          project: "Trading API",
          rating: 4.9,
        },
      ],
      workHistory: [
        {
          company: "Slack",
          position: "Senior Full Stack Developer",
          duration: "2021 - Present",
          description:
            "Building scalable communication platform features, focusing on real-time messaging and API performance optimization.",
        },
        {
          company: "Hootsuite",
          position: "Full Stack Developer",
          duration: "2019 - 2021",
          description:
            "Developed social media management tools and analytics dashboards, working with high-volume social media data processing.",
        },
        {
          company: "Local Fintech Startup",
          position: "Software Developer",
          duration: "2018 - 2019",
          description:
            "Built core banking features and payment processing systems, gaining experience in financial technology requirements.",
        },
      ],
    },
    {
      id: 9,
      name: "Eric Kibuchi",
      role: "Mobile Developer",
      experience: "5+ years",
      location: "Nairobi, Kenya",
      avatar: "/images/dev9.jpg",
      skills: ["Flutter", "Dart", "Firebase", "Kotlin", "React Native"],
      specialties: [
        "Cross-Platform Development",
        "Mobile App Optimization",
        "Backend Integration",
      ],
      availability: "Available",
      rating: 4.8,
      projectsCompleted: 47,
      gradient: "from-purple-500/20 to-indigo-500/10",
      portfolioUrl: "https://erickibuichi.dev",
      githubUrl: "https://github.com/erickibuichi",
      linkedinUrl: "https://linkedin.com/in/erickibuichi",
      bio: "Experienced mobile developer focused on delivering high-performance apps across Android and iOS platforms.",
      about:
        "I'm a mobile developer with over 5 years of experience building robust, scalable applications for startups, NGOs, and enterprise clients. My core expertise lies in crafting seamless cross-platform user experiences using Flutter and React Native, with deep understanding of mobile performance optimization and backend integrations. I’m passionate about clean UI, efficient state management, and building apps that users love. From MVPs to full-scale production apps, I bring a design-driven and user-centric approach to mobile development.",
      languages: ["English (Fluent)", "Swahili (Native)", "French (Basic)"],
      education:
        "B.Sc. Computer Science, Jomo Kenyatta University of Agriculture and Technology (JKUAT)",
      certifications: [
        "Google Associate Android Developer",
        "Flutter Developer Expert (by Dart/Flutter Kenya)",
        "Firebase for Mobile Certification",
      ],
      projectHighlights: [
        {
          title: "Telemedicine App for East Africa",
          description:
            "Led mobile development for a doctor-patient video consultation platform, enabling secure real-time chats and prescription uploads.",
          tech: ["Flutter", "Firebase", "WebRTC", "Node.js"],
          duration: "7 months",
        },
        {
          title: "Ride-Hailing MVP",
          description:
            "Built a fully functional MVP for a ride-hailing service with live tracking, fare estimation, and driver-passenger chat.",
          tech: ["React Native", "Firebase", "Google Maps API"],
          duration: "6 months",
        },
        {
          title: "E-learning Platform Mobile App",
          description:
            "Developed a mobile app extension for a web-based LMS, featuring offline mode, video streaming, and progress tracking.",
          tech: ["Flutter", "Hive", "Firebase", "REST APIs"],
          duration: "5 months",
        },
      ],
      testimonials: [
        {
          client: "AfyaLink Health",
          feedback:
            "Eric was instrumental in bringing our mobile telehealth platform to life. His commitment and quality of code were top-tier.",
          project: "Telemedicine App",
          rating: 4.9,
        },
        {
          client: "SwiftRides",
          feedback:
            "From concept to MVP, Eric handled every challenge with professionalism. The app exceeded our expectations.",
          project: "Ride-Hailing MVP",
          rating: 4.8,
        },
      ],
      workHistory: [
        {
          company: "Andishi Software",
          position: "Lead Mobile Developer",
          duration: "2022 - Present",
          description:
            "Driving cross-platform mobile development for global clients. Responsible for architecture, implementation, and mentoring junior devs.",
        },
        {
          company: "Tech4Dev Africa",
          position: "Mobile Developer",
          duration: "2020 - 2022",
          description:
            "Worked on digital tools for NGOs and government initiatives, including health tracking and education platforms.",
        },
        {
          company: "Freelance",
          position: "Independent Mobile Developer",
          duration: "2018 - 2020",
          description:
            "Delivered mobile solutions for local SMEs and startups, focusing on MVPs and business process automation tools.",
        },
      ],
    },
  ];

  const roles: string[] = [
    "all",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Blockchain Developer",
    "AI/ML Engineer",
  ];

  const filteredDevelopers: Developer[] =
    selectedRole === "all"
      ? developers
      : developers.filter((dev: Developer) => dev.role === selectedRole);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        ease: "easeOut" as const,
      },
    },
  } as const;

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  } as const;

  const badgeVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const,
      },
    },
  } as const;

  // Handler for opening developer profile modal
  const handleDeveloperClick = (developer: Developer): void => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  };

  // Handler for closing modal
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedDeveloper(null);
  };

  return (
    <section id="talent" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Tech <span className="text-purple-400">Talent Pool</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Connect with our curated network of skilled developers and engineers
            ready to bring your vision to life
          </p>

          {/* Role Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {roles.map((role, index) => (
              <motion.button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-6 py-2 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer ${
                  selectedRole === role
                    ? "bg-purple-500/20 border-purple-400/50 text-gray-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-300"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {role === "all" ? "All Talent" : role}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Developers Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredDevelopers.map((developer: Developer) => (
              <motion.article
                key={developer.id}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.03) 0%, 
                    rgba(147, 51, 234, 0.02) 50%, 
                    rgba(236, 72, 153, 0.03) 100%)`,
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                {/* Colored gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${developer.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                ></div>

                {/* Availability Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <motion.span
                    className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      developer.availability === "Available"
                        ? "bg-green-500/60 text-white"
                        : "bg-orange-500/60 text-white"
                    }`}
                    variants={badgeVariants}
                  >
                    {developer.availability}
                  </motion.span>
                </div>

                {/* Developer Avatar */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                  <Image
                    src={developer.avatar}
                    alt={developer.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Social Links */}
                  {/* <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={developer.portfolioUrl}
                      className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                      aria-label="View portfolio"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                    <Link
                      href={developer.githubUrl}
                      className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                      aria-label="View GitHub profile"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div> */}
                </div>

                {/* Content */}
                <div className="relative p-6 space-y-4">
                  {/* Name and Role */}
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                      {developer.name}
                    </h3>
                    <p className="text-purple-400 text-xs mt-2 font-medium monty uppercase">
                      {developer.role}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed line-clamp-2">
                    {developer.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {developer.skills.slice(0, 3).map((skill, index) => (
                      <motion.div
                        key={skill}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          skillColors[skill] ||
                          "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }`}
                        variants={badgeVariants}
                        custom={index}
                      >
                        {skill}
                      </motion.div>
                    ))}
                    {developer.skills.length > 3 && (
                      <motion.div
                        className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/20"
                        variants={badgeVariants}
                      >
                        +{developer.skills.length - 3}
                      </motion.div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-white">
                            {developer.rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 monty uppercase ">
                          Rating
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {developer.projectsCompleted}
                        </p>
                        <p className="text-xs text-gray-500 monty uppercase ">
                          Projects
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          {developer.experience} experience
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeveloperClick(developer)}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-purple-500/30 text-gray-300 text-sm font-medium rounded-full border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating particles */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                <div
                  className="absolute bottom-6 left-6 w-1 h-1 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                  style={{ animationDelay: "1s" }}
                ></div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <motion.div
          className="flex justify-center items-center my-20 space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all duration-300"
            aria-label="Previous page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-4 cursor-pointer monty py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${
                    page === 1
                      ? "bg-blue-500/20 border-blue-400/50 text-gray-300"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all duration-300"
            aria-label="Next page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </motion.div>

        {/* Join Talent Pool Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/join-talent-pool"
            className="group inline-flex items-center space-x-2 px-8 my-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer"
          >
            <span className="monty uppercase">Join Our Talent Pool</span>
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </motion.svg>
          </Link>
        </motion.div>
      </div>

      {/* Modal - Rendered outside the grid */}
      {selectedDeveloper && (
        <DevProfileModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          developer={selectedDeveloper}
        />
      )}

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
}
