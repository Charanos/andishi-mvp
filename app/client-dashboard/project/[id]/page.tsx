"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import EnhancedProjectTracking from "@/app/client-dashboard/projectDetails";
import { ProjectWithDetails, ProjectData } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const ProjectDetailsPage = () => {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;

      console.log("Fetching project with ID:", id);

      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/client-projects?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-email": user.email || "",
          },
        });

        console.log("API Response:", response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch project data.");
        }

        const data = await response.json();
        console.log("API Data:", data);
        if (data.success) {
          console.log("Project data received:", data.data);
          setProject(data.data);
        } else {
          throw new Error(data.message || "Could not find the project.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-xl p-6 shadow-xl flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <span className="text-gray-900 dark:text-white font-medium">Loading Project...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-900 dark:text-white text-center px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-900 dark:text-white text-center px-4">
        <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-white/10 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The project you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    window.location.href = "/client-dashboard";
  };

  // Function to transform ProjectWithDetails to ProjectData
  const transformProjectToData = (project: ProjectWithDetails): ProjectData => {
    return {
      _id: project.id,
      projectDetails: {
        title: project.title,
        description: project.description,
        category: project.category,
        timeline: project.timeline || "",
        priority: project.priority,
        techStack: project.techStack,
        requirements: project.requirements || "",
      },
      pricing: {
        type: project.pricing?.type || "fixed",
        currency: project.pricing?.currency || "USD",
        fixedBudget: project.pricing?.fixedBudget,
        hourlyRate: project.pricing?.hourlyRate,
        estimatedHours: project.pricing?.estimatedHours?.toString(),
      },
      status: project.status,
      priority: project.priority === "urgent" ? "critical" : project.priority,
      progress: project.progress,
      createdAt: project.createdAt.toString(),
      updatedAt: project.updatedAt.toString(),
      userInfo: project.userInfo,
      milestones: project.milestones,
      updates: project.updates,
      files: project.files,
      payments: project.payments,
    };
  };

  return (
    <EnhancedProjectTracking
      project={transformProjectToData(project)}
      onBack={handleBack}
    />
  );
};

export default ProjectDetailsPage;
