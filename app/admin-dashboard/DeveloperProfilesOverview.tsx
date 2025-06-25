"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/fa";
import { toast } from "react-toastify";

interface DeveloperProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    portfolio?: string;
    tagline: string;
  };
  professionalInfo: {
    title: string;
    experienceLevel: string;
    availability: string;
    hourlyRate: number;
  };
  technicalSkills: {
    primarySkills: Array<{ name: string; level: number }>;
  };
  stats: {
    totalProjects: number;
    averageRating: number;
    totalEarnings: number;
    clientRetention: number;
  };
  projects: Array<{
    status: string;
  }>;
  recentActivity: Array<{
    timestamp: string;
  }>;
}

interface Props {
  onViewProfile?: (profileId: string) => void; // Callback to parent component
}

const DeveloperProfilesOverview: React.FC<Props> = ({ onViewProfile }) => {
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<DeveloperProfile[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProfile, setSelectedProfile] =
    useState<DeveloperProfile | null>(null);
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Fetch developer profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Changed from /api/developer-profiles to /api/developer-profile
        const res = await fetch("/api/developer-profile");
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();

        // Ensure data is always an array
        const profilesArray = Array.isArray(data) ? data : [data];
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
        case "rate":
          return b.professionalInfo.hourlyRate - a.professionalInfo.hourlyRate;
        default:
          return 0;
      }
    });

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, selectedExperience, selectedAvailability, sortBy]);

  const handleEdit = (profileId: string) => {
    // Route to the edit page with the profile ID
    router.push(`/admin-dashboard/developer-profiles/${profileId}/edit/`);
  };

  const handleView = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setViewMode("detail");
      // If parent wants to handle view state, call the callback
      if (onViewProfile) {
        onViewProfile(profileId);
      }
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProfile(null);
  };

  const handleDelete = async (profileId: string, developerName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${developerName}'s profile? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/developer-profile`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete profile");

      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      toast.success(`${developerName}'s profile has been deleted`);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting profile");
    }
  };

  const getActiveProjects = (profile: DeveloperProfile) => {
    return profile.projects.filter((p) => p.status === "in-progress").length;
  };

  const getLastActivity = (profile: DeveloperProfile) => {
    if (profile.recentActivity.length === 0) return "No recent activity";
    const lastActivity = profile.recentActivity[0];
    const date = new Date(lastActivity.timestamp);
    return date.toLocaleDateString();
  };

  const getTopSkills = (profile: DeveloperProfile) => {
    return profile.technicalSkills.primarySkills
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map((skill) => skill.name);
  };

  // Render detailed profile view
  const renderProfileDetail = () => {
    if (!selectedProfile) return null;

    return (
      <div className="bg-white/5 min-h-screen rounded-lg">
        {/* Header Section */}
        <div className="backdrop-blur-xl bg-indigo-900/80 border-b rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToList}
                  className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
                >
                  <FaArrowCircleLeft className="w-5 h-5" />
                  <span>Back to Profiles</span>
                </button>
                <div className="h-6 w-px bg-white/20"></div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {selectedProfile.personalInfo.firstName}{" "}
                    {selectedProfile.personalInfo.lastName}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedProfile.professionalInfo.title}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-white font-medium text-lg">
                    {selectedProfile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Hourly Rate</p>
                  <p className="text-2xl font-semibold text-green-400">
                    ${selectedProfile.professionalInfo.hourlyRate}/hr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Overview Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl monty font-semibold !text-indigo-400">
                    Profile Overview
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-indigo-200 mb-3">
                      Professional Summary
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-md">
                      {selectedProfile.personalInfo.tagline}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-indigo-300 text-sm monty uppercase font-medium mb-2">
                        Experience Level
                      </p>
                      <p className="text-white font-semibold text-md">
                        {selectedProfile.professionalInfo.experienceLevel}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-indigo-300 text-sm monty uppercase font-medium mb-2">
                        Availability
                      </p>
                      <p className="text-white font-semibold text-md">
                        {selectedProfile.professionalInfo.availability}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-indigo-300 text-sm monty uppercase font-medium mb-2">
                        Location
                      </p>
                      <p className="text-white font-semibold text-md">
                        {selectedProfile.personalInfo.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills Card */}

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <FaCode className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl monty font-semibold !text-indigo-400">
                    Technical Skills
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Responsive grid - single column on mobile, 2 on tablet, 3 on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedProfile.technicalSkills.primarySkills.map(
                      (skill) => (
                        <div
                          key={skill.name}
                          className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all text-center"
                        >
                          {/* Circular Progress */}
                          <div className="relative w-20 h-20 mx-auto mb-4">
                            {/* Background circle */}
                            <svg
                              className="w-20 h-20 transform -rotate-90"
                              viewBox="0 0 100 100"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-700"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${skill.level * 25.12} 251.2`}
                                className="text-blue-500 transition-all duration-1000"
                                strokeLinecap="round"
                              />
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {skill.level}
                              </span>
                            </div>
                          </div>

                          {/* Skill name */}
                          <h5 className="text-white font-semibold text-base mb-2">
                            {skill.name}
                          </h5>
                          <p className="text-indigo-300 text-sm">
                            {skill.level}/10 Proficiency
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Stats Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl monty font-semibold !text-indigo-400">
                    Performance Statistics
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-indigo-300 text-sm font-medium mb-1">
                          Total Projects
                        </p>
                        <p className="text-3xl font-semibold text-white">
                          {selectedProfile.stats.totalProjects}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FaCode className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {getActiveProjects(selectedProfile)} currently active
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-indigo-300 text-sm font-medium mb-1">
                          Total Earnings
                        </p>
                        <p className="text-3xl font-semibold text-green-400">
                          $
                          {selectedProfile.stats.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <FaDollarSign className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Lifetime earnings</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-indigo-300 text-sm font-medium mb-1">
                          Average Rating
                        </p>
                        <p className="text-3xl font-semibold text-yellow-400">
                          {selectedProfile.stats.averageRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <FaStar className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Based on client feedback
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-indigo-300 text-sm font-medium mb-1">
                          Client Retention
                        </p>
                        <p className="text-3xl font-semibold text-purple-400">
                          {selectedProfile.stats.clientRetention}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FaUsers className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Return client rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Personal Info & Actions */}
            <div className="space-y-8">
              {/* Personal Information Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl monty font-semibold !text-indigo-400">
                    Personal Details
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-white/10">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-semibold text-xl">
                        {selectedProfile.personalInfo.firstName[0]}
                        {selectedProfile.personalInfo.lastName[0]}
                      </span>
                    </div>
                    <h4 className="text-lg mb-2 font-semibold text-white">
                      {selectedProfile.personalInfo.firstName}{" "}
                      {selectedProfile.personalInfo.lastName}
                    </h4>
                    <p className="text-indigo-300 text-sm monty uppercase">
                      {selectedProfile.professionalInfo.title}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaMapMarkerAlt className="text-indigo-400" />
                      <div>
                        <p className="text-indigo-300 text-sm monty uppercase">
                          Location
                        </p>
                        <p className="text-white font-medium">
                          {selectedProfile.personalInfo.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaUsers className="text-indigo-400" />
                      <div>
                        <p className="text-indigo-300 text-sm monty uppercase">
                          Experience
                        </p>
                        <p className="text-white font-medium">
                          {selectedProfile.professionalInfo.experienceLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaClock className="text-indigo-400" />
                      <div>
                        <p className="text-indigo-300 text-sm monty uppercase">
                          Availability
                        </p>
                        <p className="text-white font-medium">
                          {selectedProfile.professionalInfo.availability}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl monty font-semibold !text-indigo-400 mb-6">
                  Profile Actions
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => handleEdit(selectedProfile.id)}
                    className="cursor-pointer w-full px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-medium hover:shadow-lg hover:shadow-green-500/10 group"
                  >
                    <FaEdit className="text-lg text-green-400 group-hover:text-green-300 transition-colors" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        selectedProfile.id,
                        `${selectedProfile.personalInfo.firstName} ${selectedProfile.personalInfo.lastName}`
                      )
                    }
                    className="cursor-pointer w-full px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-red-500/20 hover:border-red-400/40 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-medium hover:shadow-lg hover:shadow-red-500/10 group"
                  >
                    <FaTrash className="text-lg text-red-400 group-hover:text-red-300 transition-colors" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats Summary Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Quick Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Hourly Rate</span>
                    <span className="text-green-400 font-semibold">
                      ${selectedProfile.professionalInfo.hourlyRate}/hr
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Projects</span>
                    <span className="text-blue-400 font-semibold">
                      {selectedProfile.stats.totalProjects}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-purple-400 font-semibold">
                      {selectedProfile.stats.clientRetention}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Rating</span>
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
      </div>
    );
  };

  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    return (
      <div className=" min-h-screen rounded-lg">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Developer Profiles
              </h1>
              <p className="text-gray-400">
                Manage and overview all developers in our talent pool.
              </p>
            </div>
          </div>
        </div>
        {/* Search and Filter Controls */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
              >
                <FaFilter />
                <span>Filters</span>
                <FaChevronDown
                  className={`transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="projects">Sort by Projects</option>
                <option value="earnings">Sort by Earnings</option>
                <option value="rate">Sort by Rate</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Availability</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-300">
            Showing {filteredProfiles.length} of {profiles.length} developers
          </p>
        </div>

        {/* Developer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {profile.personalInfo.firstName[0]}
                      {profile.personalInfo.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
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
                  <span className="text-white font-medium">
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Location and Rate */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <FaMapMarkerAlt className="text-sm" />
                  <span className="text-sm">
                    {profile.personalInfo.location}
                  </span>
                </div>
                <div className="text-green-400 font-semibold">
                  ${profile.professionalInfo.hourlyRate}/hr
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {getTopSkills(profile).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">
                    {profile.stats.totalProjects}
                  </p>
                  <p className="text-gray-400 text-xs">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-green-400">
                    ${(profile.stats.totalEarnings / 1000).toFixed(0)}k
                  </p>
                  <p className="text-gray-400 text-xs">Earned</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(profile.id)}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <FaEye />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEdit(profile.id)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() =>
                    handleDelete(
                      profile.id,
                      `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`
                    )
                  }
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
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
            <FaExclamationTriangle className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No developers found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Main render - THIS WAS MISSING!
  return (
    <div>
      {viewMode === "detail" ? renderProfileDetail() : renderListView()}
    </div>
  );
};

export default DeveloperProfilesOverview;
