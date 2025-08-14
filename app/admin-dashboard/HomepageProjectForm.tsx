"use client";

import React, { useState, useEffect } from "react";
import {
  HomepageProjectType,
  useHomepageProjectCRUD,
} from "@/hooks/useHomepageProjectCRUD";
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaImage,
  FaUser,
  FaTag,
  FaEdit,
  FaFileAlt,
  FaClock,
  FaUsers,
  FaStar,
  FaCode,
  FaCheckCircle,
  FaAlignLeft,
  FaPlus,
  FaExternalLinkAlt,
  FaGithub,
} from "react-icons/fa";
import ToastNotification from "@/app/components/ToastNotification";
import { ToastNotification as ToastNotificationType } from "@/app/components/ToastNotification";
import ImageUpload from "@/app/components/ImageUpload";
import dynamic from "next/dynamic";

const RichContentEditor = dynamic(
  () => import("@/app/components/RichContentEditor"),
  {
    ssr: false,
  }
);

interface HomepageProjectFormData {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  projectImages: string[];
  client: string;
  duration: string;
  teamSize: string;
  status: "completed" | "in-progress" | "planning";
  featured: boolean;
  liveUrl?: string;
  githubUrl?: string;
  projectUrl?: string;
}

interface HomepageProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProject?: HomepageProjectType | null;
  mode: "create" | "edit";
}

export default function HomepageProjectForm({
  isOpen,
  onClose,
  onSuccess,
  editingProject,
  mode,
}: HomepageProjectFormProps) {
  const {
    createHomepageProject,
    updateHomepageProject,
    isLoading,
    error,
    clearError,
  } = useHomepageProjectCRUD();

  const [formData, setFormData] = useState<HomepageProjectFormData>({
    title: "",
    description: "",
    category: "",
    technologies: [],
    image: "",
    projectImages: [],
    client: "",
    duration: "",
    teamSize: "",
    status: "completed",
    featured: false,
    liveUrl: "",
    githubUrl: "",
    projectUrl: "",
  });
  const [currentTech, setCurrentTech] = useState("");
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editingProject && mode === "edit") {
      setFormData({
        title: editingProject.title,
        description: editingProject.description,
        category: editingProject.category,
        technologies: editingProject.technologies,
        image: editingProject.image || "",
        projectImages: editingProject.projectImages || [],
        client: editingProject.client || "",
        duration: editingProject.duration || "",
        teamSize: editingProject.teamSize || "",
        status: editingProject.status,
        featured: editingProject.featured,
        liveUrl: editingProject.liveUrl || "",
        githubUrl: editingProject.githubUrl || "",
        projectUrl: editingProject.projectUrl || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        category: "",
        technologies: [],
        image: "",
        projectImages: [],
        client: "",
        duration: "",
        teamSize: "",
        status: "completed",
        featured: false,
        liveUrl: "",
        githubUrl: "",
        projectUrl: "",
      });
    }
  }, [editingProject, mode, isOpen]);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  const handleTechKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    if (!formData.title || !formData.description || !formData.category) {
      addToast({
        type: "error",
        title: "Error",
        message: "Please fill in all required fields",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (mode === "create") {
        result = await createHomepageProject(formData);
      } else if (editingProject && editingProject.id) {
        result = await updateHomepageProject(editingProject.id, formData);
      }

      if (result) {
        addToast({
          type: "success",
          title: "Success!",
          message: `Project ${
            mode === "create" ? "created" : "updated"
          } successfully! Redirecting to projects showcase...`,
          duration: 3000,
        });
        
        // Call onSuccess to refresh the project list
        onSuccess();
        
        // Close the modal and redirect after a short delay
        setTimeout(() => {
          onClose();
          // Redirect to projects page
          window.location.href = '/projects';
        }, 2000);
      } else {
        throw new Error('Failed to save project');
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to save project. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaEdit className="text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-white">
              {mode === "create" ? "Create New Project" : "Edit Project"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Notification */}
        {toasts.length > 0 && (
          <div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              toasts[0].type === "success"
                ? "bg-green-500/20 border border-green-500/30 text-green-300"
                : "bg-red-500/20 border border-red-500/30 text-red-300"
            }`}
          >
            {toasts[0].message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaFileAlt className="text-blue-400" />
                <span>Title *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Enter project title..."
                required
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaAlignLeft className="text-purple-400" />
                <span>Description *</span>
              </label>
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg overflow-hidden">
                <RichContentEditor
                  value={formData.description}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, description: content }))
                  }
                  placeholder="Enter detailed project description..."
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaTag className="text-purple-400" />
                <span>Category *</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              >
                <option value="">Select category...</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Blockchain">Blockchain</option>
                <option value="AI/ML">AI/ML</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">SaaS</option>
              </select>
            </div>

            {/* Technologies */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaCode className="text-green-400" />
                <span>Technologies</span>
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={handleTechKeyPress}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Add a technology..."
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 cursor-pointer py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-gray-400 cursor-pointer hover:text-white"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="lg:col-span-2">
              <ImageUpload
                label="Cover Image"
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                placeholder="Upload cover image..."
                type="cover"
              />
            </div>

            {/* Client */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaUser className="text-green-400" />
                <span>Client</span>
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Client name..."
              />
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaClock className="text-orange-400" />
                <span>Duration</span>
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="e.g., 3 months, 6 weeks..."
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaUsers className="text-teal-400" />
                <span>Team Size</span>
              </label>
              <input
                type="text"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="e.g., 5 developers, 2 designers..."
              />
            </div>

            {/* Live URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaExternalLinkAlt className="text-blue-400" />
                <span>Live URL</span>
              </label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="https://example.com"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaGithub className="text-gray-400" />
                <span>GitHub URL</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="https://github.com/username/repo"
              />
            </div>

            {/* Project URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaExternalLinkAlt className="text-purple-400" />
                <span>Project URL</span>
              </label>
              <input
                type="url"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="https://project-demo.com"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaCheckCircle className="text-green-400" />
                <span>Status</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            {/* Project Gallery Images */}
            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-4">
                <FaImage className="text-cyan-400" />
                <span>Project Gallery</span>
              </label>
              <div className="space-y-4">
                {(formData.projectImages || []).map((image, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <ImageUpload
                        label={`Gallery Image ${index + 1}`}
                        value={image}
                        onChange={(url) => {
                          const newImages = [...formData.projectImages];
                          newImages[index] = url;
                          setFormData((prev) => ({
                            ...prev,
                            projectImages: newImages,
                          }));
                        }}
                        placeholder="Upload gallery image..."
                        type="cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = (formData.projectImages || []).filter(
                          (_, i) => i !== index
                        );
                        setFormData((prev) => ({
                          ...prev,
                          projectImages: newImages,
                        }));
                      }}
                      className="p-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      projectImages: [...(prev.projectImages || []), ""],
                    }));
                  }}
                  className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaPlus />
                  <span>Add Gallery Image</span>
                </button>
              </div>
            </div>

            {/* Featured */}
            <div className="lg:col-span-2 flex items-center space-x-3 pt-4">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-gray-300 flex items-center space-x-2">
                <FaStar className="text-yellow-400" />
                <span>Featured Project</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6  cursor-pointer py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {(isLoading || isSubmitting) ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>
                {isSubmitting
                  ? "Saving Project..."
                  : isLoading
                  ? "Processing..."
                  : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
              </span>
            </button>
          </div>
        </form>
      </div>

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
