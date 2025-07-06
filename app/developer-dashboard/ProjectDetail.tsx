"use client";

import React, { useState } from "react";
import { ProjectAssignment } from "@/types/project";
import { FaArrowLeft, FaComments, FaCode, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import ProjectChatComponent from "../admin-dashboard/ProjectChat";

interface ProjectDetailProps {
  project: ProjectAssignment;
  onBack: () => void;
}

type DetailView = "overview" | "chat";

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const [activeView, setActiveView] = useState<DetailView>("overview");

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Project Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-white">{project.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Progress</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Budget</h4>
                  <p className="text-white font-semibold">${project.budget.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <ProjectChatComponent
              projectId={project.id}
              projectTitle={project.title}
              currentUserId="dev-1"
              currentUserRole="developer"
              currentUserName="Developer User"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="backdrop-blur-xl bg-indigo-900/80 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Projects</span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                <p className="text-gray-400">{project.client}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-gray-400" />
                <span className="text-gray-300 text-sm">
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FaDollarSign className="text-gray-400" />
                <span className="text-gray-300 text-sm">${project.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeView === "overview"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaCode className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeView === "chat"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaComments className="inline mr-2" />
            Chat
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectDetail;
