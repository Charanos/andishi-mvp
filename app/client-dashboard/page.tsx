"use client";

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
  Target,
  Code,
  ExternalLink,
  FileText,
  Circle,
  Activity,
} from "lucide-react";
import {
  FaArrowCircleLeft,
  FaBell,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCheck,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaCode,
  FaCog,
  FaComment,
  FaDownload,
  FaFile,
  FaFlag,
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
  FaUserEdit,
  FaUsers,
} from "react-icons/fa";
import ClientDashboardStartProject from "./StartNewProject";

type ActiveTab = "projects" | "analytics" | "create" | "settings";

// Types based on your schema
interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  category?: string;
  timeline?: string;
  urgency?: string;
  techStack: string[];
  requirements?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  pricing?: {
    type: "fixed" | "milestone" | "hourly";
    currency: "USD" | "KES";
    fixedBudget?: string;
    hourlyRate?: string;
    estimatedHours?: number;
    totalPaid?: string;
  };
  milestones?: Array<{
    id: string;
    title: string;
    description: string;
    budget: string;
    timeline: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    dueDate?: Date;
    completedAt?: Date;
    order: number;
  }>;
  updates?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: Date;
  }>;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    createdAt: Date;
  }>;
}

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
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info";
      message: string;
    }>
  >([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    const mockProjects: ProjectWithDetails[] = [
      {
        id: "1",
        title: "E-commerce Platform Redesign",
        description:
          "Complete redesign of the e-commerce platform with modern UI/UX, improved performance, and mobile optimization.",
        category: "Web Development",
        timeline: "3 months",
        urgency: "high",
        techStack: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "PostgreSQL",
        ],
        status: "in_progress",
        priority: "high",
        progress: 65,
        startDate: new Date("2024-01-15"),
        estimatedCompletionDate: new Date("2024-04-15"),
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-03-01"),
        pricing: {
          type: "milestone",
          currency: "USD",
          totalPaid: "15000",
        },
        milestones: [
          {
            id: "1",
            title: "UI/UX Design",
            description: "Complete design system and mockups",
            budget: "5000",
            timeline: "2 weeks",
            status: "completed",
            order: 1,
            completedAt: new Date("2024-01-30"),
          },
          {
            id: "2",
            title: "Frontend Development",
            description: "Implement responsive frontend",
            budget: "8000",
            timeline: "6 weeks",
            status: "in_progress",
            order: 2,
          },
        ],
        updates: [
          {
            id: "1",
            title: "Frontend Development Progress",
            description:
              "Completed product catalog and shopping cart functionality",
            type: "general",
            createdAt: new Date("2024-02-28"),
          },
        ],
      },
      {
        id: "2",
        title: "Mobile App Development",
        description:
          "Native mobile application for iOS and Android with real-time features and offline capability.",
        category: "Mobile Development",
        timeline: "4 months",
        urgency: "medium",
        techStack: ["React Native", "Node.js", "Firebase", "Redux"],
        status: "pending",
        priority: "medium",
        progress: 0,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        pricing: {
          type: "fixed",
          currency: "USD",
          fixedBudget: "25000",
        },
      },
      {
        id: "3",
        title: "Data Analytics Dashboard",
        description:
          "Business intelligence dashboard with real-time analytics, reporting, and data visualization.",
        category: "Data Analytics",
        timeline: "2 months",
        urgency: "low",
        techStack: ["Python", "Django", "React", "D3.js", "PostgreSQL"],
        status: "completed",
        priority: "low",
        progress: 100,
        startDate: new Date("2023-11-01"),
        endDate: new Date("2024-01-01"),
        actualCompletionDate: new Date("2024-01-01"),
        createdAt: new Date("2023-10-15"),
        updatedAt: new Date("2024-01-01"),
        pricing: {
          type: "hourly",
          currency: "USD",
          hourlyRate: "75",
          estimatedHours: 200,
        },
      },
    ];

    setProjects(mockProjects);
    setFilteredProjects(mockProjects);

    // Calculate stats
    const newStats: ProjectStats = {
      total: mockProjects.length,
      pending: mockProjects.filter((p) => p.status === "pending").length,
      inProgress: mockProjects.filter((p) => p.status === "in_progress").length,
      completed: mockProjects.filter((p) => p.status === "completed").length,
      cancelled: mockProjects.filter((p) => p.status === "cancelled").length,
      onHold: mockProjects.filter((p) => p.status === "on_hold").length,
      averageProgress: Math.round(
        mockProjects.reduce((acc, p) => acc + p.progress, 0) /
          mockProjects.length
      ),
    };
    setStats(newStats);
    setLoading(false);
  }, []);

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
        (project) => project.status === selectedStatus
      );
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (project) => project.priority === selectedPriority
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.techStack.some((tech) =>
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
      case "in_progress":
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
      case "in_progress":
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
    (p) => p.status === "in_progress"
  ).length;
  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
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
        p.startDate && (p.status === "in_progress" || p.status === "completed")
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
      (p) => p.status === "in_progress"
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
            new Date(project.createdAt) < new Date(oldest.createdAt)
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
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-purple-400" />
            Portfolio Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-white font-medium text-xl">{totalProjects}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-white font-medium text-xl">{activeProjects}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-white font-medium text-xl">
                {completedProjects}
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
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
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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
        <div className="flex items-center justify-between p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
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
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaChartBar className="mr-2 text-cyan-400" />
            Quick Portfolio Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {totalProjects > 0
                  ? Math.round((completedProjects / totalProjects) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-400 text-sm">Completion Rate</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {projects.reduce(
                  (sum, p) => sum + (p.milestones?.length || 0),
                  0
                )}
              </div>
              <div className="text-gray-400 text-sm">Total Milestones</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {projects.reduce((sum, p) => sum + (p.files?.length || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Files Managed</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
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
                        metric.trend === "up"
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
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Project Status Distribution
            </h3>
            <div className="space-y-4">
              {(() => {
                const statusData = [
                  {
                    status: "Completed",
                    count: completedProjects,
                    color: "bg-green-500",
                    icon: <FaCheckCircle className="text-green-400" />,
                    percentage:
                      totalProjects > 0
                        ? Math.round((completedProjects / totalProjects) * 100)
                        : 0,
                  },
                  {
                    status: "In Progress",
                    count: inProgressProjects,
                    color: "bg-blue-500",
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
                    color: "bg-yellow-500",
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
                    color: "bg-red-500",
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Popular Tech Stack
            </h3>
            <div className="space-y-3">
              {(() => {
                const techStackCount = projects
                  .flatMap((p) => p.techStack)
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

  const renderProjectDetail = (project: ProjectWithDetails): JSX.Element => {
    // Calculate project statistics
    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones =
      project.milestones?.filter((m) => m.status === "completed").length || 0;
    const milestoneProgress =
      totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    const totalBudget = project.pricing?.fixedBudget
      ? parseFloat(project.pricing.fixedBudget)
      : project.milestones?.reduce((sum, m) => sum + parseFloat(m.budget), 0) ||
        0;

    const spentBudget = project.pricing?.totalPaid
      ? parseFloat(project.pricing.totalPaid)
      : 0;
    const budgetProgress =
      totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

    // Calculate project duration
    const startDate = project.startDate;
    const endDate =
      project.actualCompletionDate || project.estimatedCompletionDate;
    const daysPassed = startDate
      ? Math.floor(
          (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        )
      : 0;
    const totalDays =
      startDate && endDate
        ? Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
          )
        : 0;

    // Recent activity
    const recentActivity = [
      ...(project.updates?.map((u) => ({ ...u, activityType: "update" })) ||
        []),
      ...(project.milestones
        ?.filter((m) => m.completedAt)
        .map((m) => ({
          id: m.id,
          title: `Milestone: ${m.title}`,
          description: "Milestone completed",
          createdAt: m.completedAt!,
          activityType: "milestone",
        })) || []),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return (
      <div className="bg-white/5 min-h-screen rounded-lg">
        {/* Header Section */}
        <div className="backdrop-blur-xl bg-indigo-900/80 border-b border-white/10 rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode("list")}
                  className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
                >
                  <FaArrowCircleLeft className="w-5 h-5" />
                  <span>Back to Projects</span>
                </button>
                <div className="h-6 w-px bg-white/20"></div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {project.title}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {project.category}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(project.status)}
                  <span className="text-white font-medium capitalize">
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    project.priority
                  )}`}
                >
                  {project.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Project Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-blue-300" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {project.progress}%
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Overall Progress
              </h3>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {100 - project.progress}% remaining
              </p>
            </div>

            {/* Milestones Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-purple-300" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">Milestones</h3>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {Math.round(milestoneProgress)}% completed
              </p>
            </div>

            {/* Budget Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-300" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(
                    spentBudget.toString(),
                    project.pricing?.currency || "USD"
                  )}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">Budget Spent</h3>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                of{" "}
                {formatCurrency(
                  totalBudget.toString(),
                  project.pricing?.currency || "USD"
                )}{" "}
                total
              </p>
            </div>

            {/* Timeline Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-300" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {daysPassed}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">Days Active</h3>
              {totalDays > 0 && (
                <>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (daysPassed / totalDays) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {Math.max(totalDays - daysPassed, 0)} days remaining
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="xl:col-span-2 space-y-8">
              {/* Project Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Project Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {project.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Requirements
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {project.requirements}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.urgency && (
                      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-2 block">
                          Urgency
                        </label>
                        <span className="text-white font-medium capitalize">
                          {project.urgency}
                        </span>
                      </div>
                    )}

                    {project.timeline && (
                      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-2 block">
                          Timeline
                        </label>
                        <span className="text-white font-medium">
                          {project.timeline}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                    <Code className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Technology Stack
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {project.techStack.map((tech: string, index: number) => (
                    <div
                      key={index}
                      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 hover:scale-105 transition-all duration-200 text-center"
                    >
                      <span className="text-gray-200 font-medium text-sm">
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Timeline */}
              {project.milestones && project.milestones.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl">
                      <Target className="w-5 h-5 text-pink-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Milestones & Timeline
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {project.milestones
                      .sort((a, b) => a.order - b.order)
                      .map((milestone, index) => (
                        <div key={milestone.id} className="relative">
                          {/* Timeline connector */}
                          {index < project.milestones!.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-gray-600 to-gray-700"></div>
                          )}

                          <div className="flex items-start space-x-4">
                            {/* Status indicator */}
                            <div
                              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                milestone.status === "completed"
                                  ? "bg-green-500/20 border-green-500 text-green-300"
                                  : milestone.status === "in_progress"
                                  ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                  : "bg-gray-500/20 border-gray-500 text-gray-400"
                              }`}
                            >
                              {milestone.status === "completed" ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : milestone.status === "in_progress" ? (
                                <Clock className="w-6 h-6" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                            </div>

                            {/* Milestone content */}
                            <div className="flex-1 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-white">
                                    {milestone.title}
                                  </h3>
                                  <p className="text-gray-300 text-sm mt-1">
                                    {milestone.description}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    milestone.status
                                  )}`}
                                >
                                  {milestone.status.replace("_", " ")}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Budget:</span>
                                  <span className="text-white font-medium">
                                    {formatCurrency(
                                      milestone.budget,
                                      project.pricing?.currency || "USD"
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Timeline:
                                  </span>
                                  <span className="text-white font-medium">
                                    {milestone.timeline}
                                  </span>
                                </div>
                                {milestone.dueDate && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Due:</span>
                                    <span className="text-white font-medium">
                                      {milestone.dueDate.toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Project Timeline */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl">
                    <Calendar className="w-5 h-5 text-teal-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Timeline</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-1 block">
                      Created
                    </label>
                    <p className="text-white font-medium">
                      {project.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {project.startDate && (
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-1 block">
                        Started
                      </label>
                      <p className="text-white font-medium">
                        {project.startDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {project.estimatedCompletionDate && (
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-1 block">
                        {project.actualCompletionDate
                          ? "Estimated Completion"
                          : "Expected Completion"}
                      </label>
                      <p className="text-white font-medium">
                        {project.estimatedCompletionDate.toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {project.actualCompletionDate && (
                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <label className="text-sm font-medium text-green-400 mb-1 block">
                        Completed
                      </label>
                      <p className="text-white font-medium">
                        {project.actualCompletionDate.toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Details */}
              {project.pricing && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                      <DollarSign className="w-5 h-5 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Pricing
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-1 block">
                        Type
                      </label>
                      <p className="text-white font-medium capitalize">
                        {project.pricing.type} Project
                      </p>
                    </div>

                    {project.pricing.fixedBudget && (
                      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-1 block">
                          Total Budget
                        </label>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(
                            project.pricing.fixedBudget,
                            project.pricing.currency
                          )}
                        </p>
                      </div>
                    )}

                    {project.pricing.hourlyRate && (
                      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-1 block">
                          Hourly Rate
                        </label>
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(
                            project.pricing.hourlyRate,
                            project.pricing.currency
                          )}
                          /hr
                        </p>
                        {project.pricing.estimatedHours && (
                          <p className="text-gray-400 text-sm mt-1">
                            Est. {project.pricing.estimatedHours} hours
                          </p>
                        )}
                      </div>
                    )}

                    {project.pricing.totalPaid && (
                      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <label className="text-sm font-medium text-green-400 mb-1 block">
                          Total Paid
                        </label>
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(
                            project.pricing.totalPaid,
                            project.pricing.currency
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl">
                    <Activity className="w-5 h-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Recent Activity
                  </h3>
                </div>

                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-white/[0.03] rounded-xl border border-white/5"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-white">
                            {activity.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              activity.activityType === "milestone"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {activity.activityType}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mb-2">
                          {activity.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {activity.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Project Files */}
              {project.files && project.files.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                      <FileText className="w-5 h-5 text-amber-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Project Files
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {project.files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-600/30 rounded-lg">
                              <FileText className="w-4 h-4 text-gray-300" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">
                                {file.fileName}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {file.fileSize
                                  ? `${(file.fileSize / 1024).toFixed(1)} KB`
                                  : "Unknown size"}{" "}
                                •
                                {file.createdAt.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this function before your main return statement
  const renderProjects = () => {
    if (viewMode === "detail" && selectedProject) {
      return renderProjectDetail(selectedProject);
    }

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
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

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
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

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
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

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
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
            <div
              key={project.id}
              className={`group relative overflow-hidden rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] ${
                currentView === "list" ? "p-60" : "p-6"
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
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  <span className="capitalize">
                    {project.status.replace("_", " ")}
                  </span>
                </span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                    project.priority
                  )}`}
                >
                  {project.priority.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md">
                      +{project.techStack.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-2 mb-4">
                {project.pricing && (
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400">
                      {project.pricing.type === "fixed"
                        ? formatCurrency(
                            project.pricing.fixedBudget,
                            project.pricing.currency
                          )
                        : project.pricing.type === "hourly"
                        ? `${formatCurrency(
                            project.pricing.hourlyRate,
                            project.pricing.currency
                          )}/hr`
                        : formatCurrency(
                            project.pricing.totalPaid,
                            project.pricing.currency
                          )}
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
              <div className="realtive w-full bottom-0 flex items-center justify-between pt-4 border-t border-white/10">
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

                  {project.updates && project.updates.length > 0 && (
                    <button className="flex cursor-pointer items-center space-x-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 text-sm rounded-md hover:bg-blue-500/30 transition-colors">
                      <MessageSquare className="w-3 h-3" />
                      <span>{project.updates.length}</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Updated {project.updatedAt.toLocaleDateString()}
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
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
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
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">A</span>
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
                { id: "projects", label: "Projects", icon: FaProjectDiagram },
                { id: "analytics", label: "Analytics", icon: FaChartBar },
                { id: "create", label: "Start New Project", icon: FaRocket },
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
            {activeTab === "projects" && renderProjects()}
            {activeTab === "analytics" &&
              projects.length > 0 &&
              renderAnalytics(projects)}
            {activeTab === "create" &&
              projects.length > 0 &&
              renderCreateNewProject()}
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
      </div>
    </>
  );
};

export default ClientDashboard;
