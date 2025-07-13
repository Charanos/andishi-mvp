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
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useProjectAssignments } from "@/hooks/useProjectAssignments";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";

import type { Assignment } from "@/types/project";
import { SystemUser } from "~/types";


interface ProjectAssignmentsProps {
  projectId: string;
  projectTitle: string;
  projectTechStack?: string[];
  projectExperienceLevel?: string;
  developers: SystemUser[];
  readOnly?: boolean;
}

const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  projectId,
  projectTitle,
  projectTechStack = [],
  projectExperienceLevel = "Mid-level",
  developers,
  readOnly = false,
}) => {
  const { assignments, loading: loadingAssignments, refetch, assignDevelopers, updateAssignment, removeAssignment } = useProjectAssignments(projectId);
  const { notifications, removeNotification, toast } = useToast();

  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(true);
  const [sortBy, setSortBy] = useState<
    "compatibility" | "rating" | "projects" | "rate"
  >("compatibility");
  const [showFilters, setShowFilters] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [developerProfiles, setDeveloperProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [unassigning, setUnassigning] = useState<string | null>(null);


  // Fetch developer profiles to get detailed information
  useEffect(() => {
    const fetchDeveloperProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const response = await fetch('/api/developer-profiles');
        if (response.ok) {
          const profiles = await response.json();
          setDeveloperProfiles(profiles);
        }
      } catch (error) {
toast.error("Error fetching developer profiles", error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchDeveloperProfiles();
  }, []);

  // Get enhanced developer data by merging SystemUser with DeveloperProfile
  const getEnhancedDeveloper = (developer: SystemUser) => {
    const profile = developerProfiles.find(p =>
      p.personalInfo?.email?.toLowerCase() === developer.email.toLowerCase()
    );

    return {
      ...developer,
      profile,
      // Enhanced fields from profile
      title: profile?.professionalInfo?.title || developer.role,
      skills: profile?.technicalSkills?.primarySkills || [],
      rating: profile?.stats?.averageRating || 0,
      hourlyRateProfile: profile?.professionalInfo?.hourlyRate || developer.hourlyRate,
      totalProjectsProfile: profile?.stats?.totalProjects || developer.completedProjects,
      isAvailableProfile: profile?.isAvailable ?? true,
      experienceLevel: profile?.professionalInfo?.experienceLevel || 'Mid-level'
    };
  };

  // Calculate compatibility score between developer and project
  const calculateCompatibilityScore = (developer: any): number => {
    if (!developer?.skills || !Array.isArray(developer.skills)) return 0;
    if (!projectTechStack || projectTechStack.length === 0) return 0;

    let score = 0;

    // Skill matching
    const devSkills = developer.skills.map((skill: any) =>
      typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase() || ''
    );
    const projectSkills = projectTechStack.map((skill) => skill.toLowerCase());

    const matchingSkills = projectSkills.filter((skill) =>
      devSkills.some(
        (devSkill: string) => devSkill.includes(skill) || skill.includes(devSkill)
      )
    );

    score = (matchingSkills.length / Math.max(projectSkills.length, 1)) * 100;

    return Math.round(score);
  };

  // Filter and sort developers
  const getFilteredDevelopers = (): SystemUser[] => {
    if (!Array.isArray(developers)) return [];

    let filtered: SystemUser[] = developers.filter(
      dev => dev.role === "developer" && dev.developerProfileStatus === "approved"
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (dev: SystemUser) =>
          `${dev.firstName} ${dev.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dev.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (dev.company && dev.company
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
      );
    }

    if (filterAvailable) {
      // Filter out developers who are already assigned to any project
      const assignedDeveloperIds = assignments.map(a => a.developerId);
      filtered = filtered.filter((dev: SystemUser) =>
        dev.status === "active" && !assignedDeveloperIds.includes(dev._id)
      );
    }

    // Sort by selected criteria
    filtered.sort((a: SystemUser, b: SystemUser) => {
      switch (sortBy) {
        case "compatibility":
          return 0;
        case "rating":
          const aRating = a.completedProjects && a.completedProjects > 0 && a.totalEarnings
            ? a.totalEarnings / a.completedProjects
            : 0;
          const bRating = b.completedProjects && b.completedProjects > 0 && b.totalEarnings
            ? b.totalEarnings / b.completedProjects
            : 0;
          return bRating - aRating;
        case "projects":
          return (b.completedProjects || 0) - (a.completedProjects || 0);
        case "rate":
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
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
      toast.error("Please select at least one developer");
      return;
    }
    setAssigning(true);
    try {
      await assignDevelopers(selectedDevelopers);
      toast.success(`Successfully assigned ${selectedDevelopers.length} developer(s) to ${projectTitle}`);
      setSelectedDevelopers([]);
      refetch();
    } catch (error) {
toast.error("Failed to assign developers", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setAssigning(false);
    }
  };

  // Unassign developer from project
  const handleUnassignDeveloper = async (developerId: string, developerName: string) => {
    if (!confirm(`Are you sure you want to unassign ${developerName} from this project?`)) {
      return;
    }

    setUnassigning(developerId);
    try {
      await removeAssignment(developerId);
      toast.success(`Successfully unassigned ${developerName} from ${projectTitle}`);
      refetch();
    } catch (error) {
toast.error("Failed to unassign developer", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setUnassigning(null);
    }
  };

  // Get assigned developers for this project
  const getAssignedDevelopers = (): SystemUser[] => {
    if (!Array.isArray(assignments) || !Array.isArray(developers)) return [];

    const assignedDeveloperIds = assignments.map(a => a.developerId);
    return developers.filter(dev => assignedDeveloperIds.includes(dev._id));
  };

  // Safe rating calculation
  const calculateAverageRating = (developer: SystemUser): string => {
    const enhanced = getEnhancedDeveloper(developer);
    if (enhanced.rating > 0) return enhanced.rating.toFixed(1);
    if (!developer.completedProjects || developer.completedProjects === 0) return 'N/A';
    if (!developer.totalEarnings) return 'N/A';

    const rating = developer.totalEarnings / developer.completedProjects;
    return rating.toFixed(1);
  };

  if (loadingAssignments || loadingProfiles) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">
            {loadingAssignments ? 'Loading Project Assignments...' : 'Loading Developer Profiles...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

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

          {selectedDevelopers.length > 0 && !readOnly && (
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                {selectedDevelopers.length} selected
              </div>
              <button
                onClick={handleAssignDevelopers}
                disabled={assigning}
                className="px-6 py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
          {readOnly && (
            <div className="px-3 py-1 bg-gray-500/20 rounded-full text-gray-400 text-sm font-medium">
              View Only
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
            {getAssignedDevelopers().map((developer) => {
              const enhancedDev = getEnhancedDeveloper(developer);
              const isUnassigning = unassigning === developer._id;

              return (
                <div
                  key={developer._id}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-200 relative"
                >
                  {/* Unassign Button */}
                  {!readOnly && (
                    <button
                      onClick={() => handleUnassignDeveloper(developer._id, `${developer.firstName} ${developer.lastName}`)}
                      disabled={isUnassigning}
                      className="absolute top-3 cursor-pointer right-3 p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Unassign from project"
                    >
                      {isUnassigning ? (
                        <FaSpinner className="w-3 h-3 animate-spin" />
                      ) : (
                        <FaTimes className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Developer Header */}
                  <div className="flex items-start justify-between mb-3 pr-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <FaUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">
                          {developer.firstName} {developer.lastName}
                        </h5>
                        <p className="text-sm text-gray-400">
                          {enhancedDev.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400 w-4 h-4" />
                      <span className="text-sm text-gray-300 font-medium">
                        {enhancedDev.rating > 0 ? enhancedDev.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    {/* Availability Status */}
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Busy (Assigned)
                    </span>

                    {/* Assignment Status */}
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <FaCheckCircle className="inline mr-1" />
                      Assigned
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Primary Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(enhancedDev.skills || []).slice(0, 3).map((skill: any, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-600/30 rounded text-xs text-gray-300 border border-gray-600/30"
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                      {(enhancedDev.skills?.length || 0) > 3 && (
                        <span className="px-2 py-1 bg-gray-600/30 rounded text-xs text-gray-400 border border-gray-600/30">
                          +{(enhancedDev.skills?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Developer Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <FaCode className="text-blue-400 w-3 h-3" />
                        <span className="text-white font-semibold text-sm">
                          {enhancedDev.totalProjectsProfile || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Projects</p>
                    </div>
                    <div className="text-center p-2 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <FaClock className="text-green-400 w-3 h-3" />
                        <span className="text-white font-semibold text-sm">
                          ${enhancedDev.hourlyRateProfile || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Per Hour</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-400">
                      <FaEnvelope className="mr-2 w-3 h-3" />
                      <span className="truncate">{developer.email}</span>
                    </div>
                    {developer.phone && (
                      <div className="flex items-center text-xs text-gray-400">
                        <FaPhone className="mr-2 w-3 h-3" />
                        <span>{developer.phone}</span>
                      </div>
                    )}
                    {developer.company && (
                      <div className="flex items-center text-xs text-gray-400">
                        <FaGlobe className="mr-2 w-3 h-3" />
                        <span>{developer.company}</span>
                      </div>
                    )}
                    {enhancedDev.experienceLevel && (
                      <div className="flex items-center text-xs text-gray-400">
                        <FaUser className="mr-2 w-3 h-3" />
                        <span>{enhancedDev.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Assignment Status */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Status: Assigned to Project</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      {!readOnly && (
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex gap-3 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search developers by name, email, or company..."
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
                <FaChevronDown
                  className={`transform transition-transform ${showFilters ? "rotate-180" : ""
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
                  <span className="text-white">Available only (exclude assigned)</span>
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
      )}

      {!readOnly && (
        <>
          {/* Enhanced Available Developers */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-white flex items-center">
                <FaBolt className="mr-2 text-yellow-400" />
                Available Developers
              </h4>
              <div className="text-sm text-gray-400">
                Showing {getFilteredDevelopers().length} of{" "}
                {developers.filter((d) => d.role === "developer" && d.developerProfileStatus === "approved").length} available
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
                  const enhancedDev = getEnhancedDeveloper(developer);
                  const compatibilityScore = calculateCompatibilityScore(enhancedDev);
                  const isAssigned: boolean = assignments.some(
                    (a: Assignment) =>
                      a.projectId === projectId && a.developerId === developer._id
                  );
                  const isSelected = selectedDevelopers.includes(developer._id);

                  return (
                    <div
                      key={developer._id}
                      className={`group relative p-6 flex items-center justify-between min-h-100 rounded-2xl border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg"
                        : isAssigned
                          ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                          : "border-gray-700 hover:border-gray-600 bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                        }`}
                    >
                      {/* Compatibility Score Badge */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${compatibilityScore >= 70
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
                                toggleDeveloperSelection(developer._id)
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
                                  {developer.firstName} {developer.lastName}
                                </h5>
                                <p className="text-gray-400">
                                  {enhancedDev.title}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex items-center space-x-2 mb-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${developer.status === "active"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                            >
                              {developer.status === "active" ? "Available" : "Unavailable"}
                            </span>

                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300 border border-gray-600/30">
                              {developer.role}
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
                              {(enhancedDev.skills || [])
                                .slice(0, 4)
                                .map((skill: any, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-300 border border-gray-600/30"
                                  >
                                    {typeof skill === 'string' ? skill : skill.name}
                                  </span>
                                ))}
                              {(enhancedDev.skills?.length || 0) > 4 && (
                                <span className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-400 border border-gray-600/30">
                                  +{(enhancedDev.skills?.length || 0) - 4} more
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
                                  {enhancedDev.rating > 0 ? enhancedDev.rating.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">Avg. Rating</p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaCode className="text-blue-400 w-4 h-4" />
                                <span className="text-white font-semibold">
                                  {enhancedDev.totalProjectsProfile || 0}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">Projects</p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaUser className="text-purple-400 w-4 h-4" />
                                <span className="text-white font-semibold">
                                  {enhancedDev.experienceLevel}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">Experience</p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaClock className="text-green-400 w-4 h-4" />
                                <span className="text-white font-semibold">
                                  ${enhancedDev.hourlyRateProfile || 'N/A'}
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
                                {developer.email}
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
        </>
      )}
    </div>
  );
};

export default ProjectAssignments;