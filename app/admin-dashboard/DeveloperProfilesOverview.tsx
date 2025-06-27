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
} from "react-icons/fa";
import { toast } from "react-toastify";
import AddNewDeveloper from "./AddNewDeveloper";

import type { DeveloperProfile } from "../../lib/types";

interface Props {
  onViewProfile?: (profileId: string) => void;
}

type ViewMode = "list" | "detail" | "edit" | "create";
type SortOption = "name" | "rating" | "projects" | "earnings" | "rate";
type ExperienceLevel = "all" | "junior" | "mid" | "senior" | "lead";
type AvailabilityStatus = "all" | "available" | "busy" | "unavailable";

const DeveloperProfilesOverview: React.FC<Props> = ({ onViewProfile }) => {
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<DeveloperProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProfile, setSelectedProfile] = useState<DeveloperProfile | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus>("all");
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
        case "rate":
          return b.professionalInfo.hourlyRate - a.professionalInfo.hourlyRate;
        default:
          return 0;
      }
    });

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, selectedExperience, selectedAvailability, sortBy]);

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
      const res = await fetch(`/api/developer-profiles?id=${profileId}`, {
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
    return profile.projects?.filter((p) => p.status === "in-progress").length ?? 0;
  };

  const getLastActivity = (profile: DeveloperProfile): string => {
    if (!profile.recentActivity || profile.recentActivity.length === 0) return "No recent activity";
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

  // Render detailed profile view
  const renderProfileDetail = (): JSX.Element | null => {
    if (!selectedProfile) return null;

    return (
      <div className=" min-h-screen rounded-lg">
        {/* Header Section */}
        <div className="bg-indigo-400/10 backdrop-blur-md rounded-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToList}
                  className="flex cursor-pointer items-center space-x-2 text-slate-300 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
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
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedProfile.professionalInfo.title}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-amber-400" />
                  <span className="text-white font-medium text-lg">
                    {selectedProfile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Hourly Rate</p>
                  <p className="text-2xl font-semibold text-emerald-400">
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">
                    Profile Overview
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-slate-300 mb-3">
                      Professional Summary
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-md">
                      {selectedProfile.personalInfo.tagline}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-slate-400 text-sm uppercase font-medium mb-2">
                        Experience Level
                      </p>
                      <p className="text-white font-semibold text-md">
                        {selectedProfile.professionalInfo.experienceLevel}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-slate-400 text-sm uppercase font-medium mb-2">
                        Availability
                      </p>
                      <p className="text-white font-semibold text-md">
                        {selectedProfile.professionalInfo.availability}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-slate-400 text-sm uppercase font-medium mb-2">
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-sky-600 to-sky-700 rounded-lg flex items-center justify-center">
                    <FaCode className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">
                    Technical Skills
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedProfile.technicalSkills.primarySkills.map(
                      (skill) => (
                        <div
                          key={skill.name}
                          className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all text-center"
                        >
                          {/* Circular Progress */}
                          <div className="relative w-20 h-20 mx-auto mb-4">
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
                                className="text-slate-700"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${skill.level * 25.12} 251.2`}
                                className="text-sky-500 transition-all duration-1000"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {skill.level}
                              </span>
                            </div>
                          </div>

                          <h5 className="text-white font-semibold text-base mb-2">
                            {skill.name}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            {skill.level}/10 Proficiency
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Stats Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">
                    Performance Statistics
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                          Total Projects
                        </p>
                        <p className="text-3xl font-semibold text-white">
                          {selectedProfile.stats.totalProjects}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-sky-600 to-sky-700 rounded-full flex items-center justify-center">
                        <FaCode className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">
                      {getActiveProjects(selectedProfile)} currently active
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                          Total Earnings
                        </p>
                        <p className="text-3xl font-semibold text-emerald-400">
                          $
                          {selectedProfile.stats.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center">
                        <FaDollarSign className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">Lifetime earnings</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                          Average Rating
                        </p>
                        <p className="text-3xl font-semibold text-amber-400">
                          {selectedProfile.stats.averageRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
                        <FaStar className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Based on client feedback
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                          Client Retention
                        </p>
                        <p className="text-3xl font-semibold text-violet-400">
                          {selectedProfile.stats.clientRetention}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-violet-700 rounded-full flex items-center justify-center">
                        <FaUsers className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">Return client rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Personal Info & Actions */}
            <div className="space-y-8">
              {/* Personal Information Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">
                    Personal Details
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-white/10">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-semibold text-xl">
                        {selectedProfile.personalInfo.firstName[0]}
                        {selectedProfile.personalInfo.lastName[0]}
                      </span>
                    </div>
                    <h4 className="text-lg mb-2 font-semibold text-white">
                      {selectedProfile.personalInfo.firstName}{" "}
                      {selectedProfile.personalInfo.lastName}
                    </h4>
                    <p className="text-slate-400 text-sm uppercase">
                      {selectedProfile.professionalInfo.title}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaMapMarkerAlt className="text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm uppercase">
                          Location
                        </p>
                        <p className="text-white font-medium">
                          {selectedProfile.personalInfo.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaUsers className="text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm uppercase">
                          Experience
                        </p>
                        <p className="text-white font-medium">
                          {selectedProfile.professionalInfo.experienceLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FaClock className="text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm uppercase">
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
                <h3 className="text-xl font-semibold text-slate-200 mb-6">
                  Profile Actions
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => handleEdit(selectedProfile.id)}
                    className="cursor-pointer w-full px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/40 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-medium hover:shadow-lg hover:shadow-emerald-500/10 group"
                  >
                    <FaEdit className="text-lg text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        selectedProfile.id,
                        `${selectedProfile.personalInfo.firstName} ${selectedProfile.personalInfo.lastName}`
                      )
                    }
                    className="cursor-pointer w-full px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-rose-500/20 hover:border-rose-400/40 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-medium hover:shadow-lg hover:shadow-rose-500/10 group"
                  >
                    <FaTrash className="text-lg text-rose-400 group-hover:text-rose-300 transition-colors" />
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
                    <span className="text-slate-300">Hourly Rate</span>
                    <span className="text-emerald-400 font-semibold">
                      ${selectedProfile.professionalInfo.hourlyRate}/hr
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300">Total Projects</span>
                    <span className="text-sky-400 font-semibold">
                      {selectedProfile.stats.totalProjects}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300">Success Rate</span>
                    <span className="text-violet-400 font-semibold">
                      {selectedProfile.stats.clientRetention}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300">Rating</span>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-amber-400" />
                      <span className="text-amber-400 font-semibold">
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

  const renderListView = (): JSX.Element => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen rounded-lg">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Developer Profiles
              </h1>
              <p className="text-slate-400">
                Manage and overview all developers in our talent pool.
              </p>
            </div>
          </div>

          {/* Add New Developer Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddNewDeveloper}
              className="cursor-pointer flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              <FaPlus />
              <span>Add New Developer</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="name" className="bg-slate-800">Name</option>
                  <option value="rating" className="bg-slate-800">Rating</option>
                  <option value="projects" className="bg-slate-800">Projects</option>
                  <option value="earnings" className="bg-slate-800">Earnings</option>
                  <option value="rate" className="bg-slate-800">Hourly Rate</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`cursor-pointer flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value as ExperienceLevel)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-slate-800">All Levels</option>
                    <option value="junior" className="bg-slate-800">Junior</option>
                    <option value="mid" className="bg-slate-800">Mid-Level</option>
                    <option value="senior" className="bg-slate-800">Senior</option>
                    <option value="lead" className="bg-slate-800">Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Availability Status
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value as AvailabilityStatus)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-slate-800">All Status</option>
                    <option value="available" className="bg-slate-800">Available</option>
                    <option value="busy" className="bg-slate-800">Busy</option>
                    <option value="unavailable" className="bg-slate-800">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Showing {filteredProfiles.length} of {profiles.length} developers
            </p>
            {filteredProfiles.length === 0 && profiles.length > 0 && (
              <div className="flex items-center space-x-2 text-amber-400">
                <FaExclamationTriangle />
                <span>No developers match your current filters</span>
              </div>
            )}
          </div>
        </div>

        {/* Developer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {profile.personalInfo.firstName[0]}
                      {profile.personalInfo.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {profile.professionalInfo.title}
                    </p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-1 bg-amber-500/20 px-3 py-1 rounded-full">
                  <FaStar className="text-amber-400 text-sm" />
                  <span className="text-amber-400 font-medium text-sm">
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-slate-400 text-sm" />
                  <span className="text-slate-300 text-sm">
                    {profile.personalInfo.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-slate-400 text-sm" />
                  <span className="text-slate-300 text-sm">
                    {profile.professionalInfo.availability}
                  </span>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-400 text-sm">Hourly Rate</span>
                  <span className="text-emerald-400 font-semibold text-lg">
                    ${profile.professionalInfo.hourlyRate}/hr
                  </span>
                </div>
              </div>

              {/* Top Skills */}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {getTopSkills(profile).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">
                    {profile.stats.totalProjects}
                  </p>
                  <p className="text-slate-400 text-xs">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-400 font-semibold text-lg">
                    ${Math.round(profile.stats.totalEarnings / 1000)}k
                  </p>
                  <p className="text-slate-400 text-xs">Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-violet-400 font-semibold text-lg">
                    {profile.stats.clientRetention}%
                  </p>
                  <p className="text-slate-400 text-xs">Retention</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(profile.id)}
                  className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <FaEye />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEdit(profile.id)}
                  className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center"
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
                  className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfiles.length === 0 && profiles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="text-slate-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No developers found
            </h3>
            <p className="text-slate-400 mb-6">
              Get started by adding your first developer profile.
            </p>
            <button
              onClick={handleAddNewDeveloper}
              className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto font-medium"
            >
              <FaPlus />
              <span>Add First Developer</span>
            </button>
          </div>
        )}
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
        initialProfile={selectedProfile}
        profileId={selectedProfile.id}
        onSaveSuccess={handleUpdateSuccess}
        onCancel={handleBackFromEditor}
      />
    );
  }

  if (viewMode === "create") {
    return (
      <AddNewDeveloper
        onCancel={() => setViewMode("list")}
        onCreate={handleCreateSuccess}
      />
    );
  }

  return renderListView();
};

export default DeveloperProfilesOverview;