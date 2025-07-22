"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProjectChat from "../../ProjectChat";
import { useAuth } from "../../../../hooks/useAuth";
import { useProjectDetails } from "../../../../hooks/useProjectDetails";

const ProjectChatPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, isLoading: authLoading } = useAuth();

  const {
    projectDetails,
    loading: projectLoading,
    error: projectError,
  } = useProjectDetails(projectId);

  if (authLoading || projectLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">Loading Chat...</span>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-400">
            Could not load project details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Please log in to view the chat.</p>
      </div>
    );
  }

  return (
    <ProjectChat
      projectId={projectId}
      projectTitle={projectDetails?.title || "Loading..."}
      currentUserId={user.id}
      currentUserRole={user.role as "admin" | "client" | "developer"}
      currentUserName={user.name || "User"}
    />
  );
};

export default ProjectChatPage;
