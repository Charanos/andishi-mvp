"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiTrendingUp,
  FiX,
  FiCalendar,
  FiUsers,
  FiStar,
  FiExternalLink,
  FiGithub,
  FiPlay,
} from "react-icons/fi";
import { HiSparkles, HiViewGrid, HiViewList } from "react-icons/hi";
import { FaBolt, FaFire, FaCode, FaSmile } from "react-icons/fa";
import { useHomepageProjectCRUD } from "@/hooks/useHomepageProjectCRUD";
import { useReviewCrud } from "@/hooks/useReviewCrud";
import { ReviewType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  image: string;
  projectImages?: string[];
  technologies: string[];
  gradient?: string;
  liveUrl?: string;
  githubUrl?: string;
  slug?: string;
  client: string;
  duration: string;
  teamSize: string;
  year?: string;
  status: "completed" | "in-progress" | "planning";
  featured: boolean;
}

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { fetchHomepageProjects, isLoading } = useHomepageProjectCRUD();
  const { fetchReviews, isLoading: reviewsLoading } = useReviewCrud();
  const [rawProjects, setRawProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projects, reviewsData] = await Promise.all([
          fetchHomepageProjects(),
          fetchReviews(),
        ]);
        setRawProjects(projects || []);
        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setRawProjects([]);
        setReviews([]);
      }
    };
    loadData();
  }, [fetchHomepageProjects, fetchReviews]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById(
          "project-search"
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Transform homepage projects to match portfolio interface
  const projects: Project[] = useMemo(() => {
    return (rawProjects || []).map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      longDescription: project.description, // Use description as longDescription
      category: project.category,
      image:
        project.image ||
        (project.projectImages && project.projectImages[0]) ||
        "/images/placeholder-project.webp",
      projectImages: project.projectImages,
      technologies: Array.isArray(project.technologies)
        ? project.technologies
        : typeof project.technologies === "string"
        ? project.technologies.split(",").map((t: string) => t.trim())
        : [],
      gradient: "from-blue-500/20 to-cyan-500/10", // Default gradient
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      slug: project.slug,
      client: project.client,
      duration: project.duration,
      teamSize: project.teamSize,
      year: new Date().getFullYear().toString(), // Current year as default
      status: project.status as "completed" | "in-progress" | "planning",
      featured: project.featured,
    }));
  }, [rawProjects]);

  // Tech icons colors mapping
  const techColors: { [key: string]: string } = {
    React:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Next.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Node.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    TypeScript:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Python:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Tailwind CSS":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    MongoDB:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    PostgreSQL:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Firebase:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    AWS: "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    "Vue.js":
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Blockchain:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Flutter:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Django:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Express:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Redis:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Docker:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Kubernetes:
      "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
    Web3: "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15",
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = projects.map((project) => project.category);
    return ["all", ...Array.from(new Set(cats))];
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (project) => project.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(query)
          ) ||
          project.client.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query)
      );
    }

    // Sort projects
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) =>
          (b.year || "2024").localeCompare(a.year || "2024")
        );
      case "oldest":
        return filtered.sort((a, b) =>
          (a.year || "2024").localeCompare(b.year || "2024")
        );
      case "featured":
        return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
      case "alphabetical":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [projects, selectedCategory, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedCategory !== "all" || searchQuery !== "" || sortBy !== "newest";

  if (isLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D0E] dark:bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-xl">
            Loading our projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D0E] dark:bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 border-b border-gray-200 dark:border-white/5 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HiSparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              <h1 className="text-5xl lg:text-7xl font-semibold bg-gradient-to-r from-gray-900 via-purple-600 to-purple-800 dark:from-white dark:via-purple-200 dark:to-purple-400 bg-clip-text text-transparent monty">
                Our Portfolio
              </h1>
              <HiSparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our comprehensive portfolio of innovative solutions across
              various industries and cutting-edge technologies
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {[
              {
                label: "Projects Delivered",
                value: `${projects.length}+`,
                color: "purple",
                icon: <FaCode />,
              },
              {
                label: "Satisfied Clients",
                value: `${Math.max(projects.length - 5, 1)}+`,
                color: "blue",
                icon: <FaSmile />,
              },
              {
                label: "Technologies Used",
                value: `${
                  Array.from(new Set(projects.flatMap((p) => p.technologies)))
                    .length
                }+`,
                color: "green",
                icon: <FaBolt />,
              },
              {
                label: "Success Rate",
                value: "99.9%",
                color: "orange",
                icon: <FaFire />,
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex flex-col items-center justify-center absolute inset-0 bg-gradient-to-r from-${
                    stat.color
                  }-600/20 to-${
                    stat.color === "orange" ? "red" : stat.color
                  }-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100`}
                ></div>
                <div className="flex flex-col items-center justify-center relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:transform hover:scale-[1.01] hover:bg-white/90 dark:hover:bg-white/8">
                  <div className="text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 monty">
                    {stat.value}
                  </div>
                  <div className="text-xs monty uppercase text-blue-600 dark:text-blue-300 font-medium mb-3">
                    {stat.label}
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Filters and Controls */}
      <section className="py-16 border-b border-gray-200 dark:border-white/5 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiFilter className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Discover Some of Our Work
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Find the perfect project that matches your interests
            </p>
          </div>

          {/* Main Controls Container */}
          <div className="bg-white/80 dark:bg-black/10 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-xl">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto group">
                <div
                  className={`bg-gray-300 text-black ${
                    isSearchFocused ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <div className="relative">
                  <input
                    id="project-search"
                    type="text"
                    placeholder="Search projects, technologies, clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full px-6 py-4 pl-14 pr-20 bg-white/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:bg-white dark:focus:bg-white/10 transition-all duration-300 text-lg backdrop-blur-sm"
                  />
                  <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute cursor-pointer right-16 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                      >
                        <FiX className="cursor-pointer w-6 h-6 text-gray-500" />
                      </button>
                    )}
                    <kbd className=" px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded">
                      ⌘ / CTRL
                    </kbd>
                    <kbd className=" px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded">
                      K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Category Filter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium monty uppercase text-gray-600 dark:text-gray-400">
                    Categories:
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`group cursor-pointer monty relative px-6 py-3 rounded-full border transition-all duration-300 capitalize font-medium text-sm transform hover:scale-105 active:scale-95 ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-400/60 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {selectedCategory === category && (
                          <FaFire className="w-4 h-4" />
                        )}
                        {category === "all" ? "All Projects" : category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative ">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-5  py-3 pr-12 bg-white/90 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 font-medium backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 transition-all duration-300 min-w-[160px]"
                  >
                    <option className="bg-black/60" value="newest">
                      Newest First
                    </option>
                    <option className="bg-black/60" value="oldest">
                      Oldest First
                    </option>
                    <option className="bg-black/60" value="name">
                      Name A-Z
                    </option>
                    <option className="bg-black/60" value="featured">
                      Featured First
                    </option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-white/5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3.5 cursor-pointer transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                    title="Grid View"
                  >
                    <HiViewGrid className="w-5 h-5" />
                  </button>
                  <div className="w-px bg-gray-200 dark:bg-white/10"></div>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3.5 cursor-pointer transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
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
                    <FiTrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Showing{" "}
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {filteredAndSortedProjects.length}
                      </span>{" "}
                      of{" "}
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {projects.length}
                      </span>{" "}
                      projects
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex cursor-pointer items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 transition-colors duration-200"
                    >
                      <FiX className="w-3 h-3" />
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Projects</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Featured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid/List */}
      <section className="py-20 bg-white dark:bg-[#0B0D0E] dark:bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
        <div className="max-w-7xl mx-auto px-6">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "No projects available at the moment"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            // Replace your existing projects mapping with this:
            <motion.div
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence>
                {filteredAndSortedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group relative bg-white/90 dark:bg-white/5 shadow-lg backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 hover:transform hover:scale-[1.01] hover:bg-white dark:hover:bg-white/8 ${
                      viewMode === "list" ? "flex gap-6" : ""
                    }`}
                  >
                    {/* Project Image */}
                    <div
                      className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-80 h-48 flex-shrink-0" : "h-48"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          project.gradient || "from-blue-500/20 to-cyan-500/10"
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      ></div>
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/placeholder-project.webp";
                        }}
                      />
                      {project.featured && (
                        <div className="absolute top-4 left-4 bg-purple-500/80 dark:bg-purple-500/60 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-medium text-white dark:text-purple-300">
                            Featured
                          </span>
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 bg-black/60 dark:bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                        <span
                          className={`text-xs font-medium ${
                            project.status === "completed"
                              ? "text-green-400"
                              : project.status === "in-progress"
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        >
                          {project.status === "completed"
                            ? "Completed"
                            : project.status === "in-progress"
                            ? "In Progress"
                            : "Planning"}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-4 right-4 bg-purple-900/80 dark:bg-purple-900/60 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1">
                        <span className="text-xs text-white dark:text-white font-semibold">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6 flex-1">
                      <div className="mb-4">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                            {project.title}
                          </h3>
                        </div>
                        <div
                          className="text-gray-600 dark:text-gray-300 text-sm my-4 leading-relaxed line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: project.description,
                          }}
                        />
                      </div>

                      {/* Technologies */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                                techColors[tech] ||
                                "bg-gray-100 dark:bg-white/10 backdrop-blur-sm text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-200 dark:hover:bg-white/15"
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-md">
                              +{project.technologies.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Project Meta */}
                      <div className="flex items-center justify-between text-xs border-y border-gray-200 dark:border-gray-400/10 py-4 text-gray-500 dark:text-gray-400 my-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            <span className="text-xs uppercase">
                              {project.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-3 h-3" />
                            <span className="text-xs uppercase">
                              {project.teamSize}
                            </span>
                          </div>
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 font-medium uppercase truncate max-w-[120px]">
                          {project.client}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/projects/${project.slug || project.id}`}
                          className="flex cursor-pointer items-center gap-2 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200/90 transition-all duration-200 text-sm font-medium"
                        >
                          View Details
                          <FiPlay className="w-4 h-4" />
                        </Link>

                        <div className="flex items-center gap-2">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                              title="View Live Site"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                              title="View Source Code"
                            >
                              <FiGithub className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-24 overflow-hidden bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
              What Our{" "}
              <span className="text-purple-600 dark:text-purple-400">
                Clients Say
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hear from businesses that transformed their operations with our
              solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Video Testimonial Section */}
            <div className="relative group">
              <div className="aspect-video bg-gradient-to-br from-purple-200/50 to-blue-200/50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                {/* Video placeholder with play button */}
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <button className="absolute z-10 w-16 h-16 bg-purple-500 dark:bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 dark:group-hover:bg-purple-600 transition-colors duration-300">
                    <FiPlay className="w-8 h-8 text-white ml-1" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Image
                    src="/api/placeholder/1280/720"
                    alt="Client testimonial"
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
                  />
                </div>
              </div>

              <div className="mt-6 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 -z-30"></div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium z-20">
                      {reviews.length > 0 ? reviews[0].name : "Sarah Johnson"}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400 text-sm z-20">
                      {reviews.length > 0
                        ? reviews[0].position
                        : "CTO, TechInnovate Inc."}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-gray-600 dark:text-gray-300 italic z-20">
                  "
                  {reviews.length > 0
                    ? reviews[0].review
                    : "The team delivered beyond our expectations. Our platform handles 3x more traffic with zero downtime."}
                  "
                </p>
              </div>
            </div>

            {/* Client Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, 4).map((review, index) => (
                <div
                  key={review.id}
                  className="bg-white/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${
                          i < review.rating
                            ? "fill-current opacity-100"
                            : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{review.review}"
                  </p>
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.name}
                    </h4>
                    <p className="text-purple-600 dark:text-purple-400 text-sm">
                      {review.position}
                    </p>
                    {review.project && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Project: {review.project}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gray-50 dark:bg-[#0B0D0E] dark:bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10  ">
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white mb-6">
            Ready to Start Your{" "}
            <span className="text-purple-600 dark:text-purple-400">
              Next Project?
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's collaborate to bring your vision to life with cutting-edge
            technology and innovative solutions
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start-project"
              className="group inline-flex items-center monty uppercase justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer"
            >
              <span>Start a Project</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <Link
              href="/contact-us"
              className="group monty uppercase inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <span>Contact Us</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
