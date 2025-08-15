"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  HomepageProjectType,
  useHomepageProjectCRUD,
} from "@/hooks/useHomepageProjectCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaClock,
  FaUsers,
  FaExternalLinkAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaPlay,
} from "react-icons/fa";
import ToastNotification from "@/app/components/ToastNotification";
import { ToastNotification as ToastNotificationType } from "@/app/components/ToastNotification";
import HomepageProjectForm from "@/app/admin-dashboard/HomepageProjectForm";
import Image from "next/image";

interface ProjectShowcaseProps {
  isHomepage?: boolean;
  maxProjects?: number;
}

export default function ProjectShowcase({
  isHomepage = false,
  maxProjects = 6,
}: ProjectShowcaseProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchHomepageProjects, deleteHomepageProject, isLoading, error } =
    useHomepageProjectCRUD();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [projects, setProjects] = useState<HomepageProjectType[]>([]);
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<HomepageProjectType | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const fetchedProjects = await fetchHomepageProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load projects",
        duration: 5000,
      });
    }
  };

  const addToast = (toast: Omit<ToastNotificationType, "id">) => {
    const newToast = {
      ...toast,
      id: Date.now().toString(),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setEditingProject(null);
    setMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (project: HomepageProjectType) => {
    setEditingProject(project);
    setMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteHomepageProject(id);
      if (success) {
        setProjects(projects.filter((project) => project.id !== id));
        addToast({
          type: "success",
          title: "Success",
          message: "Project deleted successfully",
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to delete project",
          duration: 5000,
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete project",
        duration: 5000,
      });
    }
  };

  const handleFormSuccess = () => {
    loadProjects();
  };

  const handleCardClick = (slug: string) => {
    router.push(`/projects/${slug}`);
  };

  const categories = [
    "all",
    "Web Development",
    "Mobile Development",
    "Blockchain",
    "AI/ML",
  ];

  const filteredProjects = (projects || []).filter((project) => {
    if (selectedCategory === "all") return true;
    return project.category === selectedCategory;
  });

  // Get the single featured project and non-featured projects
  const featuredProject = filteredProjects.find((project) => project.featured);
  const nonFeaturedProjects = filteredProjects.filter(
    (project) => !project.featured
  );

  // Combine with featured project first (for better visibility)
  const sortedProjects = featuredProject
    ? [featuredProject, ...nonFeaturedProjects]
    : nonFeaturedProjects;

  // Apply truncation only on homepage
  const displayProjects =
    isHomepage && maxProjects
      ? sortedProjects.slice(0, maxProjects)
      : sortedProjects;

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Effects */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            {isHomepage ? "Featured" : "Our"}{" "}
            <span className="!text-transparent !bg-clip-text !bg-gradient-to-r !from-blue-400 !to-cyan-400">
              {isHomepage ? "Projects" : "Latest Projects"}
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {isHomepage
              ? "Explore our featured projects showcasing innovative solutions and cutting-edge technology."
              : "Discover our recent work showcasing cutting-edge technology solutions and innovative digital experiences."}
          </p>
        </div>
        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-between items-center mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
              <span className="text-blue-300 text-sm font-medium">
                Admin Mode
              </span>
            </div>
            <button
              onClick={handleCreate}
              className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FaPlus />
              <span>New Project</span>
            </button>
          </div>
        )}
        {/* Category Filter - Only show on full projects page */}
        {!isHomepage && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6  cursor-pointer py-3 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : "bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white border border-white/20"
                }`}
              >
                {category === "all" ? "All Projects" : category}
              </button>
            ))}
          </div>
        )}
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200 mb-8">
            {error}
          </div>
        )}
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-gray-300 mt-4">Loading projects...</p>
          </div>
        )}

        {/* Featured Project - Special Layout */}
        {featuredProject && displayProjects.includes(featuredProject) && (
          <div className="mb-16">
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:transform hover:scale-[1.01] hover:bg-white/8 cursor-pointer max-w-6xl mx-auto shadow-2xl">
              <div className="md:flex h-fit">
                {/* Featured Project Image */}
                <div className="relative md:w-3/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Image
                    src={
                      featuredProject.image ||
                      "/images/placeholder-project.webp"
                    }
                    alt={featuredProject.title}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-project.webp";
                    }}
                  />

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 bg-purple-500/40 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 flex items-center gap-1">
                    <FaStar className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-300">
                      Featured
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                    <span
                      className={`text-xs font-medium ${
                        featuredProject.status === "completed"
                          ? "text-green-400"
                          : featuredProject.status === "in-progress"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {featuredProject.status === "completed"
                        ? "Completed"
                        : featuredProject.status === "in-progress"
                        ? "In Progress"
                        : "Planning"}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 right-4 bg-purple-900/60 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                    <span className="text-xs text-white font-medium">
                      {featuredProject.category}
                    </span>
                  </div>
                </div>

                {/* Featured Project Content */}
                <div className="md:w-2/5 p-8 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-4 leading-tight">
                      {featuredProject.title}
                    </h3>

                    <div
                      className="text-gray-300 text-sm leading-relaxed my-4"
                      dangerouslySetInnerHTML={{
                        __html: featuredProject.description,
                      }}
                    />

                    {/* Technologies */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {(featuredProject.technologies || [])
                          .slice(0, 6)
                          .map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-xs rounded-md transition-all duration-200 bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15"
                            >
                              {tech}
                            </span>
                          ))}
                        {(featuredProject.technologies || []).length > 6 && (
                          <span className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md">
                            +{(featuredProject.technologies || []).length - 6}{" "}
                            more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div>
                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400 my-4 border-y border-gray-400/10 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span className="font-montserrat uppercase text-xs">
                            {featuredProject.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaUsers className="w-3 h-3" />
                          <span className="font-montserrat uppercase text-xs">
                            {featuredProject.teamSize}
                          </span>
                        </div>
                      </div>
                      <div className="text-purple-400 font-medium font-montserrat uppercase text-xs">
                        {featuredProject.client}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          handleCardClick(
                            featuredProject.slug || featuredProject.id
                          )
                        }
                        className="flex cursor-pointer items-center gap-2  text-purple-300 hover:text-purple-200/90 transition-all duration-200 text-sm font-medium"
                      >
                        View Details
                        <FaPlay className="w-4 h-4" />
                      </button>

                      <div className="flex items-end gap-2">
                        {featuredProject.liveUrl && (
                          <a
                            href={featuredProject.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                            title="View Live Site"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaExternalLinkAlt className="w-4 h-4" />
                          </a>
                        )}
                        {featuredProject.githubUrl && (
                          <a
                            href={featuredProject.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                            title="View Source Code"
                            onClick={(e) => e.stopPropagation()}
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
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(featuredProject);
                          }}
                          className="p-2 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(featuredProject.id);
                          }}
                          className="p-2 bg-red-600/20 text-red-300 border border-red-400/30 rounded-lg hover:bg-red-600/30 transition-all duration-200"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects
            .filter((project) => {
              // On homepage, exclude the featured project as it's shown separately above
              if (isHomepage && featuredProject) {
                return project.id !== featuredProject.id;
              }
              // On full projects page, show all projects
              return true;
            })
            .map((project) => (
              <div
                key={project.id}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:transform hover:scale-[1.01] hover:bg-white/8 cursor-pointer"
                onClick={() => handleCardClick(project.slug)}
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Image
                    src={project.image || "/images/placeholder-project.webp"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-project.webp";
                    }}
                  />

                  {project.featured && (
                    <div className="absolute top-4 left-4 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 flex items-center gap-1">
                      <FaStar className="w-3 h-3 text-purple-400" />
                      <span className="text-xs font-medium text-purple-300">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
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
                  <div className="absolute bottom-4 right-4 bg-purple-900/60 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1">
                    <span className="text-xs text-white font-semibold">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 flex-1">
                  <div className="mb-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                        {project.title}
                      </h3>
                    </div>
                    <div
                      className="text-gray-300 text-sm my-4 leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  </div>

                  {/* Technologies */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(project.technologies || []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs rounded-md transition-all duration-200 bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.technologies || []).length > 4 && (
                        <span className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md">
                          +{(project.technologies || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Meta */}
                  <div className="flex items-center justify-between text-xs border-y border-gray-400/10 py-4 text-gray-400 my-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span className="text-xs uppercase">
                          {project.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers className="w-3 h-3" />
                        <span className="text-xs uppercase">
                          {project.teamSize}
                        </span>
                      </div>
                    </div>
                    <div className="text-purple-400 font-medium uppercase truncate max-w-[120px]">
                      {project.client}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(project.slug || project.id);
                      }}
                      className="flex cursor-pointer items-center gap-2  text-purple-300 hover:text-purple-200/90 transition-all duration-200 text-sm font-medium"
                    >
                      View Details
                      <FaPlay className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                          title="View Live Site"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                          title="View Source Code"
                          onClick={(e) => e.stopPropagation()}
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
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="p-2 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-2 bg-red-600/20 text-red-300 border border-red-400/30 rounded-lg hover:bg-red-600/30 transition-all duration-200"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        {/* CTA Button for Homepage */}
        {isHomepage && sortedProjects.length > maxProjects && (
          <div className="text-center mt-12">
            <a
              href="/projects"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <span>View All Projects</span>
              <FaExternalLinkAlt />
            </a>
            <p className="text-gray-400 mt-3">
              Showing {displayProjects.length} of {sortedProjects.length}{" "}
              projects
              {featuredProject && (
                <span className="text-amber-400 ml-2">• 1 featured</span>
              )}
            </p>
          </div>
        )}
        {/* Empty State */}
        {!isLoading && displayProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {selectedCategory === "all"
                ? "No projects found. Create your first project!"
                : `No projects found in "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <HomepageProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingProject={editingProject}
        mode={mode}
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
