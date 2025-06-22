// types.ts
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  timeZone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  profilePicture: string;
}

export interface ProfessionalInfo {
  title: string;
  experienceLevel: string;
  yearsOfExperience: string;
  currentRole: string;
  currentCompany: string;
  availability: string;
  workType: string[];
  languages: string[];
  bio: string;
}

export interface TechnicalSkills {
  primarySkills: string[];
  secondarySkills: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  certifications: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  role: string;
}

export interface RatesAndPreferences {
  currency: string;
  workingHours: string;
  communicationPreferences: string[];
}

export interface DeveloperData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  workExperience: WorkExperience[];
  projects: Project[];
  ratesAndPreferences: RatesAndPreferences;
}

// dummyData.ts
export const dummyDeveloperData: DeveloperData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
    location: "Nairobi, Kenya",
    timeZone: "EAT",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.dev",
    profilePicture: ""
  },
  professionalInfo: {
    title: "Full Stack Developer",
    experienceLevel: "Mid Level (3-5 years)",
    yearsOfExperience: "4",
    currentRole: "Senior Frontend Developer",
    currentCompany: "Tech Solutions Ltd",
    availability: "2weeks",
    workType: ["Full-time Remote", "Contract"],
    languages: ["English", "Swahili"],
    bio: "Passionate full-stack developer with 4 years of experience building scalable web applications. I specialize in React, Node.js, and cloud technologies. I love solving complex problems and creating user-friendly interfaces that make a difference."
  },
  technicalSkills: {
    primarySkills: ["JavaScript", "TypeScript", "Python"],
    secondarySkills: ["Java", "PHP"],
    frameworks: ["React", "Next.js", "Node.js", "Django"],
    databases: ["PostgreSQL", "MongoDB", "Redis"],
    tools: ["Git", "Docker", "AWS", "Figma"],
    certifications: ["AWS Certified Developer", "React Professional Certificate"]
  },
  workExperience: [
    {
      id: "1",
      company: "Tech Solutions Ltd",
      position: "Senior Frontend Developer",
      duration: "Jan 2022 - Present",
      description: "Lead frontend development for multiple client projects, mentor junior developers, and implement modern React applications with TypeScript.",
      technologies: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"]
    },
    {
      id: "2",
      company: "Digital Innovations",
      position: "Full Stack Developer",
      duration: "Mar 2020 - Dec 2021",
      description: "Developed and maintained web applications using React and Node.js, integrated third-party APIs, and optimized database performance.",
      technologies: ["React", "Node.js", "MongoDB", "Express.js", "AWS"]
    }
  ],
  projects: [
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Built a complete e-commerce solution with payment integration, inventory management, and admin dashboard.",
      technologies: ["React", "Next.js", "Stripe", "PostgreSQL", "Prisma"],
      liveUrl: "https://ecommerce-demo.com",
      githubUrl: "https://github.com/johndoe/ecommerce-platform",
      role: "Lead Developer"
    },
    {
      id: "2",
      name: "Task Management App",
      description: "Developed a collaborative task management application with real-time updates and team collaboration features.",
      technologies: ["React", "Socket.io", "Node.js", "MongoDB"],
      liveUrl: "https://taskmanager-demo.com",
      githubUrl: "https://github.com/johndoe/task-manager",
      role: "Full Stack Developer"
    }
  ],
  ratesAndPreferences: {
    currency: "USD",
    workingHours: "40 hours/week",
    communicationPreferences: ["Slack", "Email", "Zoom"]
  }
};