"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPlus,
  FaTrash,
  FaPhone,
  FaCheck,
  FaEnvelope,
  FaBuilding,
  FaArrowLeft,
  FaDollarSign,
  FaArrowRight,
  FaCalendarAlt,
  FaCode,
  FaGraduationCap,
  FaBriefcase,
  FaGithub,
  FaLinkedin,
  FaPortrait,
  FaFileUpload,
  FaMapMarkerAlt,
  FaClock,
  FaLanguage,
  FaHeart,
  FaTimes,
  FaStar,
  FaTools,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  timeZone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  profilePicture?: string;
}

interface ProfessionalInfo {
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

interface TechnicalSkills {
  primarySkills: string[];
  secondarySkills: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  certifications: string[];
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  role: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  workExperience: WorkExperience[];
  projects: Project[];
}

export default function DeveloperRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      timeZone: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    professionalInfo: {
      title: "",
      experienceLevel: "",
      yearsOfExperience: "",
      currentRole: "",
      currentCompany: "",
      availability: "",
      workType: [],
      languages: [],
      bio: "",
    },
    technicalSkills: {
      primarySkills: [],
      secondarySkills: [],
      frameworks: [],
      databases: [],
      tools: [],
      certifications: [],
    },
    workExperience: [],
    projects: [],
  });

  const steps = [
    { number: 1, title: "Personal Info", icon: FaUser },
    { number: 2, title: "Professional", icon: FaBriefcase },
    { number: 3, title: "Technical Skills", icon: FaCode },
    { number: 4, title: "Experience", icon: FaGraduationCap },
    { number: 5, title: "Portfolio", icon: FaPortrait },
    { number: 6, title: "Review", icon: FaCheck },
  ];

  // Tech skills options
  const primarySkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Dart",
    "C++",
    "Scala",
    "Elixir",
  ];

  const frameworks = [
    "React",
    "Next.js",
    "Vue.js",
    "Nuxt.js",
    "Angular",
    "Svelte",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Laravel",
    "Symfony",
    "Ruby on Rails",
    "Spring Boot",
    "ASP.NET",
    "Flutter",
    "React Native",
  ];

  const databases = [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Elasticsearch",
    "SQLite",
    "Oracle",
    "SQL Server",
    "Firebase",
    "Supabase",
    "DynamoDB",
  ];

  const tools = [
    "Git",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Jenkins",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "Webpack",
    "Vite",
    "Figma",
  ];

  const experienceLevels = [
    "Entry Level (0-2 years)",
    "Mid Level (3-5 years)",
    "Senior Level (6-10 years)",
    "Lead/Architect (10+ years)",
  ];

  const workTypes = ["Full-time Remote", "Contract"];

  const spokenLanguages = [
    "English",
    "Swahili",
    "Spanish",
    "French",
    "German",
    "Portuguese",
    "Italian",
    "Arabic",
    "Chinese",
    "Japanese",
    "Korean",
    "Other",
  ];

  const projectTypes = [
    "Web Applications",
    "Mobile Apps",
    "E-commerce",
    "SaaS Platforms",
    "API Development",
    "DevOps/Infrastructure",
    "AI/ML",
    "Blockchain",
    "Data Analytics",
    "CMS Development",
    "Game Development",
  ];

  const communicationTools = [
    "Slack",
    "Discord",
    "Microsoft Teams",
    "Zoom",
    "Email",
    "WhatsApp",
    "Telegram",
    "Skype",
    "Google Meet",
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 10, behavior: "smooth" });
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateProfessionalInfo = (
    field: keyof ProfessionalInfo,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      professionalInfo: { ...prev.professionalInfo, [field]: value },
    }));
  };

  const updateTechnicalSkills = (
    field: keyof TechnicalSkills,
    value: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: { ...prev.technicalSkills, [field]: value },
    }));
  };

  const toggleSkill = (
    skillArray: string[],
    skill: string,
    field: keyof TechnicalSkills
  ) => {
    const newSkills = skillArray.includes(skill)
      ? skillArray.filter((s) => s !== skill)
      : [...skillArray, skill];
    updateTechnicalSkills(field, newSkills);
  };

  const toggleArrayField = (
    currentArray: string[],
    item: string,
    updateFn: (field: any, value: any) => void,
    field: string
  ) => {
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFn(field, newArray);
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      duration: "",
      description: "",
      technologies: [],
    };
    setFormData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp],
    }));
  };

  const updateWorkExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeWorkExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      role: "",
    };
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (
    id: string,
    field: keyof Project,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    }));
  };

  const removeProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions before submitting.");
      return;
    }

    try {
      setSubmitStatus("loading");
      toast.info("Submitting your application...");

      // First create the user record in the talent pool
      const userResponse = await fetch("/api/join-talent-pool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.personalInfo.email,
          firstName: formData.personalInfo.firstName,
          lastName: formData.personalInfo.lastName,
          role: "developer",
          status: "pending",
          isActive: true,
          accountCreated: false,
          passwordGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...formData,
        }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to submit application");
      }

      const { insertedId } = await userResponse.json();

      // Then create the developer profile
      const response = await fetch("/api/developer-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: insertedId,
          data: {
            personalInfo: formData.personalInfo,
            professionalInfo: formData.professionalInfo,
            technicalSkills: formData.technicalSkills,
            workExperience: formData.workExperience,
            projects: formData.projects,
            stats: {
              totalProjects: 0,
              averageRating: 0,
              totalEarnings: 0,
              clientRetention: 0,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create developer profile");
      }

      toast.success("Successfully joined the talent pool!");
      router.push("/thank-you-join-talent-pool");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
      setSubmitStatus("error");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.personalInfo.firstName &&
          formData.personalInfo.lastName &&
          formData.personalInfo.email
        );
      case 2:
        return (
          formData.professionalInfo.title &&
          formData.professionalInfo.experienceLevel
        );
      case 3:
        return formData.technicalSkills.primarySkills.length > 0;
      case 4:
      case 5:
        return true; // Optional steps
      case 6:
        return termsAccepted;
      default:
        return true;
    }
  };

  // --- JSX ---
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <section className="min-h-screen py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 my-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Join Our <span className="text-purple-400">Developer</span>{" "}
              Network
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Connect with amazing projects and clients worldwide. Build your
              career with flexible remote opportunities.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-20 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            ></div>
            {steps.map((step) => (
              <div key={step.number} className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  <step.icon className="text-lg" />
                </div>
                <div className="absolute top-14 left-1/2 -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap monty uppercase">
                  {step.title}
                </div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                  <FaUser className="mr-3 text-blue-400" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.firstName}
                      onChange={(e) =>
                        updatePersonalInfo("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.lastName}
                      onChange={(e) =>
                        updatePersonalInfo("lastName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        updatePersonalInfo("email", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaPhone className="mr-2 text-blue-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        updatePersonalInfo("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-400" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.location}
                      onChange={(e) =>
                        updatePersonalInfo("location", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaClock className="mr-2 text-blue-400" />
                      Time Zone
                    </label>
                    <select
                      value={formData.personalInfo.timeZone}
                      onChange={(e) =>
                        updatePersonalInfo("timeZone", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="" className="bg-gray-800">
                        Select your timezone
                      </option>
                      <option value="EAT" className="bg-gray-800">
                        East Africa Time (EAT)
                      </option>
                      <option value="UTC" className="bg-gray-800">
                        UTC
                      </option>
                      <option value="EST" className="bg-gray-800">
                        Eastern Time (EST)
                      </option>
                      <option value="PST" className="bg-gray-800">
                        Pacific Time (PST)
                      </option>
                      <option value="CET" className="bg-gray-800">
                        Central European Time (CET)
                      </option>
                      <option value="Other" className="bg-gray-800">
                        Other
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaLinkedin className="mr-2 text-blue-400" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={formData.personalInfo.linkedin}
                      onChange={(e) =>
                        updatePersonalInfo("linkedin", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaGithub className="mr-2 text-blue-400" />
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={formData.personalInfo.github}
                      onChange={(e) =>
                        updatePersonalInfo("github", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={formData.personalInfo.portfolio}
                    onChange={(e) =>
                      updatePersonalInfo("portfolio", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                  <FaBriefcase className="mr-3 text-blue-400" />
                  Professional Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      value={formData.professionalInfo.title}
                      onChange={(e) =>
                        updateProfessionalInfo("title", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="e.g., Full Stack Developer, Mobile App Developer"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Experience Level *
                      </label>
                      <select
                        value={formData.professionalInfo.experienceLevel}
                        onChange={(e) =>
                          updateProfessionalInfo(
                            "experienceLevel",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                      >
                        <option value="" className="bg-gray-800">
                          Select experience level
                        </option>
                        {experienceLevels.map((level) => (
                          <option
                            key={level}
                            value={level}
                            className="bg-gray-800"
                          >
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.yearsOfExperience}
                        onChange={(e) =>
                          updateProfessionalInfo(
                            "yearsOfExperience",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="e.g., 3.5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Current Role
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.currentRole}
                        onChange={(e) =>
                          updateProfessionalInfo("currentRole", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Your current position"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Current Company
                      </label>
                      <input
                        type="text"
                        value={formData.professionalInfo.currentCompany}
                        onChange={(e) =>
                          updateProfessionalInfo(
                            "currentCompany",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Company name or 'Freelancer'"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Availability
                    </label>
                    <select
                      value={formData.professionalInfo.availability}
                      onChange={(e) =>
                        updateProfessionalInfo("availability", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="" className="bg-gray-800">
                        Select availability
                      </option>
                      <option value="immediately" className="bg-gray-800">
                        Available Immediately
                      </option>
                      <option value="2weeks" className="bg-gray-800">
                        Available in 2 weeks
                      </option>
                      <option value="1month" className="bg-gray-800">
                        Available in 1 month
                      </option>
                      <option value="2months" className="bg-gray-800">
                        Available in 2+ months
                      </option>
                      <option value="not-looking" className="bg-gray-800">
                        Not actively looking
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Preferred Work Types
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {workTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            toggleArrayField(
                              formData.professionalInfo.workType,
                              type,
                              updateProfessionalInfo,
                              "workType"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.professionalInfo.workType.includes(type)
                              ? "bg-blue-500/20 border-blue-400 text-blue-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaLanguage className="mr-2 text-blue-400" />
                      Languages Spoken
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {spokenLanguages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() =>
                            toggleArrayField(
                              formData.professionalInfo.languages,
                              lang,
                              updateProfessionalInfo,
                              "languages"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.professionalInfo.languages.includes(lang)
                              ? "bg-blue-500/20 border-blue-400 text-blue-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      value={formData.professionalInfo.bio}
                      onChange={(e) =>
                        updateProfessionalInfo("bio", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="Tell us about yourself, your experience, and what makes you unique..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Technical Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                  <FaCode className="mr-3 text-blue-400" />
                  Technical Skills
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-4">
                      Primary Programming Languages *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {primarySkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            toggleSkill(
                              formData.technicalSkills.primarySkills,
                              skill,
                              "primarySkills"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.technicalSkills.primarySkills.includes(
                              skill
                            )
                              ? "bg-blue-500/20 border-blue-400 text-blue-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-4">
                      Frameworks & Libraries
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {frameworks.map((framework) => (
                        <button
                          key={framework}
                          type="button"
                          onClick={() =>
                            toggleSkill(
                              formData.technicalSkills.frameworks,
                              framework,
                              "frameworks"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.technicalSkills.frameworks.includes(
                              framework
                            )
                              ? "bg-purple-500/20 border-purple-400 text-purple-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {framework}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-4">
                      Databases
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {databases.map((db) => (
                        <button
                          key={db}
                          type="button"
                          onClick={() =>
                            toggleSkill(
                              formData.technicalSkills.databases,
                              db,
                              "databases"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.technicalSkills.databases.includes(db)
                              ? "bg-green-500/20 border-green-400 text-green-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {db}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-4">
                      Tools & Technologies
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tools.map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          onClick={() =>
                            toggleSkill(
                              formData.technicalSkills.tools,
                              tool,
                              "tools"
                            )
                          }
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                            formData.technicalSkills.tools.includes(tool)
                              ? "bg-orange-500/20 border-orange-400 text-orange-300"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Certifications
                    </label>
                    <textarea
                      value={formData.technicalSkills.certifications.join(", ")}
                      onChange={(e) =>
                        updateTechnicalSkills(
                          "certifications",
                          e.target.value
                            .split(", ")
                            .filter((cert) => cert.trim())
                        )
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="List your certifications, separated by commas (e.g., AWS Solutions Architect, Google Cloud Professional, etc.)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Work Experience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <FaGraduationCap className="mr-3 text-blue-400" />
                    Work Experience
                  </h2>
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Experience
                  </button>
                </div>
                <div className="space-y-6">
                  {formData.workExperience.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="p-6 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">
                          Experience #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeWorkExperience(exp.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "company",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Position
                          </label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "position",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Job title"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "duration",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder="e.g., Jan 2022 - Present"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                          placeholder="Describe your role and achievements..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Technologies Used
                        </label>
                        <input
                          type="text"
                          value={exp.technologies.join(", ")}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "technologies",
                              e.target.value
                                .split(", ")
                                .filter((tech) => tech.trim())
                            )
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder="React, Node.js, PostgreSQL, etc."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Portfolio Projects */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <FaPortrait className="mr-3 text-blue-400" />
                    Portfolio Projects
                  </h2>
                  <button
                    type="button"
                    onClick={addProject}
                    className="flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Project
                  </button>
                </div>
                <div className="space-y-6">
                  {formData.projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="p-6 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">
                          Project #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeProject(project.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) =>
                              updateProject(project.id, "name", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Project name"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Your Role
                          </label>
                          <input
                            type="text"
                            value={project.role}
                            onChange={(e) =>
                              updateProject(project.id, "role", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="e.g., Full Stack Developer, Lead Developer"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(
                              project.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                          placeholder="Describe the project, its purpose, and your contributions..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Live URL
                          </label>
                          <input
                            type="url"
                            value={project.liveUrl || ""}
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "liveUrl",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="https://project-demo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            value={project.githubUrl || ""}
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "githubUrl",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Technologies Used
                        </label>
                        <input
                          type="text"
                          value={project.technologies.join(", ")}
                          onChange={(e) =>
                            updateProject(
                              project.id,
                              "technologies",
                              e.target.value
                                .split(", ")
                                .filter((tech) => tech.trim())
                            )
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder="React, Node.js, MongoDB, etc."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                  <FaCheck className="mr-3 text-blue-400" />
                  Review Your Application
                </h2>

                {/* Personal Info Review */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-400" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>{" "}
                      <span className="text-white">
                        {formData.personalInfo.firstName}{" "}
                        {formData.personalInfo.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      <span className="text-white">
                        {formData.personalInfo.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>{" "}
                      <span className="text-white">
                        {formData.personalInfo.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>{" "}
                      <span className="text-white">
                        {formData.personalInfo.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timezone:</span>{" "}
                      <span className="text-white">
                        {formData.personalInfo.timeZone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Info Review */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <FaBriefcase className="mr-2 text-blue-400" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Title:</span>{" "}
                      <span className="text-white">
                        {formData.professionalInfo.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Experience:</span>{" "}
                      <span className="text-white">
                        {formData.professionalInfo.experienceLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Years:</span>{" "}
                      <span className="text-white">
                        {formData.professionalInfo.yearsOfExperience}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Availability:</span>{" "}
                      <span className="text-white">
                        {formData.professionalInfo.availability}
                      </span>
                    </div>
                  </div>
                  {formData.professionalInfo.workType.length > 0 && (
                    <div className="mt-4">
                      <span className="text-gray-400">Work Types:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.professionalInfo.workType.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-500/20 border border-blue-400 text-blue-300 rounded text-xs"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Skills Review */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <FaCode className="mr-2 text-blue-400" />
                    Technical Skills
                  </h3>
                  {formData.technicalSkills.primarySkills.length > 0 && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">
                        Primary Skills:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technicalSkills.primarySkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-500/20 border border-blue-400 text-blue-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.technicalSkills.frameworks.length > 0 && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">Frameworks:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technicalSkills.frameworks.map(
                          (framework) => (
                            <span
                              key={framework}
                              className="px-2 py-1 bg-purple-500/20 border border-purple-400 text-purple-300 rounded text-xs"
                            >
                              {framework}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Privacy Policy
                      </a>
                      . I understand that my information will be shared with
                      potential clients for project matching purposes.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-16 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  currentStep === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                }`}
              >
                <FaArrowLeft className="text-[15.5px" />
                <span>Previous</span>
              </button>

              <div className="text-center flex place-self-center text-[15.5px] text-gray-400">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ml-auto ${
                    isStepValid()
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                      : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid() || submitStatus === "loading"}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ml-auto ${
                    isStepValid() && submitStatus !== "loading"
                      ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitStatus === "loading" ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Application
                      <FaCheck className="ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ambient background effects */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </section>
    </>
  );
}
