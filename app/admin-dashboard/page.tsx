"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";
import {
  FaUser,
  FaProjectDiagram,
  FaDollarSign,
  FaEnvelope,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaUsers,
  FaCode,
  FaChartLine,
  FaDownload,
  FaCheckCircle,
  FaLightbulb,
  FaPause,
  FaFile,
  FaTag,
  FaCog,
  FaShieldAlt,
  FaKey,
  FaLock,
  FaNetworkWired,
  FaDatabase,
  FaCalendarAlt,
  FaChartBar,
  FaServer,
  FaArrowCircleLeft,
  FaPhone,
  FaUserEdit,
  FaInfoCircle,
  FaBell,
  FaTachometerAlt,
  FaBuilding,
  FaFlag,
} from "react-icons/fa";
import DeveloperProfilesOverview from "./DeveloperProfilesOverview";
import {
  listProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "~/services/clientProjects";
import { UserRole } from "@/types/auth";
import UserManagement from "./renderUsers";
import ProjectOverview from "./ProjectOverview";
import { ProjectData, Milestone, ProjectFile } from "~/types";

// Types
interface SystemUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role: "client" | "developer" | "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
  projectsCount?: number;
  skills?: string[];
  hourlyRate?: number;
  passwordLastChanged?: string;
  loginAttempts?: number;
  accountLocked?: boolean;
  completedProjects?: number;
  activeProjects?: number;
  totalEarnings?: number;
  isActive: boolean;
  accountCreated: boolean;
  passwordGenerated: boolean;
}

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalRevenue: number;
  monthlyGrowth: number;
  projectsByStatus: { [key: string]: number };
  usersByRole: { [key: string]: number };
  revenueByMonth: { month: string; revenue: number }[];
  topClients: { name: string; projects: number; revenue: number }[];
  topDevelopers: { name: string; projects: number; rating: number }[];
}

type ActiveTab =
  | "overview"
  | "projects"
  | "users"
  | "dev profiles"
  | "clients"
  | "analytics"
  | "settings";

export default function EnhancedAdminDashboard(): ReactNode {
  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [devProfiles, setDevProfiles] = useState<
    (typeof DeveloperProfilesOverview)[]
  >([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    projectsByStatus: {},
    usersByRole: {},
    revenueByMonth: [],
    topClients: [],
    topDevelopers: [],
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoggedInUser, setFetchLoggedInUser] = useState(false);

  const [accountExists, setAccountExists] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [existingAccountData, setExistingAccountData] = useState<any>(null);

  // Navigation items for developers tab
  // Get logged-in user from session (example using /api/session)
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await fetch("/api/users", { credentials: "include" });
        if (res.ok) {
          const session = await res.json();
          if (session?.user) {
            setSelectedUser(session.user);
          }
        }
      } catch (err) {
        // Ignore error, fallback to default
      }
    };
    fetchLoggedInUser();
  }, [setFetchLoggedInUser]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel via service / API endpoints
        const [projectsData, devProfilesData, usersData] = await Promise.all([
          listProjects(),
          fetch("/api/developer-profiles").then((r) => r.json()),
          fetch("/api/users").then((r) => r.json()),
        ]);

        // Normalise / transform projects
        const transformedProjects = (projectsData || []).map(
          (project: any) => ({
            ...project,
            priority: project.priority || "low",
          })
        );
        setProjects(transformedProjects);

        // Developer profiles may come in various envelope shapes
        const profilesArray = Array.isArray(devProfilesData)
          ? devProfilesData
          : Array.isArray(devProfilesData?.profiles)
          ? devProfilesData.profiles
          : [];
        setDevProfiles(profilesArray);

        // Users array normalisation
        const usersArray = Array.isArray(usersData)
          ? usersData
          : Array.isArray(usersData?.users)
          ? usersData.users
          : [];
        setUsers(usersArray);

        // Generate dashboard analytics
        generateAnalytics(transformedProjects, usersArray);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);
  const [error, setError] = useState<string | null>(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const resp = await fetch("/api/users", { credentials: "include" });
        if (!resp.ok) {
          throw new Error("Failed to fetch users");
        }
        const data: SystemUser[] = await resp.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info";
      message: string;
    }>
  >([]);

  // Notification functions
  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Project-related states
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "detail" | "edit">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "budget">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // User management states
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<
    "create" | "edit" | "view"
  >("view");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    firstName: selectedUser?.firstName || "",
    lastName: selectedUser?.lastName || "",
    email: selectedUser?.email || "",
    phone: selectedUser?.phone || "",
    company: selectedUser?.company || "",
    role: selectedUser?.role || "client",
    status: selectedUser?.status || "active",
    skills: selectedUser?.skills?.join(", ") || "",
    hourlyRate: selectedUser?.hourlyRate?.toString() || "",
  });

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  // viewMode projects details reset
  useEffect(() => {
    setViewMode("list");
    setSelectedProject(null);
  }, [activeTab]);

  // viewMode users details reset
  useEffect(() => {
    setViewMode("list");
    setSelectedUser(null);
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch projects via service wrapper to ensure consistent response shape
      const projectsArray = await listProjects();
      const transformedProjects = (projectsArray || []).map((project: any) => ({
        ...project,
        priority: project.priority || "low",
      }));
      setProjects(transformedProjects);

      // Fetch users
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users ? usersData.users : usersData);
      }

      // Fetch developer profiles
      const devProfilesRes = await fetch("/api/developer-profiles");
      const devProfilesData = await devProfilesRes.json();
      let profiles: any[] = [];
      if (Array.isArray(devProfilesData)) {
        profiles = devProfilesData;
      } else if (Array.isArray(devProfilesData?.profiles)) {
        profiles = devProfilesData.profiles;
      } else if (
        devProfilesData.success &&
        Array.isArray(devProfilesData.profiles)
      ) {
        profiles = devProfilesData.profiles;
      }
      setDevProfiles(profiles);

      // Generate analytics with transformed data
      const usersArray = Array.isArray(usersData)
        ? usersData
        : Array.isArray(usersData?.users)
        ? usersData.users
        : [];
      generateAnalytics(transformedProjects, usersArray);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (
    projectsData: ProjectData[],
    usersData: SystemUser[]
  ): void => {
    // Calculate project statistics
    const projectStats = projectsData.map((project) => {
      // Safely get client name, handling potential undefined userInfo
      let clientName = "Unknown Client";
      if (
        project.userInfo &&
        project.userInfo.firstName &&
        project.userInfo.lastName
      ) {
        clientName = `${project.userInfo.firstName} ${project.userInfo.lastName}`;
      } else if (project.clientId) {
        // Try to find user info from usersData if we have clientId
        const clientUser = usersData.find(
          (user) => user._id === project.clientId
        );
        if (clientUser) {
          clientName = `${clientUser.firstName} ${clientUser.lastName}`;
        }
      }

      return {
        id: project._id,
        status: project.status || "pending",
        priority: project.priority || "low",
        budget: calculateProjectBudget(project),
        client: clientName,
        date: project.createdAt,
      };
    });

    // Calculate total revenue and project status counts
    const totalRevenue = projectStats.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    const projectsByStatus = projectStats.reduce(
      (acc: { [key: string]: number }, project) => {
        const status = project.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate user role distribution
    const usersByRole = usersData.reduce(
      (acc: { [key: string]: number }, user) => {
        const role = user.role || "client";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate monthly revenue with safe date handling
    const revenueByMonth = projectStats.reduce(
      (acc: { [key: string]: number }, project) => {
        try {
          const month = new Date(project.date).toLocaleString("default", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + (project.budget || 0);
        } catch (error) {
          console.error("Error processing date:", error);
          // Skip invalid dates
        }
        return acc;
      },
      {}
    );

    // Convert revenueByMonth to array format
    const revenueMonthly = Object.entries(revenueByMonth).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    // Calculate top clients with safe handling of undefined values
    const clientStats = projectStats.reduce(
      (
        acc: { [key: string]: { projects: number; revenue: number } },
        project
      ) => {
        const clientName = project.client || "Unknown Client";
        if (!acc[clientName]) {
          acc[clientName] = { projects: 0, revenue: 0 };
        }
        acc[clientName].projects++;
        acc[clientName].revenue += project.budget || 0;
        return acc;
      },
      {}
    );

    const topClients = Object.entries(clientStats)
      .map(([name, stats]) => ({
        name,
        projects: stats.projects,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate top developers with safe handling
    const developerStats = usersData
      .filter(
        (user) => user.role === "developer" && user.firstName && user.lastName
      )
      .map((dev) => ({
        name: `${dev.firstName} ${dev.lastName}`,
        projects: dev.projectsCount || 0,
        rating: 4.5, // Default rating if not available
      }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 5);

    // Calculate monthly growth with safe handling
    const currentMonthRevenue =
      revenueMonthly[revenueMonthly.length - 1]?.revenue || 0;
    const previousMonthRevenue =
      revenueMonthly[revenueMonthly.length - 2]?.revenue || 0;
    const monthlyGrowth = previousMonthRevenue
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100
      : 0;

    setAnalytics({
      totalUsers: usersData.length,
      totalProjects: projectsData.length,
      totalRevenue,
      monthlyGrowth,
      projectsByStatus,
      usersByRole,
      revenueByMonth: revenueMonthly,
      topClients,
      topDevelopers: developerStats,
    });
  };

  const calculateProjectBudget = (project: ProjectData): number => {
    if (project.pricing.type === "fixed") {
      return parseFloat(project.pricing.fixedBudget || "0");
    } else if (project.pricing.type === "milestone") {
      const milestonesArr =
        project.milestones && project.milestones.length
          ? project.milestones
          : project.pricing.milestones || [];
      return (
        milestonesArr.reduce(
          (sum, m) => sum + parseFloat(m.budget || "0"),
          0
        ) || 0
      );
    } else {
      return (
        parseFloat(project.pricing.hourlyRate || "0") *
        parseFloat(project.pricing.estimatedHours || "0")
      );
    }
  };

  // Project functions

  // 1. Update Project Status (Already implemented)

  const updateProjectStatus = async (
    projectId: string,
    newStatus: "pending" | "reviewed" | "approved" | "rejected"
  ) => {
    const prevProjects = [...projects];
    let updatedProject: ProjectData | undefined;
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id === projectId) {
          updatedProject = { ...project, status: newStatus };
          return updatedProject;
        }
        return project;
      })
    );

    try {
      await apiUpdateProject(projectId, { status: newStatus });
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      const statusMessages = {
        approved: "Project approved successfully! 🎉",
        reviewed: "Project marked as reviewed 👍",
        rejected: "Project rejected ❌",
        pending: "Project status updated ⏳",
      };
      toast.success(statusMessages[newStatus]);
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error(error?.message || "Failed to update project status");
    } finally {
      if (newStatus === "rejected" || newStatus === "approved") {
        setViewMode("list");
        setSelectedProject(null);
      }
    }
  };

  // 2. Update Project Progress
  const updateProjectProgress = async (projectId: string, progress: number) => {
    const prevProjects = [...projects];
    let updatedProject: ProjectData | undefined;
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id === projectId) {
          updatedProject = { ...project, progress };
          return updatedProject;
        }
        return project;
      })
    );

    try {
      await apiUpdateProject(projectId, { progress });
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      toast.success("Project progress updated ✅");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error(error?.message || "Failed to update project progress");
    }
  };

  // 3. Update Milestone details
  const updateMilestone = async (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ) => {
    const prevProjects = [...projects];
    const prevSelectedProject =
      selectedProject?._id === projectId ? selectedProject : null;

    // Optimistically update the UI
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id !== projectId) return project;

        const updatedMilestones = (project.milestones || []).map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, ...updates }
            : milestone
        );

        // Create the updated project with proper typing
        const updatedProject: ProjectData = {
          ...project,
          milestones: updatedMilestones,
          // Ensure pricing is always a valid PricingOption
          pricing: project.pricing
            ? {
                ...project.pricing,
                milestones: updatedMilestones,
              }
            : {
                // Provide default values that match PricingOption type
                type: "fixed", // or whatever default makes sense
                currency: "USD",
                milestones: updatedMilestones,
              },
          updatedAt: new Date().toISOString(),
        };

        // Update selected project if it's the one being edited
        if (selectedProject?._id === projectId) {
          setSelectedProject(updatedProject);
        }

        return updatedProject;
      })
    );

    try {
      // Send update to the backend
      await apiUpdateProject(projectId, {
        milestones: { id: milestoneId, ...updates },
      });

      // Refresh the data to ensure consistency
      const updatedProjects = await listProjects();
      setProjects(updatedProjects);

      // Update selected project if needed
      if (selectedProject?._id === projectId) {
        const updated =
          updatedProjects.find((p) => p._id === projectId) || null;
        setSelectedProject(updated);
      }

      toast.success("Milestone updated successfully!");
    } catch (error: any) {
      // Revert to previous state on error
      setProjects(prevProjects);
      if (prevSelectedProject) {
        setSelectedProject(prevSelectedProject);
      }
      toast.error(error?.message || "Failed to update milestone");
    }
  };

  // 4. Add project update/comment
  const addProjectUpdate = async (
    projectId: string,
    update: { title: string; description: string; type: string }
  ) => {
    const prevProjects = [...projects];
    const newUpdate = {
      ...update,
      id: new Date().toISOString(),
      createdAt: new Date(),
    };

    let updatedProject: ProjectData | undefined;
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id === projectId) {
          updatedProject = {
            ...project,
            updates: [newUpdate, ...(project.updates || [])],
          };
          return updatedProject;
        }
        return project;
      })
    );

    try {
      await apiUpdateProject(projectId, { updates: [newUpdate] });
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      toast.success("Update added ✅");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error(error?.message || "Failed to add update");
    }
  };

  // 5. Upload project file
  const uploadProjectFile = async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    const prevProjects = [...projects];
    const tempFileUrl = URL.createObjectURL(file);
    const newFile: ProjectFile = {
      id: tempFileUrl, // Use temp url as unique key for optimistic update
      fileName: file.name,
      fileUrl: tempFileUrl,
      fileSize: file.size,
      fileType: file.type,
      createdAt: new Date(),
    };

    let optimisticallyUpdatedProject: ProjectData | undefined;
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id === projectId) {
          optimisticallyUpdatedProject = {
            ...project,
            files: [newFile, ...(project.files || [])],
          };
          return optimisticallyUpdatedProject;
        }
        return project;
      })
    );
    if (optimisticallyUpdatedProject) {
      setSelectedProject(optimisticallyUpdatedProject);
    }

    try {
      const res = await fetch("/api/client-projects/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      let finalUpdatedProject: ProjectData | undefined;
      setProjects((prev) =>
        prev.map((project) => {
          if (project._id === projectId) {
            const updatedFiles = project.files?.map((f) =>
              f.id === tempFileUrl ? data.file : f
            );
            finalUpdatedProject = { ...project, files: updatedFiles };
            return finalUpdatedProject;
          }
          return project;
        })
      );
      if (finalUpdatedProject) {
        setSelectedProject(finalUpdatedProject);
      }

      toast.success("File uploaded ✅");
    } catch (error: any) {
      setProjects(prevProjects);
      if (selectedProject?._id === projectId) {
        const revertedProject = prevProjects.find((p) => p._id === projectId);
        setSelectedProject(revertedProject || null);
      }
      toast.error(error?.message || "Failed to upload file");
    }
  };

  // 6. Record payment
  const recordProjectPayment = async (
    projectId: string,
    payment: { amount: number; method: string; notes?: string }
  ) => {
    const newPayment = {
      ...payment,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      status: "completed",
    };

    const prevProjects = [...projects];
    let updatedProject: ProjectData | undefined;
    setProjects((prev) =>
      prev.map((project) => {
        if (project._id === projectId) {
          updatedProject = {
            ...project,
            payments: [newPayment, ...(project.payments || [])],
          };
          return updatedProject;
        }
        return project;
      })
    );

    try {
      await apiUpdateProject(projectId, { payments: [newPayment] });
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      toast.success("Payment recorded");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error(error?.message || "Failed to record payment");
    }
  };

  // 7. Create New Project (POST)
  const createNewProject = async (project: Partial<ProjectData>) => {
    const tempId = `temp-${Date.now()}`;
    const newProject = {
      ...project,
      _id: tempId,
      status: "pending",
      createdAt: new Date().toISOString(),
    } as ProjectData;

    setProjects((prev) => [newProject, ...prev]);

    try {
      const savedProject = await apiCreateProject(project);
      setProjects((prev) =>
        prev.map((p) => (p._id === tempId ? savedProject : p))
      );
      toast.success("Project created successfully!");
    } catch (error: any) {
      setProjects((prev) => prev.filter((p) => p._id !== tempId));
      toast.error(error?.message || "Failed to create project");
    }
  };

  // 8. Delete Project
  const deleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;

    const prevProjects = [...projects];
    setProjects((prev) => prev.filter((p) => p._id !== projectId));

    try {
      await apiDeleteProject(projectId);
      toast.success("Project deleted successfully!");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error(error?.message || "Failed to delete project");
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date provided";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return `Invalid: ${dateString}`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-400" />;
      case "reviewed":
        return <FaEye className="text-blue-400" />;
      case "approved":
        return <FaCheck className="text-green-400" />;
      case "rejected":
        return <FaTimes className="text-red-400" />;
      case "active":
        return <FaCheck className="text-green-400" />;
      case "inactive":
        return <FaClock className="text-gray-400" />;
      case "suspended":
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-400 bg-red-500/20 border-red-400/30";
      case "high":
        return "text-orange-400 bg-orange-500/20 border-orange-400/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-400/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-400/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-500/20 border-red-400/30";
      case "developer":
        return "text-blue-400 bg-blue-500/20 border-blue-400/30";
      case "client":
        return "text-green-400 bg-green-500/20 border-green-400/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/20 border-green-400/30";
      case "inactive":
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
      case "suspended":
        return "text-red-400 bg-red-500/20 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
    }
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    if (!Array.isArray(users)) return [];
    let filtered = [...users];

    if (activeTab === "clients") {
      filtered = filtered.filter((user) => user.role === "client");
    } else if (activeTab === "dev profiles") {
      filtered = filtered.filter((user) => user.role === "developer");
    }

    if (userSearchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(userSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          (user.company &&
            user.company.toLowerCase().includes(userSearchTerm.toLowerCase()))
      );
    }

    if (userRoleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === userRoleFilter);
    }

    if (userStatusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === userStatusFilter);
    }

    return filtered;
  };

  // Render functions
  const renderOverview = (): ReactNode => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Users",
            value: analytics.totalUsers,
            icon: <FaUsers className="text-blue-400" />,
            change: "+12.5%",
            trend: "up" as const,
          },
          {
            label: "Active Projects",
            value: analytics.totalProjects,
            icon: <FaProjectDiagram className="text-green-400" />,
            change: "+8.2%",
            trend: "up" as const,
          },
          {
            label: "Total Revenue",
            value: formatCurrency(analytics.totalRevenue),
            icon: <FaDollarSign className="text-yellow-400" />,
            change: `+${analytics.monthlyGrowth.toFixed(1)}%`,
            trend:
              analytics.monthlyGrowth >= 0
                ? ("up" as const)
                : ("down" as const),
          },
          {
            label: "Avg Project Value",
            value: formatCurrency(
              analytics.totalProjects > 0
                ? analytics.totalRevenue / analytics.totalProjects
                : 0
            ),
            icon: <FaChartLine className="text-purple-400" />,
            change: "+15.3%",
            trend: "up" as const,
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  {metric.icon}
                </div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  {metric.trend === "up" ? (
                    <FaSortAmountUp className="text-green-400 mr-1" />
                  ) : (
                    <FaSortAmountDown className="text-red-400 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      metric.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Project Status Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.projectsByStatus).map(
              ([status, count]) => {
                const percentage = Math.round(
                  (count / analytics.totalProjects) * 100
                );
                return (
                  <div key={status} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                          {getStatusIcon(status)}
                        </div>
                        <span className="text-white font-medium capitalize">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {count} projects
                        </span>
                        <span className="text-white font-semibold">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={`${getStatusColor(
                          status
                        )} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            User Role Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.usersByRole).map(([role, count]) => {
              const percentage = Math.round(
                (count / analytics.totalUsers) * 100
              );
              return (
                <div key={role} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <FaUser className={getRoleColor(role)} />
                      </div>
                      <span className="text-white font-medium capitalize">
                        {role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {count} users
                      </span>
                      <span className="text-white font-semibold">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`${getRoleColor(
                        role
                      )} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Clients</h3>
          <div className="space-y-3">
            {analytics.topClients.map((client, index) => (
              <div
                key={client.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-gray-400 text-sm">
                      {client.projects} projects
                    </p>
                  </div>
                </div>
                <p className="text-green-400 font-medium">
                  {formatCurrency(client.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Developers */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Developers
          </h3>
          <div className="space-y-3">
            {analytics.topDevelopers.map((dev, index) => (
              <div
                key={dev.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{dev.name}</p>
                    <p className="text-gray-400 text-sm">
                      {dev.projects} projects
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white">{dev.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = (): ReactNode => {
    if (viewMode === "detail" && selectedProject) {
      return (
        <ProjectOverview
          selectedProject={selectedProject}
          onBack={() => setViewMode("list")}
          onStatusUpdate={updateProjectStatus}
          onProgressUpdate={async (projectId, progress) => {
            /* kept original stub structure */
            await updateProjectProgress(projectId, progress);
          }}
          onMilestoneUpdate={async (
            projectId,
            milestoneId,
            updates: Partial<Milestone>
          ) => {
            /* kept original stub structure */
            await updateMilestone(projectId, milestoneId, updates);
          }}
          onAddUpdate={async (projectId, update) => {
            /* kept original stub structure */
            await addProjectUpdate(projectId, update);
          }}
          onFileUpload={async (projectId, file) => {
            /* kept original stub structure */
            await uploadProjectFile(projectId, file);
          }}
          onPaymentRecord={async (projectId, payment) => {
            /* kept original stub structure */
            await recordProjectPayment(projectId, payment);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen">
        <div className="space-y-8 p-6">
          {/* Enhanced Header with Statistics */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  Client Projects
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage and track all client projects with real-time insights
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-3  backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-blue-400">
                    {projects?.filter((p) => p?.status === "approved").length ||
                      0}
                  </div>
                  <div className="text-xs text-blue-300 monty uppercase">
                    Active
                  </div>
                </div>
                <div className="flex items-center gap-3 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-green-400">
                    {projects?.filter((p) => p?.status === "reviewed").length ||
                      0}
                  </div>
                  <div className="text-xs text-green-300 monty uppercase">
                    Reviewed
                  </div>
                </div>
                <div className="flex items-center gap-3  backdrop-blur-sm border border-orange-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-orange-400">
                    {projects?.filter((p) => p?.status === "pending").length ||
                      0}
                  </div>
                  <div className="text-xs text-orange-300 monty uppercase">
                    Pending
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/5 my-12 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative group">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search projects by name, client, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                >
                  <option value="all" className="bg-black/50">
                    All Status
                  </option>
                  <option value="pending" className="bg-black/50">
                    Pending
                  </option>
                  <option value="reviewed" className="bg-black/50">
                    Reviewed
                  </option>
                  <option value="approved" className="bg-black/50">
                    Approved
                  </option>
                  <option value="rejected" className="bg-black/50">
                    Rejected
                  </option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                >
                  <option value="all" className="bg-black/50">
                    All Priority
                  </option>
                  <option value="critical" className="bg-black/50">
                    Critical
                  </option>
                  <option value="high" className="bg-black/50">
                    High
                  </option>
                  <option value="medium" className="bg-black/50">
                    Medium
                  </option>
                  <option value="low" className="bg-black/50">
                    Low
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(projects ?? []).map((project) => {
              const progress = project?.progress || 0;
              const status = project?.status || "pending";
              const priority = project?.priority || "low";

              return (
                <div
                  key={project?._id}
                  className="group relative bg-white/5 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 hover:border-slate-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Priority Indicator */}
                  <div
                    className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                      priority === "critical"
                        ? "bg-red-500/20 shadow-lg shadow-red-500/30"
                        : priority === "high"
                        ? "bg-orange-500/20 shadow-lg shadow-orange-500/30"
                        : priority === "medium"
                        ? "bg-yellow-500/20 shadow-lg shadow-yellow-500/30"
                        : "bg-green-500/20 shadow-lg shadow-green-500/30"
                    }`}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {project?.projectDetails?.title ?? "Untitled Project"}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <FaUser className="text-blue-400" />
                        {project?.userInfo?.firstName ?? "Unknown"}{" "}
                        {project?.userInfo?.lastName ?? ""}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <FaBuilding className="text-purple-400" />
                        {project?.userInfo?.company ?? "No Company"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`flex items-center monty uppercase gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          status === "approved"
                            ? " text-green-400 border border-green-500/30"
                            : status === "reviewed"
                            ? " text-blue-400 border border-blue-500/30"
                            : status === "pending"
                            ? " text-orange-400 border border-orange-500/30"
                            : " text-red-400 border border-red-500/30"
                        }`}
                      >
                        {getStatusIcon(status)}
                        {status}
                      </div>
                      <div
                        className={`px-2 py-1 monty uppercase rounded-full text-xs font-medium ${getPriorityColor(
                          priority
                        )}`}
                      >
                        {priority}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FaProjectDiagram className="mr-3 text-blue-400" />
                      <span className="font-medium monty uppercase">
                        {project?.projectDetails?.category ?? "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300">
                      <FaDollarSign className="mr-3 text-indigo-400" />
                      <span className="font-semibold text-xl text-green-400">
                        {formatCurrency(
                          calculateProjectBudget(project),
                          project?.pricing?.currency ?? "USD"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${
                          progress < 25
                            ? "bg-gradient-to-r from-red-500 to-red-400"
                            : progress < 50
                            ? "bg-gradient-to-r from-orange-500 to-orange-400"
                            : progress < 75
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                            : progress < 100
                            ? "bg-gradient-to-r from-blue-500 to-blue-400"
                            : "bg-gradient-to-r from-green-500 to-green-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Indicator */}
                  {project?.milestones && project.milestones.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <FaFlag className="text-purple-400" />
                        <span>Milestones</span>
                      </div>
                      <div className="flex gap-1">
                        {project.milestones
                          .slice(0, 5)
                          .map((milestone: any, index: number) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                milestone.completed
                                  ? "bg-green-400"
                                  : "bg-gray-600"
                              }`}
                            />
                          ))}
                        {project.milestones.length > 5 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{project.milestones.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                    <div className="flex items-center monty uppercase gap-2 text-sm text-gray-400">
                      <FaCalendarAlt className="text-blue-400" />
                      <span>
                        {project?.createdAt
                          ? formatDate(project.createdAt)
                          : "No date"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setViewMode("detail");
                        }}
                        className="cursor-pointer p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project?._id) {
                            deleteProject(project._id);
                          }
                        }}
                        className="cursor-pointer p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                        title="Delete Project"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {(!projects || projects.length === 0) && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-12 max-w-md mx-auto">
                <FaProjectDiagram className="mx-auto text-6xl text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Projects Found
                </h3>
                <p className="text-gray-400">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Try adjusting your filters to see more projects."
                    : "Start by creating your first project to see it here."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // User management functions
  interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    role: "client" | "developer" | "admin";
    status?: "active" | "inactive" | "suspended";
    skills?: string;
    hourlyRate?: string;
    generatePassword: boolean;
  }

  interface CreateUserResponse {
    success: boolean;
    user: SystemUser;
    generatedPassword?: string;
    error?: string;
  }

  const createUser = async (
    userData: Omit<CreateUserPayload, "generatePassword">
  ): Promise<CreateUserResponse> => {
    try {
      // Add password generation flag for new users
      const payload: CreateUserPayload = {
        ...userData,
        generatePassword: true, // This will generate a secure password
      };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: CreateUserResponse = await res.json();

      if (data.success) {
        setUsers((prev) => [...prev, data.user]);
        toast.success(
          `User created successfully! ${
            data.generatedPassword ? "Password: " + data.generatedPassword : ""
          }`
        );

        // If a password was generated, you might want to show it to the admin
        if (data.generatedPassword) {
          // You could show this in a separate modal or copy to clipboard
          console.log("Generated password:", data.generatedPassword);
          // Optional: Copy to clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(data.generatedPassword);
            toast.info("Password copied to clipboard!");
          }
        }

        return data;
      } else {
        throw new Error(data.error || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Create user error:", error);
      toast.error(error?.message || "Failed to create user");
      throw error;
    }
  };

  interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: "client" | "developer" | "admin";
    status?: "active" | "inactive" | "suspended";
    skills?: string[] | string;
    hourlyRate?: number | string;
  }

  interface UpdateUserResponse {
    success: boolean;
    user?: SystemUser;
    error?: string;
  }

  const updateUser = async (
    userId: string,
    userData: UpdateUserPayload
  ): Promise<UpdateUserResponse> => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: userId, ...userData }),
      });

      const data: UpdateUserResponse = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  ...userData,
                  skills:
                    typeof userData.skills === "string"
                      ? userData.skills
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter(Boolean)
                      : userData.skills ?? user.skills,
                  hourlyRate:
                    userData.hourlyRate !== undefined
                      ? typeof userData.hourlyRate === "string"
                        ? userData.hourlyRate === ""
                          ? undefined
                          : Number(userData.hourlyRate)
                        : userData.hourlyRate
                      : user.hourlyRate,
                }
              : user
          )
        );
        toast.success("User updated successfully!");
        return data;
      } else {
        throw new Error(data.error || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error(error?.message || "Failed to update user");
      throw error;
    }
  };

  interface DeleteUserResponse {
    success: boolean;
    error?: string;
  }

  const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
    try {
      // Fixed: Use query parameter instead of body for DELETE request
      const res: Response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data: DeleteUserResponse = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        toast.success("User deleted successfully!");
        return data;
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast.error(error?.message || "Failed to delete user");
      throw error;
    }
  };

  interface ToggleUserStatusResponse {
    success: boolean;
    user?: SystemUser;
    error?: string;
  }

  const toggleUserStatus = async (
    userId: string,
    currentStatus: "active" | "inactive" | "suspended"
  ): Promise<ToggleUserStatusResponse> => {
    try {
      const newStatus: "active" | "inactive" =
        currentStatus === "active" ? "inactive" : "active";

      const res: Response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: userId,
          status: newStatus,
        }),
      });

      const data: ToggleUserStatusResponse = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast.success(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`
        );
        return data;
      } else {
        throw new Error(data.error || "Failed to update user status");
      }
    } catch (error: any) {
      console.error("Toggle user status error:", error);
      toast.error(error?.message || "Failed to update user status");
      throw error;
    }
  };

  // Additional utility functions
  interface GenerateNewPasswordRequest {
    userId: string;
    regenerate: boolean;
  }

  interface GenerateNewPasswordResponse {
    success: boolean;
    generatedPassword?: string;
    user?: SystemUser;
    error?: string;
  }

  const generateNewPassword = async (
    userId: string
  ): Promise<GenerateNewPasswordResponse> => {
    try {
      const payload: GenerateNewPasswordRequest = {
        userId: userId,
        regenerate: true,
      };

      const res: Response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: GenerateNewPasswordResponse = await res.json();

      if (data.success) {
        toast.success("New password generated successfully!");

        // Copy password to clipboard if available
        if (data.generatedPassword && navigator.clipboard) {
          navigator.clipboard.writeText(data.generatedPassword);
          toast.info("Password copied to clipboard!");
        }

        // You might want to show the password in a secure way to the admin
        console.log("New password:", data.generatedPassword);

        return data;
      } else {
        throw new Error(data.error || "Failed to generate new password");
      }
    } catch (error: any) {
      console.error("Generate password error:", error);
      toast.error(error?.message || "Failed to generate new password");
      throw error;
    }
  };

  // Bulk operations
  interface BulkDeleteUsersResult {
    successfulDeletions: string[];
    failedDeletions: string[];
  }

  const bulkDeleteUsers = async (
    userIds: string[]
  ): Promise<BulkDeleteUsersResult> => {
    try {
      const deletePromises: Promise<Response>[] = userIds.map((id: string) =>
        fetch(`/api/users?id=${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
      );

      const results: PromiseSettledResult<Response>[] =
        await Promise.allSettled(deletePromises);

      // Filter out successful deletions
      const successfulDeletions: string[] = [];
      const failedDeletions: string[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.ok) {
          successfulDeletions.push(userIds[index]);
        } else {
          failedDeletions.push(userIds[index]);
        }
      });

      // Update local state
      if (successfulDeletions.length > 0) {
        setUsers((prev) =>
          prev.filter((user) => !successfulDeletions.includes(user._id))
        );
        toast.success(
          `${successfulDeletions.length} user(s) deleted successfully!`
        );
      }

      if (failedDeletions.length > 0) {
        toast.error(`Failed to delete ${failedDeletions.length} user(s)`);
      }

      return { successfulDeletions, failedDeletions };
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete users");
      throw error;
    }
  };

  // const renderUsers = () => {
  //   if (viewMode === "detail" || viewMode === "edit") {
  //     return renderUserDetails();
  //   }

  //   return (
  //     <div className="space-y-6">
  //       {/* User Management Header */}
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <h2 className="text-3xl font-semibold text-white mb-2">
  //             {activeTab === "clients"
  //               ? "Client Management"
  //               : activeTab === "dev profiles"
  //               ? "Developer Management"
  //               : "User Management"}
  //           </h2>
  //           <p className="text-gray-400 mt-1">
  //             {activeTab === "clients"
  //               ? "Manage client accounts and information"
  //               : activeTab === "dev profiles"
  //               ? "Manage developer accounts and profiles"
  //               : "Manage all user accounts and permissions"}
  //           </p>
  //         </div>
  //         <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
  //           <FaPlus />
  //           <span>Add User</span>
  //         </button>
  //       </div>

  //       {/* User Filters */}
  //       <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
  //         <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
  //           <div className="flex-1 max-w-md">
  //             <div className="relative">
  //               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  //               <input
  //                 type="text"
  //                 placeholder="Search users..."
  //                 value={userSearchTerm}
  //                 onChange={(e) => setUserSearchTerm(e.target.value)}
  //                 className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
  //               />
  //             </div>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             {activeTab === "users" && (
  //               <select
  //                 value={userRoleFilter}
  //                 onChange={(e) => setUserRoleFilter(e.target.value)}
  //                 className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
  //               >
  //                 <option value="all" className="bg-gray-800">
  //                   All Roles
  //                 </option>
  //                 <option value="admin" className="bg-gray-800">
  //                   Admin
  //                 </option>
  //                 <option value="developer" className="bg-gray-800">
  //                   Developer
  //                 </option>
  //                 <option value="client" className="bg-gray-800">
  //                   Client
  //                 </option>
  //               </select>
  //             )}
  //             <select
  //               value={userStatusFilter}
  //               onChange={(e) => setUserStatusFilter(e.target.value)}
  //               className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
  //             >
  //               <option value="all" className="bg-gray-800">
  //                 All Status
  //               </option>
  //               <option value="active" className="bg-gray-800">
  //                 Active
  //               </option>
  //               <option value="inactive" className="bg-gray-800">
  //                 Inactive
  //               </option>
  //               <option value="suspended" className="bg-gray-800">
  //                 Suspended
  //               </option>
  //             </select>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Users Table */}
  //       <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden">
  //         <div className="overflow-x-auto">
  //           <table className="w-full">
  //             <thead className="bg-white/5 border-b border-white/10">
  //               <tr>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   User
  //                 </th>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   Contact
  //                 </th>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   Role
  //                 </th>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   Status
  //                 </th>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   Joined
  //                 </th>
  //                 <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 uppercase tracking-wide">
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody className="divide-y divide-white/10">
  //               {getFilteredUsers().map((user) => (
  //                 <tr
  //                   key={user._id}
  //                   className="hover:bg-white/5 transition-colors"
  //                 >
  //                   <td className="py-4 px-6">
  //                     <div className="flex items-center space-x-3">
  //                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
  //                         <span className="text-white font-medium">
  //                           {user.firstName.charAt(0)}
  //                           {user.lastName.charAt(0)}
  //                         </span>
  //                       </div>
  //                       <div>
  //                         <p className="text-white font-medium">
  //                           {user.firstName} {user.lastName}
  //                         </p>
  //                         <p className="text-gray-400 text-sm">
  //                           {user.company || "No company"}
  //                         </p>
  //                       </div>
  //                     </div>
  //                   </td>
  //                   <td className="py-4 px-6">
  //                     <div>
  //                       <p className="text-white text-sm">{user.email}</p>
  //                       <p className="text-gray-400 text-sm">
  //                         {user.phone || "No phone"}
  //                       </p>
  //                     </div>
  //                   </td>
  //                   <td className="py-4 px-6">
  //                     <span
  //                       className={`px-2 py-1 rounded text-xs border ${getRoleColor(
  //                         user.role
  //                       )}`}
  //                     >
  //                       {user.role}
  //                     </span>
  //                   </td>
  //                   <td className="py-4 px-6">
  //                     <div className="flex items-center space-x-2">
  //                       {getStatusIcon(user.status)}
  //                       <span
  //                         className={`px-2 py-1 rounded text-xs border ${getStatusColor(
  //                           user.status
  //                         )}`}
  //                       >
  //                         {user.status}
  //                       </span>
  //                     </div>
  //                   </td>
  //                   <td className="py-4 px-6">
  //                     <span className="text-gray-400 text-sm">
  //                       {formatDate(user.createdAt)}
  //                     </span>
  //                   </td>
  //                   <td className="py-4 px-6">
  //                     <div className="flex items-center space-x-2">
  //                       <button
  //                         onClick={() => {
  //                           setSelectedUser(user);
  //                           setViewMode("detail");
  //                           setShowUserModal(true);
  //                         }}
  //                         className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
  //                       >
  //                         <FaEye />
  //                       </button>
  //                       {/* <button
  //                         onClick={() => {
  //                           setSelectedUser(user);
  //                           setUserModalMode("edit");
  //                           setShowUserModal(true);
  //                         }}
  //                         className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
  //                       >
  //                         <FaEdit />
  //                       </button> */}
  //                       <button
  //                         onClick={() =>
  //                           toggleUserStatus(user._id, user.status)
  //                         }
  //                         className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
  //                       >
  //                         {user.status === "active" ? <FaLock /> : <FaUnlock />}
  //                       </button>
  //                       <button
  //                         onClick={() => deleteUser(user._id)}
  //                         className="p-2 text-gray-400 hover:text-red-400 transition-colors"
  //                       >
  //                         <FaTrash />
  //                       </button>
  //                     </div>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderAnalytics = (): ReactNode => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive business insights and metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(analytics?.totalRevenue ?? 0),
            change: "+15.3%",
            trend: "up",
          },
          {
            label: "Active Users",
            value: analytics?.totalUsers ?? 0,
            change: "+8.2%",
            trend: "up",
          },
          {
            label: "Completed Projects",
            value: analytics?.projectsByStatus?.approved ?? 0,
            change: "+12.1%",
            trend: "up",
          },
          {
            label: "Avg. Project Value",
            value: formatCurrency(
              (analytics?.totalRevenue ?? 0) / (analytics?.totalProjects ?? 0)
            ),
            change: "+5.7%",
            trend: "up",
          },
        ].map((metric, index) => (
          <div
            key={metric.label}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  {metric.trend === "up" ? (
                    <FaSortAmountUp className="text-green-400 mr-1" />
                  ) : (
                    <FaSortAmountDown className="text-red-400 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      metric.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FaChartLine className="text-4xl mb-2 mx-auto" />
              <p>Revenue chart would be rendered here</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Project Status Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics?.projectsByStatus ?? {}).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="text-white capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((count ?? 0) / (analytics?.totalProjects ?? 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Clients</h3>
          <div className="space-y-3">
            {(analytics?.topClients ?? []).map((client, index) => (
              <div
                key={client?.name ?? index}
                className="flex  items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {client?.name ?? "Unknown"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {client?.projects ?? 0} projects
                    </p>
                  </div>
                </div>
                <p className="text-green-400 font-medium">
                  {formatCurrency(client?.revenue ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Developers
          </h3>
          <div className="space-y-3">
            {(analytics?.topDevelopers ?? []).map((dev, index) => (
              <div
                key={dev?.name ?? index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {dev?.name ?? "Unknown"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {dev?.projects ?? 0} projects
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white">{dev?.rating ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = (): ReactNode => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <FaCog className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              System Settings
            </h2>
            <p className="text-gray-300 text-lg mt-2">
              Configure your system preferences and security settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Security Settings Card */}
        <div className="group relative">
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <FaShieldAlt className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Security</h3>
            </div>

            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FaKey className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Two-Factor Authentication
                      </p>
                      <p className="text-gray-300 text-sm">
                        Enhanced account security
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 cursor-pointer">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <FaClock className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Session Timeout
                      </p>
                      <p className="text-gray-300 text-sm">
                        Auto logout after inactivity
                      </p>
                    </div>
                  </div>
                  <select className="px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 cursor-pointer">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </div>

              {/* Login Attempts */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <FaLock className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Failed Login Protection
                      </p>
                      <p className="text-gray-300 text-sm">
                        Account lockout after failed attempts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Configuration Card */}
        <div className="group relative">
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <FaNetworkWired className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                System Config
              </h3>
            </div>

            <div className="space-y-6">
              {/* API Rate Limiting */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FaChartLine className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        API Rate Limiting
                      </p>
                      <p className="text-gray-300 text-sm">
                        Control API request rates
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                    Configure
                  </button>
                </div>
              </div>

              {/* Database Backup */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FaDatabase className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Database Backup
                      </p>
                      <p className="text-gray-300 text-sm">
                        Automated daily backups
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 cursor-pointer">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* System Monitoring */}
              <div className="group/item">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FaEye className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        System Monitoring
                      </p>
                      <p className="text-gray-300 text-sm">
                        Real-time performance tracking
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information Card */}
      <div className="group relative">
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FaDatabase className="text-xl text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              System Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Version */}
            <div className="group/stat relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-sm group-hover/stat:blur-md transition-all duration-300"></div>
              <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FaCode className="text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Version</p>
                </div>
                <p className="text-2xl font-semibold text-white">v2.1.0</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="group/stat relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-sm group-hover/stat:blur-md transition-all duration-300"></div>
              <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FaCalendarAlt className="text-green-400" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">
                    Last Updated
                  </p>
                </div>
                <p className="text-2xl font-semibold text-white">Jun 15</p>
                <p className="text-gray-400 text-sm">2025</p>
              </div>
            </div>

            {/* Uptime */}
            <div className="group/stat relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover/stat:blur-md transition-all duration-300"></div>
              <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FaChartBar className="text-purple-400" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Uptime</p>
                </div>
                <p className="text-2xl font-semibold text-white">99.9%</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="group/stat relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl blur-sm group-hover/stat:blur-md transition-all duration-300"></div>
              <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <FaServer className="text-orange-400" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Status</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xl font-semibold text-white">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if account already exists when component loads or user changes
  useEffect(() => {
    if (selectedUser) {
      checkExistingAccount(selectedUser._id);
    }
  }, [selectedUser]);

  // Password generation utility
  const generateRandomPassword = (length: number = 12): string => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Permissions enum definition
  enum Permissions {
    VIEW_DASHBOARD = "VIEW_DASHBOARD",
    UPDATE_PROFILE = "UPDATE_PROFILE",
    CHANGE_PASSWORD = "CHANGE_PASSWORD",
    VIEW_USERS = "VIEW_USERS",
    EDIT_USERS = "EDIT_USERS",
    DELETE_USERS = "DELETE_USERS",
    MANAGE_ROLES = "MANAGE_ROLES",
    MANAGE_PLATFORM = "MANAGE_PLATFORM",
    VIEW_ANALYTICS = "VIEW_ANALYTICS",
    MODERATE_CONTENT = "MODERATE_CONTENT",
    HANDLE_DISPUTES = "HANDLE_DISPUTES",
    MANAGE_PAYMENTS = "MANAGE_PAYMENTS",
    CREATE_PROJECT = "CREATE_PROJECT",
    VIEW_PROJECT = "VIEW_PROJECT",
    EDIT_PROJECT = "EDIT_PROJECT",
    DELETE_PROJECT = "DELETE_PROJECT",
    ASSIGN_PROJECT = "ASSIGN_PROJECT",
    POST_PROJECT = "POST_PROJECT",
    HIRE_DEVELOPER = "HIRE_DEVELOPER",
    REVIEW_SUBMISSIONS = "REVIEW_SUBMISSIONS",
    MAKE_PAYMENT = "MAKE_PAYMENT",
    VIEW_TALENT_POOL = "VIEW_TALENT_POOL",
    APPLY_TO_PROJECT = "APPLY_TO_PROJECT",
    UPDATE_PORTFOLIO = "UPDATE_PORTFOLIO",
    SUBMIT_WORK = "SUBMIT_WORK",
  }

  // Role-based permissions mapping
  const getRolePermissions = (role: UserRole): Permissions[] => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          Permissions.VIEW_DASHBOARD,
          Permissions.UPDATE_PROFILE,
          Permissions.CHANGE_PASSWORD,
          Permissions.VIEW_USERS,
          Permissions.EDIT_USERS,
          Permissions.DELETE_USERS,
          Permissions.MANAGE_ROLES,
          Permissions.MANAGE_PLATFORM,
          Permissions.VIEW_ANALYTICS,
          Permissions.MODERATE_CONTENT,
          Permissions.HANDLE_DISPUTES,
          Permissions.MANAGE_PAYMENTS,
          Permissions.CREATE_PROJECT,
          Permissions.VIEW_PROJECT,
          Permissions.EDIT_PROJECT,
          Permissions.DELETE_PROJECT,
          Permissions.ASSIGN_PROJECT,
        ];

      case UserRole.CLIENT:
        return [
          Permissions.VIEW_DASHBOARD,
          Permissions.UPDATE_PROFILE,
          Permissions.CHANGE_PASSWORD,
          Permissions.POST_PROJECT,
          Permissions.HIRE_DEVELOPER,
          Permissions.REVIEW_SUBMISSIONS,
          Permissions.MAKE_PAYMENT,
          Permissions.CREATE_PROJECT,
          Permissions.VIEW_PROJECT,
          Permissions.EDIT_PROJECT,
          Permissions.VIEW_TALENT_POOL,
        ];

      case UserRole.DEVELOPER:
        return [
          Permissions.VIEW_DASHBOARD,
          Permissions.UPDATE_PROFILE,
          Permissions.CHANGE_PASSWORD,
          Permissions.APPLY_TO_PROJECT,
          Permissions.VIEW_TALENT_POOL,
          Permissions.UPDATE_PORTFOLIO,
          Permissions.SUBMIT_WORK,
          Permissions.VIEW_PROJECT,
        ];

      default:
        return [
          Permissions.VIEW_DASHBOARD,
          Permissions.UPDATE_PROFILE,
          Permissions.CHANGE_PASSWORD,
        ];
    }
  };

  // Enhanced generateCredentials function that calls your API
  const generateCredentials = async () => {
    if (!selectedUser) return;

    setIsCreatingAccount(true);

    try {
      // Call your API to generate credentials
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          regenerate: accountExists, // Flag to indicate if this is a password reset
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedPassword(data.generatedPassword);
        setAccountExists(true);
        setExistingAccountData(data.user);

        console.log("Credentials generated successfully:", {
          email: data.user.email,
          action: accountExists ? "password_reset" : "account_created",
          role: data.user.role,
          userId: data.user._id,
        });

        // Optionally refresh the user list to get updated data
        if (
          typeof window !== "undefined" &&
          window.location.pathname.includes("users")
        ) {
          // Trigger a refresh of the users list if you have that function
          // refreshUsers?.();
        }
      } else {
        console.error("Error generating credentials:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating credentials:", error);
      alert("Failed to generate credentials. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Function to get account status info
  const getAccountStatusInfo = () => {
    if (accountExists && existingAccountData) {
      return {
        hasAccount: true,
        lastPasswordChange: existingAccountData.passwordLastChanged,
        accountCreated: existingAccountData.createdAt,
        lastLogin: existingAccountData.lastLogin,
        isActive:
          existingAccountData.isActive && !existingAccountData.accountLocked,
        role: existingAccountData.role,
        permissions: getRolePermissions(existingAccountData.role as UserRole)
          .length,
        accountLocked: existingAccountData.accountLocked || false,
        loginAttempts: existingAccountData.loginAttempts || 0,
      };
    }
    return {
      hasAccount: false,
      lastPasswordChange: null,
      accountCreated: null,
      lastLogin: null,
      isActive: false,
      role: selectedUser?.role,
      permissions: selectedUser
        ? getRolePermissions(selectedUser.role as UserRole).length
        : 0,
      accountLocked: false,
      loginAttempts: 0,
    };
  };

  // Function to disable/enable account access
  const toggleAccountAccess = async (disable: boolean) => {
    if (!selectedUser || !accountExists) return;

    const action = disable ? "disable" : "enable";
    const confirmMessage = disable
      ? `Are you sure you want to disable access for ${
          selectedUser?.email ?? "Unknown"
        }? This will prevent them from logging in.`
      : `Are you sure you want to enable access for ${
          selectedUser?.email ?? "Unknown"
        }?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: selectedUser?._id,
          isActive: !disable,
          accountLocked: disable,
          // Reset login attempts when enabling
          ...(disable ? {} : { loginAttempts: 0 }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setExistingAccountData((prev: typeof existingAccountData) => ({
          ...prev,
          isActive: !disable,
          accountLocked: disable,
          loginAttempts: disable ? prev?.loginAttempts : 0,
        }));

        console.log(
          `Account ${action}d successfully for:`,
          selectedUser?.email ?? "Unknown"
        );
        alert(`Account ${action}d successfully!`);
      } else {
        console.error(`Error ${action}ing account:`, data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing account:`, error);
      alert(`Failed to ${action} account. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Separate functions for disable/enable
  const revokeAccess = () => toggleAccountAccess(true);
  const restoreAccess = () => toggleAccountAccess(false);

  // Enhanced sendCredentials function
  const sendCredentials = () => {
    if (!selectedUser) {
      alert("No user selected");
      return;
    }

    if (!generatedPassword && !accountExists) {
      alert("Please generate credentials first");
      return;
    }

    const statusInfo = getAccountStatusInfo();

    // For MVP, show different messages based on account status
    if (generatedPassword) {
      // Newly generated password
      const message = `Login Credentials for ${
        selectedUser?.email ?? "Unknown"
      }:

Email: ${selectedUser?.email ?? "Unknown"}
Password: ${generatedPassword}
Login URL: ${window.location.origin}/login

This ${
        statusInfo.hasAccount ? "updates their existing" : "creates a new"
      } account.
Role: ${selectedUser?.role ?? "Unknown"}
Status: Active`;

      alert(message);
    } else if (accountExists) {
      // Existing account
      const message = `Account Information for ${
        selectedUser?.email ?? "Unknown"
      }:

Email: ${selectedUser?.email ?? "Unknown"}
Password: [Hidden for security - generate new to reset]
Login URL: ${window.location.origin}/login

Account Status: ${statusInfo.isActive ? "Active" : "Inactive"}
Role: ${statusInfo.role}
Last Login: ${
        statusInfo.lastLogin
          ? new Date(statusInfo.lastLogin).toLocaleDateString()
          : "Never"
      }
Account Created: ${
        statusInfo.accountCreated
          ? new Date(statusInfo.accountCreated).toLocaleDateString()
          : "Unknown"
      }

${
  statusInfo.isActive
    ? "User can log in with existing password."
    : "Account is disabled - enable to allow login."
}
Generate new credentials to reset password.`;

      alert(message);
    }

    console.log("Credentials info sent:", {
      email: selectedUser?.email ?? "Unknown",
      hasNewPassword: !!generatedPassword,
      accountExists: statusInfo.hasAccount,
      isActive: statusInfo.isActive,
      loginUrl: window.location.origin + "/login",
    });
  };

  // Function to delete user account completely
  const deleteUserAccount = async () => {
    if (!selectedUser) return;

    const confirmMessage = `Are you sure you want to permanently delete the account for ${
      selectedUser?.email ?? "Unknown"
    }? This action cannot be undone.`;
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "This will permanently delete all user data. Are you absolutely sure?"
    );
    if (!doubleConfirm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users?id=${selectedUser?._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        console.log(
          "User account deleted successfully:",
          selectedUser?.email ?? "Unknown"
        );
        alert("User account deleted successfully!");

        // Reset local state
        setAccountExists(false);
        setExistingAccountData(null);
        setGeneratedPassword("");

        // Optionally redirect or refresh the user list
        // window.location.reload(); // or navigate to users list
      } else {
        console.error("Error deleting user account:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
      alert("Failed to delete user account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to copy credentials to clipboard
  const copyCredentials = async () => {
    if (!selectedUser || !generatedPassword) return;

    const credentials = `Email: ${
      selectedUser?.email ?? "Unknown"
    }\nPassword: ${generatedPassword}`;

    try {
      await navigator.clipboard.writeText(credentials);
      alert("Credentials copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy credentials:", err);
    }
  };

  // Function to check if account already exists in the database
  const checkExistingAccount = async (userId: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      // Check if user has account credentials (passwordGenerated flag)
      const response = await fetch(`/api/users`);
      const data = await response.json();

      if (data.success) {
        const user = data.users.find((u: any) => u._id === userId);

        if (user && user.passwordGenerated) {
          setAccountExists(true);
          setExistingAccountData(user);
          setGeneratedPassword(""); // Reset generated password display
        } else {
          setAccountExists(false);
          setExistingAccountData(null);
          setGeneratedPassword("");
        }
      }
    } catch (error) {
      console.error("Error checking existing account:", error);
      setAccountExists(false);
      setExistingAccountData(null);
    } finally {
      setLoading(false);
    }
  };

  // Main render
  return (
    <>
      <div className="relative min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover mb-0">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaCode className="text-white text-sm" />
                  </div>
                  <button
                    onClick={() => renderOverview()}
                    className="text-white font-semibold text-lg"
                  >
                    Andishi {" | "}
                    <span className="text-sm monty uppercase text-gray-400">
                      admin dashboard
                    </span>
                  </button>
                </div>

                <div className="hidden md:flex space-x-4">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: FaTachometerAlt,
                    },
                    {
                      id: "projects",
                      label: "Projects",
                      icon: FaProjectDiagram,
                    },
                    { id: "users", label: "Users", icon: FaUsers },
                    { id: "analytics", label: "Analytics", icon: FaChartBar },
                    {
                      id: "dev profiles",
                      label: "Dev Profiles",
                      icon: FaUserEdit,
                    },
                    { id: "settings", label: "Settings", icon: FaCog },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <tab.icon className="text-sm" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaBell className="text-lg" />
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {notifications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white/5 border-b border-white/10">
          <div className="flex space-x-1 p-2">
            {[
              { id: "overview", label: "Overview", icon: FaTachometerAlt },
              { id: "projects", label: "Projects", icon: FaProjectDiagram },
              { id: "users", label: "Users", icon: FaUsers },
              { id: "analytics", label: "Analytics", icon: FaChartBar },
              { id: "devProfiles", label: "Dev Profiles", icon: FaUserEdit },
              { id: "settings", label: "Settings", icon: FaCog },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-1 flex flex-col items-center space-y-1 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.icon className="text-lg" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 my-8">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "projects" && renderProjects()}
          {activeTab === "users" && (
            <UserManagement
              activeTab={activeTab}
              users={users}
              setUsers={setUsers}
              userSearchTerm={userSearchTerm}
              setUserSearchTerm={setUserSearchTerm}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
            />
          )}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "dev profiles" && <DeveloperProfilesOverview />}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>

      {/* Loading Overlay */}

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-white font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md transition-all transform ${
            notification.type === "success"
              ? "bg-green-500/20 border-green-500/30 text-green-400"
              : notification.type === "error"
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-blue-500/20 border-blue-500/30 text-blue-400"
          }`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              {notification.type === "success" && <FaCheck />}
              {notification.type === "error" && <FaTimes />}
              {notification.type === "info" && <FaInfoCircle />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
