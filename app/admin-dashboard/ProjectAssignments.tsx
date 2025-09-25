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
  refreshDevelopers?: () => void;
}

const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  projectId,
  projectTitle,
  projectTechStack = [],
  projectExperienceLevel = "Mid-level",
  developers,
  readOnly = false,
  refreshDevelopers,
}) => {
  const {
    assignments,
    loading: loadingAssignments,
    refetch,
    assignDevelopers,
    updateAssignment,
    removeAssignment,
  } = useProjectAssignments(projectId);
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
  const fetchDeveloperProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const response = await fetch("/api/developer-profiles");
      if (response.ok) {
        const profiles = await response.json();
        setDeveloperProfiles(profiles);
      }
    } catch (error) {
      toast.error(
        "Error fetching developer profiles",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchDeveloperProfiles();
  }, []);

  // Refresh developer profiles when refreshDevelopers is called
  useEffect(() => {
    if (refreshDevelopers) {
      fetchDeveloperProfiles();
    }
  }, [refreshDevelopers]);

  // Get enhanced developer data by merging SystemUser with DeveloperProfile
  const getEnhancedDeveloper = (developer: SystemUser) => {
    const profile = developerProfiles.find(
      (p) =>
        p.personalInfo?.email?.toLowerCase() === developer.email.toLowerCase()
    );

    // Extract skills from profile data structure
    const profileSkills =
      profile?.technicalSkills?.primarySkills ||
      profile?.data?.technicalSkills?.primarySkills ||
      [];

    // Fallback skills from developer object if profile skills are empty
    const fallbackSkills = (developer as any).skills || [];
    const combinedSkills =
      profileSkills.length > 0 ? profileSkills : fallbackSkills;

    return {
      ...developer,
      profile,
      // Enhanced fields from profile with better fallbacks
      title:
        profile?.professionalInfo?.title ||
        profile?.data?.professionalInfo?.title ||
        developer.role ||
        "Developer",
      skills: combinedSkills,
      rating:
        profile?.stats?.averageRating ||
        profile?.data?.stats?.averageRating ||
        ((developer.completedProjects || 0) > 0 ? 4.0 : 0),
      hourlyRateProfile:
        profile?.professionalInfo?.hourlyRate ||
        profile?.data?.professionalInfo?.hourlyRate ||
        developer.hourlyRate ||
        0,
      totalProjectsProfile:
        profile?.stats?.totalProjects ||
        profile?.data?.stats?.totalProjects ||
        (developer.completedProjects ?? 0),
      isAvailableProfile:
        profile?.isAvailable ?? profile?.data?.isAvailable ?? true,
      experienceLevel:
        profile?.professionalInfo?.experienceLevel ||
        profile?.data?.professionalInfo?.experienceLevel ||
        "Mid-level",
      busyUntil: profile?.busyUntilDate || profile?.data?.busyUntilDate,
    };
  };

  // Calculate compatibility score between developer and project
  const calculateCompatibilityScore = (developer: any): number => {
    if (!developer?.skills || !Array.isArray(developer.skills)) return 0;
    if (!projectTechStack || projectTechStack.length === 0) return 0;

    let score = 0;

    // Skill matching
    const devSkills = developer.skills.map((skill: any) =>
      typeof skill === "string"
        ? skill.toLowerCase()
        : skill.name?.toLowerCase() || ""
    );
    const projectSkills = projectTechStack.map((skill) => skill.toLowerCase());

    const matchingSkills = projectSkills.filter((skill) =>
      devSkills.some(
        (devSkill: string) =>
          devSkill.includes(skill) || skill.includes(devSkill)
      )
    );

    score = (matchingSkills.length / Math.max(projectSkills.length, 1)) * 100;

    return Math.round(score);
  };

  // Get assigned developers for this project
  const getAssignedDevelopers = (): SystemUser[] => {
    if (!Array.isArray(assignments) || !Array.isArray(developers)) return [];
    const assignedDeveloperIds = new Set(assignments.map((a) => a.developerId));
    return developers.filter((dev) =>
      assignedDeveloperIds.has((dev as any)._id ?? (dev as any).id)
    );
  };

  // Get developers available for assignment
  const getFilteredDevelopers = (): SystemUser[] => {
    if (!Array.isArray(developers)) {
      console.warn(
        "ProjectAssignments: developers prop is not an array:",
        developers
      );
      return [];
    }

    const assignedDeveloperIds = new Set(assignments.map((a) => a.developerId));

    let filtered: SystemUser[] = developers.filter((dev) => {
      const isDeveloper = dev.role === "developer";
      const isApproved = dev.developerProfileStatus === "approved";
      const isPendingOrNull =
        dev.developerProfileStatus === "pending" ||
        dev.developerProfileStatus === null;
      const isActiveUser = dev.status === "active" || dev.isActive !== false;
      const isNotAssigned = !assignedDeveloperIds.has(
        (dev as any)._id ?? (dev as any).id
      );

      // Get enhanced developer data to check availability
      const enhancedDev = getEnhancedDeveloper(dev);
      const isAvailable =
        enhancedDev.isAvailableProfile !== false &&
        dev.status !== "inactive" &&
        dev.status !== "suspended";

      // Show developers if they are approved OR if they are pending/null but active
      // AND they are available (not busy)
      const shouldShow =
        isDeveloper &&
        (isApproved || (isPendingOrNull && isActiveUser)) &&
        isNotAssigned &&
        isAvailable;

      if (isDeveloper && !shouldShow) {
        console.log(
          `Developer ${dev.firstName} ${dev.lastName} filtered out:`,
          {
            profileStatus: dev.developerProfileStatus,
            userStatus: dev.status,
            isActive: dev.isActive,
            isAssigned: !isNotAssigned,
            isAvailable: isAvailable,
            profileAvailable: enhancedDev.isAvailableProfile,
          }
        );
      }

      return shouldShow;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (dev) =>
          `${dev.firstName} ${dev.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dev.company &&
            dev.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by selected criteria
    filtered.sort((a: SystemUser, b: SystemUser) => {
      switch (sortBy) {
        case "compatibility":
          return 0; // Placeholder for compatibility logic
        case "rating":
          const aRating =
            a.completedProjects && a.completedProjects > 0 && a.totalEarnings
              ? a.totalEarnings / a.completedProjects
              : 0;
          const bRating =
            b.completedProjects && b.completedProjects > 0 && b.totalEarnings
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

  // Helper function to update project chat participants after assignment
  const updateProjectChatParticipants = async (
    assignedDeveloperIds: string[]
  ) => {
    try {
      console.log(
        `Updating project chat participants for project ${projectId}...`
      );
      const response = await fetch(
        `/api/project-chat/${projectId}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "add_developers",
            developerIds: assignedDeveloperIds,
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Failed to update chat participants: ${response.status}`);
        return false;
      }

      console.log(
        `Successfully updated chat participants for project ${projectId}`
      );
      return true;
    } catch (error) {
      console.error("Error updating chat participants:", error);
      return false;
    }
  };

  // Assign developers to project with graceful error handling
  const handleAssignDevelopers = async () => {
    // snapshot current selection to avoid race conditions with state updates
    const ids = [...selectedDevelopers];
    if (ids.length === 0) {
      toast.error("Please select at least one developer");
      return;
    }

    setAssigning(true);
    const assignmentResults = {
      successful: [] as string[],
      failed: [] as { developerId: string; error: string }[],
    };

    try {
      // Step 1: First, create the project assignments
      console.log("Creating project assignments...");
      await assignDevelopers(ids);

      // Step 2: Then update developer profiles sequentially with proper error handling
      console.log("Updating developer profiles...");
      for (const developerId of ids) {
        try {
          const response = await fetch(`/api/developer/${developerId}/update`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              assignedProject: {
                projectId,
                title: projectTitle,
                techStack: projectTechStack,
                experienceLevel: projectExperienceLevel,
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || "Update failed");
          }

          assignmentResults.successful.push(developerId);
          console.log(`Successfully updated developer ${developerId}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `Error updating developer ${developerId}:`,
            errorMessage
          );
          assignmentResults.failed.push({ developerId, error: errorMessage });
        }
      }

      // Step 3: Update project chat participants with successfully assigned developers
      if (assignmentResults.successful.length > 0) {
        console.log("Updating project chat participants...");
        await updateProjectChatParticipants(assignmentResults.successful);
      }

      // Step 4: Show results and handle partial failures
      if (assignmentResults.successful.length > 0) {
        toast.success(
          `Successfully assigned ${assignmentResults.successful.length} developer(s) to ${projectTitle}`,
          assignmentResults.failed.length > 0
            ? `${assignmentResults.failed.length} developer(s) had profile update issues but were still assigned.`
            : undefined
        );
      }

      if (assignmentResults.failed.length > 0) {
        toast.warning(
          `${assignmentResults.failed.length} developer(s) had profile update issues`,
          "They are still assigned to the project, but their profiles may not reflect the assignment."
        );
        console.warn("Failed developer updates:", assignmentResults.failed);
      }

      setSelectedDevelopers([]);
      refetch();

      // Refresh the developer data to reflect availability changes
      if (refreshDevelopers) {
        refreshDevelopers();
      }
      await fetchDeveloperProfiles();
      await refetch(); // Refetch assignments to update the UI
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Assignment error:", error);

      // If the main assignment failed, try to clean up any partial assignments
      if (assignmentResults.successful.length > 0) {
        toast.error(
          "Assignment partially failed",
          `Some developers may have been assigned. Please refresh and check the current assignments.`
        );
      } else {
        toast.error("Failed to assign developers", errorMessage);
      }

      refetch(); // Refresh to show current state
    } finally {
      setAssigning(false);
    }
  };

  // Unassign developer from project
  const handleUnassignDeveloper = async (
    developerId: string,
    developerName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to unassign ${developerName} from this project?`
      )
    ) {
      return;
    }

    setUnassigning(developerId);
    try {
      // Update developer profile upon unassignment
      const updateDeveloperUponUnassignment = async () => {
        try {
          const response = await fetch(`/api/developer/${developerId}/update`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              unassign: true,
              projectId,
            }),
          });
          if (!response.ok) {
            throw new Error(
              "Failed to update developer profile upon unassignment."
            );
          }
        } catch (error) {
          console.error(`Error unassigning developer ${developerId}:`, error);
        }
      };

      // Unassign and update
      await removeAssignment(developerId);
      await updateDeveloperUponUnassignment();
      toast.success(
        `Successfully unassigned ${developerName} from ${projectTitle}`
      );
      refetch();

      // Refresh the developer data to reflect availability changes
      if (refreshDevelopers) {
        refreshDevelopers();
      }
      await fetchDeveloperProfiles();
      await refetch(); // Refetch assignments to update the UI
    } catch (error) {
      toast.error(
        "Failed to unassign developer",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setUnassigning(null);
    }
  };

  // Safe rating calculation
  const calculateAverageRating = (developer: SystemUser): string => {
    const enhanced = getEnhancedDeveloper(developer);
    if (enhanced.rating > 0) return enhanced.rating.toFixed(1);
    if (!developer.completedProjects || developer.completedProjects === 0)
      return "N/A";
    if (!developer.totalEarnings) return "N/A";

    const rating = developer.totalEarnings / developer.completedProjects;
    return rating.toFixed(1);
  };

  if (loadingAssignments || loadingProfiles) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">
            {loadingAssignments
              ? "Loading Project Assignments..."
              : "Loading Developer Profiles..."}
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
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUsers className="mr-3 text-blue-600 dark:text-blue-400" />
              Project Assignments
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage team members for{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {projectTitle}
              </span>
            </p>
          </div>

          {selectedDevelopers.length > 0 && !readOnly && (
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-blue-500/30 dark:bg-blue-500/20 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium">
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
            <div className="px-3 py-1 bg-gray-200 dark:bg-black/20 rounded-full text-gray-600 dark:text-gray-400 text-sm font-medium">
              View Only
            </div>
          )}
        </div>
      </>

      {/* Enhanced Assigned Developers Section */}
      {getAssignedDevelopers().length > 0 && (
        <div className="bg-gradient-to-br from-green-500/20 dark:from-green-500/10 to-emerald-500/20 dark:to-emerald-500/10 rounded-2xl p-6 border border-green-500/30 dark:border-green-500/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-500/30 dark:bg-green-500/20 rounded-xl mr-3">
              <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-medium text-gray-900 dark:text-white">
              Assigned Team ({getAssignedDevelopers().length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAssignedDevelopers().map((developer) => {
              const enhancedDev = getEnhancedDeveloper(developer);
              const isUnassigning = unassigning === developer.id;

              return (
                <div
                  key={developer.id}
                  className="bg-white/10 dark:bg-black/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-200 relative"
                >
                  {/* Unassign Button */}
                  {!readOnly && (
                    <button
                      onClick={() =>
                        handleUnassignDeveloper(
                          developer.id,
                          `${developer.firstName} ${developer.lastName}`
                        )
                      }
                      disabled={isUnassigning}
                      className="absolute top-3 cursor-pointer right-3 p-1.5 bg-red-500/30 dark:bg-red-500/20 hover:bg-red-500/40 dark:hover:bg-red-500/30 border border-red-500/40 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {developer.firstName} {developer.lastName}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {enhancedDev.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400 w-4 h-4" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {enhancedDev.rating > 0
                          ? enhancedDev.rating.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    {(() => {
                      const isBusy =
                        !enhancedDev.isAvailableProfile ||
                        assignments.some((a) => a.developerId === developer.id);
                      const busyUntil = (enhancedDev as any).busyUntil as
                        | string
                        | undefined;
                      if (isBusy) {
                        return (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/30 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/40 dark:border-yellow-500/30">
                            {busyUntil
                              ? `Busy until ${new Date(
                                  busyUntil
                                ).toLocaleDateString()}`
                              : "Busy"}
                          </span>
                        );
                      }
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 dark:border-green-500/30">
                          Available
                        </span>
                      );
                    })()}

                    {/* Assignment Status */}
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 dark:border-green-500/30">
                      <FaCheckCircle className="inline mr-1" />
                      Assigned
                    </span>

                    {!readOnly && (
                      <button
                        title="Unassign"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignDeveloper(
                            developer.id,
                            `${developer.firstName} ${developer.lastName}`
                          );
                        }}
                        className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/30 dark:bg-red-500/20 border border-red-500/50 dark:border-red-500/40 text-red-700 dark:text-red-300 rounded hover:bg-red-500/40 dark:hover:bg-red-500/30"
                      >
                        Unassign
                      </button>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Primary Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(developer.skills || [])
                        .slice(0, 3)
                        .map((skill: any, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600/30 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30"
                          >
                            {typeof skill === "string" ? skill : skill.name}
                          </span>
                        ))}
                      {(developer.skills?.length || 0) > 3 && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600/30 rounded text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/30">
                          +{(developer.skills?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Developer Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <FaCode className="text-blue-600 dark:text-blue-400 w-3 h-3" />
                        <span className="text-gray-900 dark:text-white font-semibold text-sm">
                          {enhancedDev.totalProjectsProfile || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Projects
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <FaClock className="text-green-600 dark:text-green-400 w-3 h-3" />
                        <span className="text-gray-900 dark:text-white font-semibold text-sm">
                          ${enhancedDev.hourlyRateProfile || "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Per Hour
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <FaEnvelope className="mr-2 w-3 h-3" />
                      <span className="truncate">{developer.email}</span>
                    </div>
                    {developer.phone && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <FaPhone className="mr-2 w-3 h-3" />
                        <span>{developer.phone}</span>
                      </div>
                    )}
                    {developer.company && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <FaGlobe className="mr-2 w-3 h-3" />
                        <span>{developer.company}</span>
                      </div>
                    )}
                    {enhancedDev.experienceLevel && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <FaUser className="mr-2 w-3 h-3" />
                        <span>{enhancedDev.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Assignment Status */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Status: Assigned to Project</span>
                      <span className="text-green-600 dark:text-green-400">
                        Active
                      </span>
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
        <div className="bg-white/10  shadow-lg dark:shadow-none dark:bg-white/10 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="flex gap-3 flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search developers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/20 dark:bg-black/50 border border-gray-300 dark:border-gray-600/50 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/20 dark:bg-black/50 border border-gray-300 dark:border-gray-600/50 rounded-xl hover:bg-white/30 dark:hover:bg-gray-600/50 transition-colors text-gray-900 dark:text-white"
              >
                <FaFilter />
                <FaChevronDown
                  className={`transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/30 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600/30 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAvailable}
                    onChange={(e) => setFilterAvailable(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">
                    Available only (exclude assigned)
                  </span>
                </label>

                <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/30 rounded-xl">
                  <FaSort className="text-gray-500 dark:text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option
                      value="compatibility"
                      className="bg-white dark:bg-black/50"
                    >
                      Sort by Compatibility
                    </option>
                    <option
                      value="rating"
                      className="bg-white dark:bg-black/50"
                    >
                      Sort by Rating
                    </option>
                    <option
                      value="projects"
                      className="bg-white dark:bg-black/50"
                    >
                      Sort by Projects
                    </option>
                    <option value="rate" className="bg-white dark:bg-black/50">
                      Sort by Rate
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700/30 rounded-xl text-gray-600 dark:text-gray-400">
                  Showing {getFilteredDevelopers().length} of{" "}
                  {getFilteredDevelopers().length} available
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
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FaBolt className="mr-2 text-yellow-600 dark:text-yellow-400" />
                Available Developers
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {getFilteredDevelopers().length} of{" "}
                {getFilteredDevelopers().length} available
              </div>
            </div>

            {getFilteredDevelopers().length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700/50 rounded-full mb-4">
                  <FaUsers className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No developers match the current filters
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredDevelopers().map((developer) => {
                  const enhancedDev = getEnhancedDeveloper(developer);
                  const compatibilityScore =
                    calculateCompatibilityScore(enhancedDev);
                  const devId = (developer as any)._id ?? (developer as any).id;
                  const isAssigned: boolean = assignments.some(
                    (a: Assignment) =>
                      a.projectId === projectId && a.developerId === devId
                  );
                  const isSelected = selectedDevelopers.includes(devId);

                  return (
                    <div
                      key={devId}
                      onClick={() => toggleDeveloperSelection(devId)}
                      className={`group w-full relative p-6 flex items-center justify-between min-h-100 rounded-2xl border transition-all duration-300 shadow-lg dark:shadow-none hover:shadow-xl transform hover:scale-[1.02] cursor-pointer backdrop-blur-lg ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20 dark:bg-black/30 shadow-lg"
                          : isAssigned
                          ? "border-green-500 bg-gradient-to-br from-green-500/30 dark:from-green-500/20 to-emerald-500/30 dark:to-emerald-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-black/5 dark:bg-white/5"
                      }`}
                    >
                      {/* Compatibility Score Badge */}
                      {/* <div className="absolute top-4 right-4">
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
                      </div> */}

                      <div className="flex items-center w-full space-x-4">
                        <div className="flex-1 min-w-0 items-center">
                          {/* Developer Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <FaUser className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {developer.firstName} {developer.lastName}
                                </h5>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {enhancedDev.title}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex items-center space-x-2 mb-4">
                            {(() => {
                              const isBusy =
                                !enhancedDev.isAvailableProfile ||
                                assignments.some(
                                  (a) => a.developerId === devId
                                );
                              const busyUntil = (enhancedDev as any)
                                .busyUntil as string | undefined;
                              if (isBusy) {
                                return (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/30 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/40 dark:border-yellow-500/30">
                                    {busyUntil
                                      ? `Busy until ${new Date(
                                          busyUntil
                                        ).toLocaleDateString()}`
                                      : "Busy"}
                                  </span>
                                );
                              }
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 dark:border-green-500/30">
                                  Available
                                </span>
                              );
                            })()}

                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30">
                              {developer.role}
                            </span>

                            {isAssigned && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 dark:border-green-500/30">
                                <FaCheckCircle className="inline mr-1" />
                                Assigned
                              </span>
                            )}
                          </div>

                          {/* Skills */}
                          <div className="mb-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Primary Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(developer.skills || [])
                                .slice(0, 4)
                                .map((skill: any, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600/30 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30"
                                  >
                                    {typeof skill === "string"
                                      ? skill
                                      : skill.name}
                                  </span>
                                ))}
                              {(developer.skills?.length || 0) > 4 && (
                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600/30 rounded-lg text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/30">
                                  +{(developer.skills?.length || 0) - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaStar className="text-yellow-400 w-4 h-4" />
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {enhancedDev.rating > 0
                                    ? enhancedDev.rating.toFixed(1)
                                    : "N/A"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Avg. Rating
                              </p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaCode className="text-blue-400 w-4 h-4" />
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {enhancedDev.totalProjectsProfile || 0}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Projects
                              </p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaUser className="text-purple-400 w-4 h-4" />
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {enhancedDev.experienceLevel}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Experience
                              </p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <FaClock className="text-green-400 w-4 h-4" />
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  ${enhancedDev.hourlyRateProfile || "N/A"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Per Hour
                              </p>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
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
