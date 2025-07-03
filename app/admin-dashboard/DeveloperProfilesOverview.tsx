"use client";

import React, { JSX, useEffect, useState } from "react";
import DeveloperProfileEditor from "./DeveloperProfileEditor";

import {
  FaEdit,
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaCode,
  FaDollarSign,
  FaUsers,
  FaChevronDown,
  FaSyncAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaUser,
  FaChartLine,
  FaArrowCircleLeft,
  FaUserPlus,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaCalendarAlt,
  FaProjectDiagram,
  FaGitAlt,
  FaBug,
  FaGraduationCap,
  FaTrophy,
  FaLinkedin,
  FaGithub,
  FaBriefcase,
  FaCertificate,
  FaCheckCircle,
  FaComment,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AddNewDeveloper from "./AddNewDeveloper";

import type { DeveloperProfile } from "../../lib/types";

interface Props {
  onViewProfile?: (profileId: string) => void;
}

type ViewMode = "list" | "detail" | "edit" | "create";
type SortOption = "name" | "rating" | "projects" | "earnings";
type ExperienceLevel = "all" | "junior" | "mid" | "senior" | "lead";
type AvailabilityStatus = "all" | "available" | "busy" | "unavailable";

const DeveloperProfilesOverview: React.FC<Props> = ({ onViewProfile }) => {
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<DeveloperProfile[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProfile, setSelectedProfile] =
    useState<DeveloperProfile | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceLevel>("all");
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch developer profiles
  useEffect(() => {
    const fetchProfiles = async (): Promise<void> => {
      try {
        const res = await fetch("/api/developer-profiles");
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();

        const profilesArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.profiles)
          ? data.profiles
          : [data];
        setProfiles(profilesArray);
        setFilteredProfiles(profilesArray);
      } catch (err) {
        console.error(err);
        toast.error("Error loading developer profiles");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Filter and search profiles
  useEffect(() => {
    let filtered = profiles.filter((profile) => {
      const fullName =
        `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.toLowerCase();
      const email = profile.personalInfo.email.toLowerCase();
      const title = profile.professionalInfo.title.toLowerCase();
      const location = profile.personalInfo.location.toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        title.includes(searchTerm.toLowerCase()) ||
        location.includes(searchTerm.toLowerCase());

      const matchesExperience =
        selectedExperience === "all" ||
        profile.professionalInfo.experienceLevel === selectedExperience;

      const matchesAvailability =
        selectedAvailability === "all" ||
        profile.professionalInfo.availability === selectedAvailability;

      return matchesSearch && matchesExperience && matchesAvailability;
    });

    // Sort profiles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.personalInfo.firstName} ${a.personalInfo.lastName}`.localeCompare(
            `${b.personalInfo.firstName} ${b.personalInfo.lastName}`
          );
        case "rating":
          return b.stats.averageRating - a.stats.averageRating;
        case "projects":
          return b.stats.totalProjects - a.stats.totalProjects;
        case "earnings":
          return b.stats.totalEarnings - a.stats.totalEarnings;
        default:
          return 0;
      }
    });

    // Calculate total pages
    const total = filtered.length;
    setTotalPages(Math.ceil(total / itemsPerPage));

    // Get current page's profiles
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProfiles = filtered.slice(startIndex, endIndex);

    setFilteredProfiles(currentProfiles);
  }, [
    profiles,
    searchTerm,
    selectedExperience,
    selectedAvailability,
    sortBy,
    currentPage,
  ]);

  const handleEdit = (profileId: string): void => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setViewMode("edit");
    }
  };

  const handleView = (profileId: string): void => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setViewMode("detail");
      if (onViewProfile) {
        onViewProfile(profileId);
      }
    }
  };

  const handleBackToList = (): void => {
    setViewMode("list");
    setSelectedProfile(null);
  };

  const handleBackFromEditor = (): void => {
    setViewMode("list");
    setSelectedProfile(null);
  };

  const handleAddNewDeveloper = (): void => {
    setViewMode("create");
  };

  const handleCreateSuccess = (newProfile: DeveloperProfile): void => {
    setProfiles((prev) => [...prev, newProfile]);
    setFilteredProfiles((prev) => [...prev, newProfile]);
    setViewMode("list");
    toast.success("Developer profile created successfully");
  };

  const handleUpdateSuccess = (updatedProfile: DeveloperProfile) => {
    const updatedProfiles = profiles.map((p) =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    setProfiles(updatedProfiles);
    setFilteredProfiles(updatedProfiles);
    setViewMode("list");
    setSelectedProfile(null);
    toast.success("Profile updated successfully");
  };

  const handleDelete = async (
    profileId: string,
    developerName: string
  ): Promise<void> => {
    if (
      !confirm(
        `Are you sure you want to delete ${developerName}'s profile? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/developer-profiles/${profileId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorPayload = await res.text();
        console.error(
          `Failed to delete profile. Status: ${res.status}. Body: ${errorPayload}`
        );
        throw new Error(`Failed to delete profile: ${res.statusText}`);
      }
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      setFilteredProfiles((prev) => prev.filter((p) => p.id !== profileId));
      toast.success(`${developerName}'s profile has been deleted`);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting profile");
    }
  };

  const getActiveProjects = (profile: DeveloperProfile): number => {
    return (
      profile.projects?.filter((p) => p.status === "in-progress").length ?? 0
    );
  };

  const getLastActivity = (profile: DeveloperProfile): string => {
    if (!profile.recentActivity || profile.recentActivity.length === 0)
      return "No recent activity";
    const lastActivity = profile.recentActivity[0];
    const date = new Date(lastActivity.timestamp);
    return date.toLocaleDateString();
  };

  const getTopSkills = (profile: DeveloperProfile): string[] => {
    return profile.technicalSkills.primarySkills
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map((skill) => skill.name);
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case "available":
        return "text-green-400";
      case "busy":
        return "text-yellow-400";
      case "unavailable":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getExperienceColor = (level: string): string => {
    switch (level) {
      case "junior":
        return "text-blue-400";
      case "mid":
        return "text-purple-400";
      case "senior":
        return "text-orange-400";
      case "lead":
        return "text-pink-400";
      default:
        return "text-gray-400";
    }
  };

  const renderProfileDetail = (): JSX.Element | null => {
    if (!selectedProfile) return null;

    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-indigo-400/20 rounded-xl mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToList}
                  className="cursor-pointer flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <FaArrowCircleLeft className="w-4 h-4" />
                  <span>Back to Profiles</span>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {selectedProfile.personalInfo.firstName}{" "}
                    {selectedProfile.personalInfo.lastName}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {selectedProfile.professionalInfo.title}
                  </p>
                  {selectedProfile.personalInfo.bio && (
                    <p className="text-gray-300 text-sm mt-2 max-w-md">
                      {selectedProfile.personalInfo.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-white font-medium">
                    {selectedProfile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Hourly Rate</p>
                  <p className="text-xl font-semibold text-green-400">
                    ${selectedProfile.professionalInfo.hourlyRate}/hr
                  </p>
                </div>
                {selectedProfile.stats.responseTime && (
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Response Time</p>
                    <p className="text-white font-medium">
                      {selectedProfile.stats.responseTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FaUser className="text-gray-400" />
                <h3 className="text-lg font-semibold !text-indigo-400">
                  Profile Overview
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">
                    Professional Summary
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedProfile.personalInfo.tagline}
                  </p>
                  {selectedProfile.professionalInfo.bio && (
                    <p className="text-gray-300 leading-relaxed mt-3">
                      {selectedProfile.professionalInfo.bio}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">
                      Experience Level
                    </p>
                    <p
                      className={`font-medium capitalize ${getExperienceColor(
                        selectedProfile.professionalInfo.experienceLevel
                      )}`}
                    >
                      {selectedProfile.professionalInfo.experienceLevel}
                    </p>
                    {selectedProfile.professionalInfo.yearsOfExperience && (
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedProfile.professionalInfo.yearsOfExperience}{" "}
                        years
                      </p>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Availability</p>
                    <p
                      className={`font-medium capitalize ${getAvailabilityColor(
                        selectedProfile.professionalInfo.availability
                      )}`}
                    >
                      {selectedProfile.professionalInfo.availability}
                    </p>
                    {selectedProfile.professionalInfo.workingHours && (
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedProfile.professionalInfo.workingHours}
                      </p>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-white font-medium">
                      {selectedProfile.personalInfo.location}
                    </p>
                    {selectedProfile.personalInfo.timeZone && (
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedProfile.personalInfo.timeZone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FaCode className="text-gray-400" />
                <h3 className="text-lg font-semibold !text-indigo-400">
                  Technical Skills
                </h3>
              </div>

              {/* Primary Skills */}
              <div className="mb-6">
                <h4 className="!text-indigo-300 font-medium mb-3">
                  Primary Skills
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProfile.technicalSkills.primarySkills.map(
                    (skill) => (
                      <div
                        key={skill.name}
                        className="bg-white/5 rounded-lg p-4 text-center"
                      >
                        <div className="relative w-16 h-16 mx-auto mb-3">
                          <svg
                            className="w-16 h-16 transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="text-gray-700"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${skill.level * 21.98} 219.8`}
                              className="text-blue-400"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {skill.level}
                            </span>
                          </div>
                        </div>
                        <h5 className="text-white font-medium mb-1">
                          {skill.name}
                        </h5>
                        <p className="text-gray-400 text-xs">
                          {skill.level}/10
                        </p>
                        {skill.endorsements && (
                          <p className="text-green-400 text-xs mt-1">
                            {skill.endorsements} endorsements
                          </p>
                        )}
                        {skill.lastUsed && (
                          <p className="text-gray-500 text-xs">
                            Last used: {skill.lastUsed}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Additional Skills Sections */}
              {selectedProfile.technicalSkills.frameworks &&
                selectedProfile.technicalSkills.frameworks.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">
                      Frameworks & Libraries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.technicalSkills.frameworks.map(
                        (skill) => (
                          <span
                            key={skill.name}
                            className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill.name} ({skill.level}/10)
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedProfile.technicalSkills.databases &&
                selectedProfile.technicalSkills.databases.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">Databases</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.technicalSkills.databases.map(
                        (skill) => (
                          <span
                            key={skill.name}
                            className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill.name} ({skill.level}/10)
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedProfile.technicalSkills.tools &&
                selectedProfile.technicalSkills.tools.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">
                      Tools & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.technicalSkills.tools.map((skill) => (
                        <span
                          key={skill.name}
                          className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {skill.name} ({skill.level}/10)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedProfile.technicalSkills.cloudPlatforms &&
                selectedProfile.technicalSkills.cloudPlatforms.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">
                      Cloud Platforms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.technicalSkills.cloudPlatforms.map(
                        (platform) => (
                          <span
                            key={platform}
                            className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                          >
                            {platform}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedProfile.technicalSkills.specializations &&
                selectedProfile.technicalSkills.specializations.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.technicalSkills.specializations.map(
                        (spec) => (
                          <span
                            key={spec}
                            className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Enhanced Performance Stats */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FaChartLine className="text-gray-400" />
                <h3 className="text-lg font-semibold !text-indigo-400">
                  Performance Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-sm">Total Projects</p>
                      <p className="text-2xl font-semibold text-white">
                        {selectedProfile.stats.totalProjects}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                      <FaCode className="text-blue-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {selectedProfile.stats.completedProjects ||
                      getActiveProjects(selectedProfile)}{" "}
                    completed
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-2xl font-semibold text-green-400">
                        ${selectedProfile.stats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                      <FaDollarSign className="text-green-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Lifetime earnings</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-sm">Average Rating</p>
                      <p className="text-2xl font-semibold text-yellow-400">
                        {selectedProfile.stats.averageRating.toFixed(1)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <FaStar className="text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Client feedback</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-sm">Client Retention</p>
                      <p className="text-2xl font-semibold text-purple-400">
                        {selectedProfile.stats.clientRetention}%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center">
                      <FaUsers className="text-purple-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Return rate</p>
                </div>

                {/* {selectedProfile.stats.totalCodeLines && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Lines of Code</p>
                        <p className="text-2xl font-semibold text-cyan-400">
                          {selectedProfile.stats.totalCodeLines.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center">
                        <FaCode className="text-cyan-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">Total written</p>
                  </div>
                )}

                {selectedProfile.stats.totalCommits && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Git Commits</p>
                        <p className="text-2xl font-semibold text-orange-400">
                          {selectedProfile.stats.totalCommits.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-orange-400/20 rounded-full flex items-center justify-center">
                        <FaGitAlt className="text-orange-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">Total commits</p>
                  </div>
                )}

                {selectedProfile.stats.bugsFixed && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Bugs Fixed</p>
                        <p className="text-2xl font-semibold text-red-400">
                          {selectedProfile.stats.bugsFixed}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-red-400/20 rounded-full flex items-center justify-center">
                        <FaBug className="text-red-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">Issues resolved</p>
                  </div>
                )}

                {selectedProfile.stats.codeReviewsGiven && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Code Reviews</p>
                        <p className="text-2xl font-semibold text-indigo-400">
                          {selectedProfile.stats.codeReviewsGiven}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-400/20 rounded-full flex items-center justify-center">
                        <FaEye className="text-indigo-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">Reviews given</p>
                  </div>
                )}

                {selectedProfile.stats.mentoringSessions && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-400 text-sm">Mentoring</p>
                        <p className="text-2xl font-semibold text-pink-400">
                          {selectedProfile.stats.mentoringSessions}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-pink-400/20 rounded-full flex items-center justify-center">
                        <FaGraduationCap className="text-pink-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">Sessions held</p>
                  </div>
                )} */}
              </div>
            </div>

            {/* Recent Projects */}
            {selectedProfile.projects &&
              selectedProfile.projects.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaProjectDiagram className="text-gray-400" />
                    <h3 className="text-lg font-semibold !text-indigo-400">
                      Recent Projects
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedProfile?.projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="bg-white/5 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">
                            {project.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : project.status === "in-progress"
                                ? "bg-blue-500/20 text-blue-400"
                                : project.status === "review"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FaDollarSign className="text-green-400 text-xs" />
                              <span className="text-green-400 text-sm font-medium">
                                ${project.budget?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span className="text-gray-400 text-sm">
                                {new Date(
                                  project?.deadline
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {project.technologies.slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  className="bg-black/20 text-gray-300 px-2 py-1 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 4 && (
                                <span className="text-gray-400 text-xs px-2 py-1">
                                  +{project.technologies.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Achievements */}
            {selectedProfile.achievements &&
              selectedProfile.achievements.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaTrophy className="text-gray-400" />
                    <h3 className="text-lg font-semibold !text-indigo-400">
                      Achievements
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProfile.achievements
                      .slice(0, 6)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="bg-white/5 rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                achievement.rarity === "legendary"
                                  ? "bg-yellow-500/20"
                                  : achievement.rarity === "epic"
                                  ? "bg-purple-500/20"
                                  : "bg-blue-500/20"
                              }`}
                            >
                              <span className="text-lg">
                                {achievement.icon}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">
                                {achievement.title}
                              </h4>
                              <p className="text-gray-300 text-sm mt-1">
                                {achievement.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    achievement.rarity === "legendary"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : achievement.rarity === "epic"
                                      ? "bg-purple-500/20 text-purple-400"
                                      : "bg-blue-500/20 text-blue-400"
                                  }`}
                                >
                                  {achievement.rarity}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {new Date(
                                    achievement.earnedDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Enhanced Personal Information */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FaUser className="text-gray-400" />
                <h3 className="text-lg font-semibold !text-indigo-400">
                  Personal Details
                </h3>
              </div>
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-700">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-semibold text-lg">
                      {selectedProfile.personalInfo.firstName[0]}
                      {selectedProfile.personalInfo.lastName[0]}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold mb-1">
                    {selectedProfile.personalInfo.firstName}{" "}
                    {selectedProfile.personalInfo.lastName}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {selectedProfile.professionalInfo.title}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">
                        {selectedProfile.personalInfo.email}
                      </p>
                    </div>
                  </div>

                  {selectedProfile.personalInfo.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaPhone className="text-gray-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white font-medium">
                          {selectedProfile.personalInfo.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">
                        {selectedProfile.personalInfo.location}
                      </p>
                      {selectedProfile.personalInfo.timeZone && (
                        <p className="text-gray-500 text-xs">
                          {selectedProfile.personalInfo.timeZone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaUsers className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Experience</p>
                      <p
                        className={`font-medium capitalize ${getExperienceColor(
                          selectedProfile.professionalInfo.experienceLevel
                        )}`}
                      >
                        {selectedProfile.professionalInfo.experienceLevel}
                      </p>
                      {selectedProfile.professionalInfo.yearsOfExperience && (
                        <p className="text-gray-500 text-xs">
                          {selectedProfile.professionalInfo.yearsOfExperience}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaClock className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Availability</p>
                      <p
                        className={`font-medium capitalize ${getAvailabilityColor(
                          selectedProfile.professionalInfo.availability
                        )}`}
                      >
                        {selectedProfile.professionalInfo.availability}
                      </p>
                      {selectedProfile.professionalInfo.workingHours && (
                        <p className="text-gray-500 text-xs">
                          {selectedProfile.professionalInfo.workingHours}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(selectedProfile.personalInfo.linkedin ||
                  selectedProfile.personalInfo.github ||
                  selectedProfile.personalInfo.portfolio) && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-white font-medium mb-3">Links</h4>
                    <div className="space-y-2">
                      {selectedProfile.personalInfo.linkedin && (
                        <a
                          href={selectedProfile.personalInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FaLinkedin className="w-4 h-4" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                      {selectedProfile.personalInfo.github && (
                        <a
                          href={selectedProfile.personalInfo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span className="text-sm">GitHub</span>
                        </a>
                      )}
                      {selectedProfile.personalInfo.portfolio && (
                        <a
                          href={selectedProfile.personalInfo.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <FaGlobe className="w-4 h-4" />
                          <span className="text-sm">Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Details */}
            {(selectedProfile.professionalInfo.languages ||
              selectedProfile.professionalInfo.certifications ||
              selectedProfile.professionalInfo.preferredWorkType) && (
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FaBriefcase className="text-gray-400" />
                  <h3 className="text-lg font-semibold !text-indigo-400">
                    Professional Details
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedProfile.professionalInfo.languages &&
                    selectedProfile.professionalInfo.languages.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Languages
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.professionalInfo.languages.map(
                            (language) => (
                              <span
                                key={language}
                                className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm"
                              >
                                {language}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {selectedProfile.professionalInfo.certifications &&
                    selectedProfile.professionalInfo.certifications.length >
                      0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Certifications
                        </h4>
                        <div className="space-y-2">
                          {selectedProfile.professionalInfo.certifications.map(
                            (cert) => (
                              <div
                                key={cert}
                                className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg"
                              >
                                <FaCertificate className="text-yellow-400 text-sm" />
                                <span className="text-gray-300 text-sm">
                                  {cert}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {selectedProfile.professionalInfo.preferredWorkType &&
                    selectedProfile.professionalInfo.preferredWorkType.length >
                      0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">
                          Preferred Work Type
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.professionalInfo.preferredWorkType.map(
                            (type) => (
                              <span
                                key={type}
                                className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm"
                              >
                                {type}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {selectedProfile.recentActivity &&
              selectedProfile.recentActivity.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaClock className="text-gray-400" />
                    <h3 className="text-lg font-semibold !text-indigo-400">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedProfile.recentActivity
                      .slice(0, 5)
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              activity.type === "task"
                                ? "bg-blue-500/20 text-blue-400"
                                : activity.type === "feedback"
                                ? "bg-green-500/20 text-green-400"
                                : activity.type === "code"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {activity.type === "task" ? (
                              <FaCheckCircle />
                            ) : activity.type === "feedback" ? (
                              <FaComment />
                            ) : activity.type === "code" ? (
                              <FaCode />
                            ) : (
                              <FaTrophy />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">
                              {activity.action}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(
                                activity.timestamp
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Time Tracking Summary */}
            {selectedProfile.timeEntries &&
              selectedProfile.timeEntries.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FaClock className="text-gray-400" />
                    <h3 className="text-lg font-semibold !text-indigo-400">
                      Time Tracking
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedProfile.timeEntries
                      .slice(0, 5)
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">
                              {entry.project}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {entry.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-cyan-400 font-medium">
                              {entry.hours}h
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Hours</span>
                        <span className="text-cyan-400 font-semibold">
                          {selectedProfile.timeEntries.reduce(
                            (sum, entry) => sum + entry.hours,
                            0
                          )}
                          h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Profile Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleEdit(selectedProfile.id)}
                  className="cursor-pointer w-full px-4 py-3 bg-white/10 hover:bg-black/20 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <FaEdit className="text-blue-400" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() =>
                    handleDelete(
                      selectedProfile.id,
                      `${selectedProfile.personalInfo.firstName} ${selectedProfile.personalInfo.lastName}`
                    )
                  }
                  className="cursor-pointer w-full px-4 py-3 bg-white/10 hover:bg-black/20 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <FaTrash className="text-red-400" />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>

            {/* Enhanced Quick Summary */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Hourly Rate</span>
                  <span className="text-green-400 font-semibold">
                    ${selectedProfile.professionalInfo.hourlyRate}/hr
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Total Projects</span>
                  <span className="text-blue-400 font-semibold">
                    {selectedProfile.stats.totalProjects}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-purple-400 font-semibold">
                    {selectedProfile.stats.clientRetention}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">
                      {selectedProfile.stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = (): JSX.Element => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Developer Profiles
            </h1>
            <p className="text-gray-400">
              Manage and overview all developers in the talent pool.
            </p>
          </div>
          <button
            onClick={handleAddNewDeveloper}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <FaPlus />
            <span>Add New Developer</span>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer appearance-none bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="name" className="bg-gray-800">
                    Name
                  </option>
                  <option value="rating" className="bg-gray-800">
                    Rating
                  </option>
                  <option value="projects" className="bg-gray-800">
                    Projects
                  </option>
                  <option value="earnings" className="bg-gray-800">
                    Earnings
                  </option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`cursor-pointer flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-black/20"
                }`}
              >
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={selectedExperience}
                    onChange={(e) =>
                      setSelectedExperience(e.target.value as ExperienceLevel)
                    }
                    className="cursor-pointer w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">
                      All Levels
                    </option>
                    <option value="junior" className="bg-gray-800">
                      Junior
                    </option>
                    <option value="mid" className="bg-gray-800">
                      Mid-Level
                    </option>
                    <option value="senior" className="bg-gray-800">
                      Senior
                    </option>
                    <option value="lead" className="bg-gray-800">
                      Lead
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability Status
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) =>
                      setSelectedAvailability(
                        e.target.value as AvailabilityStatus
                      )
                    }
                    className="cursor-pointer w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">
                      All Status
                    </option>
                    <option value="available" className="bg-gray-800">
                      Available
                    </option>
                    <option value="busy" className="bg-gray-800">
                      Busy
                    </option>
                    <option value="unavailable" className="bg-gray-800">
                      Unavailable
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredProfiles.slice(0, 6).map((profile) => (
            <div
              key={profile.id}
              className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-gray-700/50 hover:border-gray-600"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {profile.personalInfo.firstName[0]}
                      {profile.personalInfo.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {profile.personalInfo.firstName}{" "}
                      {profile.personalInfo.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {profile.professionalInfo.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-white font-medium text-sm">
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaCode className="text-blue-400 text-sm" />
                    <span className="text-gray-400 text-xs">Projects</span>
                  </div>
                  <p className="text-white font-semibold">
                    {profile.stats.totalProjects}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaBriefcase className="text-green-400 text-sm" />
                    <span className="text-gray-400 text-xs">Exp</span>
                  </div>
                  <p className="text-white font-medium">
                    {profile.professionalInfo.experienceLevel}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {getTopSkills(profile).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    <span className="text-gray-400 text-xs">
                      {profile.personalInfo.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-medium capitalize ${getAvailabilityColor(
                      profile.professionalInfo.availability
                    )}`}
                  >
                    {profile.professionalInfo.availability}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(profile.id)}
                  className="cursor-pointer flex-1 px-3 py-2 bg-indigo-500/20 border border-indigo-400/50 text-gray-300 hover:bg-blue-500/30 hover:text-white rounded-lg transition-all duration-300 text-sm font-medium"
                >
                  <FaEye className="inline mr-2" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(profile.id)}
                  className="cursor-pointer px-3 py-2 bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 rounded-lg transition-all duration-300 text-sm"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() =>
                    handleDelete(
                      profile.id,
                      `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`
                    )
                  }
                  className="cursor-pointer px-3 py-2 bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:text-red-200 rounded-lg transition-all duration-300 text-sm"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No developers found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedExperience("all");
                setSelectedAvailability("all");
                setShowFilters(false);
              }}
              className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-y border-white/10 px-6 py-4 my-16">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 cursor-pointer border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
            ${
              currentPage === page
                ? "bg-blue-500/20 border border-blue-400/50 text-gray-300"
                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
            }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {profiles.length}
              </div>
              <div className="text-gray-400 text-sm">Total Developers</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {
                  profiles.filter(
                    (p) => p.professionalInfo.availability === "available"
                  ).length
                }
              </div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {profiles.length > 0
                  ? (
                      profiles.reduce(
                        (sum, p) => sum + p.stats.averageRating,
                        0
                      ) / profiles.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-gray-400 text-sm">Avg Rating</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {profiles.length > 0
                  ? profiles.reduce((sum, p) => sum + p.stats.totalProjects, 0)
                  : 0}
              </div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (viewMode === "detail") {
    return renderProfileDetail();
  }

  if (viewMode === "edit" && selectedProfile) {
    return (
      <DeveloperProfileEditor
        profileId={selectedProfile.id}
        onSaveSuccess={handleUpdateSuccess}
        onCancel={handleBackFromEditor}
      />
    );
  }

  if (viewMode === "create") {
    return (
      <AddNewDeveloper
        onCancel={handleBackToList}
        onCreate={handleCreateSuccess}
      />
    );
  }

  return renderListView();
};

export default DeveloperProfilesOverview;
