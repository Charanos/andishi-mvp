"use client";

import React, { useState, useEffect } from "react";
import { HomepageProjectType, useHomepageProjectCRUD } from "@/hooks/useHomepageProjectCRUD";
import { FaPlus, FaEdit, FaTrash, FaStar, FaClock, FaUsers, FaTag } from "react-icons/fa";
import ToastNotification from "./ToastNotification";
import { ToastNotification as ToastNotificationType } from "./ToastNotification";
import HomepageProjectForm from "@/app/admin-dashboard/HomepageProjectForm";

interface HomepageProjectShowcaseProps {
  initialProjects?: HomepageProjectType[];
}

export default function HomepageProjectShowcase({ 
  initialProjects = [] 
}: HomepageProjectShowcaseProps) {
  const { fetchHomepageProjects, deleteHomepageProject, isLoading, error } = useHomepageProjectCRUD();
  const [projects, setProjects] = useState<HomepageProjectType[]>(initialProjects);
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HomepageProjectType | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (initialProjects.length === 0) {
      loadProjects();
    }
  }, [initialProjects]);

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
        setProjects(projects.filter(project => project.id !== id));
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

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Homepage Projects</h2>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FaPlus />
          <span>New Project</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all group"
          >
            {project.featured && (
              <div className="flex justify-end mb-2">
                <FaStar className="text-yellow-400" />
              </div>
            )}
            
            {project.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-300 mb-4 line-clamp-3">{project.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FaTag className="text-blue-400" />
                <span>{project.category}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FaClock className="text-green-400" />
                <span>{project.duration}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FaUsers className="text-purple-400" />
                <span>{project.teamSize}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(project)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
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
    </div>
  );
}
