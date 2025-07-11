"use client";

import React, { useState } from "react";
import { Save, X, DollarSign, Calendar, Clock } from "lucide-react";
import { ProjectWithDetails } from "../../types";

interface InlineProjectEditProps {
  project: ProjectWithDetails;
  onSave: (updatedProject: any) => void;
  onCancel: () => void;
}

const InlineProjectEdit: React.FC<InlineProjectEditProps> = ({
  project,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    priority: project.priority || "low",
    status: project.status || "pending",
    techStack: project.techStack || [],
    newTech: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProject = {
      ...project,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      techStack: formData.techStack,
    };
    onSave(updatedProject);
  };

  const handleTechStackAdd = () => {
    if (formData.newTech.trim() && !formData.techStack.includes(formData.newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, prev.newTech.trim()],
        newTech: "",
      }));
    }
  };

  const handleTechStackRemove = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Project</h3>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Technology
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.newTech}
                onChange={(e) => setFormData(prev => ({ ...prev, newTech: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., React, Node.js"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTechStackAdd())}
              />
              <button
                type="button"
                onClick={handleTechStackAdd}
                className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Enter project description"
          />
        </div>

        {/* Tech Stack Display */}
        {formData.techStack.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Technologies
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-sm"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleTechStackRemove(tech)}
                    className="text-blue-300 hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InlineProjectEdit;
