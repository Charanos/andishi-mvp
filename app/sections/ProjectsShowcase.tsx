"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  FaTag,
  FaExternalLinkAlt,
  FaGithub,
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

  const handleCardClick = (projectId: string) => {
    window.location.href = `/projects/${projectId}`;
  };

  // Tech icons as unified glassmorphic badges
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
  const featuredProject = filteredProjects.find(project => project.featured);
  const nonFeaturedProjects = filteredProjects.filter(project => !project.featured);
  
  // Combine with featured project first (for better visibility)
  const sortedProjects = featuredProject ? [featuredProject, ...nonFeaturedProjects] : nonFeaturedProjects;

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
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full px-4 py-2">
                <FaStar className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">Featured Project</span>
              </div>
            </div>
            
            <div 
              className="group relative bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-500/20 border-2 border-purple-400/40 hover:border-purple-400/60 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 rounded-3xl overflow-hidden transition-all duration-500 hover:transform hover:scale-[1.02] cursor-pointer max-w-4xl mx-auto"
              onClick={() => handleCardClick(featuredProject.id)}
            >
              <div className="md:flex">
                {/* Featured Project Image */}
                <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <Image
                    src={featuredProject.image || "/images/placeholder-project.webp"}
                    alt={featuredProject.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-project.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
                    <FaStar className="w-4 h-4" />
                    <span>Featured Project</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-medium">
                    {featuredProject.status === "completed" ? "✅ Completed" : 
                     featuredProject.status === "in-progress" ? "🔄 In Progress" : "📋 Planning"}
                  </div>
                </div>
                
                {/* Featured Project Content */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="text-purple-300 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-sm font-medium">
                      {featuredProject.category}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300 mb-4">
                    {featuredProject.title}
                  </h3>
                  
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {featuredProject.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {(featuredProject.technologies || []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                            techColors[tech] || "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:border-white/30 hover:bg-white/15"
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                      {(featuredProject.technologies || []).length > 4 && (
                        <span className="px-3 py-1 text-sm bg-white/5 text-gray-400 rounded-full">
                          +{(featuredProject.technologies || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <FaClock className="w-4 h-4" />
                        <span>{featuredProject.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaUsers className="w-4 h-4" />
                        <span>{featuredProject.teamSize}</span>
                      </div>
                    </div>
                    <div className="text-purple-400 font-medium">
                      {featuredProject.client}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                      <FaExternalLinkAlt className="w-4 h-4" />
                      <span>View Project</span>
                    </button>
                    
                    {isAdmin && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(featuredProject);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(featuredProject.id);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects.filter(project => !project.featured).map((project) => (
            <div
              key={project.id}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 hover:bg-white/8 cursor-pointer"
              onClick={() => handleCardClick(project.id)}
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <FaStar className="text-yellow-400 text-lg" />
                </div>
              )}

              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image || "/images/placeholder-project.webp"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-project.webp";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                    <FaStar className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {project.status === "completed"
                    ? "✅ Completed"
                    : project.status === "in-progress"
                    ? "🔄 In Progress"
                    : "📋 Planning"}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className={`text-xl font-semibold transition-colors duration-300 ${
                      project.featured
                        ? "text-white group-hover:text-purple-300"
                        : "text-white group-hover:text-blue-300"
                    }`}
                  >
                    {project.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      project.featured
                        ? "text-purple-300 bg-purple-500/20 border border-purple-400/30"
                        : "text-gray-400 bg-white/10"
                    }`}
                  >
                    {project.category}
                  </span>
                </div>

                <p className="text-gray-300 line-clamp-3">
                  {project.description}
                </p>

                {/* Project Meta */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FaClock className="text-green-400" />
                    <span>{project.duration}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FaUsers className="text-purple-400" />
                    <span>{project.teamSize}</span>
                  </div>

                  {project.client && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FaTag className="text-blue-400" />
                      <span>{project.client}</span>
                    </div>
                  )}
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className={
                        techColors[tech] ||
                        "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20"
                      }
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity pt-4">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <FaTrash />
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
              Showing {displayProjects.length} of {sortedProjects.length} projects
              {featuredProject && (
                <span className="text-purple-400 ml-2">• 1 featured</span>
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
