"use client";

import React, { useState, useEffect } from "react";
import { ProjectAssignment } from "@/types/project";
import { FaArrowLeft, FaComments, FaCode, FaCalendarAlt, FaDollarSign, FaUsers, FaChartLine } from "react-icons/fa";
import ProjectChatComponent from "../admin-dashboard/ProjectChat";
import ProjectAssignmentsComponent from "../admin-dashboard/ProjectAssignments";
import { useAuth } from "@/hooks/useAuth";
import { SystemUser } from "~/types";
import useSWR from "swr";
import {
  Activity,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

interface ProjectDetailProps {
  project: ProjectAssignment;
  onBack: () => void;
}

type DetailView = "overview" | "chat" | "assignments" | "activity";

interface FetcherError extends Error {
  info?: any;
  status?: number;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error: FetcherError = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};


const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const [activeView, setActiveView] = useState<DetailView>("overview");
  const [developers, setDevelopers] = useState<SystemUser[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const { user } = useAuth();

  const { data: activityData, error: activityError, isLoading: activityLoading } = useSWR(
    project ? `/api/project-activity/${project.id}` : null,
    fetcher
  );

  // Fetch developers for assignments
  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoadingDevelopers(true);
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDevelopers(data.filter((user: any) => user.role === 'developer'));
        }
      } catch (error) {
        console.error('Error fetching developers:', error);
      } finally {
        setLoadingDevelopers(false);
      }
    };
    fetchDevelopers();
  }, []);

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
            {user && (
              <ProjectChatComponent
                projectId={project.id}
                projectTitle={project.title}
                currentUserId={user.id}
                currentUserRole={user.role as "admin" | "client" | "developer"}
                currentUserName={user.name || user.email}
              />
            )}
          </div>
        );

      case "assignments":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {loadingDevelopers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-gray-400">Loading developers...</span>
              </div>
            ) : (
              <ProjectAssignmentsComponent
                projectId={project.id}
                projectTitle={project.title}
                developers={developers}
                readOnly={true}
              />
            )}
          </div>
        );

      case "activity":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <h3 className="text-lg font-medium text-white mt-4">
                    Loading activity...
                  </h3>
                </div>
              ) : activityError ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Could not load activity
                  </h3>
                  <p className="text-gray-400">
                    There was an error fetching the project activity.
                  </p>
                </div>
              ) : (
                activityData?.data.map((activity: any) => (
                  <div
                    key={`${activity.activityType}-${activity.id}`}
                    className="flex items-start space-x-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.activityType === "milestone" ? (
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        </div>
                      ) : activity.activityType === "update" ? (
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-300" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{activity.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {(activityData?.data.length === 0) && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Activity Yet
                  </h3>
                  <p className="text-gray-400">
                    Activity will appear here as the project progresses.
                  </p>
                </div>
              )}
            </div>
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
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeView === "overview"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <FaCode className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeView === "chat"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <FaComments className="inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveView("assignments")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeView === "assignments"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <FaUsers className="inline mr-2" />
            Team Assignments
          </button>
          <button
            onClick={() => setActiveView("activity")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeView === "activity"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <FaChartLine className="inline mr-2" />
            Activity
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectDetail;
