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
  FiClock,
  FiStar,
  FiExternalLink,
  FiGithub,
  FiPlay,
} from "react-icons/fi";
import { HiSparkles, HiViewGrid, HiViewList } from "react-icons/hi";
import { FaBolt, FaFire, FaRocket, FaSmile } from "react-icons/fa";

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  image: string;
  technologies: string[];
  gradient: string;
  liveUrl: string;
  githubUrl: string;
  client: string;
  duration: string;
  teamSize: string;
  year: string;
  status: "completed" | "in-progress" | "planning";
  featured: boolean;
}

export default function OurProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Extended project data
  const projects: Project[] = [
    {
      id: 1,
      title: "AI-Powered E-commerce Platform",
      description:
        "A full-stack e-commerce solution with AI-driven product recommendations, real-time inventory management, and advanced analytics dashboard.",
      longDescription:
        "This comprehensive e-commerce platform revolutionizes online shopping with advanced AI algorithms for personalized product recommendations. Features include real-time inventory tracking, multi-vendor support, integrated payment gateways, and a sophisticated analytics dashboard for business insights. The platform handles over 10,000 concurrent users and processes thousands of transactions daily.",
      category: "Web Development",
      image: "/images/project1.webp",
      technologies: [
        "React",
        "Node.js",
        "MongoDB",
        "AWS",
        "TypeScript",
        "Redis",
      ],
      gradient: "from-blue-500/20 to-cyan-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "TechCorp Inc.",
      duration: "3 months",
      teamSize: "4 developers",
      year: "2024",
      status: "completed",
      featured: true,
    },
    {
      id: 2,
      title: "Decentralized Finance Dashboard",
      description:
        "A comprehensive DeFi platform for portfolio tracking, yield farming, and cross-chain transactions with real-time market data integration.",
      longDescription:
        "Revolutionary DeFi dashboard that aggregates data from multiple blockchain networks, providing users with a unified view of their cryptocurrency portfolios. Features include yield farming opportunities, cross-chain swapping, liquidity pool management, and advanced charting tools. Built with security-first architecture and supports 15+ blockchain networks.",
      category: "Blockchain",
      image: "/images/project2.webp",
      technologies: [
        "Next.js",
        "Blockchain",
        "TypeScript",
        "Tailwind CSS",
        "Web3",
      ],
      gradient: "from-purple-500/20 to-pink-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "CryptoFinance Ltd.",
      duration: "4 months",
      teamSize: "5 developers",
      year: "2024",
      status: "completed",
      featured: true,
    },
    {
      id: 3,
      title: "Healthcare Management System",
      description:
        "HIPAA-compliant healthcare platform with patient management, appointment scheduling, telemedicine integration, and medical records system.",
      longDescription:
        "Enterprise-grade healthcare management system designed for hospitals and clinics. Features comprehensive patient record management, appointment scheduling, telemedicine capabilities, prescription management, and billing integration. Built with strict HIPAA compliance and enterprise-level security protocols.",
      category: "Web Development",
      image: "/images/project3.webp",
      technologies: ["Vue.js", "Python", "PostgreSQL", "AWS", "Django"],
      gradient: "from-green-500/20 to-emerald-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "MedTech Solutions",
      duration: "6 months",
      teamSize: "6 developers",
      year: "2024",
      status: "completed",
      featured: false,
    },
    {
      id: 4,
      title: "Real-time Collaboration Tool",
      description:
        "A Slack-alternative with real-time messaging, video calls, file sharing, and project management features for remote teams.",
      longDescription:
        "Next-generation collaboration platform designed for remote teams. Features include real-time messaging with threading, HD video conferencing, screen sharing, file collaboration, task management, and integration with popular productivity tools. Supports teams of up to 1000 members with enterprise-grade security.",
      category: "Mobile Development",
      image: "/images/project4.webp",
      technologies: ["React", "Node.js", "Firebase", "TypeScript", "Flutter"],
      gradient: "from-orange-500/20 to-red-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "RemoteWork Inc.",
      duration: "5 months",
      teamSize: "7 developers",
      year: "2025",
      status: "completed",
      featured: false,
    },
    {
      id: 5,
      title: "Machine Learning Analytics Platform",
      description:
        "Advanced data analytics platform with ML models for predictive analysis, data visualization, and automated reporting for enterprise clients.",
      longDescription:
        "Sophisticated analytics platform that leverages machine learning for predictive insights and automated decision-making. Features include custom ML model training, real-time data processing, interactive dashboards, automated report generation, and API integrations for data ingestion from multiple sources.",
      category: "AI/ML",
      image: "/images/project5.webp",
      technologies: [
        "Python",
        "React",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Kubernetes",
      ],
      gradient: "from-indigo-500/20 to-blue-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "DataTech Analytics",
      duration: "4 months",
      teamSize: "5 developers",
      year: "2025",
      status: "completed",
      featured: true,
    },
    {
      id: 6,
      title: "NFT Marketplace Platform",
      description:
        "Full-featured NFT marketplace with minting, trading, auctions, and royalty management on multiple blockchain networks.",
      longDescription:
        "Comprehensive NFT marketplace supporting multiple blockchain networks including Ethereum, Polygon, and Solana. Features include NFT minting, peer-to-peer trading, timed auctions, royalty distribution, collection management, and social features for creators and collectors. Built with gas optimization and eco-friendly blockchain integration.",
      category: "Blockchain",
      image: "/images/project6.webp",
      technologies: [
        "Next.js",
        "Blockchain",
        "MongoDB",
        "Tailwind CSS",
        "Web3",
      ],
      gradient: "from-violet-500/20 to-purple-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "NFT Collective",
      duration: "5 months",
      teamSize: "6 developers",
      year: "2025",
      status: "completed",
      featured: false,
    },
    {
      id: 7,
      title: "Smart City IoT Platform",
      description:
        "IoT platform for smart city infrastructure management with sensor networks, data analytics, and automated response systems.",
      longDescription:
        "Cutting-edge IoT platform that connects and manages thousands of sensors across urban infrastructure. Features include traffic flow optimization, environmental monitoring, energy management, waste collection optimization, and emergency response coordination. Processes over 1 million data points daily.",
      category: "IoT",
      image: "/images/project7.webp",
      technologies: ["Python", "React", "MongoDB", "AWS", "Docker"],
      gradient: "from-cyan-500/20 to-blue-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "Smart City Solutions",
      duration: "8 months",
      teamSize: "8 developers",
      year: "2023",
      status: "completed",
      featured: true,
    },
    {
      id: 8,
      title: "Educational Learning Management System",
      description:
        "Comprehensive LMS with course management, interactive content delivery, assessment tools, and student progress tracking.",
      longDescription:
        "Modern learning management system designed for educational institutions. Features include course creation tools, multimedia content delivery, interactive assessments, gradebook management, discussion forums, and detailed analytics for student performance tracking. Supports both synchronous and asynchronous learning.",
      category: "Web Development",
      image: "/images/project8.webp",
      technologies: ["React", "Node.js", "PostgreSQL", "AWS", "TypeScript"],
      gradient: "from-green-500/20 to-teal-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "EduTech Institute",
      duration: "4 months",
      teamSize: "5 developers",
      year: "2023",
      status: "completed",
      featured: false,
    },
    {
      id: 9,
      title: "Fintech Mobile Banking App",
      description:
        "Next-generation mobile banking application with advanced security, digital payments, and personal finance management.",
      longDescription:
        "Revolutionary mobile banking application with biometric authentication, contactless payments, budget tracking, investment management, and AI-powered financial insights. Features bank-level security with multi-factor authentication and fraud detection algorithms.",
      category: "Mobile Development",
      image: "/images/project9.webp",
      technologies: ["Flutter", "Node.js", "MongoDB", "AWS", "TypeScript"],
      gradient: "from-purple-500/20 to-indigo-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "NextGen Bank",
      duration: "6 months",
      teamSize: "7 developers",
      year: "2023",
      status: "in-progress",
      featured: true,
    },
  ];

  const categories = [
    "all",
    "Web Development",
    "Mobile Development",
    "Blockchain",
    "AI/ML",
    "IoT",
  ];

  // Enhanced filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (project) => project.category === selectedCategory
      );
    }

    // Enhanced search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.longDescription.toLowerCase().includes(query) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(query)
          ) ||
          project.client.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query) ||
          project.year.includes(query)
      );
    }

    // Enhanced sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return parseInt(b.year) - parseInt(a.year) || b.id - a.id;
        case "oldest":
          return parseInt(a.year) - parseInt(b.year) || a.id - b.id;
        case "name":
          return a.title.localeCompare(b.title);
        case "featured":
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return parseInt(b.year) - parseInt(a.year);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const statusColors = {
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    "in-progress": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery.trim() || selectedCategory !== "all" || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 relative">
      {/* Header Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Our <span className="text-purple-400">Projects</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explore our comprehensive portfolio of innovative solutions across
              various industries and cutting-edge technologies
            </p>
          </div>

          {/*  stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {[
              {
                label: "Projects Delivered",
                value: `${projects.length + 26}+`,
                color: "purple",
                icon: <FaRocket />,
              },
              {
                label: "Satisfied Clients",
                value: "30+",
                color: "blue",
                icon: <FaSmile />,
              },
              {
                label: "Features Engineered",
                value: "25+",
                color: "green",
                icon: <FaBolt />,
              },
              {
                label: "Uptime Record",
                value: "99.9%",
                color: "orange",
                icon: <FaFire />,
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative animate-fade-in-up "
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex flex-col items-center justify-center absolute inset-0 bg-gradient-to-r from-${
                    stat.color
                  }-600/20 to-${
                    stat.color === "orange" ? "red" : stat.color
                  }-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 `}
                ></div>
                <div className="flex flex-col items-center justify-center relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 hover:bg-white/8">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 monty">
                    {stat.value}
                  </div>
                  <div className="text-xs monty uppercase text-blue-300 font-medium mb-3">
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
      <section className="py-16 border-b border-white/5 relative  bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiFilter className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-semibold">
                Discover Some of Our Work
              </h2>
            </div>
            <p className="text-gray-400 text-lg">
              Find the perfect project that matches your interests
            </p>
          </div>

          {/* Main Controls Container */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
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
                    className="w-full px-6 py-4 pl-14 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:bg-white/10 transition-all duration-300 text-lg backdrop-blur-sm"
                  />
                  <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
                      >
                        <FiX className="cursor-pointer w-6 h-6 text-gray-500" />
                      </button>
                    )}
                    <kbd className=" px-2 py-1 text-xs font-semibold text-gray-500 bg-white/5 border border-white/10 rounded">
                      ⌘ / CTRL
                    </kbd>
                    <kbd className=" px-2 py-1 text-xs font-semibold text-gray-500 bg-white/5 border border-white/10 rounded">
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
                  <span className="text-sm font-medium monty uppercase text-gray-400">
                    Categories:
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`group monty relative px-6 py-3 rounded-full border transition-all duration-300 capitalize font-medium text-sm transform hover:scale-105 active:scale-95 ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-400/60 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
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
                    className="appearance-none px-5  py-3 pr-12  border border-white/10 rounded-xl text-white focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 min-w-[160px]"
                  >
                    <option value="newest">✨ Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                    <option value="name">🔤 Name A-Z</option>
                    <option value="featured">⭐ Featured First</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3.5 transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Grid View"
                  >
                    <HiViewGrid className="w-5 h-5" />
                  </button>
                  <div className="w-px bg-white/10"></div>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3.5 transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="List View"
                  >
                    <HiViewList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiTrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">
                      Showing{" "}
                      <span className="text-white font-semibold">
                        {filteredAndSortedProjects.length}
                      </span>{" "}
                      of{" "}
                      <span className="text-white font-semibold">
                        {projects.length}
                      </span>{" "}
                      projects
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-300 hover:bg-purple-500/30 transition-colors duration-200"
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

      {/* Projects Display */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                <FiSearch className="w-16 h-16 text-gray-400" />
              </div>

              <h3 className="text-xl text-white mb-2">No projects found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {filteredAndSortedProjects.map((project) =>
                viewMode === "grid" ? (
                  // Grid View
                  <article
                    key={project.id}
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-xl shadow-md bg-black/10 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                  >
                    {/* Colored gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                    ></div>

                    {/* Project Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Status and Category Badges */}
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="px-3 py-1 bg-yellow-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span
                          className={`px-3 py-1 backdrop-blur-sm text-xs font-medium rounded-full border capitalize ${
                            statusColors[project.status]
                          }`}
                        >
                          {project.status.replace("-", " ")}
                        </span>
                      </div>

                      {/* Project Links */}
                      {/* <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={project.liveUrl}
                          className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                          aria-label="View live project"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Link>
                        <Link
                          href={project.githubUrl}
                          className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                          aria-label="View source code"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div> */}
                    </div>

                    {/* Content */}
                    <div className="relative p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <div
                            key={tech}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              techColors[tech] ||
                              "bg-gray-500/20 text-gray-300 border-gray-500/30"
                            }`}
                          >
                            {tech}
                          </div>
                        ))}
                        {project.technologies.length > 4 && (
                          <div className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-500/20 text-gray-300 border-gray-500/30">
                            +{project.technologies.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Project Stats */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                          <div>
                            <span className="text-gray-500 monty uppercase">
                              Client:
                            </span>
                            <div className="text-gray-300 font-medium monty">
                              {project.client}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 monty uppercase">
                              Year:
                            </span>
                            <div className="text-gray-300 font-medium monty">
                              {project.year}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 monty uppercase">
                              Duration:
                            </span>
                            <div className="text-gray-300 font-medium monty">
                              {project.duration}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 monty uppercase">
                              Team:
                            </span>
                            <div className="text-gray-300 font-medium monty">
                              {project.teamSize}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                    <div
                      className="absolute bottom-6 right-6 w-1 h-1 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </article>
                ) : (
                  // List View
                  <article
                    key={project.id}
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-black/5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Project Image */}
                      <div className="relative w-full md:w-80 h-48 md:h-64 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                        {/* Status and Category Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full w-fit">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="px-3 py-1 bg-yellow-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full w-fit">
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 backdrop-blur-sm text-xs font-medium rounded-full border capitalize w-fit ${
                              statusColors[project.status]
                            }`}
                          >
                            {project.status.replace("-", " ")}
                          </span>
                        </div>

                        {/* Project Links */}
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            href={project.liveUrl}
                            className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                            aria-label="View live project"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                          <Link
                            href={project.githubUrl}
                            className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                            aria-label="View source code"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 space-y-4">
                        {/* Title and Description */}
                        <div>
                          <h3 className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed mb-4">
                            {project.longDescription}
                          </p>
                        </div>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech) => (
                            <div
                              key={tech}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                techColors[tech] ||
                                "bg-gray-500/20 text-gray-300 border-gray-500/30"
                              }`}
                            >
                              {tech}
                            </div>
                          ))}
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 block">Client</span>
                            <span className="text-gray-300 font-medium">
                              {project.client}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Year</span>
                            <span className="text-gray-300 font-medium">
                              {project.year}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">
                              Duration
                            </span>
                            <span className="text-gray-300 font-medium">
                              {project.duration}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">
                              Team Size
                            </span>
                            <span className="text-gray-300 font-medium">
                              {project.teamSize}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-4">
              What Our <span className="text-purple-400">Clients Say</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Hear from businesses that transformed their operations with our
              solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Video Testimonial Section */}
            <div className="relative group">
              <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl overflow-hidden border border-white/10">
                {/* Video placeholder with play button */}
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <button className="absolute z-10 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r  from-purple-500 to-blue-500 -z-30"></div>
                  <div>
                    <h3 className="text-white font-medium z-20">
                      Sarah Johnson
                    </h3>
                    <p className="text-purple-400 text-sm z-20">
                      CTO, TechInnovate Inc.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-gray-300 italic z-20">
                  "The team delivered beyond our expectations. Our platform
                  handles 3x more traffic with zero downtime."
                </p>
              </div>
            </div>

            {/* Client Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Michael Chen",
                  role: "Product Director, FinTech Global",
                  quote:
                    "Their blockchain solution reduced transaction costs by 40% and improved security significantly.",
                  rating: 5,
                },
                {
                  name: "Emma Rodriguez",
                  role: "CEO, HealthCare Solutions",
                  quote:
                    "The healthcare management system streamlined our operations and improved patient care quality.",
                  rating: 5,
                },
                {
                  name: "David Wilson",
                  role: "Operations Manager, RetailChain",
                  quote:
                    "Our e-commerce platform saw 150% growth in conversions after their AI recommendations implementation.",
                  rating: 4,
                },
                {
                  name: "Priya Sharma",
                  role: "Tech Lead, EduTech Innovations",
                  quote:
                    "The learning management system transformed how we deliver content to 50,000+ students globally.",
                  rating: 5,
                },
              ].map((review, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
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
                  <p className="text-gray-300 mb-6 italic">"{review.quote}"</p>
                  <div>
                    <h3 className="text-white font-medium">{review.name}</h3>
                    <p className="text-purple-400 text-sm">{review.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden ">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10  ">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
            Ready to Start Your{" "}
            <span className="text-purple-400">Next Project?</span>
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
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
              className="group monty uppercase inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
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
