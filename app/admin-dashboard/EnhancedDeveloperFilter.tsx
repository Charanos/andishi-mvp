"use client";

import React, { useState } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaFilter,
  FaStar,
  FaCertificate,
  FaTimes,
} from "react-icons/fa";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { IoIosExit, IoMdTrendingUp } from "react-icons/io";

// Define types for our filter options
type ExperienceLevel = "all" | "junior" | "mid" | "senior" | "lead";
type AvailabilityStatus = "all" | "available" | "busy" | "unavailable";
type SortOption = "name" | "rating" | "projects" | "earnings" | "newest";
type ViewMode = "list" | "detail" | "edit" | "create" | "grid";

interface EnhancedDeveloperFilterProps {
  searchTerm: string;
  onSearchChange: (query: string) => void;
  selectedExperience: ExperienceLevel;
  onExperienceChange: (level: ExperienceLevel) => void;
  selectedAvailability: AvailabilityStatus;
  onAvailabilityChange: (status: AvailabilityStatus) => void;
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  selectedCertifications: string[];
  onCertificationsChange: (certifications: string[]) => void;
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  sortBy: SortOption;
  onSortChange: React.Dispatch<React.SetStateAction<SortOption>>;
  viewMode: ViewMode;
  onViewModeChange: React.Dispatch<React.SetStateAction<ViewMode>>;
  languageOptions: string[];
  certificationOptions: string[];
  skillOptions: string[];
  filteredProfilesCount: number;
  totalProfilesCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const EnhancedDeveloperFilter: React.FC<EnhancedDeveloperFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedExperience,
  onExperienceChange,
  selectedAvailability,
  onAvailabilityChange,
  selectedLanguages,
  onLanguagesChange,
  selectedCertifications,
  onCertificationsChange,
  selectedSkills,
  onSkillsChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  languageOptions = ["JavaScript", "TypeScript", "Python", "React", "Node.js"],
  certificationOptions = [
    "AWS Certified",
    "Google Cloud",
    "Azure",
    "Kubernetes",
  ],
  skillOptions = ["React", "Vue", "Angular", "Node.js", "Python", "Docker"],
  filteredProfilesCount,
  totalProfilesCount,
  hasActiveFilters,
  clearFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Toggle language in filters
  const toggleLanguageFilter = (language: string) => {
    if (selectedLanguages.includes(language)) {
      onLanguagesChange(selectedLanguages.filter((l) => l !== language));
    } else {
      onLanguagesChange([...selectedLanguages, language]);
    }
  };

  // Toggle certification in filters
  const toggleCertificationFilter = (certification: string) => {
    if (selectedCertifications.includes(certification)) {
      onCertificationsChange(
        selectedCertifications.filter((c) => c !== certification)
      );
    } else {
      onCertificationsChange([...selectedCertifications, certification]);
    }
  };

  // Toggle skill in filters
  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedExperience !== "all") count++;
    if (selectedAvailability !== "all") count++;
    if (selectedLanguages.length > 0) count++;
    if (selectedCertifications.length > 0) count++;
    if (selectedSkills.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white/5 rounded-xl p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search developers by name, skills, or expertise..."
              className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort and View Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[140px]"
            >
              <option value="name" className="bg-black">
                Name
              </option>
              <option value="rating" className="bg-black">
                Rating
              </option>
              <option value="projects" className="bg-black">
                Projects
              </option>
              <option value="earnings" className="bg-black">
                Earnings
              </option>
              <option value="newest" className="bg-black">
                Newest
              </option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`relative cursor-pointer flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              showAdvancedFilters
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            title="Advanced Filters"
          >
            <FaFilter />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-600 overflow-hidden bg-black/50">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-3 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="List View"
            >
              <HiViewList className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-600"></div>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-3 transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Grid View"
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Experience Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={selectedExperience}
                  onChange={(e) =>
                    onExperienceChange(e.target.value as ExperienceLevel)
                  }
                  className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Availability Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Availability Status
              </label>
              <div className="relative">
                <select
                  value={selectedAvailability}
                  onChange={(e) =>
                    onAvailabilityChange(e.target.value as AvailabilityStatus)
                  }
                  className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Languages Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Languages
              </label>
              <div className="bg-white/10 border border-gray-600 rounded-lg p-4 min-h-[120px] max-h-32 overflow-y-auto">
                {languageOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((language) => (
                      <button
                        key={language}
                        onClick={() => toggleLanguageFilter(language)}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedLanguages.includes(language)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">
                    No languages available
                  </span>
                )}
              </div>
            </div>

            {/* Certifications Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Certifications
              </label>
              <div className="bg-white/10 border border-gray-600 rounded-lg p-4 min-h-[120px] max-h-32 overflow-y-auto">
                {certificationOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map((certification) => (
                      <button
                        key={certification}
                        onClick={() => toggleCertificationFilter(certification)}
                        className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-colors ${
                          selectedCertifications.includes(certification)
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <FaCertificate className="text-xs" />
                        {certification}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">
                    No certifications available
                  </span>
                )}
              </div>
            </div>

            {/* Skills Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Technical Skills
              </label>
              <div className="bg-white/10 border border-gray-600 rounded-lg p-4 min-h-[120px] max-h-32 overflow-y-auto">
                {skillOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkillFilter(skill)}
                        className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-colors ${
                          selectedSkills.includes(skill)
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <FaStar className="text-xs" />
                        {skill}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">
                    No skills available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <IoMdTrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">
                Showing{" "}
                <span className="text-white font-semibold">
                  {filteredProfilesCount || 0}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {totalProfilesCount || 0}
                </span>{" "}
                developers
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs text-blue-300 hover:bg-blue-500/30 transition-colors duration-200 cursor-pointer"
              >
                <IoIosExit className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { EnhancedDeveloperFilter };
