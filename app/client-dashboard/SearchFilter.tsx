import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { ProjectWithDetails } from "./types";

interface ProjectDetails {
  title: string;
  description: string;
  category?: string;
  timeline?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  techStack: string[];
  requirements?: string;
}

interface SearchFilterProps {
  projects: ProjectWithDetails[];
  setFilteredProjects: (projects: ProjectWithDetails[]) => void;
  onViewChange: (view: "grid" | "list") => void;
}

type StatusValue = "all" | ProjectWithDetails["status"];
type PriorityValue = "all" | ProjectWithDetails["priority"];
type DateRangeValue = "all" | "today" | "week" | "month" | "quarter" | "year";
type SortByValue = "newest" | "oldest" | "name" | "priority" | "status";

interface StatusOption {
  value: StatusValue;
  label: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PriorityOption {
  value: PriorityValue;
  label: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const SearchFilterComponent: React.FC<SearchFilterProps> = ({
  projects = [],
  setFilteredProjects,
  onViewChange,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<StatusValue>("all");
  const [selectedPriority, setSelectedPriority] =
    useState<PriorityValue>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>("all");
  const [sortBy, setSortBy] = useState<SortByValue>("newest");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");

  const statusOptions: StatusOption[] = [
    { value: "all", label: "All Status", color: "text-gray-400" },
    {
      value: "pending",
      label: "Pending",
      color: "text-yellow-400",
      icon: Clock,
    },
    { value: "in_progress", label: "In Progress", color: "text-blue-400" },
    { value: "completed", label: "Completed", color: "text-green-400" },
    { value: "on_hold", label: "On Hold", color: "text-orange-400" },
    { value: "cancelled", label: "Cancelled", color: "text-red-400" },
  ];

  const priorityOptions: PriorityOption[] = [
    { value: "all", label: "All Priority", color: "text-gray-400" },
    {
      value: "urgent",
      label: "Urgent",
      color: "text-red-400",
      icon: AlertCircle,
    },
    { value: "high", label: "High", color: "text-orange-400" },
    { value: "medium", label: "Medium", color: "text-yellow-400" },
    { value: "low", label: "Low", color: "text-green-400" },
  ];

  const activeFiltersCount: number = [
    selectedStatus,
    selectedPriority,
    dateRange,
    sortBy,
  ].filter((filter) => filter !== "all" && filter !== "newest").length;

  // Filter projects based on selected criteria
  useEffect(() => {
    let filtered: ProjectWithDetails[] = [...projects];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (project) => project.status === selectedStatus
      );
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (project) => project.priority === selectedPriority
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.techStack.some((tech) =>
            tech.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (project.category &&
            project.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((project) => {
        const projectDate = new Date(project.createdAt);

        switch (dateRange) {
          case "today":
            return projectDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return projectDate >= weekAgo;
          case "month":
            const monthAgo = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              today.getDate()
            );
            return projectDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date(
              today.getFullYear(),
              today.getMonth() - 3,
              today.getDate()
            );
            return projectDate >= quarterAgo;
          case "year":
            const yearAgo = new Date(
              today.getFullYear() - 1,
              today.getMonth(),
              today.getDate()
            );
            return projectDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortBy !== "newest") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "name":
            return a.title.localeCompare(b.title);
          case "priority":
            const priorityOrder: Record<
              ProjectWithDetails["priority"],
              number
            > = {
              urgent: 4,
              high: 3,
              medium: 2,
              low: 1,
            };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "status":
            return a.status.localeCompare(b.status);
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
    } else {
      // Default newest first sorting
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredProjects(filtered);
  }, [
    projects,
    selectedStatus,
    selectedPriority,
    searchQuery,
    dateRange,
    sortBy,
    setFilteredProjects,
  ]);

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setDateRange("all");
    setSortBy("newest");
  };

  interface StatusOptionProps {
    option: StatusOption;
    isSelected: boolean;
  }

  const StatusOption: React.FC<StatusOptionProps> = ({
    option,
    isSelected,
  }) => {
    const Icon = option.icon;
    return (
      <div className={`flex items-center space-x-2 ${option.color}`}>
        {Icon && <Icon className="w-3 h-3" />}
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-white/5 my-8 p-6 rounded-3xl">
      {/* Main Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Enhanced Search Input */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none lg:w-100  transition-all duration-200 hover:border-white/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Custom Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusValue)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:bg-white/10 focus:outline-none transition-all duration-200 hover:border-white/20 cursor-pointer min-w-[140px]"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-gray-900 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Custom Priority Dropdown */}
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as PriorityValue)
              }
              className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:bg-white/10 focus:outline-none transition-all duration-200 hover:border-white/20 cursor-pointer min-w-[140px]"
            >
              {priorityOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-gray-900 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              showAdvancedFilters || activeFiltersCount > 0
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-gray-300 hover:border-white/20"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-gray-400 hover:text-white text-sm underline transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* View Toggle & Sort */}
        <div className="flex items-center space-x-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByValue)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:outline-none transition-all duration-200 hover:border-white/20 cursor-pointer text-sm"
            >
              <option value="newest" className="bg-gray-900">
                Newest first
              </option>
              <option value="oldest" className="bg-gray-900">
                Oldest first
              </option>
              <option value="name" className="bg-gray-900">
                Name A-Z
              </option>
              <option value="priority" className="bg-gray-900">
                Priority
              </option>
              <option value="status" className="bg-gray-900">
                Status
              </option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setCurrentView("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentView === "grid"
                  ? "bg-purple-500/30 text-purple-300 shadow-lg"
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
              }`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentView === "list"
                  ? "bg-purple-500/30 text-purple-300 shadow-lg"
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Date Range:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeValue)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              >
                <option value="all" className="bg-gray-900">
                  All time
                </option>
                <option value="today" className="bg-gray-900">
                  Today
                </option>
                <option value="week" className="bg-gray-900">
                  This week
                </option>
                <option value="month" className="bg-gray-900">
                  This month
                </option>
                <option value="quarter" className="bg-gray-900">
                  This quarter
                </option>
                <option value="year" className="bg-gray-900">
                  This year
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(searchQuery || activeFiltersCount > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400">Active filters:</span>

          {searchQuery && (
            <div className="flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
              <Search className="w-3 h-3" />
              <span>"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {selectedStatus !== "all" && (
            <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
              <span>
                Status:{" "}
                {statusOptions.find((s) => s.value === selectedStatus)?.label}
              </span>
              <button
                onClick={() => setSelectedStatus("all")}
                className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {selectedPriority !== "all" && (
            <div className="flex items-center space-x-1 bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
              <span>
                Priority:{" "}
                {
                  priorityOptions.find((p) => p.value === selectedPriority)
                    ?.label
                }
              </span>
              <button
                onClick={() => setSelectedPriority("all")}
                className="ml-1 hover:bg-orange-500/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilterComponent;
