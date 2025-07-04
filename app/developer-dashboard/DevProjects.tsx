"use client";

import React, { useState, useMemo } from "react";
import { ProjectAssignment } from "@/types/project";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCode,
  FaGithub,
  FaShieldAlt,
  FaTools,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaBriefcase,
  FaCheck,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaStar,
  FaDownload,
  FaFileExport,
  FaShare,
  FaBookmark,
  FaTag,
  FaHeart,
  FaComments,
  FaRocket,
  FaLightbulb,
} from "react-icons/fa";
import { IoIosGrid, IoIosList } from "react-icons/io";

interface DevProjectsProps {
  projects: ProjectAssignment[];
}

export default function DevProjects({ projects }: DevProjectsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      "on-hold": "bg-gray-500/20 text-gray-400 border-gray-500/30",
      review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status as keyof typeof colors] || colors.assigned;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: "text-green-400",
      medium: "text-yellow-400",
      high: "text-red-400",
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  // Filtering and sorting logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === "all" || project.category === categoryFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesCategory
      );
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "budget":
          return b.budget - a.budget;
        case "progress":
          return b.progress - a.progress;
        case "satisfaction":
          return b.satisfaction - a.satisfaction;
        default:
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
      }
    });

    return filtered;
  }, [
    projects,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  ]);

  const projectStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const inProgress = projects.filter(
      (p) => p.status === "in-progress"
    ).length;
    const overdue = projects.filter(
      (p) => new Date(p.deadline) < new Date() && p.status !== "completed"
    ).length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const avgSatisfaction =
      projects.reduce((sum, p) => sum + p.satisfaction, 0) / total;

    return {
      total,
      completed,
      inProgress,
      overdue,
      totalBudget,
      avgSatisfaction,
    };
  }, [projects]);

  const categories = [...new Set(projects.map((p) => p.category))];

  return (
    <div className="space-y-6 my-18">
      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm  monty uppercase">
                Total Projects
              </p>
              <p className="text-2xl font-semibold text-white">
                {projectStats.total}
              </p>
            </div>
            <FaBriefcase className="text-blue-400 text-2xl" />
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm  monty uppercase">
                Completed
              </p>
              <p className="text-2xl font-semibold text-green-400">
                {projectStats.completed}
              </p>
            </div>
            <FaCheck className="text-green-400 text-2xl" />
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm  monty uppercase">
                In Progress
              </p>
              <p className="text-2xl font-semibold text-yellow-400">
                {projectStats.inProgress}
              </p>
            </div>
            <FaClock className="text-yellow-400 text-2xl" />
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm monty uppercase">
                Avg Rating
              </p>
              <p className="text-2xl font-semibold text-purple-400">
                {projectStats.avgSatisfaction.toFixed(1)}
              </p>
            </div>
            <FaStar className="text-purple-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 cursor-pointer py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <FaFilter className="mr-2" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option className="bg-black/80" value="lastUpdated">
                Last Updated
              </option>
              <option className="bg-black/80" value="title">
                Title
              </option>
              <option className="bg-black/80" value="deadline">
                Deadline
              </option>
              <option className="bg-black/80" value="budget">
                Budget
              </option>
              <option className="bg-black/80" value="progress">
                Progress
              </option>
              <option className="bg-black/80" value="satisfaction">
                Rating
              </option>
            </select>

            <div className="flex rounded-lg overflow-hidden border border-white/20">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2.5 cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-900 text-blue-400"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <IoIosGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2.5 cursor-pointer transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-900 text-blue-400"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <IoIosList />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option className="bg-black/80" value="all">
                    All Statuses
                  </option>
                  <option className="bg-black/80" value="assigned">
                    Assigned
                  </option>
                  <option className="bg-black/80" value="in-progress">
                    In Progress
                  </option>
                  <option className="bg-black/80" value="completed">
                    Completed
                  </option>
                  <option value="on-hold">On Hold</option>
                  <option className="bg-black/80" value="review">
                    Review
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option className="bg-black/80" value="all">
                    All Priorities
                  </option>
                  <option className="bg-black/80" value="low">
                    Low
                  </option>
                  <option className="bg-black/80" value="medium">
                    Medium
                  </option>
                  <option className="bg-black/80" value="high">
                    High
                  </option>
                  <option className="bg-black/80" value="critical">
                    Critical
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option className="bg-black/80" value="all">
                    All Categories
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Display */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 xl:grid-cols-2 gap-6"
            : "space-y-4"
        }
      >
        {filteredAndSortedProjects.map((project) => (
          <div
            key={project.id}
            className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all ${
              selectedProject === project.id
                ? "border-blue-400/50 bg-blue-500/5"
                : ""
            }`}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-blue-400 truncate">
                    {project.title}
                  </h3>
                  {project.isBookmarked && (
                    <FaBookmark className="text-yellow-400 text-sm" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status.replace("-", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {project.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                    {project.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {project.description}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaEye className="text-gray-400" />
                </button>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaEdit className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-semibold text-white">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center text-sm text-gray-300">
                <FaBriefcase className="mr-2 text-blue-400" />
                <span className="truncate">{project.client}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <FaUser className="mr-2 text-green-400" />
                {project.teamSize} members
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <FaCalendarAlt className="mr-2 text-orange-400" />
                {new Date(project.deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <FaDollarSign className="mr-2 text-green-400" />$
                {project.budget.toLocaleString()}
              </div>
            </div>

            {/* Risk & Satisfaction */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  <FaExclamationTriangle
                    className={`mr-2 ${getRiskColor(project.riskLevel)}`}
                  />
                  <span className="text-gray-400">Risk: </span>
                  <span className={getRiskColor(project.riskLevel)}>
                    {project.riskLevel}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <FaStar className="mr-2 text-yellow-400" />
                  <span className="text-gray-400">Rating: </span>
                  <span className="text-white">
                    {project.satisfaction.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <FaClock className="mr-2" />
                {project.actualHours}h / {project.efficiency}% efficient
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <FaCode className="text-blue-400 mx-auto mb-1 text-sm" />
                <div className="text-white font-semibold text-sm">
                  {(project.metrics.linesOfCode / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-400">Lines</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <FaGithub className="text-green-400 mx-auto mb-1 text-sm" />
                <div className="text-white font-semibold text-sm">
                  {project.metrics.commits}
                </div>
                <div className="text-xs text-gray-400">Commits</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <FaShieldAlt className="text-purple-400 mx-auto mb-1 text-sm" />
                <div className="text-white font-semibold text-sm">
                  {project.metrics.testsWritten}
                </div>
                <div className="text-xs text-gray-400">Tests</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <FaTools className="text-orange-400 mx-auto mb-1 text-sm" />
                <div className="text-white font-semibold text-sm">
                  {project.metrics.bugsFixed}
                </div>
                <div className="text-xs text-gray-400">Bugs</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <FaEye className="text-yellow-400 mx-auto mb-1 text-sm" />
                <div className="text-white font-semibold text-sm">
                  {project.metrics.codeReviews}
                </div>
                <div className="text-xs text-gray-400">Reviews</div>
              </div>
            </div>

            {/* Technologies */}
            <div className="mb-4">
              <h4 className="text-sm text-gray-400 mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg text-gray-300 text-sm border border-gray-600/30"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="px-3 py-1 bg-gray-700/50 rounded-lg text-gray-400 text-sm">
                    +{project.technologies.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-400">Recent Tasks</h4>
                <span className="text-xs text-gray-500">
                  {project.tasks.filter((t) => t.completed).length} /{" "}
                  {project.tasks.length} completed
                </span>
              </div>
              <div className="space-y-1">
                {project.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded text-sm"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.completed ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      <span
                        className={`flex-1 truncate ${
                          task.completed
                            ? "text-gray-400 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.actualHours || task.estimatedHours}h
                      </span>
                    </div>
                  </div>
                ))}
                {project.tasks.length > 3 && (
                  <div className="text-center pt-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View all {project.tasks.length} tasks
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-4">
              <h4 className="text-sm text-gray-400 mb-2">Milestones</h4>
              <div className="space-y-2">
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          milestone.completed ? "bg-green-500" : "bg-gray-500"
                        } flex items-center justify-center`}
                      >
                        {milestone.completed && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm block truncate ${
                            milestone.completed ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {milestone.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          Due:{" "}
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-semibold text-sm">
                        ${milestone.payment.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                  <FaRocket className="text-xs" />
                  <span>View Details</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-1 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors text-sm">
                  <FaChartLine className="text-xs" />
                  <span>Analytics</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaShare className="text-gray-400 text-sm" />
                </button>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <FaDownload className="text-gray-400 text-sm" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    project.isBookmarked
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  <FaBookmark className="text-sm" />
                </button>
              </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {Math.round(
                      (Date.now() - new Date(project.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </div>
                  <div className="text-xs text-gray-400">Days Active</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {Math.round(
                      (new Date(project.deadline).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </div>
                  <div className="text-xs text-gray-400">Days Left</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    $
                    {Math.round(
                      project.budget * (project.progress / 100)
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Earned</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Projects Found */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 max-w-md mx-auto">
            <FaLightbulb className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search criteria or filters to find the projects
              you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
              }}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
