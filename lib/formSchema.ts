import { z } from 'zod';

// --- Project Forms Schemas ---

export const userInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export const projectDetailsSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().min(10, 'Project description is required'),
  category: z.string().optional(),
  timeline: z.string().optional(),
  urgency: z.string().optional(),
  techStack: z.array(z.string()).min(1, 'Please select at least one technology').default([]),
  requirements: z.string().optional(),
});

export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().min(1, 'Milestone description is required'),
  budget: z.string().min(1, 'Milestone budget is required'),
  timeline: z.string().min(1, 'Milestone timeline is required'),
});

export const pricingSchema = z.object({
  type: z.enum(['fixed', 'milestone', 'hourly']),
  currency: z.enum(['USD', 'KES']),
  fixedBudget: z.string().optional(),
  milestones: z.array(milestoneSchema).default([]),
  hourlyRate: z.string().optional(),
  estimatedHours: z.string().optional(),
}).refine(
  (data) => data.type !== 'milestone' || (data.milestones && data.milestones.length > 0),
  {
    message: 'Please add at least one milestone for milestone-based pricing.',
    path: ['milestones'],
  }
);

export const startProjectFormSchema = z.object({
  userInfo: userInfoSchema,
  projectDetails: projectDetailsSchema,
  pricing: pricingSchema,
});

export type StartProjectForm = z.infer<typeof startProjectFormSchema>;

// --- Tech Talent Pool Forms Schemas ---

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[+]?\d{10,}$/, 'Please enter a valid phone number'),
  location: z.string().min(2, 'Location is required'),
  timeZone: z.string().optional(),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  portfolio: z.string().url('Please enter a valid Portfolio URL').optional().or(z.literal('')),
  profilePicture: z.string().optional(),
});

export const professionalInfoSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  experienceLevel: z.string().min(2, 'Experience level is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  currentRole: z.string().min(2, 'Current role is required'),
  currentCompany: z.string().min(2, 'Current company is required'),
  availability: z.string().min(2, 'Availability is required'),
  workType: z.array(z.string()).min(1, 'Please select at least one work type'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must not exceed 500 characters'),
});

export const technicalSkillsSchema = z.object({
  primarySkills: z.array(z.string()).min(1, 'Please select at least one primary skill'),
  secondarySkills: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const workExperienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(300, 'Description must not exceed 300 characters'),
  technologies: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(300, 'Description must not exceed 300 characters'),
  technologies: z.array(z.string())
    .min(1, 'Please select at least 1 technology'),
  duration: z.string().min(1, 'Duration is required'),
  url: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  role: z.string().min(2, 'Your role is required'),
  impact: z.string().optional(),
});

export const ratesAndPreferencesSchema = z.object({
  hourlyRate: z.string().min(1, 'Hourly rate is required'),
  currency: z.enum(['USD', 'KES'], { required_error: 'Please select a currency' }),
  workingHours: z.string().min(1, 'Working hours are required'),
  communicationPreferences: z.array(z.string()).min(1, 'Please select at least one communication preference'),
});

export const educationSchema = z.object({
  degree: z.string().min(2, 'Degree is required'),
  institution: z.string().min(2, 'Institution is required'),
  year: z.string()
    .min(4, 'Please enter a valid year')
    .max(4, 'Please enter a valid year')
    .regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  field: z.string().optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(2, 'Certification name is required'),
  issuer: z.string().min(2, 'Issuing organization is required'),
  year: z.string()
    .min(4, 'Please enter a valid year')
    .max(4, 'Please enter a valid year')
    .regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  url: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

export const additionalInfoSchema = z.object({
  education: z.array(educationSchema)
    .min(1, 'Please add at least one education entry'),
  certifications: z.array(certificationSchema).default([]),
  workExperience: z.array(workExperienceSchema)
    .min(1, 'Please add at least one work experience entry'),
  projectHighlights: z.array(projectSchema)
    .min(2, 'Please add at least 2 project highlights')
    .max(5, 'Please add no more than 5 project highlights'),
  achievements: z.string()
    .max(500, 'Achievements must not exceed 500 characters')
    .optional(),
  interests: z.string()
    .max(200, 'Interests must not exceed 200 characters')
    .optional(),
  references: z.boolean().default(false),
  backgroundCheck: z.boolean().default(false),
  remoteWork: z.boolean().default(true),
  relocation: z.boolean().default(false),
  additionalNotes: z.string()
    .max(300, 'Additional notes must not exceed 300 characters')
    .optional(),
});

export const joinTechTalentPoolSchema = z.object({
  personalInfo: personalInfoSchema,
  professionalInfo: professionalInfoSchema,
  technicalSkills: technicalSkillsSchema,
  workExperience: z.array(workExperienceSchema),
  projects: z.array(projectSchema),
  ratesAndPreferences: ratesAndPreferencesSchema,
  additionalInfo: additionalInfoSchema,
}).refine(
  (data) => {
    // Validate that if current is true in work experience, endDate should be empty
    return data.workExperience.every(exp =>
      !exp.current || !exp.endDate || exp.endDate === ''
    );
  },
  {
    message: 'End date should be empty for current positions',
    path: ['workExperience'],
  }
).refine(
  (data) => {
    // Validate URLs if provided
    const urls = [
      data.personalInfo.portfolio,
      data.personalInfo.github,
      data.personalInfo.linkedin
    ].filter(url => url && url !== '');

    return urls.every(url => {
      try {
        new URL(url as string);
        return true;
      } catch {
        return false;
      }
    });
  },
  {
    message: 'Please provide valid URLs for portfolio, GitHub, and LinkedIn',
    path: ['personalInfo'],
  }
);

export type JoinTechTalentPoolForm = z.infer<typeof joinTechTalentPoolSchema>;

// --- Helper Schemas for Form Steps ---

export const personalInfoStepSchema = personalInfoSchema;
export const professionalInfoStepSchema = professionalInfoSchema;
export const additionalInfoStepSchema = additionalInfoSchema;

// --- Validation for Individual Sections (Types) ---

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type AdditionalInfo = z.infer<typeof additionalInfoSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type ProjectHighlight = z.infer<typeof projectSchema>;

// --- Common Validation Utilities ---

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUrl = (url: string): boolean => {
  if (!url || url === '') return true; // Optional URLs
  return z.string().url().safeParse(url).success;
};

export const validatePhoneNumber = (phone: string): boolean => {
  return z.string()
    .min(10)
    .regex(/^[+]?[\d\s\-()]+$/)
    .safeParse(phone).success;
};

// --- Predefined Options for Form Dropdowns ---

export const ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Blockchain Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Product Manager',
  'Other'
] as const;

export const EXPERIENCE_LEVELS = [
  'Junior (0-2 years)',
  'Mid-level (2-5 years)',
  'Senior (5-8 years)',
  'Lead (8+ years)',
  'Principal/Architect (10+ years)'
] as const;

export const AVAILABILITY_OPTIONS = [
  'Available immediately',
  'Available in 2 weeks',
  'Available in 1 month',
  'Available in 2-3 months',
  'Not currently available'
] as const;

export const WORK_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Open to all'
] as const;

export const CURRENCIES = ['USD', 'KES'] as const;

export const RATE_PERIODS = [
  'hour',
  'day',
  'week',
  'month',
  'project'
] as const;

export const COMMON_SKILLS = [
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express.js',
  'Python',
  'Django',
  'Flask',
  'JavaScript',
  'TypeScript',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Bootstrap',
  'Sass/SCSS',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Firebase',
  'AWS',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Git',
  'GitHub',
  'GitLab',
  'REST APIs',
  'GraphQL',
  'Redux',
  'Zustand',
  'React Native',
  'Flutter',
  'iOS',
  'Android',
  'Swift',
  'Kotlin',
  'Java',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Blockchain',
  'Solidity',
  'Web3',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Data Analysis',
  'Pandas',
  'NumPy'
] as const;

export const SPECIALTIES = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile App Development',
  'Web App Development',
  'E-commerce Development',
  'API Development',
  'Database Design',
  'Cloud Architecture',
  'DevOps & CI/CD',
  'Blockchain Development',
  'Smart Contracts',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Performance Optimization',
  'Security Implementation',
  'Microservices',
  'Serverless Architecture',
  'Progressive Web Apps',
  'Real-time Applications',
  'IoT Development',
  'Game Development',
  'AR/VR Development',
  'Automation & Scripting'
] as const;

export const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Dart',
  'C++',
  'C',
  'Scala',
  'Clojure',
  'Elixir',
  'Haskell',
  'R',
  'MATLAB',
  'SQL',
  'Solidity',
  'Assembly'
] as const;