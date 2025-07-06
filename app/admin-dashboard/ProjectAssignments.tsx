"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaUsers,
  FaCheck,
  FaTimes,
  FaSearch,
  FaStar,
  FaClock,
  FaCode,
  FaPlus,
  FaInfoCircle,
  FaFilter,
  FaSort,
  FaChevronDown,
  FaBolt,
  FaHeart,
  FaGlobe,
  FaAward,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
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

interface Assignment {
  id: string;
  projectId: string;
  developerId: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  assignedAt: string;
  updatedAt: string;
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ProjectAssignmentsProps {
  projectId: string;
  projectTitle: string;
  projectTechStack?: string[];
  projectExperienceLevel?: string;
}

const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  projectId,
  projectTitle,
  projectTechStack = [],
  projectExperienceLevel = "Mid-level",
}) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(true);
  const [sortBy, setSortBy] = useState<
    "compatibility" | "rating" | "projects" | "rate"
  >("compatibility");
  const [showFilters, setShowFilters] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Generate mock developers for demo
  const generateMockDevelopers = (): Developer[] => {
    const mockDevelopers: Developer[] = [
      {
        id: "1",
        personalInfo: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.j@email.com",
          location: "San Francisco, CA",
        },
        professionalInfo: {
          title: "Full Stack Developer",
          experienceLevel: "Senior",
          availability: "Available",
          hourlyRate: 85,
        },
        technicalSkills: {
          primarySkills: ["React", "Node.js", "TypeScript", "Python"],
          frameworks: ["Next.js", "Express", "Django"],
          specializations: ["API Development", "Database Design"],
        },
        stats: {
          totalProjects: 34,
          averageRating: 4.9,
          clientRetention: 95,
        },
        currentProjects: 1,
        isAvailable: true,
      },
      {
        id: "2",
        personalInfo: {
          firstName: "Marcus",
          lastName: "Chen",
          email: "marcus.chen@email.com",
          location: "New York, NY",
        },
        professionalInfo: {
          title: "Frontend Specialist",
          experienceLevel: "Mid-level",
          availability: "Available",
          hourlyRate: 70,
        },
        technicalSkills: {
          primarySkills: ["React", "Vue.js", "JavaScript", "CSS"],
          frameworks: ["Nuxt.js", "Tailwind CSS", "Material-UI"],
          specializations: ["UI/UX Implementation", "Mobile Responsive"],
        },
        stats: {
          totalProjects: 22,
          averageRating: 4.7,
          clientRetention: 88,
        },
        currentProjects: 0,
        isAvailable: true,
      },
      {
        id: "3",
        personalInfo: {
          firstName: "Emily",
          lastName: "Rodriguez",
          email: "emily.r@email.com",
          location: "Austin, TX",
        },
        professionalInfo: {
          title: "DevOps Engineer",
          experienceLevel: "Senior",
          availability: "Busy",
          hourlyRate: 95,
        },
        technicalSkills: {
          primarySkills: ["Docker", "Kubernetes", "AWS", "Python"],
          frameworks: ["Terraform", "Jenkins", "Ansible"],
          specializations: ["Cloud Architecture", "CI/CD"],
        },
        stats: {
          totalProjects: 41,
          averageRating: 4.8,
          clientRetention: 92,
        },
        currentProjects: 3,
        isAvailable: false,
      },
      {
        id: "4",
        personalInfo: {
          firstName: "David",
          lastName: "Kim",
          email: "david.kim@email.com",
          location: "Seattle, WA",
        },
        professionalInfo: {
          title: "Backend Developer",
          experienceLevel: "Junior",
          availability: "Available",
          hourlyRate: 45,
        },
        technicalSkills: {
          primarySkills: ["Node.js", "Java", "MongoDB", "SQL"],
          frameworks: ["Spring Boot", "Express", "Mongoose"],
          specializations: ["API Development", "Database Optimization"],
        },
        stats: {
          totalProjects: 8,
          averageRating: 4.5,
          clientRetention: 85,
        },
        currentProjects: 1,
        isAvailable: true,
      },
    ];
    return mockDevelopers;
  };

  // Custom toast notification functions
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

  // Initialize with mock data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockDevelopers = generateMockDevelopers();
      setDevelopers(mockDevelopers);

      // Mock some assignments
      const mockAssignments: Assignment[] = [
        {
          id: "1",
          projectId: projectId,
          developerId: "1",
          role: "Lead Developer",
          status: "accepted",
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setAssignments(mockAssignments);
      setLoading(false);
    };

    initializeData();
  }, [projectId]);

  // Calculate compatibility score between developer and project
  const calculateCompatibilityScore = (developer: Developer): number => {
    let score = 0;

    // Skill matching (40% weight)
    const devSkills = [
      ...developer.technicalSkills.primarySkills,
      ...developer.technicalSkills.frameworks,
      ...developer.technicalSkills.specializations,
    ].map((skill) => skill.toLowerCase());

    const projectSkills = projectTechStack.map((skill) => skill.toLowerCase());
    const matchingSkills = projectSkills.filter((skill) =>
      devSkills.some(
        (devSkill) => devSkill.includes(skill) || skill.includes(devSkill)
      )
    );

    score += (matchingSkills.length / Math.max(projectSkills.length, 1)) * 40;

    // Experience level matching (25% weight)
    const experienceLevels = ["Junior", "Mid-level", "Senior", "Lead"];
    const devLevel = experienceLevels.indexOf(
      developer.professionalInfo.experienceLevel
    );
    const projectLevel = experienceLevels.indexOf(projectExperienceLevel);

    if (devLevel >= projectLevel) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (projectLevel - devLevel) * 8);
    }

    // Availability (20% weight)
    if (developer.isAvailable && (developer.currentProjects || 0) < 2) {
      score += 20;
    } else if (developer.isAvailable) {
      score += 10;
    }

    // Rating (15% weight)
    score += (developer.stats.averageRating / 5) * 15;

    return Math.round(score);
  };

  // Filter and sort developers
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

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "compatibility":
          return (
            calculateCompatibilityScore(b) - calculateCompatibilityScore(a)
          );
        case "rating":
          return b.stats.averageRating - a.stats.averageRating;
        case "projects":
          return b.stats.totalProjects - a.stats.totalProjects;
        case "rate":
          return a.professionalInfo.hourlyRate - b.professionalInfo.hourlyRate;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Handle developer selection
  const toggleDeveloperSelection = (developerId: string) => {
    setSelectedDevelopers((prev) =>
      prev.includes(developerId)
        ? prev.filter((id) => id !== developerId)
        : [...prev, developerId]
    );
  };

  // Assign developers to project
  const handleAssignDevelopers = async () => {
    if (selectedDevelopers.length === 0) {
      addNotification("error", "Please select at least one developer");
      return;
    }

    setAssigning(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newAssignments = selectedDevelopers.map((devId) => ({
        id: Date.now().toString() + devId,
        projectId,
        developerId: devId,
        role: "Developer",
        status: "pending" as const,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setAssignments((prev) => [...prev, ...newAssignments]);

      // Update developer availability
      setDevelopers((prev) =>
        prev.map((dev) =>
          selectedDevelopers.includes(dev.id)
            ? {
                ...dev,
                isAvailable: false,
                currentProjects: (dev.currentProjects || 0) + 1,
              }
            : dev
        )
      );

      addNotification(
        "success",
        `Successfully assigned ${selectedDevelopers.length} developer(s) to ${projectTitle}`
      );
      setSelectedDevelopers([]);
    } catch (error) {
      console.error("Error assigning developers:", error);
      addNotification("error", "Failed to assign developers");
    } finally {
      setAssigning(false);
    }
  };

  // Get assigned developers for this project
  const getAssignedDevelopers = () => {
    return assignments
      .filter((a) => a.projectId === projectId)
      .map((a) => developers.find((d) => d.id === a.developerId))
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">Processing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-in-out p-4 rounded-xl border backdrop-blur-md shadow-2xl ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                : notification.type === "error"
                ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30"
                : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30"
            } hover:scale-105`}
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-1 rounded-full ${
                    notification.type === "success"
                      ? "bg-green-500"
                      : notification.type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {notification.type === "success" && (
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  )}
                  {notification.type === "error" && (
                    <FaExclamationCircle className="w-4 h-4 text-white" />
                  )}
                  {notification.type === "info" && (
                    <FaInfoCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-medium text-white">
                  {notification.message}
                </span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-2xl font-semibold text-white flex items-center">
              <FaUsers className="mr-3 text-blue-400" />
              Project Assignments
            </h3>
            <p className="text-gray-400 mt-1">
              Manage team members for{" "}
              <span className="text-blue-400 font-medium">{projectTitle}</span>
            </p>
          </div>

          {selectedDevelopers.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                {selectedDevelopers.length} selected
              </div>
              <button
                onClick={handleAssignDevelopers}
                disabled={assigning}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {assigning ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Assign Selected
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Assigned Developers Section */}
      {getAssignedDevelopers().length > 0 && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-500/20 rounded-xl mr-3">
              <FaCheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-white">
              Assigned Team ({getAssignedDevelopers().length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAssignedDevelopers().map((developer) => (
              <div
                key={developer?.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">
                        {developer?.personalInfo.firstName}{" "}
                        {developer?.personalInfo.lastName}
                      </h5>
                      <p className="text-sm text-gray-400">
                        {developer?.professionalInfo.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400 w-4 h-4" />
                    <span className="text-sm text-gray-300 font-medium">
                      {developer?.stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center">
                    <FaGlobe className="mr-1" />
                    {developer?.personalInfo.location}
                  </span>
                  <span className="flex items-center">
                    <FaClock className="mr-1" />$
                    {developer?.professionalInfo.hourlyRate}/hr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search developers by name, email, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-400 transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-colors text-white"
            >
              <FaFilter />
              <span>Filters</span>
              <FaChevronDown
                className={`transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-600/30 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-white">Available only</span>
              </label>

              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl">
                <FaSort className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none"
                >
                  <option value="compatibility">Sort by Compatibility</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="projects">Sort by Projects</option>
                  <option value="rate">Sort by Rate</option>
                </select>
              </div>

              <div className="flex items-center justify-center p-3 bg-gray-700/30 rounded-xl text-gray-400">
                {getFilteredDevelopers().length} developers found
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Available Developers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-white flex items-center">
            <FaBolt className="mr-2 text-yellow-400" />
            Available Developers
          </h4>
          <div className="text-sm text-gray-400">
            Showing {getFilteredDevelopers().length} of{" "}
            {developers.filter((d) => d.isAvailable).length} available
          </div>
        </div>

        {getFilteredDevelopers().length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
              <FaUsers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg">
              No developers match the current filters
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredDevelopers().map((developer) => {
              const compatibilityScore = calculateCompatibilityScore(developer);
              const isAssigned = assignments.some(
                (a) =>
                  a.projectId === projectId && a.developerId === developer.id
              );
              const isSelected = selectedDevelopers.includes(developer.id);

              return (
                <div
                  key={developer.id}
                  className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                    isSelected
                      ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg"
                      : isAssigned
                      ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                      : "border-gray-700 hover:border-gray-600 bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                  }`}
                >
                  {/* Compatibility Score Badge */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        compatibilityScore >= 70
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : compatibilityScore >= 50
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {compatibilityScore}% match
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    {!isAssigned && (
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleDeveloperSelection(developer.id)
                          }
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Developer Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FaUser className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-white text-lg">
                              {developer.personalInfo.firstName}{" "}
                              {developer.personalInfo.lastName}
                            </h5>
                            <p className="text-gray-400">
                              {developer.professionalInfo.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            developer.isAvailable
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {developer.isAvailable ? "Available" : "Busy"}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300 border border-gray-600/30">
                          {developer.professionalInfo.experienceLevel}
                        </span>

                        {isAssigned && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <FaCheckCircle className="inline mr-1" />
                            Assigned
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Primary Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {developer.technicalSkills.primarySkills
                            .slice(0, 4)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-300 border border-gray-600/30"
                              >
                                {skill}
                              </span>
                            ))}
                          {developer.technicalSkills.primarySkills.length >
                            4 && (
                            <span className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-400 border border-gray-600/30">
                              +
                              {developer.technicalSkills.primarySkills.length -
                                4}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <FaStar className="text-yellow-400 w-4 h-4" />
                            <span className="text-white font-semibold">
                              {developer.stats.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Rating</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <FaCode className="text-blue-400 w-4 h-4" />
                            <span className="text-white font-semibold">
                              {developer.stats.totalProjects}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Projects</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <FaHeart className="text-red-400 w-4 h-4" />
                            <span className="text-white font-semibold">
                              {developer.stats.clientRetention}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Retention</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <FaClock className="text-green-400 w-4 h-4" />
                            <span className="text-white font-semibold">
                              ${developer.professionalInfo.hourlyRate}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Per Hour</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-400">
                            <FaGlobe className="mr-2" />
                            {developer.personalInfo.location}
                          </div>
                          <div className="flex items-center text-gray-400">
                            <FaBolt className="mr-1" />
                            {developer.currentProjects || 0} active projects
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Project Stats */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaAward className="mr-2 text-yellow-400" />
          Project Overview
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700/30 rounded-xl">
            <div className="text-2xl font-semibold text-blue-400">
              {getAssignedDevelopers().length}
            </div>
            <p className="text-sm text-gray-400">Assigned</p>
          </div>

          <div className="text-center p-4 bg-gray-700/30 rounded-xl">
            <div className="text-2xl font-semibold text-green-400">
              {developers.filter((d) => d.isAvailable).length}
            </div>
            <p className="text-sm text-gray-400">Available</p>
          </div>

          <div className="text-center p-4 bg-gray-700/30 rounded-xl">
            <div className="text-2xl font-semibold text-yellow-400">
              {selectedDevelopers.length}
            </div>
            <p className="text-sm text-gray-400">Selected</p>
          </div>

          <div className="text-center p-4 bg-gray-700/30 rounded-xl">
            <div className="text-2xl font-semibold text-purple-400">
              {projectTechStack.length}
            </div>
            <p className="text-sm text-gray-400">Tech Stack</p>
          </div>
        </div>

        {projectTechStack.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400 mb-2">Required Technologies</p>
            <div className="flex flex-wrap gap-2">
              {projectTechStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAssignments;
