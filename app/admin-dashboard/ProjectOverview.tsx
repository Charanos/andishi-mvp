import React, { useState, useEffect } from "react";
import useSWR from "swr";
import {
  FaArrowCircleLeft,
  FaProjectDiagram,
  FaDollarSign,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaEye,
  FaTimes,
  FaFileAlt,
  FaCreditCard,
  FaEdit,
  FaUpload,
  FaComment,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaTimesCircle,
  FaPlay,
  FaUsers,
  FaSearch,
  FaStar,
  FaCode,
} from "react-icons/fa";
import ProjectAssignments from "./ProjectAssignments";
import ProjectChatComponent from "./ProjectChat";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import {
  Target,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Activity,
  Code,
  Clock,
  MessageSquare,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Reply,
  Send,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  ProjectDetails,
  Milestone,
  PricingOption,
  ProjectData,
  ProjectFile,
  Payment,
  ProjectUpdate,
} from "~/types";
import ProjectChat from "./ProjectChat";
import { useAuth } from "@/hooks/useAuth";
import {
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
  getPaymentMethodsForCurrency,
  formatPaymentMethodLabel,
  DEFAULT_PAYMENT_METHOD,
  PaymentMethodType,
} from "@/lib/paymentMethods";
import ToastContainer from "../components/ToastContainer";
import { ToastNotification } from "../components/ToastNotification";

interface FetcherError extends Error {
  info?: any;
  status?: number;
}

export interface ActivityItem {
  id: string;
  type:
    | "chat"
    | "assignment"
    | "milestone"
    | "payment"
    | "update"
    | "system"
    | "file";
  title: string;
  description: string;
  createdAt: Date | string;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: any;
  activityType?: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error: FetcherError = new Error(
      "An error occurred while fetching the data."
    );
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

import { SystemUser } from "~/types";

interface ProjectOverviewProps {
  selectedProject: ProjectData | null;
  onBack: () => void;
  onStatusUpdate: (
    projectId: string,
    status: ProjectData["status"]
  ) => Promise<void>;
  onProgressUpdate: (projectId: string, progress: number) => Promise<void>;
  onMilestoneUpdate: (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ) => Promise<void>;
  onAddUpdate: (
    projectId: string,
    update: { title: string; description: string; type: string }
  ) => Promise<void>;
  onFileUpload: (projectId: string, file: File) => Promise<void>;
  onPaymentRecord: (
    projectId: string,
    payment: { amount: number; method: string; notes?: string }
  ) => Promise<void>;
  developers: SystemUser[];
  refreshDevelopers?: () => void;
}

type TrackingView =
  | "overview"
  | "milestones"
  | "budget"
  | "files"
  | "activity"
  | "assignments"
  | "chat"
  | "updates";

type MilestoneStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";
type PaymentStatus =
  | "pending"
  | "approved"
  | "completed"
  | "rejected"
  | "outstanding"
  | "paid"
  | "overdue"
  | "partial";
type FileType = "document" | "image" | "video" | "other";
type UpdateType =
  | "general"
  | "milestone"
  | "payment"
  | "file"
  | "admin_response";

// Utility functions
const EXCHANGE_RATES: Record<"USD" | "KES", number> = {
  USD: 1,
  KES: 1 / 130, // approximate: 130 KES ≈ 1 USD
};

const toUSD = (amount: number, currency: "USD" | "KES" = "USD") => {
  return amount * (EXCHANGE_RATES[currency] ?? 1);
};

const formatCurrency = (amount: number, currency: "USD" | "KES") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatCurrencyLocal = (amount: number, currency: "USD" | "KES") => {
  const currencySymbol = currency === "USD" ? "$" : "KES ";
  return `${currencySymbol}${amount.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "in-progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    overdue: "bg-red-500/20 text-red-300 border-red-500/30",
    paid: "bg-green-500/20 text-green-300 border-green-500/30",
    partial: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    on_hold: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    reviewed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    approved: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return colors[status] || colors.pending;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactElement> = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    "in-progress": <Activity className="w-4 h-4 text-blue-400" />,
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    on_hold: <AlertCircle className="w-4 h-4 text-orange-400" />,
    cancelled: <X className="w-4 h-4 text-red-400" />,
    reviewed: <Eye className="w-4 h-4 text-purple-400" />,
    approved: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
    rejected: <X className="w-4 h-4 text-red-400" />,
  };
  return icons[status] || icons.pending;
};

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  selectedProject,
  onBack,
  onStatusUpdate,
  onProgressUpdate,
  onMilestoneUpdate,
  onAddUpdate,
  onFileUpload,
  onPaymentRecord,
  developers,
  refreshDevelopers,
}) => {
  const [trackingView, setTrackingView] = useState<TrackingView>("overview");
  const [projectData, setProjectData] = useState<ProjectData>(
    selectedProject || ({} as ProjectData)
  );

  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<Partial<ProjectFile>>({});
  const [showAddFile, setShowAddFile] = useState(false);

  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({});
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({});
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [newUpdate, setNewUpdate] = useState<Partial<ProjectUpdate>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentToReject, setPaymentToReject] = useState<string | null>(null);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePaymentTab, setActivePaymentTab] = useState<
    "pending" | "history"
  >("pending");
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const [progressValue, setProgressValue] = useState(
    selectedProject?.progress || 0
  );

  const { user: currentUser } = useAuth();

  // Custom toast notification functions
  const addNotification = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message?: string
  ) => {
    const id = Date.now().toString();
    const notification: ToastNotification = { id, type, title, message };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toast = {
    success: (title: string, message?: string) =>
      addNotification("success", title, message),
    error: (title: string, message?: string) =>
      addNotification("error", title, message),
    info: (title: string, message?: string) =>
      addNotification("info", title, message),
    warning: (title: string, message?: string) =>
      addNotification("warning", title, message),
  };

  // Fetch activity data using SWR
  const {
    data: activityData,
    error: activityError,
    isLoading: activityLoading,
  } = useSWR(
    selectedProject ? `/api/project-activity/${selectedProject._id}` : null,
    fetcher
  );

  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    type: "general",
  });
  const [paymentForm, setPaymentForm] = useState<{
    amount: number;
    date: string;
    method: PaymentMethodType;
    status: string;
    notes: string;
  }>({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    method: DEFAULT_PAYMENT_METHOD,
    status: "completed",
    notes: "",
  });
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: "",
  });

  // Convert date strings to Date objects
  useEffect(() => {
    if (selectedProject) {
      const convertDates = (data: ProjectData): ProjectData => {
        return {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          estimatedCompletionDate: data.estimatedCompletionDate
            ? new Date(data.estimatedCompletionDate)
            : undefined,
          actualCompletionDate: data.actualCompletionDate
            ? new Date(data.actualCompletionDate)
            : undefined,
          milestones: (() => {
            // If project has milestones, use them
            if (data.milestones?.length) {
              return data.milestones.map((m) => ({
                ...m,
                dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
                completedAt: m.completedAt
                  ? new Date(m.completedAt)
                  : undefined,
                budget:
                  typeof m.budget === "string"
                    ? m.budget
                    : String(m.budget || "0"),
                title: m.title || "Untitled Milestone",
                description: m.description || "No description provided",
                status: m.status || "pending",
              }));
            }

            // If pricing has milestones, use them
            if (data.pricing?.milestones?.length) {
              return data.pricing.milestones.map((m) => ({
                ...m,
                dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
                completedAt: m.completedAt
                  ? new Date(m.completedAt)
                  : undefined,
                budget:
                  typeof m.budget === "string"
                    ? m.budget
                    : String(m.budget || "0"),
                title: m.title || "Untitled Milestone",
                description: m.description || "No description provided",
                status: m.status || "pending",
              }));
            }

            // If pricing type is milestone but no milestones exist, create default ones
            if (data.pricing?.type === "milestone") {
              return [
                {
                  id: "default-milestone-1",
                  title: "Project Planning & Setup",
                  description:
                    "Initial project setup, requirements gathering, and planning phase",
                  budget: "0",
                  timeline: "1 week",
                  status: "pending" as const,
                  dueDate: undefined,
                  completedAt: undefined,
                  order: 1,
                },
                {
                  id: "default-milestone-2",
                  title: "Development Phase",
                  description:
                    "Core development work and feature implementation",
                  budget: "0",
                  timeline: "2-3 weeks",
                  status: "pending" as const,
                  dueDate: undefined,
                  completedAt: undefined,
                  order: 2,
                },
                {
                  id: "default-milestone-3",
                  title: "Testing & Deployment",
                  description:
                    "Quality assurance, testing, and final deployment",
                  budget: "0",
                  timeline: "1 week",
                  status: "pending" as const,
                  dueDate: undefined,
                  completedAt: undefined,
                  order: 3,
                },
              ];
            }

            return [];
          })(),
          updates: data.updates?.map((u) => ({
            ...u,
            createdAt: new Date(u.createdAt),
          })),
          files: data.files?.map((f) => ({
            ...f,
            createdAt: new Date(f.createdAt),
          })),
          payments: data.payments?.map((p) => ({
            ...p,
            date: p.date,
          })),
        };
      };

      setProjectData(convertDates(selectedProject));
    }
  }, [selectedProject]);

  // Calculate project statistics
  const totalMilestones = projectData.milestones?.length || 0;
  const completedMilestones = (projectData.milestones || []).filter(
    (m) => m.status === "completed"
  ).length;
  const milestoneProgress =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const totalBudget = (() => {
    if (
      projectData.pricing?.type === "fixed" &&
      projectData.pricing.fixedBudget
    ) {
      return parseFloat(projectData.pricing.fixedBudget) || 0;
    }

    const milestones =
      projectData.milestones || projectData.pricing?.milestones || [];
    return milestones.reduce((sum, m) => {
      const budget =
        typeof m.budget === "string" ? parseFloat(m.budget) : m.budget || 0;
      return sum + (isNaN(budget) ? 0 : budget);
    }, 0);
  })();

  const spentBudget = (projectData.payments || [])
    .filter((p) => p.status === "approved" || p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const budgetProgress =
    totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

  // Calculate timeline
  const startDate = projectData.startDate;
  const endDate =
    projectData.actualCompletionDate || projectData.estimatedCompletionDate;
  const daysPassed = startDate
    ? Math.floor(
        (Date.now() -
          (typeof startDate === "string"
            ? new Date(startDate).getTime()
            : startDate.getTime())) /
          (1000 * 3600 * 24)
      )
    : 0;
  const totalDays =
    startDate && endDate
      ? Math.floor(
          ((typeof endDate === "string"
            ? new Date(endDate)
            : endDate
          ).getTime() -
            (typeof startDate === "string"
              ? new Date(startDate)
              : startDate
            ).getTime()) /
            (1000 * 3600 * 24)
        )
      : 0;

  if (!selectedProject) return null;

  const renderContent = () => {
    switch (trackingView) {
      case "overview":
        return (
          <div className="bg-gray-900 p-4 rounded-lg shadow-md">
            <div className="bg-blue-800 text-white p-4 rounded-t-lg">
              <h2 className="text-3xl font-semibold">Project Overview</h2>
            </div>
            <div className="bg-white p-4 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800">
                    Timeline
                  </h3>
                  <p>
                    Start Date:{" "}
                    {projectData.startDate
                      ? new Date(projectData.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    Estimated Completion:{" "}
                    {projectData.estimatedCompletionDate
                      ? new Date(
                          projectData.estimatedCompletionDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>Days Active: {daysPassed}</p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800">
                    Budget Utilization
                  </h3>
                  <p>
                    Total Budget:{" "}
                    {formatCurrency(
                      totalBudget,
                      projectData.pricing?.currency || "USD"
                    )}
                  </p>
                  <p>
                    Spent:{" "}
                    {formatCurrency(
                      spentBudget,
                      projectData.pricing?.currency || "USD"
                    )}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${budgetProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="border p-4 rounded-lg shadow-sm md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    Technology Stack
                  </h3>
                  <p>
                    {(projectData.projectDetails?.techStack || []).join(", ") ||
                      "N/A"}
                  </p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    Client Information
                  </h3>
                  <p>Client ID: {projectData.clientId}</p>
                  <p>Status: {projectData.status}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md focus:outline-none">
                  Manage Project
                </button>
              </div>
            </div>
          </div>
        );
      case "milestones":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Milestones
            </h2>
            <div className="space-y-4">
              {(projectData.milestones || []).map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-white/[0.03] p-4 rounded-lg border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {milestone.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Due:{" "}
                      {milestone.dueDate
                        ? new Date(milestone.dueDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        milestone.status
                      )}`}
                    >
                      {milestone.status.replace("_", " ")}
                    </div>
                    <div className="text-lg font-semibold text-white mt-2">
                      {formatCurrency(
                        parseFloat(milestone.budget),
                        projectData.pricing?.currency || "USD"
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(projectData.milestones || []).length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Milestones
                  </h3>
                  <p className="text-gray-400">
                    This project does not have any milestones yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "budget":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Payments</h2>
            <div className="space-y-4">
              {(projectData.payments || []).map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/[0.03] p-4 rounded-lg border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {payment.description || "Payment"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Method:{" "}
                      {formatPaymentMethodLabel(
                        payment.method as PaymentMethodType
                      )}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Date:{" "}
                      {payment.date
                        ? new Date(payment.date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        payment.status || "pending"
                      )}`}
                    >
                      {payment.status?.replace("_", " ") || "pending"}
                    </div>
                    <div className="text-lg font-semibold text-white mt-2">
                      {formatCurrency(
                        payment.amount,
                        payment.currency || "USD"
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(projectData.payments || []).length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Payments
                  </h3>
                  <p className="text-gray-400">
                    There are no recorded payments for this project yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "assignments":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <ProjectAssignments
              projectId={selectedProject._id}
              projectTitle={selectedProject.projectDetails.title}
              projectTechStack={selectedProject.projectDetails.techStack || []}
              projectExperienceLevel={"Mid-level"}
              developers={developers}
              refreshDevelopers={refreshDevelopers}
            />
          </div>
        );
      case "chat":
        if (!currentUser) {
          return <div>Authenticating...</div>;
        }
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <ProjectChat
              projectId={selectedProject._id}
              projectTitle={selectedProject.projectDetails.title}
              currentUserId={currentUser!.id}
              currentUserRole={
                currentUser!.role as "admin" | "client" | "developer"
              }
              currentUserName={
                currentUser!.name || currentUser!.email || "Anonymous"
              }
            />
          </div>
        );
      case "activity":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {activityLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading activity...</span>
                  </div>
                </div>
              ) : activityError ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Error Loading Activity
                  </h3>
                  <p className="text-gray-400">
                    There was an error loading the activity. Please try again
                    later.
                  </p>
                  <p className="text-red-400 text-sm mt-2">
                    {activityError.message || "Unknown error occurred"}
                  </p>
                </div>
              ) : activityData && activityData.data ? (
                (console.log("Rendering activities:", activityData.data.length),
                activityData.data.map((activity: ActivityItem) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start space-x-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === "milestone" ? (
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        </div>
                      ) : activity.type === "update" ? (
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-300" />
                        </div>
                      ) : activity.type === "chat" ? (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-purple-300" />
                        </div>
                      ) : activity.type === "assignment" ? (
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <FaUsers className="w-5 h-5 text-indigo-300" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {activity.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-gray-500 text-xs">
                          {(typeof activity.createdAt === "string"
                            ? new Date(activity.createdAt)
                            : activity.createdAt
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {(typeof activity.createdAt === "string"
                            ? new Date(activity.createdAt)
                            : activity.createdAt
                          ).toLocaleTimeString()}
                        </p>
                        {activity.actor && (
                          <span className="text-xs text-gray-500">
                            by {activity.actor.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )))
              ) : (
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
        return <div>Select a view</div>;
    }
  };

  const getStatusIconLocal = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="text-green-400" />;
      case "reviewed":
        return <Eye className="text-blue-400" />;
      case "pending":
        return <Clock className="text-yellow-400" />;
      case "rejected":
        return <X className="text-red-400" />;
      case "completed":
        return <CheckCircle className="text-green-400" />;
      case "'in-progress'":
        return <Activity className="text-blue-400" />;
      default:
        return <AlertCircle className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  // Budget calculation functions
  const getTotalBudget = () => {
    if (selectedProject.pricing?.type === "fixed") {
      return parseFloat(selectedProject.pricing.fixedBudget || "0");
    } else if (selectedProject.pricing?.type === "hourly") {
      const hourlyRate = parseFloat(selectedProject.pricing.hourlyRate || "0");
      const estimatedHours = parseFloat(
        selectedProject.pricing.estimatedHours || "0"
      );
      return hourlyRate * estimatedHours;
    } else if (selectedProject.pricing?.type === "milestone") {
      return (selectedProject.milestones || []).reduce((total, milestone) => {
        return total + parseFloat(milestone.budget || "0");
      }, 0);
    }
    return 0;
  };

  const getTotalPaid = () => {
    return (projectData.payments || []).reduce((total, payment) => {
      if (
        payment.status === "approved" ||
        payment.status === "completed" ||
        payment.status === "paid"
      ) {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const calculateProjectBudget = (project: ProjectData): number => {
    if (project.pricing.type === "fixed" && project.pricing.fixedBudget) {
      return parseFloat(project.pricing.fixedBudget);
    }
    if (project.pricing.type === "milestone" && project.milestones) {
      return project.milestones.reduce(
        (total, milestone) => total + parseFloat(milestone.budget || "0"),
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
        (project.pricing.estimatedHours
          ? parseFloat(project.pricing.estimatedHours)
          : 0)
      );
    }
    return 0;
  };

  const handleProgressUpdate = async () => {
    try {
      toast.info("Updating project progress", `Progress: ${progressValue}%`);
      await onProgressUpdate(selectedProject._id, progressValue);
      setShowProgressModal(false);
    } catch (error) {
      toast.error(
        "Failed to update progress",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleAddUpdate = async () => {
    try {
      await onAddUpdate(selectedProject._id, updateForm);
      setUpdateForm({ title: "", description: "", type: "general" });
      setShowUpdateModal(false);
    } catch (error) {
      toast.error(
        "Failed to add update",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    onAddUpdate(selectedProject._id, updateForm);
    setShowUpdateModal(false);
    setUpdateForm({ title: "", description: "", type: "general" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedFile) return;

    onFileUpload(selectedProject._id, selectedFile);
    setShowFileUploadModal(false);
    setSelectedFile(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const newPayment = {
      id: `temp-${Date.now()}`,
      ...paymentForm,
      amount: parseFloat(paymentForm.amount.toString()),
      status: "pending", // Admin sets payment to pending initially
      submittedBy: "admin",
    };

    onPaymentRecord(selectedProject._id, newPayment);
    setShowPaymentModal(false);
    setPaymentForm({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      method: DEFAULT_PAYMENT_METHOD,
      status: "completed",
      notes: "",
    });
  };

  // File CRUD operations
  const handleAddFile = async () => {
    if (newFile.fileName && newFile.fileUrl) {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `/api/projects/${selectedProject._id}/files`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: newFile.fileName,
              fileUrl: newFile.fileUrl,
              fileType: newFile.fileType || "document",
              uploadedBy: "admin",
              ...(newFile.fileSize && { fileSize: newFile.fileSize }),
              ...(newFile.description && { description: newFile.description }),
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          const file: ProjectFile = {
            id: result.file.id || Date.now().toString(),
            fileName: newFile.fileName,
            fileUrl: newFile.fileUrl,
            createdAt: new Date(),
            fileType: (newFile.fileType || "document") as FileType,
            uploadedBy: "admin",
            ...(newFile.fileSize && { fileSize: newFile.fileSize }),
            ...(newFile.description && { description: newFile.description }),
          };
          setProjectData((prevData) => ({
            ...prevData,
            files: [...(prevData.files || []), file],
          }));
          setNewFile({});
          setShowAddFile(false);
        } else {
          toast.error("Failed to add file", result.error);
        }
      } catch (error) {
        toast.error(
          "Error adding file",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  };

  const handleUpdateFile = async (
    id: string,
    updatedFile: Partial<ProjectFile>
  ) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/projects/${selectedProject._id}/files/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedFile),
        }
      );

      if (response.ok) {
        setProjectData((prevData) => ({
          ...prevData,
          files:
            prevData.files?.map((file) =>
              file.id === id ? { ...file, ...updatedFile } : file
            ) || [],
        }));
      } else {
        toast.error("Failed to update file");
      }
    } catch (error) {
      toast.error(
        "Error updating file",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/projects/${selectedProject._id}/files/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setProjectData((prevData) => ({
          ...prevData,
          files: prevData.files?.filter((file) => file.id !== id) || [],
        }));
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      toast.error(
        "Error deleting file",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  // Milestone CRUD operations
  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.description) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        description: newMilestone.description,
        budget: newMilestone.budget || "0",
        timeline: newMilestone.timeline || "",
        status: (newMilestone.status || "pending") as MilestoneStatus,
        dueDate: newMilestone.dueDate || new Date(),
        order: (projectData.milestones?.length || 0) + 1,
        deliverables: newMilestone.deliverables || [],
      };
      setProjectData((prevData) => ({
        ...prevData,
        milestones: [...(prevData.milestones || []), milestone],
      }));
      setNewMilestone({});
      setShowAddMilestone(false);
    }
  };

  const handleUpdateMilestone = (
    id: string,
    updatedMilestone: Partial<Milestone>
  ) => {
    setProjectData((prevData) => ({
      ...prevData,
      milestones:
        prevData.milestones?.map((milestone) =>
          milestone.id === id
            ? { ...milestone, ...updatedMilestone }
            : milestone
        ) || [],
    }));
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: string) => {
    setProjectData((prevData) => ({
      ...prevData,
      milestones:
        prevData.milestones?.filter((milestone) => milestone.id !== id) || [],
    }));
  };

  // Payment CRUD operations
  const handleAddPaymentLocal = () => {
    if (newPayment.amount && newPayment.date) {
      const payment: Payment = {
        id: Date.now().toString(),
        amount: Number(newPayment.amount),
        date: newPayment.date,
        method: newPayment.method || "Unknown",
        ...(newPayment.currency && {
          currency: newPayment.currency as "USD" | "KES",
        }),
        ...(newPayment.status && {
          status: newPayment.status as PaymentStatus,
        }),
        ...(newPayment.description && { description: newPayment.description }),
        ...(newPayment.notes && { notes: newPayment.notes }),
        ...(newPayment.invoiceUrl && { invoiceUrl: newPayment.invoiceUrl }),
      };
      setProjectData((prevData) => ({
        ...prevData,
        payments: [...(prevData.payments || []), payment],
      }));
      setNewPayment({});
      setShowAddPayment(false);
    }
  };

  const handleUpdatePayment = (
    id: string,
    updatedPayment: Partial<Payment>
  ) => {
    setProjectData((prevData) => ({
      ...prevData,
      payments:
        prevData.payments?.map((payment) =>
          payment.id === id ? { ...payment, ...updatedPayment } : payment
        ) || [],
    }));
    setEditingPayment(null);
  };

  const handleDeletePayment = (id: string) => {
    setProjectData((prevData) => ({
      ...prevData,
      payments: prevData.payments?.filter((payment) => payment.id !== id) || [],
    }));
  };

  // Payment approval functions
  const approvePayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/payment-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "approve",
          projectId: selectedProject._id,
          paymentId: paymentId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        const updatedStatus = {
          status: "approved" as const,
          approvedBy: currentUser?.id || "admin",
          approvedAt: new Date().toISOString(),
        };
        handleUpdatePayment(paymentId, updatedStatus);

        // Show success message
        toast.success("Payment approved successfully");
      } else {
        toast.error("Failed to approve payment", result.error);
      }
    } catch (error) {
      toast.error(
        "Error approving payment",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const rejectPayment = async (paymentId: string, reason: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/payment-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "reject",
          projectId: selectedProject._id,
          paymentId: paymentId,
          rejectionReason: reason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        const updatedStatus = {
          status: "rejected" as const,
          rejectedBy: currentUser?.id || "admin",
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
        };
        handleUpdatePayment(paymentId, updatedStatus);

        // Show success message
        toast.success("Payment rejected successfully");
      } else {
        toast.error("Failed to reject payment", result.error);
      }
    } catch (error) {
      toast.error(
        "Error rejecting payment",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  // Milestone approval functions
  const approveMilestone = async (milestoneId: string) => {
    const updatedStatus = {
      status: "approved" as const,
      approvedBy: "adminName", // replace with actual admin identifier
      approvedAt: new Date().toISOString(),
    };

    handleUpdateMilestone(milestoneId, updatedStatus);
  };

  const rejectMilestone = async (milestoneId: string, reason: string) => {
    const updatedStatus = {
      status: "rejected" as const,
      rejectedBy: "adminName", // replace with actual admin identifier
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    };

    handleUpdateMilestone(milestoneId, updatedStatus);
  };

  // Updates operations
  const handleAddUpdateLocal = () => {
    if (newUpdate.title && newUpdate.description) {
      const update: ProjectUpdate = {
        id: Date.now().toString(),
        title: newUpdate.title,
        description: newUpdate.description,
        type: (newUpdate.type || "general") as UpdateType,
        createdAt: new Date(),
        author: "Admin",
      };
      setProjectData((prevData) => ({
        ...prevData,
        updates: [update, ...(prevData.updates || [])],
      }));
      setNewUpdate({});
    }
  };

  const handleReply = (updateId: string) => {
    if (replyText.trim()) {
      const reply: ProjectUpdate = {
        id: Date.now().toString(),
        title: "Admin Response",
        description: replyText,
        type: "admin_response",
        createdAt: new Date(),
        author: "Admin",
        isAdminResponse: true,
        parentUpdateId: updateId,
      };
      setProjectData((prevData) => ({
        ...prevData,
        updates: [reply, ...(prevData.updates || [])],
      }));
      setReplyText("");
      setReplyingTo(null);
    }
  };
  // Get project-specific activity data
  const recentActivity =
    activityData?.activities ||
    [
      // Project updates
      ...(projectData.updates || []).map((u) => ({
        id: u.id,
        type: "update" as const,
        title: u.title,
        description: u.description,
        createdAt: u.createdAt,
        actor: {
          id: "admin",
          name: u.author || "Admin",
          role: "admin",
        },
        activityType: "update",
      })),
      // Completed milestones
      ...(projectData.milestones || [])
        .filter((m) => m.completedAt)
        .map((m) => ({
          id: m.id,
          type: "milestone" as const,
          title: `Milestone Completed: ${m.title}`,
          description: m.description || "Milestone completed successfully",
          createdAt: m.completedAt!,
          actor: {
            id: "system",
            name: "System",
            role: "system",
          },
          activityType: "milestone",
        })),
      // Payment records
      ...(projectData.payments || [])
        .filter((p) => p.status === "approved" || p.status === "completed")
        .map((p) => ({
          id: p.id,
          type: "payment" as const,
          title: `Payment ${
            p.status === "completed" ? "Completed" : "Approved"
          }`,
          description: `Payment of ${formatCurrencyLocal(
            p.amount,
            (p.currency || "USD") as "USD" | "KES"
          )} via ${p.method}`,
          createdAt: p.date || new Date().toISOString(),
          actor: {
            id: "admin",
            name: "Admin",
            role: "admin",
          },
          activityType: "payment",
        })),
      // Project status changes
      // File uploads
      ...(projectData.files || []).map((file) => ({
        id: file.id,
        type: "file" as const,
        title: "File Uploaded",
        description: `File "${file.fileName}" was uploaded to the project`,
        createdAt: file.createdAt,
        actor: {
          id: "admin",
          name: file.uploadedBy || "Admin",
          role: "admin",
        },
        activityType: "file",
      })),
      // Chat messages (fetch from project chat data if available)
      ...((projectData as any).chats || []).map((chat: any) => ({
        id: chat.id,
        type: "chat" as const,
        title: "New Message in Chat",
        description: chat.message,
        createdAt: chat.createdAt,
        actor: chat.sender,
        activityType: "chat",
      })),
      // Assignment activities (if there are any developer assignments)
      ...((projectData as any).assignments || []).map((assignment: any) => ({
        id: assignment.id,
        type: "assignment" as const,
        title: "Developer Assigned",
        description: `${
          assignment.developerName || "Developer"
        } was assigned to the project`,
        createdAt: assignment.assignedAt || assignment.createdAt,
        actor: {
          id: "admin",
          name: "Admin",
          role: "admin",
        },
        activityType: "assignment",
      })),
      // Project status changes
      ...(selectedProject.status !== "pending"
        ? [
            {
              id: `status-${selectedProject._id}`,
              type: "system" as const,
              title: `Project Status Updated`,
              description: `Project status changed to ${selectedProject.status.replace(
                "_",
                " "
              )}`,
              createdAt: selectedProject.updatedAt || selectedProject.createdAt,
              actor: {
                id: "system",
                name: "System",
                role: "system",
              },
              activityType: "system",
            },
          ]
        : []),
    ]
      .sort(
        (a, b) =>
          (typeof b.createdAt === "string"
            ? new Date(b.createdAt)
            : b.createdAt
          ).getTime() -
          (typeof a.createdAt === "string"
            ? new Date(a.createdAt)
            : a.createdAt
          ).getTime()
      )
      .slice(0, 10); // Show more activities for better project tracking

  return (
    <div className="bg-black/5 min-h-screen rounded-lg">
      {/* Header Section */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60 shadow-2xl border border-purple-500/30 rounded-2xl p-8 mb-8 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
              >
                <FaArrowCircleLeft className="w-5 h-5" />
                <span>Back to Projects</span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {selectedProject.projectDetails.title}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedProject.projectDetails.category}
                </p>
              </div>
            </div>

            {/* Progress and Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm font-medium">
                  {selectedProject.progress}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIconLocal(selectedProject.status)}
                <span className="text-white font-medium capitalize">
                  {selectedProject.status.replace("_", " ")}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                  selectedProject.priority
                )}`}
              >
                {selectedProject.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Project Tracking Navigation */}
      <div className="bg-white/10 shadow-xl backdrop-blur-xl border border-gray-500/20 rounded-2xl p-4 mb-8 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-70"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto md:overflow-x-visible py-2">
            {[
              { id: "overview", label: "Overview", icon: Target },
              { id: "milestones", label: "Milestones", icon: CheckCircle },
              { id: "budget", label: "Budget & Payments", icon: DollarSign },
              { id: "files", label: "Files", icon: FileText },
              { id: "updates", label: "Updates", icon: MessageSquare },
              { id: "activity", label: "Activity", icon: Activity },
              { id: "assignments", label: "Assignments", icon: FaUsers },
              { id: "chat", label: "Chat", icon: FaComment },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTrackingView(tab.id as TrackingView)}
                  className={`cursor-pointer flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    trackingView === tab.id
                      ? "bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg shadow-indigo-500/25 scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-xs monty uppercase">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {trackingView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Overview Card */}
              <div className="bg-black/5 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600/50">
                      <FaProjectDiagram className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Project Overview
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Project details and progress
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="px-4 py-2 bg-white/5 cursor-pointer hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span className="font-medium">Update Progress</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Description Section */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Description
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 border border-gray-700/30">
                      <p className="text-gray-300 leading-relaxed">
                        {selectedProject.projectDetails.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-gray-700/30">
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                          Timeline
                        </p>
                      </div>
                      <p className="text-white font-medium">
                        {selectedProject.projectDetails.timeline}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-gray-700/30">
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                          Priority
                        </p>
                      </div>
                      <p className="text-white font-medium capitalize">
                        {selectedProject.projectDetails.priority}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-gray-700/30">
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                          Progress
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="text-white font-medium">
                          {selectedProject.progress}%
                        </p>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technology Stack */}
                  {(selectedProject.projectDetails?.techStack || []).length >
                    0 && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">
                        Technology Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProject.projectDetails?.techStack || []).map(
                          (tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm border border-gray-600/30"
                            >
                              {tech}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Requirements
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 border border-gray-700/30">
                      <p className="text-gray-300 leading-relaxed">
                        {selectedProject.projectDetails.requirements ? (
                          selectedProject.projectDetails.requirements
                        ) : (
                          <span className="text-gray-500 italic">
                            No requirements provided.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information Card */}
              <div className="bg-black/5 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600/50">
                      <FaDollarSign className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Pricing Details
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Budget and payment information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-white/5 cursor-pointer hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaCreditCard className="w-4 h-4" />
                    <span className="font-medium">Record Payment</span>
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Main Budget Display */}
                  <div className="relative">
                    <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                      <div className="text-center">
                        <p className="text-green-300 text-sm font-semibold tracking-wide uppercase mb-3">
                          Total Project Budget
                        </p>
                        <p className="text-3xl font-semibold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover/budget:from-green-300 group-hover/budget:via-emerald-300 group-hover/budget:to-teal-300 transition-all duration-300">
                          {formatCurrencyLocal(
                            calculateProjectBudget(selectedProject),
                            selectedProject.pricing.currency
                          )}
                        </p>
                        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full opacity-60"></div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Model Section */}
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-4">
                      <h4 className="text-lg font-medium !bg-gradient-to-r from-green-200 to-emerald-200 !bg-clip-text !text-transparent">
                        Pricing Model
                      </h4>
                    </div>

                    <div className=" h-fit bg-white/10 rounded-2xl px-4 py-3 border border-green-500/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-green-300 text-sm font-semibold tracking-wide uppercase monty">
                              Billing Type
                            </p>
                            <p className="text-white font-medium text-base capitalize mt-1">
                              {selectedProject.pricing.type}
                            </p>
                          </div>
                        </div>

                        <div className="px-3 py-1 rounded-xl border border-green-500/40 backdrop-blur-sm">
                          <span className="text-green-100 font-semibold text-sm uppercase tracking-wider">
                            {selectedProject.pricing.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status or Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group/stat bg-gradient-to-br from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 rounded-2xl px-4 py-3 h-fit border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <p className="text-blue-300 text-sm monty font-semibold tracking-wide uppercase">
                          Payment Status
                        </p>
                      </div>
                      <p className="text-white font-medium text-base group-hover/stat:text-blue-100 transition-colors">
                        Active
                      </p>
                    </div>

                    <div className="group/stat bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl px-4 py-3 h-fit border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <p className="text-purple-300 text-sm font-semibold tracking-wide uppercase monty">
                          Last Updated
                        </p>
                      </div>
                      <p className="text-white font-medium text-base group-hover/stat:text-purple-100 transition-colors">
                        Today
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Client Info & Actions */}
            <div className="space-y-8">
              {/* Client Information Card */}
              <div className="bg-black/5 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600/50">
                      <FaUser className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Client Details
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Contact information and profile
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Client Profile Section */}
                  <div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-gray-700/30">
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {selectedProject.userInfo?.firstName?.[0] || "U"}
                              {selectedProject.userInfo?.lastName?.[0] || "U"}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>

                        <h4 className="text-xl font-medium text-white mb-2">
                          {selectedProject.userInfo?.firstName || "Unknown"}{" "}
                          {selectedProject.userInfo?.lastName || ""}
                        </h4>

                        <div className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-600/50">
                          <svg
                            className="w-4 h-4 text-gray-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <p className="text-gray-100 font-medium text-sm">
                            {selectedProject.userInfo?.company ||
                              "Independent Client"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Grid */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-white">
                        Contact Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Email Contact */}
                      <div className="bg-black/10 rounded-lg px-4 py-3 border border-gray-700/30">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                            <FaEnvelope className="text-gray-300 text-md" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-1">
                              Email Address
                            </p>
                            <p className="text-white font-medium text-base">
                              {selectedProject.userInfo?.email ||
                                "No email provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="bg-black/10 rounded-lg px-4 py-3 border border-gray-700/30">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                            <FaPhone className="text-gray-300 text-md" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-1">
                              Phone Number
                            </p>
                            <p className="text-white font-medium text-base">
                              {selectedProject.userInfo?.phone ||
                                "No number provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/10 rounded-lg px-4 py-3 border border-gray-700/30">
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm font-medium uppercase">
                          Status
                        </p>
                      </div>
                      <p className="text-white font-medium text-base">
                        Active Client
                      </p>
                    </div>

                    <div className="bg-black/10 rounded-lg px-4 py-3 border border-gray-700/30">
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm font-medium uppercase">
                          Since
                        </p>
                      </div>
                      <p className="text-white font-medium text-base">
                        Jan 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card */}
              <div className="bg-black/5 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600/50">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Project Actions
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Manage project status and updates
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="p-3 bg-white/5 cursor-pointer hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaComment className="w-4 h-4" />
                    {/* <span className="font-medium">Updates</span> */}
                  </button>
                </div>

                <div className="space-y-5 mb-6">
                  {/* Quick Status Overview */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-white">
                        Current Status
                      </h4>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 border border-gray-700/30">
                      <span className="font-medium text-sm uppercase text-gray-300">
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-white">
                        Available Actions
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Pending/Reviewed State Actions */}
                      {(selectedProject.status === "pending" ||
                        selectedProject.status === "reviewed") && (
                        <>
                          {/* Approve Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "in-progress")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-green-600/20 text-gray-300 hover:text-green-400 cursor-pointer border border-gray-600/50 hover:border-green-500/50"
                          >
                            <FaCheckCircle className="text-sm" />
                            <span className="font-medium">Approve Project</span>
                          </button>
                          {/* Reject Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "rejected")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 cursor-pointer border border-gray-600/50 hover:border-red-500/50"
                          >
                            <FaTimesCircle className="text-sm" />
                            <span className="font-medium">Reject Project</span>
                          </button>
                        </>
                      )}

                      {/* In Progress State Actions */}
                      {selectedProject.status === "in-progress" && (
                        <>
                          {/* Mark as Complete Button */}
                          <button
                            onClick={() => {
                              setProgressValue(100);
                              setShowProgressModal(true);
                            }}
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 cursor-pointer border border-gray-600/50 hover:border-blue-500/50"
                          >
                            <FaCheckCircle className="text-sm" />
                            <span className="font-medium">
                              Mark as Completed
                            </span>
                          </button>
                          {/* On Hold Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "on_hold")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-orange-600/20 text-gray-300 hover:text-orange-400 cursor-pointer border border-gray-600/50 hover:border-orange-500/50"
                          >
                            <FaClock className="text-sm" />
                            <span className="font-medium">Put On Hold</span>
                          </button>
                          {/* Cancel Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "cancelled")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 cursor-pointer border border-gray-600/50 hover:border-red-500/50"
                          >
                            <FaTimesCircle className="text-sm" />
                            <span className="font-medium">Cancel Project</span>
                          </button>
                        </>
                      )}

                      {/* On Hold State Actions */}
                      {selectedProject.status === "on_hold" && (
                        <>
                          {/* Resume Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "in-progress")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-green-600/20 text-gray-300 hover:text-green-400 cursor-pointer border border-gray-600/50 hover:border-green-500/50"
                          >
                            <FaPlay className="text-sm" />
                            <span className="font-medium">Resume Project</span>
                          </button>
                          {/* Cancel Button */}
                          <button
                            onClick={() =>
                              onStatusUpdate(selectedProject._id, "cancelled")
                            }
                            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 cursor-pointer border border-gray-600/50 hover:border-red-500/50"
                          >
                            <FaTimesCircle className="text-sm" />
                            <span className="font-medium">Cancel Project</span>
                          </button>
                        </>
                      )}

                      {/* Completed, Cancelled, Rejected States */}
                      {(selectedProject.status === "completed" ||
                        selectedProject.status === "cancelled" ||
                        selectedProject.status === "rejected") && (
                        <div className="text-center text-gray-400 p-4 bg-black/20 rounded-2xl border border-white/10">
                          <p>No further actions available for this project.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action History or Notes */}
                </div>
              </div>
            </div>
          </div>
        )}

        {trackingView === "milestones" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Milestones & Approvals
              </h2>
            </div>

            {/* Milestone Approval Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Pending Milestone Approvals
              </h3>
              {(projectData.milestones || []).filter(
                (m) => m.status === "pending" && m.submittedBy === "client"
              ).length > 0 ? (
                <div className="space-y-4">
                  {(projectData.milestones || [])
                    .filter(
                      (m) =>
                        m.status === "pending" && m.submittedBy === "client"
                    )
                    .map((milestone) => (
                      <div
                        key={milestone.id}
                        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-white font-medium">
                                {milestone.title}
                              </span>
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs border border-yellow-500/30">
                                Pending Approval
                              </span>
                            </div>
                            <p className="text-gray-300 mb-3">
                              {milestone.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Budget:</span>
                                <p className="text-white font-medium">
                                  ${milestone.budget}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Timeline:</span>
                                <p className="text-white font-medium">
                                  {milestone.timeline}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Due Date:</span>
                                <p className="text-white font-medium">
                                  {milestone.dueDate
                                    ? new Date(
                                        milestone.dueDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Submitted By:
                                </span>
                                <p className="text-white font-medium">Client</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => approveMilestone(milestone.id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Reason for rejection:");
                                if (reason)
                                  rejectMilestone(milestone.id, reason);
                              }}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400">No pending milestone approvals</p>
              )}
            </div>

            {(projectData.milestones || []).length > 0 ? (
              <div className="space-y-4">
                {(projectData.milestones || [])
                  .sort((a, b) => a.order - b.order)
                  .map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {milestone.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  milestone.status === "completed"
                                    ? "bg-green-500/20 text-green-300"
                                    : milestone.status === "in-progress"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : milestone.status === "cancelled"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-gray-500/20 text-gray-300"
                                }`}
                              >
                                {(milestone.status ?? "pending").replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-3">
                              {milestone.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Due: {milestone.timeline}</span>
                              {milestone.completedAt && (
                                <span>
                                  Completed:{" "}
                                  {new Date(
                                    milestone.completedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-green-400 font-semibold text-xl">
                            {formatCurrencyLocal(
                              parseFloat(milestone.budget),
                              selectedProject.pricing.currency
                            )}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            {milestone.status !== "completed" && (
                              <button
                                onClick={() =>
                                  onMilestoneUpdate(
                                    selectedProject._id,
                                    milestone.id,
                                    {
                                      status:
                                        milestone.status === "in-progress"
                                          ? "completed"
                                          : "in-progress",
                                      completedAt:
                                        milestone.status === "in-progress"
                                          ? new Date()
                                          : undefined,
                                    }
                                  )
                                }
                                className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded text-xs border border-indigo-500/30 transition-all"
                              >
                                {milestone.status === "in-progress"
                                  ? "Complete"
                                  : "Start"}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditMilestone(milestone);
                                setMilestoneForm({
                                  title: milestone.title,
                                  description: milestone.description,
                                  budget: milestone.budget,
                                  timeline: milestone.timeline,
                                });
                              }}
                              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs border border-yellow-500/30 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete milestone \"${milestone.title}\"? This cannot be undone.`
                                  )
                                ) {
                                  onMilestoneUpdate(
                                    selectedProject._id,
                                    milestone.id,
                                    {
                                      status: "cancelled",
                                    }
                                  );
                                }
                              }}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-500/30 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No milestones defined for this project
                </p>
              </div>
            )}
          </div>
        )}

        {trackingView === "updates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Project Updates
              </h2>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300"
              >
                <FaPlus />
                <span>Add Update</span>
              </button>
            </div>

            {(projectData.updates || []).length > 0 ? (
              <div className="space-y-4">
                {(projectData.updates || [])
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((update) => (
                    <div
                      key={update.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-3"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {update.title}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {new Date(update.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">
                            {update.description}
                          </p>
                          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                            {update.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaComment className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No updates posted for this project
                </p>
              </div>
            )}
          </div>
        )}

        {trackingView === "files" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Project Files
              </h2>
              <button
                onClick={() => setShowFileUploadModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300"
              >
                <FaPlus />
                <span>Upload File</span>
              </button>
            </div>

            {(projectData.files || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(projectData.files || []).map((file) => (
                  <div
                    key={file.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <FaFileAlt className="text-indigo-400 text-xl" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {file.fileName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {file.fileSize
                            ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                            : "Unknown size"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded text-xs border border-indigo-500/30 transition-all"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaFileAlt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  No files uploaded for this project
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-all cursor-pointer">
                  <FaUpload className="w-4 h-4 mr-2" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onFileUpload(selectedProject._id, file);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {trackingView === "activity" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Recent Activity
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              All project activities including updates, milestones, payments,
              file uploads, chat messages, and assignments.
            </p>

            {/* Loading State */}
            {activityLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400">Loading activity...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {activityError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-red-300 font-medium mb-1">
                      Failed to load activity
                    </h3>
                    <p className="text-red-400 text-sm">
                      Showing fallback data. Please refresh to try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Content */}
            {!activityLoading && (
              <div className="space-y-4">
                {recentActivity.map((activity: ActivityItem) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start space-x-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === "milestone" ? (
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        </div>
                      ) : activity.type === "update" ? (
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-300" />
                        </div>
                      ) : activity.type === "payment" ? (
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-300" />
                        </div>
                      ) : activity.type === "chat" ? (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-purple-300" />
                        </div>
                      ) : activity.type === "file" ? (
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <FileText className="w-5 h-5 text-indigo-300" />
                        </div>
                      ) : activity.type === "assignment" ? (
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <FaUsers className="w-5 h-5 text-orange-300" />
                        </div>
                      ) : activity.type === "system" ? (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-300" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-400">
                          {(typeof activity.createdAt === "string"
                            ? new Date(activity.createdAt)
                            : activity.createdAt
                          ).toLocaleDateString()}
                        </span>
                        {activity.actor && (
                          <span className="text-xs text-gray-500">
                            by {activity.actor.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
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
            )}
          </div>
        )}

        {trackingView === "budget" && (
          <div className="space-y-8">
            {/* Budget Overview */}
            <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Budget Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/20">
                  <h3 className="text-green-300 font-semibold mb-2">
                    Total Budget
                  </h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrencyLocal(
                      getTotalBudget(),
                      selectedProject.pricing?.currency || "USD"
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-xl border border-blue-500/20">
                  <h3 className="text-blue-300 font-semibold mb-2">
                    Amount Paid
                  </h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrencyLocal(
                      getTotalPaid(),
                      selectedProject.pricing?.currency || "USD"
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-purple-300 font-semibold mb-2">
                    Remaining
                  </h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrencyLocal(
                      getTotalBudget() - getTotalPaid(),
                      selectedProject.pricing?.currency || "USD"
                    )}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    Budget Progress
                  </span>
                  <span className="text-white font-medium">
                    {Math.round((getTotalPaid() / getTotalBudget()) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (getTotalPaid() / getTotalBudget()) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payments Section */}
            <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Payments & Approvals
                </h2>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              </div>

              {/* Payment Tabs */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePaymentTab("pending")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activePaymentTab === "pending"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Pending Approvals
                    {(projectData.payments || []).filter(
                      (p: Payment) =>
                        p.status === "pending" && p.submittedBy === "client"
                    ).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-yellow-500 text-black rounded-full">
                        {
                          (projectData.payments || []).filter(
                            (p: Payment) =>
                              p.status === "pending" &&
                              p.submittedBy === "client"
                          ).length
                        }
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActivePaymentTab("history")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activePaymentTab === "history"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Payment History
                    {(projectData.payments || []).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-500 text-white rounded-full">
                        {(projectData.payments || []).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activePaymentTab === "pending" && (
                  <div>
                    {(projectData.payments || []).filter(
                      (p: Payment) =>
                        p.status === "pending" && p.submittedBy === "client"
                    ).length > 0 ? (
                      <div className="space-y-4">
                        {(projectData.payments || [])
                          .filter(
                            (p: Payment) =>
                              p.status === "pending" &&
                              p.submittedBy === "client"
                          )
                          .map((payment: Payment) => (
                            <div
                              key={payment.id}
                              className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {payment.description || "Client Payment"}
                                    </h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                      Pending Approval
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      by {payment.submittedBy}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                      <span className="text-gray-400">
                                        Amount:
                                      </span>
                                      <p className="text-white font-medium">
                                        {formatCurrencyLocal(
                                          payment.amount,
                                          payment.currency || "USD"
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Date:
                                      </span>
                                      <p className="text-white font-medium">
                                        {payment.date
                                          ? new Date(
                                              payment.date
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Method:
                                      </span>
                                      <p className="text-white font-medium capitalize">
                                        {payment.method}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Submitted:
                                      </span>
                                      <p className="text-white font-medium">
                                        {payment.createdAt
                                          ? new Date(
                                              payment.createdAt
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  {payment.notes && (
                                    <div className="mt-2">
                                      <span className="text-gray-400 text-sm">
                                        Notes:
                                      </span>
                                      <p className="text-gray-300 text-sm">
                                        {payment.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => approvePayment(payment.id)}
                                    className="flex items-center space-x-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm transition-colors"
                                  >
                                    <span>✓</span>
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPaymentToReject(payment.id);
                                      setShowRejectModal(true);
                                    }}
                                    className="flex items-center space-x-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors cursor-pointer"
                                  >
                                    <span>✗</span>
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaCreditCard className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Pending Approvals
                        </h3>
                        <p className="text-gray-400">
                          All payments have been reviewed
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activePaymentTab === "history" && (
                  <div>
                    {(projectData.payments || []).length > 0 ? (
                      <div className="space-y-4">
                        {(projectData.payments || []).map(
                          (payment: Payment) => (
                            <div
                              key={payment.id}
                              className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {payment.description || "Payment"}
                                    </h3>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                        payment.status === "approved"
                                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                                          : payment.status === "rejected"
                                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                                          : payment.status === "pending"
                                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                          : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                      }`}
                                    >
                                      {payment.status || "pending"}
                                    </span>
                                    {payment.submittedBy && (
                                      <span className="text-xs text-gray-400">
                                        by {payment.submittedBy}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                      <span className="text-gray-400">
                                        Amount:
                                      </span>
                                      <p className="text-white font-medium">
                                        {formatCurrencyLocal(
                                          payment.amount,
                                          payment.currency || "USD"
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Date:
                                      </span>
                                      <p className="text-white font-medium">
                                        {payment.date
                                          ? new Date(
                                              payment.date
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Method:
                                      </span>
                                      <p className="text-white font-medium capitalize">
                                        {payment.method}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">
                                        Created:
                                      </span>
                                      <p className="text-white font-medium">
                                        {payment.createdAt
                                          ? new Date(
                                              payment.createdAt
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  {payment.rejectionReason && (
                                    <div className="mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                      <span className="text-red-400 text-sm font-medium">
                                        Rejection Reason:
                                      </span>
                                      <p className="text-red-300 text-sm mt-1">
                                        {payment.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                  {payment.notes && (
                                    <div className="mt-2 p-3 bg-gray-500/10 rounded-lg border border-gray-500/30">
                                      <span className="text-gray-400 text-sm font-medium">
                                        Notes:
                                      </span>
                                      <p className="text-gray-300 text-sm mt-1">
                                        {payment.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaCreditCard className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Payments Yet
                        </h3>
                        <p className="text-gray-400">
                          Payment history will appear here once recorded
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {trackingView === "assignments" && (
          <ProjectAssignments
            projectId={selectedProject._id}
            projectTitle={selectedProject.projectDetails.title}
            projectTechStack={selectedProject.projectDetails.techStack || []}
            projectExperienceLevel={
              selectedProject.projectDetails.experienceLevel || "Mid-level"
            }
            developers={developers}
          />
        )}

        {trackingView === "chat" && currentUser && (
          <ProjectChat
            projectId={selectedProject._id}
            projectTitle={selectedProject.projectDetails.title}
            currentUserId={currentUser.id}
            currentUserRole={
              currentUser.role as "admin" | "client" | "developer"
            }
            currentUserName={
              currentUser.name || currentUser.email || "Anonymous"
            }
          />
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Record Payment
            </h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, date: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      method: e.target.value as PaymentMethodType,
                    })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {getPaymentMethodsForCurrency(
                    selectedProject?.pricing?.currency || "USD"
                  ).map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Upload File
            </h2>
            <form onSubmit={handleFileUploadSubmit}>
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {selectedFile && (
                  <p className="text-gray-300">Selected: {selectedFile.name}</p>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFileUploadModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                  disabled={!selectedFile}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Add Project Update
            </h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Update Title"
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, title: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <textarea
                  placeholder="Update Description"
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                />
                <select
                  value={updateForm.type}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, type: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="progress">Progress</option>
                  <option value="blocker">Blocker</option>
                  <option value="milestone_completed">
                    Milestone Completed
                  </option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-xl transform animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-semibold text-white mb-6">
              Edit Milestone
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={milestoneForm.title}
                onChange={(e) =>
                  setMilestoneForm({ ...milestoneForm, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              />
              <textarea
                rows={3}
                placeholder="Description"
                value={milestoneForm.description}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Budget"
                value={milestoneForm.budget}
                onChange={(e) =>
                  setMilestoneForm({ ...milestoneForm, budget: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Timeline"
                value={milestoneForm.timeline}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    timeline: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditMilestone(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onMilestoneUpdate(
                    selectedProject._id,
                    editMilestone.id,
                    {
                      title: milestoneForm.title,
                      description: milestoneForm.description,
                      budget: milestoneForm.budget,
                      timeline: milestoneForm.timeline,
                    }
                  );
                  setEditMilestone(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-xl transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Update Progress
              </h3>
              <p className="text-gray-400 text-sm">
                Track your project milestone
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Progress Percentage
                </label>

                {/* Custom slider track */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) =>
                      setProgressValue(parseInt(e.target.value, 10))
                    }
                    className="w-full h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full appearance-none cursor-pointer relative z-10 slider-enhanced"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${progressValue}%, #374151 ${progressValue}%, #374151 100%)`,
                    }}
                  />

                  {/* Progress indicator */}
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full shadow-lg transform -translate-y-1/2 pointer-events-none border-2 border-white/20"
                    style={{ left: `calc(${progressValue}% - 10px)` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full animate-pulse opacity-60"></div>
                  </div>
                </div>

                {/* Progress labels */}
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-gray-500 font-medium">0%</span>
                  <div className="text-center">
                    <span className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {progressValue}%
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Complete</div>
                  </div>
                  <span className="text-gray-500 font-medium">100%</span>
                </div>

                {/* Progress bar visualization */}
                <div className="mt-4 bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progressValue}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700/80 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowProgressModal(false);

                    const newStatus =
                      progressValue === 100 ? "completed" : "in-progress";

                    await onProgressUpdate(selectedProject._id, progressValue);

                    if (selectedProject.status !== newStatus) {
                      await onStatusUpdate(selectedProject._id, newStatus);
                    }

                    setProjectData((prev) => ({
                      ...prev!,
                      progress: progressValue,
                      status: newStatus,
                      actualCompletionDate:
                        progressValue === 100
                          ? prev?.actualCompletionDate || new Date()
                          : undefined,
                    }));
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover border border-white/20 rounded-3xl p-8 w-full max-w-lg shadow-2xl backdrop-blur-xl transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Add Project Update
              </h3>
              <p className="text-gray-400 text-sm">
                Share progress and keep everyone informed
              </p>
            </div>

            <div className="space-y-6">
              {/* Update Title */}
              <div className="relative">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Update Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter a descriptive title for your update..."
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        updateForm.title
                          ? "bg-blue-400 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Update Type */}
              <div className="relative">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Update Type
                </label>
                <div className="relative">
                  <select
                    value={updateForm.type}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, type: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    <option className="bg-black/70" value="general">
                      General Update
                    </option>
                    <option className="bg-black/70" value="progress">
                      Progress Report
                    </option>
                    <option className="bg-black/70" value="milestone">
                      Milestone Reached
                    </option>
                    <option className="bg-black/70" value="issue">
                      Issue/Challenge
                    </option>
                    <option className="bg-black/70" value="completed">
                      Task Completed
                    </option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Type indicator */}
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      updateForm.type === "general"
                        ? "bg-gray-400"
                        : updateForm.type === "progress"
                        ? "bg-blue-400"
                        : updateForm.type === "milestone"
                        ? "bg-purple-400"
                        : updateForm.type === "issue"
                        ? "bg-orange-400"
                        : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-gray-400 text-xs font-medium">
                    {updateForm.type === "general"
                      ? "Standard project update"
                      : updateForm.type === "progress"
                      ? "Progress tracking update"
                      : updateForm.type === "milestone"
                      ? "Important milestone achievement"
                      : updateForm.type === "issue"
                      ? "Issue or challenge notification"
                      : "Task completion notification"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="relative">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={updateForm.description}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200 backdrop-blur-sm"
                    placeholder="Provide detailed information about this update. What progress was made? What challenges were encountered? What's next?"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {updateForm.description.length}/500
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Update Preview */}
              {updateForm.title && updateForm.description && (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${
                        updateForm.type === "general"
                          ? "bg-gray-500"
                          : updateForm.type === "progress"
                          ? "bg-blue-500"
                          : updateForm.type === "milestone"
                          ? "bg-purple-500"
                          : updateForm.type === "issue"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    >
                      {updateForm.type === "general"
                        ? "📝"
                        : updateForm.type === "progress"
                        ? "📈"
                        : updateForm.type === "milestone"
                        ? "🎯"
                        : updateForm.type === "issue"
                        ? "⚠️"
                        : "✅"}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">
                        {updateForm.title}
                      </h4>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {updateForm.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUpdate}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg transform ${
                    !updateForm.title || !updateForm.description
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  disabled={!updateForm.title || !updateForm.description}
                >
                  <div className="flex items-center justify-center space-x-2">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Update</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                <span className="text-red-400 text-xl">✗</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Reject Payment
                </h2>
                <p className="text-gray-400 text-sm">
                  Please provide a reason for rejection
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for payment rejection..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none"
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setPaymentToReject(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim() && paymentToReject) {
                    rejectPayment(paymentToReject, rejectionReason.trim());
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setPaymentToReject(null);
                  }
                }}
                disabled={!rejectionReason.trim()}
                className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                  rejectionReason.trim()
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                    : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                }`}
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};

export default ProjectOverview;
