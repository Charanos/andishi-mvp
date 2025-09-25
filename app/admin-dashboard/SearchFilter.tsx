"use client";

import React from "react";
import {
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { HiViewGrid, HiViewList } from "react-icons/hi";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  filteredProjectsCount: number;
  totalProjectsCount: number;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  filteredProjectsCount,
  totalProjectsCount,
  clearFilters,
  hasActiveFilters,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) => {
  return (
    <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 my-12">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search projects by name, client, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 dark:bg-black/40 border border-gray-300 dark:border-slate-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/20 dark:bg-black/40 border border-gray-300 dark:border-slate-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-black/40">
              All Status
            </option>
            <option value="pending" className="bg-white dark:bg-black/40">
              Pending
            </option>
            <option value="reviewed" className="bg-white dark:bg-black/40">
              Reviewed
            </option>
            <option value="approved" className="bg-white dark:bg-black/40">
              Approved
            </option>
            <option value="rejected" className="bg-white dark:bg-black/40">
              Rejected
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 bg-white/20 dark:bg-black/40 border border-gray-300 dark:border-slate-600/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-black/40">
              All Priority
            </option>
            <option value="critical" className="bg-white dark:bg-black/40">
              Critical
            </option>
            <option value="high" className="bg-white dark:bg-black/40">
              High
            </option>
            <option value="medium" className="bg-white dark:bg-black/40">
              Medium
            </option>
            <option value="low" className="bg-white dark:bg-black/40">
              Low
            </option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative ">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-5 py-3 pr-12 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 font-medium backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 min-w-[160px] bg-white/20 dark:bg-black/70 cursor-pointer"
            >
              <option value="newest" className="bg-white dark:bg-gray-800">
                Newest First
              </option>
              <option value="oldest" className="bg-white dark:bg-gray-800">
                Oldest First
              </option>
              <option value="name" className="bg-white dark:bg-gray-800">
                Name A-Z
              </option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-xl border border-gray-300 dark:border-white/10 overflow-hidden bg-white/20 dark:bg-black/70">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3.5 transition-all duration-300 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
              title="Grid View"
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-300 dark:bg-white/10"></div>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3.5 transition-all duration-300 cursor-pointer ${
                viewMode === "list"
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
              title="List View"
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FiTrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-300">
                Showing{" "}
                <span className="text-gray-900 dark:text-white font-semibold">
                  {filteredProjectsCount}
                </span>{" "}
                of{" "}
                <span className="text-gray-900 dark:text-white font-semibold">
                  {totalProjectsCount}
                </span>{" "}
                projects
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500/30 dark:bg-purple-500/20 border border-purple-400/40 dark:border-purple-400/30 rounded-full text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-500/40 dark:hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
              >
                <FiX className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
