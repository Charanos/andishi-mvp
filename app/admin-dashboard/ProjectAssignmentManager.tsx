"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaStar,
  FaClock,
  FaCode,
  FaUsers,
  FaExclamationTriangle,
  FaInfoCircle,
  FaRocket,
  FaChartLine,
  FaGem,
  FaFire,
  FaShieldAlt,
  FaLightbulb,
  FaEye,
  FaUserTie,
  FaCalendarAlt,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaBolt,
  FaAward,
  FaBullseye,
  FaHeart,
  FaUserPlus,
} from "react-icons/fa";

interface Developer {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
  };
  professionalInfo: {
    title: string;
    experienceLevel: string;
    availability: string;
    hourlyRate: number;
  };
  technicalSkills: {
    primarySkills: string[];
    frameworks: string[];
    specializations: string[];
  };
  stats: {
    totalProjects: number;
    averageRating: number;
    clientRetention: number;
  };
  currentProjects?: number;
  isAvailable?: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  techStack: string[];
  budget: number;
  timeline: string;
  requiredSkills: string[];
  experienceLevel: string;
  assignedDevelopers?: string[];
  maxTeamSize: number;
}

interface Assignment {
  projectId: string;
  developerId: string;
  assignedAt: string;
  role: string;
  status: "pending" | "accepted" | "rejected";
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const ProjectAssignmentManager: React.FC = () => {
  // Core data state
  const [developers, setDevelopers] = useState<Developer[]>([
    {
      id: "dev1",
      personalInfo: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        location: "San Francisco, CA",
      },
      professionalInfo: {
        title: "Senior Full Stack Developer",
        experienceLevel: "Senior",
        availability: "Available",
        hourlyRate: 85,
      },
      technicalSkills: {
        primarySkills: ["React", "Node.js", "TypeScript", "Python"],
        frameworks: ["Next.js", "Express.js", "Django"],
        specializations: ["Cloud Architecture", "DevOps", "UI/UX"],
      },
      stats: {
        totalProjects: 42,
        averageRating: 4.9,
        clientRetention: 95,
      },
      currentProjects: 1,
      isAvailable: true,
    },
    {
      id: "dev2",
      personalInfo: {
        firstName: "Marcus",
        lastName: "Chen",
        email: "marcus.chen@example.com",
        location: "New York, NY",
      },
      professionalInfo: {
        title: "Mobile App Developer",
        experienceLevel: "Mid-level",
        availability: "Available",
        hourlyRate: 65,
      },
      technicalSkills: {
        primarySkills: ["React Native", "Swift", "Kotlin", "Flutter"],
        frameworks: ["Expo", "Firebase", "Redux"],
        specializations: [
          "iOS Development",
          "Android Development",
          "Cross-platform",
        ],
      },
      stats: {
        totalProjects: 28,
        averageRating: 4.7,
        clientRetention: 88,
      },
      currentProjects: 0,
      isAvailable: true,
    },
    {
      id: "dev3",
      personalInfo: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@example.com",
        location: "Austin, TX",
      },
      professionalInfo: {
        title: "DevOps Engineer",
        experienceLevel: "Senior",
        availability: "Busy",
        hourlyRate: 90,
      },
      technicalSkills: {
        primarySkills: ["Docker", "Kubernetes", "AWS", "Terraform"],
        frameworks: ["Jenkins", "GitLab CI", "Ansible"],
        specializations: ["Cloud Infrastructure", "Monitoring", "Security"],
      },
      stats: {
        totalProjects: 35,
        averageRating: 4.8,
        clientRetention: 92,
      },
      currentProjects: 3,
      isAvailable: false,
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj1",
      title: "E-commerce Platform Redesign",
      description:
        "Complete redesign and development of a modern e-commerce platform with advanced features",
      status: "pending",
      priority: "high",
      techStack: ["React", "Node.js", "MongoDB", "Stripe"],
      budget: 25000,
      timeline: "3 months",
      requiredSkills: ["React", "Node.js", "MongoDB", "Payment Integration"],
      experienceLevel: "Senior",
      assignedDevelopers: [],
      maxTeamSize: 3,
    },
    {
      id: "proj2",
      title: "Mobile Banking App",
      description:
        "Secure mobile banking application with biometric authentication and real-time transactions",
      status: "pending",
      priority: "high",
      techStack: ["React Native", "Firebase", "Plaid API"],
      budget: 45000,
      timeline: "6 months",
      requiredSkills: ["React Native", "Security", "Financial APIs"],
      experienceLevel: "Senior",
      assignedDevelopers: [],
      maxTeamSize: 2,
    },
    {
      id: "proj3",
      title: "SaaS Analytics Dashboard",
      description:
        "Real-time analytics dashboard for SaaS businesses with custom reporting",
      status: "pending",
      priority: "medium",
      techStack: ["Vue.js", "Python", "PostgreSQL", "Chart.js"],
      budget: 18000,
      timeline: "2 months",
      requiredSkills: ["Vue.js", "Python", "Data Visualization"],
      experienceLevel: "Mid-level",
      assignedDevelopers: [],
      maxTeamSize: 2,
    },
  ]);

  // UI State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(true);
  const [filterBySkills, setFilterBySkills] = useState(true);
  const [filters, setFilters] = useState({
    experience: "",
    availability: "",
    rating: 0,
  });

  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    const notification: ToastNotification = { id, type, message };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleDeveloperSelection = (developerId: string) => {
    setSelectedDevelopers((prev) =>
      prev.includes(developerId)
        ? prev.filter((id) => id !== developerId)
        : [...prev, developerId]
    );
  };

  const handleAssignDevelopers = async () => {
    if (!selectedProject || selectedDevelopers.length === 0) return;

    setIsAssigning(true);

    try {
      // 1. Mark developers as unavailable
      const updatedDevelopers = developers.map((dev) =>
        selectedDevelopers.includes(dev.id)
          ? {
              ...dev,
              isAvailable: false,
              currentProjects: (dev.currentProjects || 0) + 1,
              professionalInfo: {
                ...dev.professionalInfo,
                availability: "Assigned to Project",
              },
            }
          : dev
      );

      // 2. Add developers to project's assignedDevelopers array
      const updatedProjects = projects.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              assignedDevelopers: [
                ...(project.assignedDevelopers || []),
                ...selectedDevelopers,
              ],
            }
          : project
      );

      // 3. Create assignment records
      const newAssignments: Assignment[] = selectedDevelopers.map(
        (developerId) => ({
          projectId: selectedProject.id,
          developerId,
          assignedAt: new Date().toISOString(),
          role: "Developer",
          status: "accepted" as const,
        })
      );

      // Update state
      setDevelopers(updatedDevelopers);
      setProjects(updatedProjects);
      setAssignments((prev) => [...prev, ...newAssignments]);

      // Show success notification
      addNotification(
        "success",
        `Successfully assigned ${selectedDevelopers.length} developer(s) to ${selectedProject.title}`
      );

      // Clear selection
      setSelectedDevelopers([]);
    } catch (error) {
      console.error("Error assigning developers:", error);
      addNotification(
        "error",
        "Failed to assign developers. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const calculateCompatibilityScore = (
    developer: Developer,
    project: Project
  ): number => {
    let score = 0;

    const devSkills = [
      ...developer.technicalSkills.primarySkills,
      ...developer.technicalSkills.frameworks,
      ...developer.technicalSkills.specializations,
    ].map((skill) => skill.toLowerCase());

    const projectSkills = project.requiredSkills.map((skill) =>
      skill.toLowerCase()
    );
    const matchingSkills = projectSkills.filter((skill) =>
      devSkills.some(
        (devSkill) => devSkill.includes(skill) || skill.includes(devSkill)
      )
    );

    score += (matchingSkills.length / Math.max(projectSkills.length, 1)) * 40;

    const experienceLevels = ["Junior", "Mid-level", "Senior", "Lead"];
    const devLevel = experienceLevels.indexOf(
      developer.professionalInfo.experienceLevel
    );
    const projectLevel = experienceLevels.indexOf(project.experienceLevel);

    if (devLevel >= projectLevel) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (projectLevel - devLevel) * 8);
    }

    if (developer.isAvailable && (developer.currentProjects || 0) < 2) {
      score += 20;
    } else if (developer.isAvailable) {
      score += 10;
    }

    score += (developer.stats.averageRating / 5) * 15;

    return Math.round(score);
  };

  const getFilteredDevelopers = () => {
    let filtered = developers;

    if (searchTerm) {
      filtered = filtered.filter(
        (dev) =>
          `${dev.personalInfo.firstName} ${dev.personalInfo.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dev.personalInfo.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dev.professionalInfo.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterAvailable) {
      filtered = filtered.filter((dev) => dev.isAvailable);
    }

    if (selectedProject && filterBySkills) {
      filtered = filtered.filter(
        (dev) => calculateCompatibilityScore(dev, selectedProject) >= 30
      );
    }

    if (selectedProject) {
      filtered.sort(
        (a, b) =>
          calculateCompatibilityScore(b, selectedProject) -
          calculateCompatibilityScore(a, selectedProject)
      );
    }

    return filtered;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <FaFire className="text-red-500" />;
      case "medium":
        return <FaLightbulb className="text-yellow-500" />;
      case "low":
        return <FaShieldAlt className="text-green-500" />;
      default:
        return <FaGem className="text-gray-500" />;
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "Senior":
        return "from-purple-500 to-pink-500";
      case "Mid-level":
        return "from-blue-500 to-cyan-500";
      case "Junior":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80)
      return "text-green-400 from-green-500/20 to-emerald-500/20";
    if (score >= 60)
      return "text-yellow-400 from-yellow-500/20 to-orange-500/20";
    if (score >= 40) return "text-orange-400 from-orange-500/20 to-red-500/20";
    return "text-red-400 from-red-500/20 to-pink-500/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading Assignment Manager
          </h3>
          <p className="text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      {/* Enhanced Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl border backdrop-blur-md transition-all transform animate-slide-in-right shadow-2xl ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : notification.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    notification.type === "success"
                      ? "bg-green-500/20"
                      : notification.type === "error"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {notification.type === "success" && (
                    <FaCheckCircle className="text-sm" />
                  )}
                  {notification.type === "error" && (
                    <FaTimesCircle className="text-sm" />
                  )}
                  {notification.type === "info" && (
                    <FaInfoCircle className="text-sm" />
                  )}
                </div>
                <span className="font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaRocket className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Assignment Manager
                </h1>
                <p className="text-gray-400 text-lg mt-1">
                  Match developers with projects using AI-powered compatibility
                  scoring
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-400">
                      {projects.length}
                    </div>
                    <div className="text-xs text-gray-400">Projects</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-400">
                      {developers.filter((d) => d.isAvailable).length}
                    </div>
                    <div className="text-xs text-gray-400">Available</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-400">
                      {assignments.length}
                    </div>
                    <div className="text-xs text-gray-400">Assignments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Projects Panel */}
          <div className="xl:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-800/50">
                <h2 className="text-2xl font-semibold flex items-center text-white">
                  <FaBullseye className="mr-3 text-blue-400" />
                  Available Projects
                </h2>
                <p className="text-gray-400 mt-1">
                  Select a project to view compatible developers
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {projects
                    .filter((p) => p.status !== "completed")
                    .map((project) => (
                      <div
                        key={project.id}
                        className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedProject?.id === project.id
                            ? "border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/20"
                            : "border-gray-700/50 hover:border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50"
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(project.priority)}
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {project.title}
                            </h3>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              project.priority === "high"
                                ? "bg-red-500/20 text-red-400"
                                : project.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {project.priority} priority
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.techStack.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium">
                              +{project.techStack.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <FaUsers className="text-xs" />
                              <span>
                                {project.assignedDevelopers?.length || 0}/
                                {project.maxTeamSize}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="text-xs" />
                              <span>{project.timeline}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-green-400 font-semibold">
                            <FaDollarSign className="text-xs" />
                            <span>{project.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Developers Panel */}
          <div className="xl:col-span-2">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center text-white">
                      <FaUserTie className="mr-3 text-purple-400" />
                      Developer Talent Pool
                    </h2>
                    <p className="text-gray-400 mt-1">
                      {selectedProject
                        ? `Finding matches for ${selectedProject.title}`
                        : "Select a project to see compatibility scores"}
                    </p>
                  </div>

                  {selectedProject && (
                    <button
                      onClick={handleAssignDevelopers}
                      disabled={selectedDevelopers.length === 0 || loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 font-semibold"
                    >
                      <div className="flex items-center space-x-2">
                        <FaBolt className="text-sm" />
                        <span>
                          Assign Selected ({selectedDevelopers.length})
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Enhanced Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search developers by name, email, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filterAvailable}
                        onChange={(e) => setFilterAvailable(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Available developers only
                      </span>
                    </label>

                    {selectedProject && (
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filterBySkills}
                          onChange={(e) => setFilterBySkills(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                          Match project skills
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Project Info */}
              {selectedProject && (
                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                        <FaEye className="mr-2" />
                        Currently Assigning To: {selectedProject.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-300">
                          <span className="text-gray-400">
                            Required Skills:
                          </span>{" "}
                          {selectedProject.requiredSkills.join(", ")}
                        </div>
                        <div className="text-gray-300">
                          <span className="text-gray-400">
                            Experience Level:
                          </span>{" "}
                          {selectedProject.experienceLevel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-purple-400">
                        {selectedProject.assignedDevelopers?.length || 0}/
                        {selectedProject.maxTeamSize}
                      </div>
                      <div className="text-xs text-gray-400">Team Size</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Developers List */}
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {getFilteredDevelopers().map((developer) => {
                    const compatibilityScore = selectedProject
                      ? calculateCompatibilityScore(developer, selectedProject)
                      : 0;

                    return (
                      <div
                        key={developer.id}
                        className={`group relative p-6 rounded-xl border transition-all duration-300 hover:scale-102 ${
                          selectedDevelopers.includes(developer.id)
                            ? "border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/20"
                            : "border-gray-700/50 hover:border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {developer.personalInfo.firstName[0]}
                                  {developer.personalInfo.lastName[0]}
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={selectedDevelopers.includes(
                                        developer.id
                                      )}
                                      onChange={() =>
                                        toggleDeveloperSelection(developer.id)
                                      }
                                      className="absolute opacity-0 w-5 h-5 cursor-pointer"
                                      disabled={!developer.isAvailable}
                                    />
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        selectedDevelopers.includes(
                                          developer.id
                                        )
                                          ? "bg-blue-500 border-blue-500"
                                          : "border-gray-400 bg-gray-700/50"
                                      } ${
                                        !developer.isAvailable
                                          ? "opacity-50 cursor-not-allowed"
                                          : "hover:border-blue-400"
                                      }`}
                                    >
                                      {selectedDevelopers.includes(
                                        developer.id
                                      ) && (
                                        <FaCheck className="text-white text-xs" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {developer.personalInfo.firstName}{" "}
                                  {developer.personalInfo.lastName}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {developer.professionalInfo.title}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {developer.personalInfo.location}
                                </p>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <FaStar className="text-yellow-400 text-sm" />
                                    <span className="text-sm font-medium text-gray-300">
                                      {developer.stats.averageRating} (
                                      {developer.stats.totalProjects} projects)
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaDollarSign className="text-green-400 text-sm" />
                                    <span className="text-sm font-medium text-gray-300">
                                      ${developer.professionalInfo.hourlyRate}
                                      /hr
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaUsers className="text-blue-400 text-sm" />
                                    <span className="text-sm font-medium text-gray-300">
                                      {developer.currentProjects || 0} active
                                      projects
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      developer.isAvailable
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {developer.professionalInfo.availability}
                                  </div>
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      developer.professionalInfo
                                        .experienceLevel === "Senior"
                                        ? "bg-purple-500/20 text-purple-400"
                                        : developer.professionalInfo
                                            .experienceLevel === "Mid-level"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-green-500/20 text-green-400"
                                    }`}
                                  >
                                    {developer.professionalInfo.experienceLevel}
                                  </div>
                                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300">
                                    {developer.stats.clientRetention}% retention
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <p className="text-xs text-gray-400 mb-2">
                                  Primary Skills:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {developer.technicalSkills.primarySkills
                                    .slice(0, 4)
                                    .map((skill, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  {developer.technicalSkills.primarySkills
                                    .length > 4 && (
                                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium">
                                      +
                                      {developer.technicalSkills.primarySkills
                                        .length - 4}{" "}
                                      more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-3">
                            {selectedProject && (
                              <div
                                className={`px-4 py-2 rounded-xl border backdrop-blur-sm ${getCompatibilityColor(
                                  compatibilityScore
                                )} bg-gradient-to-r ${
                                  getCompatibilityColor(
                                    compatibilityScore
                                  ).split(" ")[1]
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-semibold">
                                    {compatibilityScore}%
                                  </div>
                                  <div className="text-xs opacity-80">
                                    Match Score
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              {developer.isAvailable ? (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <FaCheckCircle className="text-sm" />
                                  <span className="text-xs font-medium">
                                    Available
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-red-400">
                                  <FaTimesCircle className="text-sm" />
                                  <span className="text-xs font-medium">
                                    Busy
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getFilteredDevelopers().length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        No developers found
                      </h3>
                      <p className="text-gray-400">
                        Try adjusting your search criteria or filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Button */}
        {selectedDevelopers.length > 0 && selectedProject && (
          <div className="fixed bottom-6 right-6 z-10">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Assign {selectedDevelopers.length} Developer
                {selectedDevelopers.length > 1 ? "s" : ""} to{" "}
                {selectedProject.title}
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={handleAssignDevelopers}
                  disabled={isAssigning}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                    isAssigning
                      ? "bg-blue-400/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  } text-white flex items-center justify-center space-x-2`}
                >
                  {isAssigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      <span>Confirm Assignment</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedDevelopers([])}
                  className="px-6 py-3 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-xl hover:bg-gray-800/50"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Selected developers will be marked as unavailable and granted
                access to the project chat.
              </p>
            </div>
          </div>
        )}

        {/* Assignment History */}
        {assignments.length > 0 && (
          <div className="mt-8">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-800/50">
                <h2 className="text-2xl font-semibold flex items-center text-white">
                  <FaChartLine className="mr-3 text-green-400" />
                  Recent Assignments
                </h2>
                <p className="text-gray-400 mt-1">
                  Track your project assignments and their status
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignments.slice(-6).map((assignment, index) => {
                    const project = projects.find(
                      (p) => p.id === assignment.projectId
                    );
                    const developer = developers.find(
                      (d) => d.id === assignment.developerId
                    );

                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              assignment.status === "accepted"
                                ? "bg-green-500/20 text-green-400"
                                : assignment.status === "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {assignment.status}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(
                              assignment.assignedAt
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <h4 className="font-semibold text-white mb-1 truncate">
                          {project?.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {developer?.personalInfo.firstName}{" "}
                          {developer?.personalInfo.lastName}
                        </p>
                        <div className="text-xs text-gray-500">
                          Role: {assignment.role}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAssignmentManager;
