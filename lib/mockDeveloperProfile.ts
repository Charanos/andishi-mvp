// Mock developer profile data used for initial database seeding.
// Keeping it in a dedicated file avoids shipping large mock objects to the client bundle
// and provides a single source-of-truth for any future seeds or tests.
// The shape intentionally matches the structure consumed by the developer dashboard.

import type { DeveloperProfile } from "./types";

export const mockDeveloperProfile: Omit<DeveloperProfile, 'id'> = {
  personalInfo: {
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@techtalent.dev",
    phone: "+1 (555) 987-6543",
    location: "Seattle, WA",
    timeZone: "PST (UTC-8)",
    linkedin: "https://linkedin.com/in/alexchen",
    github: "https://github.com/alexchen",
    portfolio: "https://alexchen.dev",
    tagline: "Full-Stack Architect • AI Enthusiast • Open Source Contributor"
  },
  professionalInfo: {
    title: "Senior Full Stack Architect",
    experienceLevel: "Senior",
    yearsOfExperience: "10+",
    availability: "Full-time",
    languages: ["English", "Mandarin", "Japanese"],
    bio: "Passionate full-stack architect with deep expertise in scalable web applications, AI integration, and cloud infrastructure. Led 50+ successful projects with a focus on performance optimization and user experience.",
    hourlyRate: 125,
    preferredWorkType: ["Remote", "Hybrid", "Consulting"],
    workingHours: "9 AM - 6 PM PST",
    certifications: [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional",
      "MongoDB Certified Developer"
    ]
  },
  technicalSkills: {
    primarySkills: [
      { name: "TypeScript", level: 95, category: "Language", trending: "up", endorsements: 47, lastUsed: "2024-01-15" },
      { name: "React", level: 92, category: "Frontend", trending: "stable", endorsements: 52, lastUsed: "2024-01-15" },
      { name: "Node.js", level: 90, category: "Backend", trending: "up", endorsements: 38, lastUsed: "2024-01-14" },
      { name: "Python", level: 88, category: "Language", trending: "up", endorsements: 31, lastUsed: "2024-01-12" },
      { name: "Go", level: 82, category: "Language", trending: "up", endorsements: 23, lastUsed: "2024-01-10" }
    ],
    frameworks: [
      { name: "Next.js", level: 94, category: "Frontend", trending: "up", endorsements: 41, lastUsed: "2024-01-15" },
      { name: "Express.js", level: 87, category: "Backend", trending: "stable", endorsements: 29, lastUsed: "2024-01-13" },
      { name: "FastAPI", level: 85, category: "Backend", trending: "up", endorsements: 26, lastUsed: "2024-01-11" },
      { name: "TailwindCSS", level: 91, category: "Styling", trending: "up", endorsements: 35, lastUsed: "2024-01-15" }
    ],
    databases: [
      { name: "PostgreSQL", level: 89, category: "SQL", trending: "stable", endorsements: 33, lastUsed: "2024-01-14" },
      { name: "MongoDB", level: 86, category: "NoSQL", trending: "up", endorsements: 28, lastUsed: "2024-01-13" },
      { name: "Redis", level: 83, category: "Cache", trending: "stable", endorsements: 21, lastUsed: "2024-01-12" }
    ],
    tools: [
      { name: "Docker", level: 91, category: "DevOps", trending: "stable", endorsements: 39, lastUsed: "2024-01-15" },
      { name: "Kubernetes", level: 84, category: "DevOps", trending: "up", endorsements: 27, lastUsed: "2024-01-14" },
      { name: "GitHub Actions", level: 87, category: "CI/CD", trending: "up", endorsements: 32, lastUsed: "2024-01-15" }
    ],
    cloudPlatforms: ["AWS", "Google Cloud", "Azure", "Vercel", "Railway"],
    specializations: [
      "Microservices",
      "AI/ML Integration",
      "Performance Optimization",
      "Security",
      "Scalable Architecture"
    ]
  },
  projects: [
    {
      id: "1",
      title: "AI-Powered E-commerce Platform",
      description: "Next-gen e-commerce platform with ML-based recommendations, real-time inventory management, and advanced analytics dashboard",
      status: "in-progress",
      startDate: "2024-01-01",
      deadline: "2024-06-30",
      budget: 75000,
      team: ["Alex Chen", "Bob Johnson", "Charlie Brown"],
      progress: 68,
      priority: "high",
      client: "TechCorp Inc.",
      teamSize: 6,
      technologies: [
        "Next.js",
        "TypeScript",
        "Python",
        "TensorFlow",
        "PostgreSQL",
        "Redis",
        "AWS"
      ],
      riskLevel: "medium",
      satisfaction: 5,
      metrics: {
        linesOfCode: 125000,
        commits: 487,
        testsWritten: 856,
        bugsFixed: 23,
        codeReviews: 67
      },
      tasks: [
        {
          id: "t1",
          title: "ML Recommendation Engine",
          completed: true,
          priority: "high",
          estimatedHours: 80,
          actualHours: 92
        },
        {
          id: "t2",
          title: "Real-time Analytics Dashboard",
          completed: true,
          priority: "high",
          estimatedHours: 60,
          actualHours: 58
        },
        {
          id: "t3",
          title: "Payment Gateway Integration",
          completed: false,
          priority: "medium",
          estimatedHours: 40
        },
        {
          id: "t4",
          title: "Mobile App Development",
          completed: false,
          priority: "high",
          estimatedHours: 120
        },
        {
          id: "t5",
          title: "Performance Optimization",
          completed: false,
          priority: "medium",
          estimatedHours: 32
        }
      ],
      milestones: [
        {
          id: "m1",
          title: "MVP Release",
          dueDate: "2024-03-15",
          completed: true,
          payment: 25000
        },
        {
          id: "m2",
          title: "Beta Launch",
          dueDate: "2024-05-01",
          completed: false,
          payment: 25000
        },
        {
          id: "m3",
          title: "Production Release",
          dueDate: "2024-06-30",
          completed: false,
          payment: 25000
        }
      ]
    },
    {
      id: "2",
      title: "Healthcare Data Analytics Platform",
      description: "HIPAA-compliant analytics platform for healthcare providers with real-time patient monitoring and predictive analytics",
      status: "review",
      startDate: "2023-09-01",
      deadline: "2024-02-29",
      budget: 95000,
      team: ["Alex Chen", "David Williams", "Eve Davis"],
      progress: 95,
      priority: "critical",
      client: "MediTech Solutions",
      teamSize: 8,
      technologies: [
        "React",
        "Node.js",
        "Python",
        "TensorFlow",
        "PostgreSQL",
        "Docker",
        "AWS"
      ],
      riskLevel: "low",
      satisfaction: 5,
      metrics: {
        linesOfCode: 180000,
        commits: 623,
        testsWritten: 1247,
        bugsFixed: 18,
        codeReviews: 89
      },
      tasks: [
        {
          id: "t6",
          title: "Security Audit",
          completed: true,
          priority: "high",
          estimatedHours: 60,
          actualHours: 65
        },
        {
          id: "t7",
          title: "HIPAA Compliance Review",
          completed: true,
          priority: "high",
          estimatedHours: 40,
          actualHours: 48
        },
        {
          id: "t8",
          title: "Performance Testing",
          completed: false,
          priority: "high",
          estimatedHours: 32
        }
      ],
      milestones: [
        {
          id: "m4",
          title: "Alpha Release",
          dueDate: "2023-12-01",
          completed: true,
          payment: 30000
        },
        {
          id: "m5",
          title: "Security Certification",
          dueDate: "2024-01-15",
          completed: true,
          payment: 35000
        },
        {
          id: "m6",
          title: "Final Delivery",
          dueDate: "2024-02-29",
          completed: false,
          payment: 30000
        }
      ]
    },
    {
      id: "3",
      title: "Real-time Collaboration Tool",
      description: "Slack-like collaboration platform with video conferencing, file sharing, and AI-powered meeting summaries",
      status: "completed",
      startDate: "2023-06-01",
      deadline: "2023-11-30",
      budget: 60000,
      team: ["Alex Chen", "Frank Miller", "Grace Wilson"],
      progress: 100,
      priority: "medium",
      client: "StartupXYZ",
      teamSize: 4,
      technologies: ["Next.js", "Socket.io", "WebRTC", "MongoDB", "Redis"],
      riskLevel: "low",
      satisfaction: 4,
      metrics: {
        linesOfCode: 95000,
        commits: 412,
        testsWritten: 687,
        bugsFixed: 31,
        codeReviews: 54
      },
      tasks: [
        {
          id: "t9",
          title: "Real-time Messaging",
          completed: true,
          priority: "high",
          estimatedHours: 80,
          actualHours: 85
        },
        {
          id: "t10",
          title: "Video Conferencing",
          completed: true,
          priority: "high",
          estimatedHours: 100,
          actualHours: 120
        },
        {
          id: "t11",
          title: "AI Meeting Summarizer",
          completed: true,
          priority: "medium",
          estimatedHours: 60,
          actualHours: 75
        }
      ],
      milestones: [
        {
          id: "m7",
          title: "Core Features",
          dueDate: "2023-08-15",
          completed: true,
          payment: 20000
        },
        {
          id: "m8",
          title: "Advanced Features",
          dueDate: "2023-10-15",
          completed: true,
          payment: 20000
        },
        {
          id: "m9",
          title: "Polish & Launch",
          dueDate: "2023-11-30",
          completed: true,
          payment: 20000
        }
      ]
    }
  ],
  stats: {
    totalProjects: 47,
    completedProjects: 43,
    totalEarnings: 890000,
    averageRating: 4.8,
    totalCodeLines: 2400000,
    activeDays: 1247,
    clientRetention: 89,
    responseTime: "< 2 hours",
    totalCommits: 5847,
    bugsFixed: 234,
    codeReviewsGiven: 456,
    mentoringSessions: 78
  },
  achievements: [
    {
      id: "1",
      title: "Code Ninja",
      description: "Wrote 1M+ lines of production code",
      icon: "ninja",
      earnedDate: "2024-01-10",
      category: "technical",
      rarity: "epic"
    },
    {
      id: "2",
      title: "Perfect Score",
      description: "Maintained 5-star rating for 10+ projects",
      icon: "star",
      earnedDate: "2024-01-05",
      category: "project",
      rarity: "legendary"
    },
    {
      id: "3",
      title: "Fast Responder",
      description: "Average response time under 2 hours",
      icon: "lightning",
      earnedDate: "2023-12-20",
      category: "collaboration",
      rarity: "rare"
    }
  ],
  recentActivity: [
    {
      id: "1",
      action: "Completed task: ML Recommendation Engine",
      timestamp: "2 hours ago",
      type: "task"
    },
    {
      id: "2",
      action: "Received 5-star rating from TechCorp Inc.",
      timestamp: "1 day ago",
      type: "feedback"
    },
    {
      id: "3",
      action: "Committed 15 files to AI-E-commerce project",
      timestamp: "1 day ago",
      type: "code"
    },
    {
      id: "4",
      action: "Earned 'Code Ninja' achievement",
      timestamp: "5 days ago",
      type: "achievement"
    }
  ],
  notifications: [
    {
      id: "1",
      type: "deadline",
      title: "Project Deadline Approaching",
      message: "Healthcare Analytics Platform deadline is in 15 days",
      timestamp: "1 hour ago",
      read: false,
      priority: "high"
    },
    {
      id: "2",
      type: "project",
      title: "New Project Invitation",
      message: "You've been invited to join 'FinTech Dashboard' project",
      timestamp: "3 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "achievement",
      title: "Achievement Unlocked!",
      message: "You've earned the 'Code Ninja' achievement",
      timestamp: "5 days ago",
      read: true,
      priority: "low"
    }
  ],
  timeEntries: [
    {
      date: "2024-01-15",
      hours: 8.5,
      project: "AI-E-commerce",
      description: "Frontend optimization and bug fixes"
    },
    {
      date: "2024-01-14",
      hours: 7.0,
      project: "Healthcare Analytics",
      description: "Security audit implementation"
    },
    {
      date: "2024-01-13",
      hours: 6.5,
      project: "AI-E-commerce",
      description: "API development and testing"
    }
  ]
};
