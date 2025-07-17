"use client";
import EnhancedProjectTracking from "./projectDetails";
import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import SearchFilterComponent from "./SearchFilter";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  MessageSquare,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  FaBell,
  FaChartBar,
  FaCheck,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaCode,
  FaCog,
  FaComment,
  FaDownload,
  FaFile,
  FaInfoCircle,
  FaLightbulb,
  FaPause,
  FaProjectDiagram,
  FaRocket,
  FaShieldAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTag,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import ClientDashboardStartProject from "./StartNewProject";
import { ProjectWithDetails, ProjectData, TrackingView } from "../../types/index";
import ConfirmationModal from "../components/ConfirmationModal";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";

// Function to transform ProjectWithDetails to ProjectData
const transformProjectToData = (
  project: ProjectWithDetails
): ProjectData => {
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
      estimatedHours: project.pricing?.estimatedHours || "0",
    },
    status: project.status,
    priority: project.priority === "urgent" ? "critical" : project.priority,
    progress: project.progress,
    createdAt: project.createdAt.toString(),
    updatedAt: project.updatedAt.toString(),
    userInfo: project.userInfo,
    milestones: (() => {
      console.log('\n=== FRONTEND MILESTONE TRANSFORMATION ===');
      console.log('Project milestones:', project.milestones);
      console.log('Project pricing milestones:', project.pricing?.milestones);

      const sourceMilestones = (project.milestones && project.milestones.length > 0)
        ? project.milestones
        : (project.pricing?.milestones || []); // Fallback to pricing milestones if project.milestones is empty

      console.log('Source milestones selected:', sourceMilestones);

      const transformedMilestones = sourceMilestones.map((m: any) => ({
        id: m.id || m._id?.toString(),
        title: m.title || "",
        description: m.description || "",
        budget: typeof m.budget === 'number' ? String(m.budget) : (m.budget || "0"), // Ensure budget is string
        timeline: m.timeline || "",
        status: m.status || "pending",
        dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
        order: m.order || 0,
      }));

      console.log('Transformed milestones:', transformedMilestones);
      return transformedMilestones;
    })(),
    updates: project.updates,
    files: project.files,
    payments: project.payments,
  };
};

type ActiveTab = "projects" | "analytics" | "create" | "settings";

interface ProjectStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  onHold: number;
  averageProgress: number;
}

const ClientDashboard: React.FC = () => {
  const recomputeStats = (projList: ProjectWithDetails[]): ProjectStats => ({
    total: projList.length,
    pending: projList.filter((p) => p.status === "pending").length,
    inProgress: projList.filter((p) => p.status === "in-progress").length,
    completed: projList.filter((p) => p.status === "completed").length,
    cancelled: projList.filter((p) => p.status === "cancelled").length,
    onHold: projList.filter((p) => p.status === "on_hold").length,
    averageProgress: projList.length
      ? Math.round(
        projList.reduce((acc, p) => acc + (p.progress || 0), 0) /
        projList.length
      )
      : 0,
  });
  const mapStatus = (
    status: "pending" | "reviewed" | "approved" | "rejected"
  ): "pending" | "in-progress" | "completed" | "cancelled" | "on_hold" => {
    switch (status) {
      case "pending":
        return "pending";
      case "reviewed":
        return "in-progress";
      case "approved":
        return "completed";
      case "rejected":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const { user } = useAuth();
  const [trackingView, setTrackingView] = useState<TrackingView>("overview");

  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<
    ProjectWithDetails[]
  >([]);
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    onHold: 0,
    averageProgress: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Toast notifications
  const { notifications: toastNotifications, removeNotification: removeToastNotification, toast } = useToast();

  // CRUD Modal states
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    variant: "info",
    loading: false,
  });

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const email =
      typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    const role =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      "user-email": user?.email || email || "",
      "user-role": (user?.role as string) || role || "client",
    };
  };

  // Replace the first useEffect with this:
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        if (!user?.email || user?.role !== "client") {
          throw new Error("User not authenticated or unauthorized");
        }

        const response = await fetch("/api/client-projects", {
          credentials: "include",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(
            (await response.text()) || "Failed to fetch projects"
          );
        }

        const responseData = await response.json();

        if (responseData.success) {
          // Transform dates in the projects data
          const transformedProjects = responseData.data.map((project: any) => ({
            id: project.id || project._id?.toString(),
            title: project.projectDetails?.title || project.title || "",
            description:
              project.projectDetails?.description || project.description || "",
            status: project.status || "pending",
            priority:
              project.projectDetails?.priority || project.priority || "low",
            progress: project.progress || 0,
            techStack:
              project.projectDetails?.techStack || project.techStack || [],
            category:
              project.projectDetails?.category || project.category || "",
            timeline:
              project.projectDetails?.timeline || project.timeline || "",
            requirements:
              project.projectDetails?.requirements ||
              project.requirements ||
              "",
            createdAt: project.createdAt
              ? new Date(project.createdAt)
              : new Date(),
            updatedAt: project.updatedAt
              ? new Date(project.updatedAt)
              : new Date(),
            startDate: project.startDate
              ? new Date(project.startDate)
              : undefined,
            endDate: project.endDate ? new Date(project.endDate) : undefined,
            estimatedCompletionDate: project.estimatedCompletionDate
              ? new Date(project.estimatedCompletionDate)
              : undefined,
            actualCompletionDate: project.actualCompletionDate
              ? new Date(project.actualCompletionDate)
              : undefined,
            pricing: project.pricing
              ? {
                type: project.pricing.type || "fixed",
                currency: project.pricing.currency || "USD",
                fixedBudget: project.pricing.fixedBudget,
                hourlyRate: project.pricing.hourlyRate,
                estimatedHours: project.pricing.estimatedHours ? Number(project.pricing.estimatedHours) : undefined,
                totalPaid: project.pricing.totalPaid,
              }
              : undefined,
            milestones: (() => {
              const sourceMilestones = (project.milestones && project.milestones.length > 0)
                ? project.milestones
                : (project.pricing?.milestones || []);
              return sourceMilestones.map((m: any) => ({
                id: m.id || m._id?.toString(),
                title: m.title || "",
                description: m.description || "",
                budget: typeof m.budget === 'number' ? String(m.budget) : (m.budget || "0"),
                timeline: m.timeline || "",
                status: m.status || "pending",
                dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
                completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
                order: m.order || 0,
              }));
            })(),
            updates: (project.updates || []).map((u: any) => ({
              id: u.id || u._id?.toString(),
              title: u.title || "",
              description: u.description || "",
              type: u.type || "general",
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
            })),
            files: (project.files || []).map((f: any) => ({
              id: f.id || f._id?.toString(),
              fileName: f.fileName || "",
              fileUrl: f.fileUrl || "",
              fileSize: f.fileSize,
              fileType: f.fileType,
              createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
            })),
            payments: (project.payments || []).map((p: any) => ({
              id: p.id || p._id?.toString(),
              amount: p.amount || 0,
              date: p.date || new Date().toISOString().split('T')[0],
              method: p.method || "Unknown",
              status: p.status || "pending",
              currency: p.currency || "USD",
              description: p.description || "",
              submittedBy: p.submittedBy || "client",
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt,
              invoiceUrl: p.invoiceUrl,
              notes: p.notes,
              rejectionReason: p.rejectionReason,
              approvedBy: p.approvedBy,
              approvedAt: p.approvedAt,
            })),
            userInfo: project.userInfo || {
              email: user.email,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              company: user.company || "",
            },
          }));

          setProjects(transformedProjects);
          setFilteredProjects(transformedProjects);

          // Calculate stats
          const newStats: ProjectStats = {
            total: transformedProjects.length,
            pending: transformedProjects.filter(
              (p: any) => p.status === "pending"
            ).length,
            inProgress: transformedProjects.filter(
              (p: any) => p.status === "in-progress"
            ).length,
            completed: transformedProjects.filter(
              (p: any) => p.status === "completed"
            ).length,
            cancelled: transformedProjects.filter(
              (p: any) => p.status === "cancelled"
            ).length,
            onHold: transformedProjects.filter(
              (p: any) => p.status === "on_hold"
            ).length,
            averageProgress: Math.round(
              transformedProjects.reduce(
                (acc: number, p: any) => acc + p.progress,
                0
              ) / transformedProjects.length
            ),
          };
          setStats(newStats);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects", "Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Listen for newly created projects to refresh seamlessly
    const projectCreatedHandler = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail;
      if (!detail) return;
      setProjects((prev) => {
        const updated = [detail, ...prev];
        setStats(recomputeStats(updated));
        return updated;
      });
      setFilteredProjects((prev) => [detail, ...prev]);
    };

    window.addEventListener("projectCreated", projectCreatedHandler);
    return () =>
      window.removeEventListener("projectCreated", projectCreatedHandler);
  }, [user]);

  // Reset view when changing tabs:
  useEffect(() => {
    setViewMode("list");
    setSelectedProject(null);
  }, [activeTab]);

  // Filter projects based on status, priority, and search
  useEffect(() => {
    let filtered = projects;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (project) => (project.status || "pending") === selectedStatus
      );
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (project) => (project.priority || "low") === selectedPriority
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (project.techStack || []).some((tech) =>
            tech.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredProjects(filtered);
  }, [projects, selectedStatus, selectedPriority, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "in-progress":
        return <Play className="w-4 h-4 text-blue-400" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "on_hold":
        return <Pause className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "on_hold":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const formatCurrency = (amount: string | undefined, currency: string) => {
    if (!amount) return "-";
    const symbol = currency === "USD" ? "$" : "KSh";
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  };

  // Helper to format dates as readable strings
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total project budget based on pricing type
  const calculateProjectBudget = (project: any): number => {
    if (!project.pricing) return 0;

    if (project.pricing.type === "fixed" && project.pricing.fixedBudget) {
      return parseFloat(project.pricing.fixedBudget);
    }
    if (project.pricing.type === "milestone" && project.milestones) {
      return project.milestones.reduce(
        (total: number, milestone: any) => total + parseFloat(milestone.budget || "0"),
        0
      );
    }
    if (
      project.pricing.type === "hourly" &&
      project.pricing.hourlyRate &&
      project.pricing.estimatedHours
    ) {
      return (
        parseFloat(project.pricing.hourlyRate) *
        (project.pricing.estimatedHours ? parseFloat(project.pricing.estimatedHours) : 0)
      );
    }
    return 0;
  };

  // Calculate project completion percentage
  const calculateCompletionPercentage = (project: any): number => {
    // If project is completed and no manual progress is set, return 100%
    if (project.status === "completed" && (!project.progress || project.progress === 0)) {
      return 100;
    }

    // If manual progress is set, always use it (from admin dashboard updates)
    if (project.progress && project.progress > 0) {
      return project.progress;
    }

    // For milestone-based projects, calculate based on milestone completion
    if (project.pricing?.type === "milestone" && project.milestones && project.milestones.length > 0) {
      const completedMilestones = project.milestones.filter(
        (milestone: any) => milestone.status === "completed"
      ).length;
      return Math.round((completedMilestones / project.milestones.length) * 100);
    }

    // Default to 0 if nothing else applies
    return 0;
  };

  // Get comprehensive project status info for display
  const getProjectStatusInfo = (project: any) => {
    const totalBudget = calculateProjectBudget(project);
    // Calculate total paid from payments array instead of pricing.totalPaid
    const totalPaid = (project.payments || []).reduce((sum: number, payment: any) => {
      if (payment.status === 'approved' || payment.status === 'paid') {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
    const completion = calculateCompletionPercentage(project);

    return {
      totalBudget,
      totalPaid,
      completion,
      remaining: totalBudget - totalPaid,
      budgetDisplay: formatCurrency(totalBudget.toString(), project.pricing?.currency || "USD"),
      paidDisplay: formatCurrency(totalPaid.toString(), project.pricing?.currency || "USD"),
      remainingDisplay: formatCurrency((totalBudget - totalPaid).toString(), project.pricing?.currency || "USD")
    };
  };

  // CRUD Functions
  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setConfirmationModal({
      isOpen: true,
      title: "Delete Project",
      message: `Are you sure you want to delete "${project.title}"? This action cannot be undone and will permanently remove all project data, including milestones, updates, and files.`,
      onConfirm: () => confirmDeleteProject(projectId),
      variant: "danger",
      loading: false,
    });
  };

  const confirmDeleteProject = async (projectId: string) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/client-projects/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      // Remove from local state
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      setStats(recomputeStats(updatedProjects));

      // Close modal and show success toast
      setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      toast.success("Project deleted", "The project has been successfully deleted.");

    } catch (error: any) {
      console.error("Error deleting project:", error);
      setConfirmationModal(prev => ({ ...prev, loading: false }));
      toast.error("Failed to delete project", error.message || "Please try again.");
    }
  };


  const handleCloseConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Add these functions before the render functions:

  const createProject = async (projectData: any) => {
    try {
      const response = await fetch("/api/client-projects", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      // Refresh projects
      const updatedResponse = await fetch("/api/client-projects", {
        headers: getAuthHeaders(),
      });
      const updatedData = await updatedResponse.json();

      if (updatedData.success) {
        setProjects(updatedData.projects);
        setFilteredProjects(updatedData.projects);
        setStats(recomputeStats(updatedData.projects));
        toast.success("Project created", "Your project has been successfully created!");
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project", error.message || "Please try again.");
    }
  };

  const updateProject = async (projectId: string, updates: any) => {
    try {
      const response = await fetch("/api/client-projects", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ projectId, ...updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update project");
      }

      // Refresh projects
      const updatedResponse = await fetch("/api/client-projects", {
        headers: getAuthHeaders(),
      });
      const updatedData = await updatedResponse.json();

      if (updatedData.success) {
        setProjects(updatedData.projects);
        setFilteredProjects(updatedData.projects);
        setStats(recomputeStats(updatedData.projects));
        toast.success("Project updated", "Your project has been successfully updated!");
      }
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project", error.message || "Please try again.");
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch("/api/client-projects", {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      // Refresh projects
      const updatedResponse = await fetch("/api/client-projects", {
        headers: getAuthHeaders(),
      });
      const updatedData = await updatedResponse.json();

      if (updatedData.success) {
        setProjects(updatedData.projects);
        setFilteredProjects(updatedData.projects);
        setStats(recomputeStats(updatedData.projects));
        toast.success("Project deleted", "Your project has been successfully deleted!");
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project", error.message || "Please try again.");
    }
  };

  // Render Functions
  const renderCreateNewProject = () => (
    <div className="">
      <ClientDashboardStartProject />
    </div>
  );

  interface AnalyticsMetric {
    label: string;
    value: string | number;
    change: string;
    trend: "up" | "down";
  }

  // Calculate overall metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const inProgressProjects = projects.filter(
    (p) => p.status === "in-progress"
  ).length;
  const averageProgress =
    projects.length > 0
      ? Math.round(
        projects.reduce((sum, p) => sum + (p.progress || 0), 0) /
        (projects.length || 1)
      )
      : 0;

  const totalMilestones = projects.reduce(
    (sum, p) => sum + (p.milestones?.length || 0),
    0
  );
  const completedMilestones = projects.reduce(
    (sum, p) =>
      sum + (p.milestones?.filter((m) => m.status === "completed").length || 0),
    0
  );

  const totalRevenue = projects.reduce((sum, p) => {
    if (p.pricing?.totalPaid) {
      return sum + parseFloat(p.pricing.totalPaid);
    }
    return sum;
  }, 0);

  const activeProjectsDays = projects
    .filter(
      (p) =>
        p.startDate && (p.status === "in-progress" || p.status === "completed")
    )
    .reduce((sum, p) => {
      const start = new Date(p.startDate!);
      const end = p.actualCompletionDate
        ? new Date(p.actualCompletionDate)
        : new Date();
      return (
        sum +
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );
    }, 0);

  const avgProjectDuration =
    inProgressProjects + completedProjects > 0
      ? Math.round(
        activeProjectsDays / (inProgressProjects + completedProjects)
      )
      : 0;

  // Get recent updates across all projects
  const allUpdates = projects
    .flatMap(
      (p) => p.updates?.map((u) => ({ ...u, projectTitle: p.title })) || []
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Get recent files across all projects
  const allFiles = projects
    .flatMap(
      (p) => p.files?.map((f) => ({ ...f, projectTitle: p.title })) || []
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const statusLabels = [
    "Completed",
    "In Progress",
    "Pending",
    "On Hold",
    "Cancelled",
  ];
  const statusColors = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#eab308", // yellow
    "#f97316", // orange
    "#ef4444", // red
  ];
  const statusCounts = [
    completedProjects,
    inProgressProjects,
    projects.filter((p) => p.status === "pending").length,
    projects.filter((p) => p.status === "on_hold").length,
    projects.filter((p) => p.status === "cancelled").length,
  ];
  const data = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: statusColors,
        borderWidth: 2,
        borderColor: "#18181b",
      },
    ],
  };

  const renderOverallSettings = (
    projects: ProjectWithDetails[]
  ): JSX.Element => {
    // Calculate portfolio metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === "in-progress"
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length;
    const pendingProjects = projects.filter(
      (p) => p.status === "pending"
    ).length;

    const oldestProject =
      projects.length > 0
        ? projects.reduce((oldest, project) =>
          project.createdAt &&
            oldest.createdAt &&
            new Date(project.createdAt).getTime() <
            new Date(oldest.createdAt).getTime()
            ? project
            : oldest
        )
        : null;

    const latestUpdate = projects
      .flatMap((p) => p.updates || [])
      .reduce(
        (latest, update) =>
          !latest || new Date(update.createdAt) > new Date(latest.createdAt)
            ? update
            : latest,
        null as any
      );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-white mb-2">
            Portfolio Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Manage your overall business preferences and client communication
            settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaBell className="mr-2 text-blue-400" />
              Global Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">New Project Alerts</p>
                  <p className="text-gray-400 text-sm">
                    Get notified when new projects are created
                  </p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Milestone Completions
                  </p>
                  <p className="text-gray-400 text-sm">
                    Notifications for all milestone completions
                  </p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Overdue Project Alerts
                  </p>
                  <p className="text-gray-400 text-sm">
                    Alerts for projects past their due dates
                  </p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Daily Portfolio Summary
                  </p>
                  <p className="text-gray-400 text-sm">
                    Daily email with portfolio overview
                  </p>
                </div>
                <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                  Disabled
                </button>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaComment className="mr-2 text-green-400" />
              Business Communication Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Client Update Frequency
                  </p>
                  <p className="text-gray-400 text-sm">
                    Default update frequency for new clients
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>On Milestones</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Primary Contact Method
                  </p>
                  <p className="text-gray-400 text-sm">
                    Default communication channel
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>Email</option>
                  <option>Slack</option>
                  <option>WhatsApp</option>
                  <option>Phone</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Business Hours</p>
                  <p className="text-gray-400 text-sm">
                    When clients can expect responses
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>9 AM - 5 PM EAT</option>
                  <option>8 AM - 6 PM EAT</option>
                  <option>24/7 Available</option>
                  <option>Custom Hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-purple-400" />
            Portfolio Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-black/10 rounded-lg">
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-white font-medium text-xl">{totalProjects}</p>
            </div>
            <div className="p-3 bg-black/10 rounded-lg">
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-white font-medium text-xl">{activeProjects}</p>
            </div>
            <div className="p-3 bg-black/10 rounded-lg">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-white font-medium text-xl">
                {completedProjects}
              </p>
            </div>
            <div className="p-3 bg-black/10 rounded-lg">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white font-medium text-xl">
                {pendingProjects}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm">Business Since</p>
              <p className="text-white font-medium">
                {oldestProject
                  ? formatDate(oldestProject.createdAt)
                  : "No projects yet"}
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm">Last Activity</p>
              <p className="text-white font-medium">
                {latestUpdate
                  ? formatDate(latestUpdate.createdAt)
                  : "No recent activity"}
              </p>
            </div>
          </div>
        </div>

        {/* Project Management Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaCog className="mr-2 text-orange-400" />
              Project Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Auto-Archive Completed
                  </p>
                  <p className="text-gray-400 text-sm">
                    Automatically archive projects after completion
                  </p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Default Project Priority
                  </p>
                  <p className="text-gray-400 text-sm">
                    Priority level for new projects
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>Medium</option>
                  <option>Low</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Milestone Reminders</p>
                  <p className="text-gray-400 text-sm">
                    Days before milestone due date
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>3 days</option>
                  <option>1 day</option>
                  <option>5 days</option>
                  <option>1 week</option>
                </select>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-red-400" />
              Security & Backup
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Backup</p>
                  <p className="text-gray-400 text-sm">
                    Automatically backup project data
                  </p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Two-Factor Auth</p>
                  <p className="text-gray-400 text-sm">
                    Extra security for your account
                  </p>
                </div>
                <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                  Disabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Session Timeout</p>
                  <p className="text-gray-400 text-sm">
                    Auto logout after inactivity
                  </p>
                </div>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                  <option>2 hours</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center justify-between p-6 backdrop-blur-md bg-black/10 border border-white/10 rounded-xl">
          <div>
            <h4 className="text-white font-medium mb-1">Portfolio Actions</h4>
            <p className="text-gray-400 text-sm">
              Manage your entire project portfolio and business settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
              Export Portfolio
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
              Backup Data
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
              Save Settings
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaChartBar className="mr-2 text-cyan-400" />
            Quick Portfolio Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-semibold text-green-400">
                {totalProjects > 0
                  ? Math.round((completedProjects / totalProjects) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-400 text-sm">Completion Rate</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-semibold text-blue-400">
                {projects.reduce(
                  (sum, p) => sum + (p.milestones?.length || 0),
                  0
                )}
              </div>
              <div className="text-gray-400 text-sm">Total Milestones</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-400">
                {projects.reduce((sum, p) => sum + (p.files?.length || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Files Managed</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-semibold text-purple-400">
                {
                  Array.from(new Set(projects.flatMap((p) => p.techStack)))
                    .length
                }
              </div>
              <div className="text-gray-400 text-sm">Technologies Used</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = (projects: ProjectWithDetails[]): JSX.Element => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">
              Projects Analytics
            </h2>
            <p className="text-gray-400 mt-1">
              Comprehensive overview of all your projects and business metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <FaDownload />
              <span>Export Portfolio Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(
            [
              {
                label: "Total Projects",
                value: totalProjects,
                change: totalProjects > 10 ? "+18.2%" : "+12.4%",
                trend: "up",
              },
              {
                label: "Overall Progress",
                value: `${averageProgress}%`,
                change: averageProgress > 70 ? "+22.1%" : "+15.8%",
                trend: "up",
              },
              {
                label: "Completed Projects",
                value: completedProjects,
                change: completedProjects > 5 ? "+28.5%" : "+16.7%",
                trend: "up",
              },
              {
                label: "Total Revenue",
                value:
                  totalRevenue > 0
                    ? `$${totalRevenue.toLocaleString()}`
                    : "N/A",
                change: "+24.3%",
                trend: "up",
              },
            ] as AnalyticsMetric[]
          ).map((metric: AnalyticsMetric, index: number) => (
            <div
              key={metric.label}
              className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6"
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
                      className={`text-sm ${metric.trend === "up"
                        ? "text-green-400"
                        : "text-red-400"
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
          {/* Project Status Visual Cards */}
          <div className="backdrop-blur-md  bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Project Status Distribution
            </h3>
            <div className="space-y-4">
              {(() => {
                const statusData = [
                  {
                    status: "Completed",
                    count: completedProjects,
                    color: "bg-green-500/30",
                    icon: <FaCheckCircle className="text-green-400" />,
                    percentage:
                      totalProjects > 0
                        ? Math.round((completedProjects / totalProjects) * 100)
                        : 0,
                  },
                  {
                    status: "In Progress",
                    count: inProgressProjects,
                    color: "bg-blue-500/30",
                    icon: <FaClock className="text-blue-400" />,
                    percentage:
                      totalProjects > 0
                        ? Math.round((inProgressProjects / totalProjects) * 100)
                        : 0,
                  },
                  {
                    status: "Planning",
                    count: Math.max(
                      0,
                      totalProjects - completedProjects - inProgressProjects
                    ),
                    color: "bg-yellow-500/30",
                    icon: <FaLightbulb className="text-yellow-400" />,
                    percentage:
                      totalProjects > 0
                        ? Math.round(
                          ((totalProjects -
                            completedProjects -
                            inProgressProjects) /
                            totalProjects) *
                          100
                        )
                        : 0,
                  },
                  {
                    status: "On Hold",
                    count: 0, // You might want to add this data from your projects
                    color: "bg-red-500/30",
                    icon: <FaPause className="text-red-400" />,
                    percentage: 0,
                  },
                ];

                return statusData.map((item, index) => (
                  <div key={item.status} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                          {item.icon}
                        </div>
                        <span className="text-white font-medium">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {item.count} projects
                        </span>
                        <span className="text-white font-semibold">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: `${item.percentage}%`,
                          animation: `slideIn 1s ease-out ${index * 0.2}s both`,
                        }}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Add custom CSS for animation */}
            <style jsx>{`
              @keyframes slideIn {
                from {
                  width: 0%;
                }
                to {
                  width: var(--target-width);
                }
              }
            `}</style>
          </div>

          <div className="backdrop-blur-md  bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Portfolio Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Completion Rate</span>
                <span className="text-white font-semibold">
                  {totalProjects > 0
                    ? Math.round((completedProjects / totalProjects) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width:
                      totalProjects > 0
                        ? `${(completedProjects / totalProjects) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  Milestones Completed
                </span>
                <span className="text-white font-semibold">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width:
                      totalMilestones > 0
                        ? `${(completedMilestones / totalMilestones) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  Avg Project Duration
                </span>
                <span className="text-white font-semibold">
                  {avgProjectDuration} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Active Projects</span>
                <span className="text-white font-semibold">
                  {inProgressProjects}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md  bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {allUpdates.length > 0 ? (
                allUpdates.map((update, index: number) => (
                  <div
                    key={`${update.id}-${index}`}
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaBell className="text-blue-400 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {update.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {update.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-blue-400 text-xs">
                          {update.projectTitle}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(update.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FaBell className="text-2xl mb-2 mx-auto opacity-50" />
                  <p>No recent activity across projects</p>
                </div>
              )}
            </div>
          </div>

          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Files
            </h3>
            <div className="space-y-3">
              {allFiles.length > 0 ? (
                allFiles.map((file, index: number) => (
                  <div
                    key={`${file.id}-${index}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <FaFile className="text-purple-400 text-sm" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {file.fileName}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{file.projectTitle}</span>
                          <span>•</span>
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(1)} KB`
                              : "Unknown size"}
                          </span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FaFile className="text-2xl mb-2 mx-auto opacity-50" />
                  <p>No files uploaded across projects</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Categories & Tech Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md  bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Project Categories
            </h3>
            <div className="space-y-3">
              {Array.from(
                new Set(projects.map((p) => p.category).filter(Boolean))
              ).length > 0 ? (
                Array.from(
                  new Set(projects.map((p) => p.category).filter(Boolean))
                ).map((category, index) => {
                  const categoryCount = projects.filter(
                    (p) => p.category === category
                  ).length;
                  const percentage = Math.round(
                    (categoryCount / totalProjects) * 100
                  );
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-white text-sm capitalize">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {categoryCount} projects
                        </span>
                        <span className="text-blue-400 text-sm">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FaTag className="text-2xl mb-2 mx-auto opacity-50" />
                  <p>No categories defined for projects</p>
                </div>
              )}
            </div>
          </div>

          <div className="backdrop-blur-md bg-black/10 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Popular Tech Stack
            </h3>
            <div className="space-y-3">
              {(() => {
                const techStackCount = projects
                  .flatMap((p) => p.techStack || [])
                  .filter((tech): tech is string => tech !== undefined)
                  .reduce((acc, tech) => {
                    acc[tech] = (acc[tech] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                const sortedTechStack = Object.entries(techStackCount)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6);

                return sortedTechStack.length > 0 ? (
                  sortedTechStack.map(([tech, count]) => {
                    const percentage = Math.round(
                      (count / totalProjects) * 100
                    );
                    return (
                      <div
                        key={tech}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-white text-sm">{tech}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">
                            {count} projects
                          </span>
                          <span className="text-green-400 text-sm">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FaCode className="text-2xl mb-2 mx-auto opacity-50" />
                    <p>No tech stack data available</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  type TrackingView =
    | "overview"
    | "timeline"
    | "milestones"
    | "budget"
    | "files"
    | "activity";

  // Add this function before your main return statement
  const renderProjects = () => {
    if (viewMode === "detail" && selectedProject) {
      // Map status to allowed ProjectData status values
      const mapStatus = (
        status: string
      ): "pending" | "reviewed" | "approved" | "rejected" => {
        switch (status) {
          case "pending":
            return "pending";
          case "in-progress":
          case "on_hold":
            return "reviewed";
          case "completed":
            return "approved";
          case "cancelled":
            return "rejected";
          default:
            return "pending";
        }
      };

      return (
        selectedProject && (
          <EnhancedProjectTracking
            onBack={() => setViewMode("list")}
            project={transformProjectToData(selectedProject)}
          />
        )
      );
    }

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className=" bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className=" bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className=" bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className=" bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Progress</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.averageProgress}%
                </p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>
        {/* Filters and Search */}
        <SearchFilterComponent
          projects={projects}
          setFilteredProjects={setFilteredProjects}
          onViewChange={setCurrentView}
        />
        {/* Projects Grid/List */}
        <div
          className={
            currentView === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-16"
              : "space-y-10"
          }
        >
          {filteredProjects.map((project) => (
            <div key={project.id}>
              {/* Project Card */}
              <div
                className={`group relative overflow-hidden rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] ${currentView === "list" ? "p-60" : "p-6"
                  }`}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.03) 0%, 
                    rgba(147, 51, 234, 0.02) 50%, 
                    rgba(236, 72, 153, 0.03) 100%)`,
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex items-center space-x-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                      project.status || "pending"
                    )}`}
                  >
                    {getStatusIcon(project.status || "pending")}
                    <span className="capitalize">
                      {project.status?.replace("_", " ") || "pending"}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                      project.priority || "low"
                    )}`}
                  >
                    {(project.priority || "low").toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {calculateCompletionPercentage(project)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${calculateCompletionPercentage(project)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(project.techStack || []).slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.techStack || []).length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md">
                        +{(project.techStack || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Info */}
                <div className="space-y-2 mb-4">
                  {project.pricing && (() => {
                    const statusInfo = getProjectStatusInfo(project);
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-gray-400">Budget:</span>
                          </div>
                          <span className="text-white font-medium">
                            {statusInfo.budgetDisplay}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <span className="text-gray-400">Paid:</span>
                          </div>
                          <span className="text-blue-400 font-medium">
                            {statusInfo.paidDisplay}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            </div>
                            <span className="text-gray-400">Remaining:</span>
                          </div>
                          <span className={`font-medium ${statusInfo.remaining > 0 ? "text-yellow-400" : "text-green-400"
                            }`}>
                            {statusInfo.remainingDisplay}
                          </span>
                        </div>

                        {/* Budget Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Budget Progress</span>
                            <span className="text-xs text-gray-400">
                              {statusInfo.totalBudget > 0
                                ? Math.round((statusInfo.totalPaid / statusInfo.totalBudget) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${statusInfo.totalBudget > 0
                                  ? Math.min((statusInfo.totalPaid / statusInfo.totalBudget) * 100, 100)
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Milestone Progress for milestone-based projects */}
                  {project.pricing?.type === "milestone" && project.milestones && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        </div>
                        <span className="text-gray-400">Milestones:</span>
                      </div>
                      <span className="text-purple-400 font-medium">
                        {project.milestones.filter((m: any) => m.status === "completed").length} / {project.milestones.length}
                      </span>
                    </div>
                  )}

                  {project.estimatedCompletionDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">
                        Due:{" "}
                        {project.estimatedCompletionDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="relative w-full bottom-0 flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setViewMode("detail");
                      }}
                      className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 text-sm rounded-md hover:bg-purple-500/30 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>


                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-red-500/20 text-red-300 text-sm rounded-md hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-2 mb-1">
                      {project.updates && project.updates.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-blue-400">
                          <MessageSquare className="w-3 h-3" />
                          <span>{project.updates.length}</span>
                        </div>
                      )}

                      {project.files && project.files.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <div className="w-3 h-3 rounded bg-green-400 flex items-center justify-center">
                            <span className="text-xs font-semibold text-green-900">{project.files.length}</span>
                          </div>
                          <span>Files</span>
                        </div>
                      )}

                      {project.payments && project.payments.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-orange-400">
                          <div className="w-3 h-3 rounded bg-orange-400 flex items-center justify-center">
                            <span className="text-xs font-semibold text-orange-900">{project.payments.length}</span>
                          </div>
                          <span>Payments</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Updated {project.updatedAt?.toLocaleDateString()}
                    </div>
                    {project.pricing?.type === "milestone" && project.milestones && (
                      <div className="text-xs text-purple-400 mt-1">
                        Next: {project.milestones.find((m: any) => m.status === "pending")?.title || "None"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-400 mb-6 monty uppercase">
              {searchQuery ||
                selectedStatus !== "all" ||
                selectedPriority !== "all"
                ? "Try adjusting your filters or search terms"
                : "Click 'Start New Project' to create a new one"}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover  ">
        <div className="relative">
          {/* Navigation */}
          <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/5 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FaCode className="text-white text-sm" />
                    </div>
                    <button className="text-white font-semibold text-lg">
                      Andishi {" | "}
                      <span className="text-sm monty uppercase text-gray-400">
                        client dashboard
                      </span>
                    </button>
                  </div>

                  <div className="hidden md:flex space-x-4">
                    {[
                      {
                        id: "projects",
                        label: "Projects",
                        icon: FaProjectDiagram,
                      },
                      { id: "analytics", label: "Analytics", icon: FaChartBar },
                      {
                        id: "create",
                        label: "Start New Project",
                        icon: FaRocket,
                      },
                      { id: "settings", label: "Settings", icon: FaCog },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeTab === tab.id
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
                    {toastNotifications.length > 0 && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {toastNotifications.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden bg-white/5 border-b border-white/10">
            <div className="flex space-x-1 p-2">
              {[
                { id: "projects", label: "Projects", icon: FaProjectDiagram },
                { id: "analytics", label: "Analytics", icon: FaChartBar },
                { id: "create", label: "Start New Project", icon: FaRocket },
                { id: "settings", label: "Settings", icon: FaCog },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 flex flex-col items-center space-y-1 py-2 rounded-lg transition-colors ${activeTab === tab.id
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
          <div className="w-[90vw] max-w-none mx-auto py-8 px-4 sm:px-6 lg:px-8 my-8">
            {activeTab === "projects" && renderProjects()}
            {activeTab === "analytics" && renderAnalytics(projects)}
            {activeTab === "create" && renderCreateNewProject()}
            {activeTab === "settings" && renderOverallSettings(projects)}
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
        <ToastContainer
          notifications={toastNotifications}
          onRemoveNotification={removeToastNotification}
          position="top-right"
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={handleCloseConfirmationModal}
          variant={confirmationModal.variant}
          loading={confirmationModal.loading}
          confirmText={confirmationModal.variant === "danger" ? "Delete" : "Confirm"}
        />
      </div>
    </>
  );
};

export default ClientDashboard;
