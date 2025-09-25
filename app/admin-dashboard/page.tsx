"use client";

import React, { useState, useEffect, ReactNode, useMemo } from "react";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";
import { useDeveloperProfiles } from "@/hooks/useDeveloperProfiles";
import { useUserManagement } from "@/hooks/useUserManagement";
import {
  FaUser,
  FaProjectDiagram,
  FaDollarSign,
  FaEnvelope,
  FaEye,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCheck,
  FaClock,
  FaUsers,
  FaCode,
  FaChartLine,
  FaDownload,
  FaPlus,
  FaCheckCircle,
  FaPause,
  FaCog,
  FaShieldAlt,
  FaKey,
  FaLock,
  FaNetworkWired,
  FaDatabase,
  FaCalendarAlt,
  FaChartBar,
  FaServer,
  FaUserEdit,
  FaInfoCircle,
  FaBell,
  FaTachometerAlt,
  FaBuilding,
  FaClipboardCheck,
} from "react-icons/fa";
import {
  MoreVertical,
  Calendar,
  DollarSign,
  MessageSquare,
  Eye,
  Trash2,
} from "lucide-react";
import DeveloperProfilesOverview from "./DeveloperProfilesOverview";
// Shared currency utilities
import {
  CurrencyAmount,
  formatCurrency,
  extractAmount,
} from "@/utils/currency";
import AdvancedAnalyticsDashboard from "./renderAnalytics";
import generateAdvancedAnalytics, {
  EnhancedAnalyticsData,
} from "@/utils/admin-analytics";
import {
  listProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "~/services/clientProjects";
import { UserRole } from "@/types/auth";
import UserManagement from "./renderUsers";
import ProjectOverview from "./ProjectOverview";
import StartProjectForm from "./StartNewProject";
import {
  ProjectData,
  Milestone,
  ProjectUpdate,
  ProjectFile,
  Payment,
  ProjectStatus,
} from "@/types";
import SearchFilter from "./SearchFilter";
import ConfirmationModal from "../components/ConfirmationModal";
import DeveloperDebugPanel from "./DeveloperDebugPanel";
import FeedbackTabEnhanced from "./FeedbackTabEnhanced";
import AssessmentsTab from "./assessments/AssessmentDashboard";

// Types
interface SystemUser {
  id: string;
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
  developerProfileStatus?: "pending" | "approved" | "rejected"; // Added
  developerProfileId?: string; // Added
}

type ActiveTab =
  | "overview"
  | "projects"
  | "users"
  | "dev profiles"
  | "clients"
  | "analytics"
  | "assessments"
  // | "debug"
  | "feedback"
  | "settings";

export default function EnhancedAdminDashboard(): ReactNode {
  // Toast notifications
  const {
    notifications: toastNotifications,
    removeNotification: removeToastNotification,
    toast,
  } = useToast();

  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const {
    profiles: devProfiles,
    loading: devProfilesLoading,
    updateProfile: updateDevProfile,
    approveProfile,
    rejectProfile,
    deleteProfile: deleteDevProfile,
    refetch: refetchProfiles,
  } = useDeveloperProfiles();
  const {
    users,
    loading: usersLoading,
    refreshUsers,
    deleteUser: deleteUserFromHook,
    updateUser: updateUserFromHook,
    createUser: createUserFromHook,
    setUsers,
  } = useUserManagement();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const emptyAnalytics: EnhancedAnalyticsData = {
    totalUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    successRate: 0,
    projectsByStatus: { completed: 0, "in-progress": 0, pending: 0 },
    usersByRole: { client: 0, developer: 0, admin: 0 },
    revenueByMonth: [],
    topClients: [],
    topDevelopers: [],
    skillsInDemand: [],
    performanceMetrics: [],
    recentActivities: [],
    avgProjectValue: 0,
    clientRetentionRate: 0,
    avgDeliveryTime: 0,
    qualityScore: 0,
  };

  const [analytics, setAnalytics] =
    useState<EnhancedAnalyticsData>(emptyAnalytics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoggedInUser, setFetchLoggedInUser] = useState(false);

  const [accountExists, setAccountExists] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [existingAccountData, setExistingAccountData] = useState<any>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(9);

  // Pagination calculations
  const allFilteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.priority === priorityFilter
      );
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.projectDetails?.title?.toLowerCase().includes(query) ||
          project.projectDetails?.description?.toLowerCase().includes(query) ||
          project.userInfo?.firstName?.toLowerCase().includes(query) ||
          project.userInfo?.lastName?.toLowerCase().includes(query) ||
          project.userInfo?.company?.toLowerCase().includes(query) ||
          project.projectDetails?.techStack?.some((tech) =>
            tech.toLowerCase().includes(query)
          )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name":
          return (a.projectDetails?.title || "").localeCompare(
            b.projectDetails?.title || ""
          );
        case "budget":
          const budgetA = calculateProjectBudget(a);
          const budgetB = calculateProjectBudget(b);
          return budgetB - budgetA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, statusFilter, priorityFilter, searchTerm, sortBy]);

  const totalPages = Math.ceil(allFilteredProjects.length / projectsPerPage);
  const filteredAndSortedProjects = allFilteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      statusFilter !== "all" ||
      priorityFilter !== "all" ||
      sortBy !== "newest"
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchTerm, sortBy]);

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
        const [projectsData, usersData, analyticsResponse] = await Promise.all([
          listProjects(),
          fetch("/api/users").then((r) => r.json()),
          fetch("/api/analytics/comprehensive").then((r) => r.json()),
        ]);

        // Normalise / transform projects
        const transformedProjects = (projectsData || []).map(
          (project: any) => ({
            ...project,
            status:
              project.status === "in-progress" ? "in-progress" : project.status,
            priority: project.priority || "low",
            milestones: project.milestones || project.pricing?.milestones || [],
            pricing: project.pricing || {
              type: "fixed",
              currency: "USD",
              fixedBudget: "0",
            },
          })
        );
        setProjects(transformedProjects);

        // Users array normalisation
        const usersArray = Array.isArray(usersData)
          ? usersData
          : Array.isArray(usersData?.users)
          ? usersData.users
          : [];
        setUsers(usersArray);

        // Use real analytics from API instead of generated mock data
        if (analyticsResponse && analyticsResponse.overview) {
          // Transform API response to match expected analytics structure
          const realAnalytics: EnhancedAnalyticsData = {
            totalUsers: analyticsResponse.overview.totalUsers || 0,
            totalProjects: analyticsResponse.overview.totalProjects || 0,
            totalRevenue: analyticsResponse.overview.totalRevenue || 0,
            monthlyGrowth: analyticsResponse.overview.monthlyGrowth || 0,
            successRate: 0, // Calculate from projects if needed
            projectsByStatus: {
              completed:
                analyticsResponse.overview.projectsByStatus?.completed || 0,
              "in-progress":
                analyticsResponse.overview.projectsByStatus?.["in-progress"] ||
                0,
              pending:
                analyticsResponse.overview.projectsByStatus?.pending || 0,
            },
            usersByRole: {
              client: analyticsResponse.overview.usersByRole?.client || 0,
              developer: analyticsResponse.overview.usersByRole?.developer || 0,
              admin: analyticsResponse.overview.usersByRole?.admin || 0,
            },
            revenueByMonth: analyticsResponse.overview.revenueByMonth || [],
            topClients: analyticsResponse.overview.topClients || [],
            topDevelopers: analyticsResponse.overview.topDevelopers || [],
            skillsInDemand: analyticsResponse.performance?.skills || [],
            performanceMetrics: analyticsResponse.performance?.metrics || [],
            recentActivities: analyticsResponse.activities || [],
            avgProjectValue:
              analyticsResponse.overview.totalProjects > 0
                ? analyticsResponse.overview.totalRevenue /
                  analyticsResponse.overview.totalProjects
                : 0,
            clientRetentionRate: 85, // Default or calculate from data
            avgDeliveryTime: 25, // Default or calculate from data
            qualityScore: 92, // Default or calculate from data
          };
          setAnalytics(realAnalytics);
        } else {
          // Fallback to generated analytics if API fails
          const analyticsData = generateAdvancedAnalytics(
            transformedProjects,
            usersArray
          );
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Fallback to generated analytics on error
        try {
          const [projectsData, usersData] = await Promise.all([
            listProjects(),
            fetch("/api/users").then((r) => r.json()),
          ]);
          const transformedProjects = (projectsData || []).map(
            (project: any) => ({
              ...project,
              status:
                project.status === "in-progress"
                  ? "in-progress"
                  : project.status,
              priority: project.priority || "low",
            })
          );
          const usersArray = Array.isArray(usersData)
            ? usersData
            : Array.isArray(usersData?.users)
            ? usersData.users
            : [];
          const analyticsData = generateAdvancedAnalytics(
            transformedProjects,
            usersArray
          );
          setAnalytics(analyticsData);
        } catch (fallbackErr) {
          toast.error(
            "Error loading dashboard data",
            "Failed to load dashboard data"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleProjectDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await apiDeleteProject(projectToDelete);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete));
      toast.success("Project deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete project", error?.message);
    } finally {
      setProjectDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleProjectDeleteCancel = () => {
    setProjectDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // Project-related states
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [isProjectDeleteModalOpen, setProjectDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const [projectViewMode, setProjectViewMode] = useState<
    "list" | "detail" | "edit"
  >("list");
  // Inline create project form
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // User management states
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<
    "create" | "edit" | "view"
  >("view");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState<number>(0);

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
    setProjectViewMode("list");
    setSelectedProject(null);
  }, [activeTab]);

  // viewMode users details reset
  useEffect(() => {
    setProjectViewMode("list");
    setSelectedUser(null);
  }, [activeTab]);

  // Add data synchronization function
  const syncDeveloperData = async () => {
    try {
      console.log("Starting developer data synchronization...");
      const syncResponse = await fetch("/api/developer-profiles?action=sync", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!syncResponse.ok) {
        throw new Error(
          `Sync request failed with status: ${syncResponse.status}`
        );
      }

      const syncResult = await syncResponse.json();
      if (syncResult.message) {
        toast.success("Data synchronized successfully", syncResult.message);
        return true;
      } else {
        console.error("Data sync failed:", syncResult);
        return false;
      }
    } catch (error) {
      console.error("Error during data sync:", error);
      toast.error("Data sync failed", "Please try again later");
      return false;
    }
  };

  // Comprehensive refresh function for all data
  const refreshAllData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing all data...");

      // Refresh both users and developer profiles
      await Promise.all([
        refreshUsers(),
        refetchProfiles(),
        syncDeveloperData(),
      ]);

      // Trigger developer profile refresh
      setProfileRefreshTrigger(Date.now());

      console.log("All data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced approval function with proper synchronization
  const handleApproveProfile = async (profileId: string) => {
    try {
      await approveProfile(profileId);
      await refreshAllData();
      toast.success("Profile approved successfully", "Developer is now active");
    } catch (error) {
      console.error("Error approving profile:", error);
      toast.error("Failed to approve profile", "Please try again");
    }
  };

  // Enhanced rejection function with proper synchronization
  const handleRejectProfile = async (profileId: string) => {
    try {
      await rejectProfile(profileId);
      await refreshAllData();
      toast.success(
        "Profile rejected successfully",
        "Developer has been deactivated"
      );
    } catch (error) {
      console.error("Error rejecting profile:", error);
      toast.error("Failed to reject profile", "Please try again");
    }
  };

  // Enhanced delete function with proper synchronization
  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deleteDevProfile(profileId);
      await refreshAllData();
      toast.success(
        "Profile deleted successfully",
        "Developer profile has been removed"
      );
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Failed to delete profile", "Please try again");
    }
  };

  // Enhanced user delete function with proper synchronization
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserFromHook(userId);
      await refreshAllData();
      toast.success(
        "User deleted successfully",
        "User and associated profiles have been removed"
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user", "Please try again");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    // First, try to sync data to ensure consistency
    await syncDeveloperData();
    try {
      // Fetch projects via service wrapper to ensure consistent response shape
      const projectsArray = await listProjects();
      const transformedProjects = (projectsArray || []).map((project: any) => ({
        ...project,
        status:
          project.status === "in-progress" ? "in-progress" : project.status,
        priority: project.priority || "low",
      }));
      setProjects(transformedProjects);

      // Fetch users with enhanced developer profile data
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      let usersArray: SystemUser[] = [];

      if (usersData.success && Array.isArray(usersData.users)) {
        usersArray = usersData.users;
        console.log(
          `Loaded ${usersArray.length} users with enhanced profile data`
        );
      } else if (Array.isArray(usersData)) {
        // Fallback if usersData itself is the array
        usersArray = usersData;
      }

      setUsers(usersArray);

      // Fetch real analytics from comprehensive API
      try {
        const analyticsResponse = await fetch("/api/analytics/comprehensive");
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData && analyticsData.overview) {
            // Transform API response to match expected analytics structure
            const realAnalytics: EnhancedAnalyticsData = {
              totalUsers: analyticsData.overview.totalUsers || 0,
              totalProjects: analyticsData.overview.totalProjects || 0,
              totalRevenue: analyticsData.overview.totalRevenue || 0,
              monthlyGrowth: analyticsData.overview.monthlyGrowth || 0,
              successRate: 0, // Calculate from projects if needed
              projectsByStatus: {
                completed:
                  analyticsData.overview.projectsByStatus?.completed || 0,
                "in-progress":
                  analyticsData.overview.projectsByStatus?.["in-progress"] || 0,
                pending: analyticsData.overview.projectsByStatus?.pending || 0,
              },
              usersByRole: {
                client: analyticsData.overview.usersByRole?.client || 0,
                developer: analyticsData.overview.usersByRole?.developer || 0,
                admin: analyticsData.overview.usersByRole?.admin || 0,
              },
              revenueByMonth: analyticsData.overview.revenueByMonth || [],
              topClients: analyticsData.overview.topClients || [],
              topDevelopers: analyticsData.overview.topDevelopers || [],
              skillsInDemand: analyticsData.performance?.skills || [],
              performanceMetrics: analyticsData.performance?.metrics || [],
              recentActivities: analyticsData.activities || [],
              avgProjectValue:
                analyticsData.overview.totalProjects > 0
                  ? analyticsData.overview.totalRevenue /
                    analyticsData.overview.totalProjects
                  : 0,
              clientRetentionRate: 85, // Default or calculate from data
              avgDeliveryTime: 25, // Default or calculate from data
              qualityScore: 92, // Default or calculate from data
            };
            setAnalytics(realAnalytics);
          } else {
            // Fallback to generated analytics if API response is invalid
            const analyticsData = generateAdvancedAnalytics(
              transformedProjects,
              usersArray
            );
            setAnalytics(analyticsData);
          }
        } else {
          // Fallback to generated analytics if API call fails
          const analyticsData = generateAdvancedAnalytics(
            transformedProjects,
            usersArray
          );
          setAnalytics(analyticsData);
        }
      } catch (analyticsError) {
        console.warn(
          "Failed to fetch comprehensive analytics, using fallback:",
          analyticsError
        );
        // Fallback to generated analytics if API fails
        const analyticsData = generateAdvancedAnalytics(
          transformedProjects,
          usersArray
        );
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError("Failed to fetch data");
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
          (user) => user.id === project.clientId
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

    // Calculate total revenue and project/user status counts
    const totalRevenue = projectStats.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    // Ensure mandatory keys are present before aggregation
    const initialProjectsByStatus: EnhancedAnalyticsData["projectsByStatus"] = {
      completed: 0,
      "in-progress": 0,
      pending: 0,
    };

    const projectsByStatus = projectStats.reduce<
      EnhancedAnalyticsData["projectsByStatus"]
    >(
      (acc, project) => {
        const status = (project.status ||
          "pending") as keyof EnhancedAnalyticsData["projectsByStatus"];
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { ...initialProjectsByStatus }
    );

    // Calculate user role distribution with mandatory keys
    const initialUsersByRole: EnhancedAnalyticsData["usersByRole"] = {
      client: 0,
      developer: 0,
      admin: 0,
    };

    const usersByRole = usersData.reduce<EnhancedAnalyticsData["usersByRole"]>(
      (acc, user) => {
        const role = (user.role ||
          "client") as keyof EnhancedAnalyticsData["usersByRole"];
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      { ...initialUsersByRole }
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
      .map(([name, stats], index) => ({
        name,
        projects: stats.projects, // Legacy support
        revenue: stats.revenue, // Legacy support
        projectCount: stats.projects, // New API format
        totalSpent: stats.revenue, // New API format
        pendingAmount: 0, // New API format
        totalValue: stats.revenue, // New API format
        id: `client-${index}`, // New API format
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate top developers with safe handling
    const developerStats = usersData
      .filter(
        (user) => user.role === "developer" && user.firstName && user.lastName
      )
      .map((dev, index) => ({
        name: `${dev.firstName} ${dev.lastName}`,
        projects: dev.projectsCount || 0, // Legacy support
        rating: 4.5, // Default rating if not available
        completedProjects: dev.projectsCount || 0, // New API format
        skills: dev.skills || [], // New API format
        id: dev.id || `dev-${index}`, // New API format
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
      ...emptyAnalytics,
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

  // Exchange rates (could be fetched dynamically, kept static for now)
  const EXCHANGE_RATES: Record<"USD" | "KES", number> = {
    USD: 1,
    KES: 1 / 130, // approximate: 130 KES ≈ 1 USD
  };

  /**
   * Converts an amount to USD based on the currency provided.
   */
  const toUSD = (amount: number, currency: "USD" | "KES" = "USD") =>
    amount * (EXCHANGE_RATES[currency] ?? 1);

  const calculateProjectBudget = (project: ProjectData): number => {
    if (!project.pricing) {
      return Math.floor(Math.random() * 50000) + 10000; // Fallback budget
    }

    if (project.pricing.type === "fixed") {
      return toUSD(
        parseFloat(project.pricing.fixedBudget || "0"),
        project.pricing.currency
      );
    } else if (project.pricing.type === "milestone") {
      const milestonesArr =
        project.milestones && project.milestones.length
          ? project.milestones
          : project.pricing.milestones || [];
      return (
        toUSD(
          milestonesArr.reduce(
            (sum, m) => sum + parseFloat(m.budget || "0"),
            0
          ),
          project.pricing.currency
        ) || 0
      );
    } else {
      return toUSD(
        parseFloat(project.pricing.hourlyRate || "0") *
          parseFloat(project.pricing.estimatedHours || "0"),
        project.pricing.currency
      );
    }
  };

  // Project functions

  // Helper function to update developers when project is completed
  const updateDevelopersOnProjectCompletion = async (
    projectId: string,
    project: ProjectData
  ) => {
    try {
      // Get all assigned developers for this project
      const response = await fetch(`/api/project-assignments/${projectId}`);
      if (response.ok) {
        const assignmentsData = await response.json();
        const assignments = assignmentsData.assignments || [];

        // Update each assigned developer's profile
        const updatePromises = assignments.map(async (assignment: any) => {
          try {
            await fetch(`/api/developer/${assignment.developerId}/update`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projectComplete: true,
                projectId: projectId,
              }),
            });
          } catch (error) {
            console.error(
              `Failed to update developer ${assignment.developerId} on project completion:`,
              error
            );
          }
        });

        await Promise.all(updatePromises);
        console.log(
          `Updated ${assignments.length} developers for completed project ${projectId}`
        );
      }
    } catch (error) {
      console.error("Error updating developers on project completion:", error);
    }
  };

  // 1. Update Project Status (Already implemented)

  const updateProjectStatus = async (
    projectId: string,
    newStatus: ProjectStatus
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

      // If project is completed, update all assigned developers' profiles
      if (newStatus === "completed" && updatedProject) {
        await updateDevelopersOnProjectCompletion(projectId, updatedProject);
      }

      const statusMessages: { [key in ProjectStatus]?: string } = {
        "in-progress": "Project marked as in progress ",
        completed: "Project marked as completed ",
        cancelled: "Project cancelled ",
        on_hold: "Project on hold ",
        pending: "Project status updated ",
        reviewed: "Project marked as reviewed",
        approved: "Project has been approved",
        rejected: "Project has been rejected",
      };
      toast.success(statusMessages[newStatus] || "Project status updated");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error("Failed to update project status", error?.message);
    } finally {
      if (newStatus === "cancelled" || newStatus === "on_hold") {
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
      toast.success("Project progress updated");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error("Failed to update project progress", error?.message);
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
      toast.error("Failed to update milestone", error?.message);
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
      toast.success("Update added");
    } catch (error: any) {
      setProjects(prevProjects);
      toast.error("Failed to add update", error?.message);
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

      toast.success("File uploaded");
    } catch (error: any) {
      setProjects(prevProjects);
      if (selectedProject?._id === projectId) {
        const revertedProject = prevProjects.find((p) => p._id === projectId);
        setSelectedProject(revertedProject || null);
      }
      toast.error("Failed to upload file", error?.message);
    }
  };

  // 6. Record payment with proper validation and error handling
  const recordProjectPayment = async (
    projectId: string,
    payment: {
      amount: number;
      method: string;
      notes?: string;
      currency?: "USD" | "KES";
      description?: string;
      invoiceUrl?: string;
    }
  ) => {
    try {
      // Input validation
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      if (!payment.amount || payment.amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }
      if (!payment.method) {
        throw new Error("Payment method is required");
      }

      // Create new payment with proper typing
      const newPayment: import("~/types").Payment = {
        id: `pay_${Date.now()}`,
        amount: Number(payment.amount),
        date: new Date().toISOString(),
        method: payment.method,
        status: "paid",
        ...(payment.notes && { notes: payment.notes }),
        ...(payment.currency && { currency: payment.currency }),
        ...(payment.description && { description: payment.description }),
        ...(payment.invoiceUrl && { invoiceUrl: payment.invoiceUrl }),
      };

      // Optimistically update the UI
      const prevProjects = [...projects];
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === projectId
            ? {
                ...project,
                payments: [newPayment, ...(project.payments || [])],
                updatedAt: new Date().toISOString(),
              }
            : project
        )
      );

      // Make API call to save the payment
      await apiUpdateProject(projectId, {
        payments: [newPayment],
        updatedAt: new Date().toISOString(),
      });

      toast.success(
        `Payment of ${payment.amount} ${
          payment.currency || "USD"
        } recorded successfully`
      );
    } catch (error) {
      // Revert on error
      const prevProjects = [...projects];
      setProjects(prevProjects);
      toast.error(
        "Failed to record payment",
        error instanceof Error ? error.message : "Please try again."
      );
      throw error; // Re-throw to allow component to handle if needed
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
      toast.error("Failed to create project", error?.message);
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
      case "in-progress":
        return <FaCode className="text-blue-400" />;
      case "completed":
        return <FaCheckCircle className="text-green-400" />;
      case "cancelled":
        return <FaTimes className="text-red-400" />;
      case "on_hold":
        return <FaPause className="text-orange-400" />;
      case "active":
        return <FaCheck className="text-green-400" />;
      case "inactive":
        return <FaClock className="text-gray-400" />;
      case "suspended":
        return <FaTimes className="text-red-400" />;
      default:
        return <FaInfoCircle className="text-gray-400" />;
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
                ? extractAmount(analytics.totalRevenue) /
                    analytics.totalProjects
                : 0
            ),
            icon: <FaChartLine className="text-purple-400" />,
            change: "+15.3%",
            trend: "up" as const,
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-gray-200/50 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                  {metric.icon}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
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
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                        <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                          {getStatusIcon(status)}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {count} projects
                        </span>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700/50 rounded-full h-2">
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
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                      <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <FaUser className={getRoleColor(role)} />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {count} users
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700/50 rounded-full h-2">
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
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Clients
          </h3>
          <div className="space-y-3">
            {analytics.topClients.slice(0, 5).map((client, index) => (
              <div
                key={`client-${index}-${client.name}`}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-white/20 dark:from-white/5 to-transparent rounded-xl hover:from-white/30 dark:hover:from-white/10 transition-all duration-300 border border-gray-200 dark:border-white/5 backdrop-blur-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {client.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {client.projectCount || client.projects || 0} projects
                    </p>
                  </div>
                </div>
                <p className="text-green-400 font-medium">
                  {formatCurrency(
                    client.totalSpent ||
                      client.revenue ||
                      client.totalValue ||
                      0
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Developers */}
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Developers
          </h3>
          <div className="space-y-3">
            {analytics.topDevelopers.slice(0, 5).map((dev, index) => (
              <div
                key={`developer-${index}-${dev.name}`}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-white/20 dark:from-white/5 to-transparent rounded-xl hover:from-white/30 dark:hover:from-white/10 transition-all duration-300 border border-gray-200 dark:border-white/5 backdrop-blur-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {dev.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {dev.completedProjects || dev.projects || 0} projects
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-900 dark:text-white">
                    {(dev.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = (): ReactNode => {
    if (showCreateProjectForm) {
      return (
        <StartProjectForm
          dashboardMode
          onSuccess={async () => {
            await fetchAllData();
            setShowCreateProjectForm(false);
            toast.success("Project created successfully");
          }}
          onCancel={() => setShowCreateProjectForm(false)}
        />
      );
    }

    if (projectViewMode === "detail" && selectedProject) {
      return (
        <ProjectOverview
          selectedProject={selectedProject}
          onBack={() => setProjectViewMode("list")}
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
          developers={users.filter((user) => {
            // More flexible filtering to show available developers
            const isDeveloper = user.role === "developer";
            const hasApprovedStatus =
              user.developerProfileStatus === "approved";
            const hasPendingStatus =
              user.developerProfileStatus === "pending" ||
              user.developerProfileStatus === null;
            const isActiveUser =
              user.status === "active" || user.isActive !== false;

            // Show developers if they are approved OR if they are pending/null but active
            // This ensures developers show up even if approval process is incomplete
            return (
              isDeveloper &&
              (hasApprovedStatus || (hasPendingStatus && isActiveUser))
            );
          })}
          refreshDevelopers={refreshAllData}
        />
      );
    }

    return (
      <div className="min-h-screen">
        <div className="space-y-6">
          {/* Enhanced Header with Statistics */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  Client Projects
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage and track all client projects with real-time insights
                </p>
                {/* Create Project Button */}
                <button
                  onClick={() => setShowCreateProjectForm(true)}
                  className="mt-4 inline-flex items-center gap-2 cursor-pointer monty uppercase px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                >
                  <FaPlus /> New Project
                </button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white/5 dark:bg-black/5 shadow-md dark:shadow-none backdrop-blur-md border border-blue-400/40 dark:border-blue-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-blue-600 dark:text-blue-400">
                    {projects?.filter((p) => p?.status === "in-progress")
                      .length || 0}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 monty uppercase">
                    Active
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 dark:bg-black/5 shadow-md dark:shadow-none backdrop-blur-md border border-green-400/40 dark:border-green-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-green-600 dark:text-green-400">
                    {projects?.filter((p) => p?.status === "completed")
                      .length || 0}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-300 monty uppercase">
                    Completed
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 dark:bg-black/5 shadow-md dark:shadow-none backdrop-blur-md border border-orange-400/40 dark:border-orange-400/30 rounded-xl p-4 min-w-[120px]">
                  <div className="text-2xl monty font-semibold text-orange-600 dark:text-orange-400">
                    {projects?.filter((p) => p?.status === "pending").length ||
                      0}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-300 monty uppercase">
                    Pending
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <SearchFilter
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredProjectsCount={filteredAndSortedProjects.length}
            totalProjectsCount={allFilteredProjects.length}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />

          {/* Enhanced Projects Grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedProjects.map((project) => {
              const progress = project?.progress || 0;
              const status = project?.status || "pending";
              const priority = project?.priority || "low";

              return viewMode === "grid" ? (
                <div
                  key={project?._id}
                  className="group relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-slate-600/60 transition-all duration-300 hover:scale-[1.01] p-6 cursor-pointer"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                        {project?.projectDetails?.title ?? "Untitled Project"}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                        {project?.projectDetails?.description ??
                          "No description"}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                          <FaUser className="text-gray-500 dark:text-slate-300" />
                          {project?.userInfo?.firstName ?? "Unknown"}{" "}
                          {project?.userInfo?.lastName ?? ""}
                        </p>
                        {project?.userInfo?.company && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                            <FaBuilding className="text-gray-500 dark:text-slate-300" />
                            {project?.userInfo?.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusIcon(status)}
                      <span className="capitalize">
                        {status?.replace("_", " ") || "pending"}
                      </span>
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                        priority
                      )}`}
                    >
                      {(priority || "low").toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {(() => {
                    const techStack =
                      project.techStack && project.techStack.length > 0
                        ? project.techStack
                        : project.projectDetails?.techStack || [];
                    if (techStack.length === 0) return null;

                    return (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {techStack
                            .slice(0, 3)
                            .map((tech: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-200 dark:bg-slate-700/40 text-gray-700 dark:text-slate-300 text-xs rounded-md border border-gray-300 dark:border-slate-600/30"
                              >
                                {tech}
                              </span>
                            ))}
                          {techStack.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700/40 text-gray-700 dark:text-slate-300 text-xs rounded-md border border-gray-300 dark:border-slate-600/30">
                              +{techStack.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Project Info */}
                  <div className="space-y-2 mb-4">
                    {project?.pricing &&
                      (() => {
                        const getProjectStatusInfo = (project: ProjectData) => {
                          // Calculate budget in original currency for display
                          let totalBudgetOriginal = 0;
                          if (project.pricing.type === "fixed") {
                            totalBudgetOriginal = parseFloat(
                              project.pricing.fixedBudget || "0"
                            );
                          } else if (project.pricing.type === "milestone") {
                            const milestonesArr =
                              project.milestones && project.milestones.length
                                ? project.milestones
                                : project.pricing.milestones || [];
                            totalBudgetOriginal = milestonesArr.reduce(
                              (sum, m) => sum + parseFloat(m.budget || "0"),
                              0
                            );
                          } else {
                            totalBudgetOriginal =
                              parseFloat(project.pricing.hourlyRate || "0") *
                              parseFloat(project.pricing.estimatedHours || "0");
                          }

                          const totalPaid =
                            project.payments?.reduce(
                              (sum, p) => sum + (p.amount || 0),
                              0
                            ) || 0;
                          const remaining = totalBudgetOriginal - totalPaid;

                          return {
                            budgetDisplay: formatCurrency(totalBudgetOriginal),
                            paidDisplay: formatCurrency(totalPaid),
                            remainingDisplay: formatCurrency(remaining),
                            totalBudget: totalBudgetOriginal,
                            totalPaid,
                            remaining,
                          };
                        };

                        const statusInfo = getProjectStatusInfo(project);
                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-gray-600 dark:text-slate-400">
                                  Budget:
                                </span>
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {statusInfo.budgetDisplay}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                                </div>
                                <span className="text-gray-600 dark:text-slate-400">
                                  Paid:
                                </span>
                              </div>
                              <span className="text-sky-600 dark:text-sky-400 font-medium">
                                {statusInfo.paidDisplay}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                </div>
                                <span className="text-gray-600 dark:text-slate-400">
                                  Remaining:
                                </span>
                              </div>
                              <span
                                className={`font-medium ${
                                  statusInfo.remaining > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {statusInfo.remainingDisplay}
                              </span>
                            </div>

                            {/* Budget Progress Bar */}
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500 dark:text-slate-500">
                                  Budget Progress
                                </span>
                                <span className="text-xs text-gray-600 dark:text-slate-400">
                                  {statusInfo.totalBudget > 0
                                    ? Math.min(
                                        Math.round(
                                          (statusInfo.totalPaid /
                                            statusInfo.totalBudget) *
                                            100
                                        ),
                                        100
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-sky-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${
                                      statusInfo.totalBudget > 0
                                        ? Math.min(
                                            (statusInfo.totalPaid /
                                              statusInfo.totalBudget) *
                                              100,
                                            100
                                          )
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}

                    {/* Milestone Progress for milestone-based projects */}
                    {project?.pricing?.type === "milestone" &&
                      project?.milestones && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                            </div>
                            <span className="text-gray-600 dark:text-slate-400">
                              Milestones:
                            </span>
                          </div>
                          <span className="text-violet-400 font-medium">
                            {
                              project.milestones.filter(
                                (m: any) => m.status === "completed"
                              ).length
                            }{" "}
                            / {project.milestones.length}
                          </span>
                        </div>
                      )}

                    {project?.createdAt && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-300" />
                        <span className="text-gray-600 dark:text-slate-400">
                          Created: {formatDate(project.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="relative w-full bottom-0 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700/30">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setProjectViewMode("detail");
                        }}
                        className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-gray-200 dark:bg-slate-600/20 text-gray-700 dark:text-slate-300 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-slate-600/30 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project?._id) {
                            setProjectToDelete(project._id);
                            setProjectDeleteModalOpen(true);
                          }
                        }}
                        className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-rose-500/30 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-sm rounded-md hover:bg-rose-500/40 dark:hover:bg-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2 mb-1">
                        {project?.updates && project.updates.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-sky-600 dark:text-sky-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{project.updates.length}</span>
                          </div>
                        )}

                        {project?.files && project.files.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-400 flex items-center justify-center">
                              <span className="text-xs font-semibold text-emerald-100 dark:text-emerald-900">
                                {project.files.length}
                              </span>
                            </div>
                            <span>Files</span>
                          </div>
                        )}

                        {project?.payments && project.payments.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                            <div className="w-3 h-3 rounded bg-amber-600 dark:bg-amber-400 flex items-center justify-center">
                              <span className="text-xs font-semibold text-amber-100 dark:text-amber-900">
                                {project.payments.length}
                              </span>
                            </div>
                            <span>Payments</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        Updated{" "}
                        {project?.updatedAt
                          ? formatDate(project.updatedAt)
                          : "N/A"}
                      </div>
                      {project?.pricing?.type === "milestone" &&
                        project?.milestones && (
                          <div className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                            Next:{" "}
                            {project.milestones.find(
                              (m: any) => m.status === "pending"
                            )?.title || "None"}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={project?._id}
                  className="group relative rounded-xl border border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg hover:border-gray-300 dark:hover:border-slate-600/60 transition-all duration-300 hover:scale-[1.01] p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    {/* List View Project Header */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                        {project?.projectDetails?.title ?? "Untitled Project"}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                        {project?.projectDetails?.description ??
                          "No description"}
                      </p>

                      {/* Client Info */}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                          <FaUser className="text-gray-500 dark:text-slate-300" />
                          {project?.userInfo?.firstName ?? "Unknown"}{" "}
                          {project?.userInfo?.lastName ?? ""}
                        </p>
                        {project?.userInfo?.company && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                            <FaBuilding className="text-gray-500 dark:text-slate-300" />
                            {project?.userInfo?.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                          status
                        )}`}
                      >
                        {getStatusIcon(status)}
                        <span className="capitalize">
                          {status?.replace("_", " ") || "pending"}
                        </span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                          priority
                        )}`}
                      >
                        {(priority || "low").toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setProjectViewMode("detail");
                        }}
                        className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-gray-200 dark:bg-slate-600/20 text-gray-700 dark:text-slate-300 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-slate-600/30 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project?._id) {
                            setProjectToDelete(project._id);
                            setProjectDeleteModalOpen(true);
                          }
                        }}
                        className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-rose-500/30 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-sm rounded-md hover:bg-rose-500/40 dark:hover:bg-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Budget Info */}
                  {project?.pricing &&
                    (() => {
                      const getProjectStatusInfo = (project: ProjectData) => {
                        const totalBudget = calculateProjectBudget(project);
                        const totalPaid =
                          project.payments?.reduce(
                            (sum, p) => sum + (p.amount || 0),
                            0
                          ) || 0;
                        const remaining = totalBudget - totalPaid;

                        return {
                          budgetDisplay: formatCurrency(totalBudget),
                          paidDisplay: formatCurrency(totalPaid),
                          remainingDisplay: formatCurrency(remaining),
                          totalBudget,
                          totalPaid,
                          remaining,
                        };
                      };

                      const statusInfo = getProjectStatusInfo(project);
                      return (
                        <div className="flex items-center space-x-6 mt-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-gray-600 dark:text-slate-400">
                              Budget:
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {statusInfo.budgetDisplay}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                            </div>
                            <span className="text-gray-600 dark:text-slate-400">
                              Paid:
                            </span>
                            <span className="text-sky-600 dark:text-sky-400 font-medium">
                              {statusInfo.paidDisplay}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            </div>
                            <span className="text-gray-600 dark:text-slate-400">
                              Remaining:
                            </span>
                            <span
                              className={`font-medium ${
                                statusInfo.remaining > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {statusInfo.remainingDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {/* Always show pagination regardless of project count */}
          {allFilteredProjects.length > 0 && (
            <div className="flex items-center justify-between border-y border-white/10 px-6 py-4 my-16">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 cursor-pointer border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Previous page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
            ${
              currentPage === page
                ? "bg-blue-500/20 border border-blue-400/50 text-gray-300"
                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
            }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Next page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Empty State */}
          {isProjectDeleteModalOpen && (
            <div className="fixed min-h-screen inset-0 bg-black/5 backdrop-blur-md bg-opacity-50 z-50 flex justify-center items-center">
              <ConfirmationModal
                isOpen={isProjectDeleteModalOpen}
                title="Confirm Deletion"
                message="Are you sure you want to delete this project?"
                onConfirm={() => {
                  handleProjectDeleteConfirm();
                }}
                onCancel={handleProjectDeleteCancel}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
              />
            </div>
          )}

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

  const createUserLocal = async (
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
          "User created successfully!",
          data.generatedPassword
            ? `Password: ${data.generatedPassword}`
            : undefined
        );

        // If a password was generated, you might want to show it to the admin
        if (data.generatedPassword) {
          // You could show this in a separate modal or copy to clipboard
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
      toast.error("Failed to create user", error?.message);
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

  const updateUserLocal = async (
    userId: string,
    userData: UpdateUserPayload
  ): Promise<UpdateUserResponse> => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...userData }),
      });

      const data: UpdateUserResponse = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
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
      toast.error("Failed to update user", error?.message);
      throw error;
    }
  };

  interface DeleteUserResponse {
    success: boolean;
    error?: string;
  }

  const deleteUserLocal = async (
    userId: string
  ): Promise<DeleteUserResponse> => {
    try {
      // Fixed: Use query parameter instead of body for DELETE request
      const res: Response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data: DeleteUserResponse = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        toast.success("User deleted successfully!");
        return data;
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error("Failed to delete user", error?.message);
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
          id: userId,
          status: newStatus,
        }),
      });

      const data: ToggleUserStatusResponse = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
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
      toast.error("Failed to update user status", error?.message);
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
        // Password will be shown in toast

        return data;
      } else {
        throw new Error(data.error || "Failed to generate new password");
      }
    } catch (error: any) {
      toast.error("Failed to generate new password", error?.message);
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
          prev.filter((user) => !successfulDeletions.includes(user.id))
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
      toast.error(
        "Failed to delete users",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  };

  const renderAnalytics = (): ReactNode => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
            className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
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
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <FaChartLine className="text-4xl mb-2 mx-auto" />
              <p>Revenue chart would be rendered here</p>
            </div>
          </div>
        </div>

        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Status Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics?.projectsByStatus ?? {}).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="text-gray-900 dark:text-white capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
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
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Clients
          </h3>
          <div className="space-y-3">
            {(analytics?.topClients ?? []).map((client, index) => (
              <div
                key={client?.name ?? index}
                className="flex  items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {client?.name ?? "Unknown"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
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

        <div className="bg-black/5 dark:bg-white/5 shadow-lg dark:shadow-none backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Developers
          </h3>
          <div className="space-y-3">
            {(analytics?.topDevelopers ?? []).map((dev, index) => (
              <div
                key={dev?.name ?? index}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {dev?.name ?? "Unknown"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {dev?.projects ?? 0} projects
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-900 dark:text-white">
                    {dev?.rating ?? 0}
                  </span>
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
          <div className="relative backdrop-blur-xl bg-black/10 rounded-2xl p-8 border border-gray-600/10">
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
          <div className="relative backdrop-blur-xl bg-black/10 rounded-2xl p-8 border border-gray-600/10">
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
        <div className="relative backdrop-blur-xl bg-black/10 rounded-2xl p-8 border border-gray-600/10">
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
      checkExistingAccount(selectedUser.id);
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
          userId: selectedUser.id,
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
          userId: data.user.id,
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
          id: selectedUser?.id,
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

    // Credentials info processed
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
      const response = await fetch(`/api/users?id=${selectedUser?.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // User account deleted successfully
        alert("User account deleted successfully!");

        // Reset local state
        setAccountExists(false);
        setExistingAccountData(null);
        setGeneratedPassword("");

        // Optionally redirect or refresh the user list
        // window.location.reload(); // or navigate to users list
      } else {
        // Error deleting user account
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      // Error deleting user account
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
      // Failed to copy credentials
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
      // Error checking existing account
      setAccountExists(false);
      setExistingAccountData(null);
    } finally {
      setLoading(false);
    }
  };

  // Main render
  return (
    <>
      <div className="relative min-h-screen bg-gray-50 dark:bg-[#0B0D0E] dark:bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover mb-0">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
          <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaCode className="text-white text-sm" />
                  </div>
                  <button
                    onClick={() => renderOverview()}
                    className="text-gray-900 dark:text-white font-semibold text-lg"
                  >
                    Andishi {" | "}
                    <span className="text-sm monty uppercase text-gray-600 dark:text-gray-400">
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
                    // {
                    //   id: "debug",
                    //   label: "Debug",
                    //   icon: FaBug,
                    // },
                    { id: "users", label: "Users", icon: FaUsers },
                    { id: "analytics", label: "Analytics", icon: FaChartBar },
                    {
                      id: "assessments",
                      label: "Assessments",
                      icon: FaClipboardCheck,
                    },
                    {
                      id: "dev profiles",
                      label: "Dev Profiles",
                      icon: FaUserEdit,
                    },
                    {
                      id: "feedback",
                      label: "Feedback",
                      icon: FaEnvelope,
                    },
                    // { id: "settings", label: "Settings", icon: FaCog },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <tab.icon className="text-sm" />
                      <span className="monty uppercase text-xs">
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <FaBell className="text-lg" />
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {toastNotifications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
          <div className="flex space-x-1 p-2">
            {[
              { id: "overview", label: "Overview", icon: FaTachometerAlt },
              { id: "projects", label: "Projects", icon: FaProjectDiagram },
              { id: "users", label: "Users", icon: FaUsers },
              { id: "analytics", label: "Analytics", icon: FaChartBar },
              {
                id: "assessments",
                label: "Assessments",
                icon: FaClipboardCheck,
              },
              { id: "dev profiles", label: "Dev Profiles", icon: FaUserEdit },
              { id: "feedback", label: "Feedback", icon: FaEnvelope },
              // { id: "debug", label: "Debug", icon: FaBug },
              // { id: "settings", label: "Settings", icon: FaCog },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-1 flex flex-col items-center space-y-1 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <tab.icon className="text-lg" />
                <span className="text-xs monty uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-[94vw] max-w-none mx-auto py-8 px-4 sm:px-8 my-8">
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
              refreshUsers={refreshAllData}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={updateUserFromHook}
              onCreateUser={createUserFromHook}
            />
          )}
          {activeTab === "analytics" && (
            <AdvancedAnalyticsDashboard analytics={analytics} />
          )}
          {activeTab === "dev profiles" && (
            <DeveloperProfilesOverview
              refreshUsers={refreshAllData}
              onApproveProfile={handleApproveProfile}
              onRejectProfile={handleRejectProfile}
              onDeleteProfile={handleDeleteProfile}
              refreshTrigger={profileRefreshTrigger}
            />
          )}
          {/* {activeTab === "debug" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-white mb-2">
                    Developer Debug Panel
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Diagnose and fix developer visibility issues in assignments
                  </p>
                </div>
              </div>
              <DeveloperDebugPanel users={users} onRefresh={refreshAllData} />
            </div>
          )} */}

          {activeTab === "assessments" && <AssessmentsTab />}
          {activeTab === "feedback" && <FeedbackTabEnhanced />}
          {/* {activeTab === "settings" && renderSettings()} */}
        </div>
      </div>

      {/* Loading Overlay */}

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-gray-900 dark:text-white font-medium">
              Please wait ...
            </span>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        notifications={toastNotifications}
        onRemoveNotification={removeToastNotification}
        position="top-right"
      />
    </>
  );
}
