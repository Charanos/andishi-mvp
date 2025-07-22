"use client";

import React, { useState, useEffect, ReactElement } from "react";
import useSWR from "swr";
import {
  Target,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Activity,
  Code,
  Clock,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  MessageSquare,
  Reply,
  Send,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useProjectCRUD } from "@/hooks/useProjectCRUD";
import ProjectChatComponent from "../admin-dashboard/ProjectChat";
import ProjectAssignmentsComponent from "../admin-dashboard/ProjectAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useProjectAssignments } from "@/hooks/useProjectAssignments";
import { SystemUser } from "~/types";
import useToast from "../../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
  getPaymentMethodsForCurrency,
  formatPaymentMethodLabel,
  DEFAULT_PAYMENT_METHOD,
  PaymentMethodType,
} from "@/lib/paymentMethods";

export interface ActivityItem {
  id: string;
  type: "chat" | "assignment" | "milestone" | "payment" | "update" | "system";
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

interface FetcherError extends Error {
  info?: any;
  status?: number;
}

// Function to calculate due date from timeline
const calculateDueDate = (startDate: Date, timeline: string): Date | null => {
  if (!timeline || !startDate) return null;

  // Clean the timeline string
  const cleanTimeline = timeline.toLowerCase().trim();

  // Extract number and unit using regex
  const match = cleanTimeline.match(
    /(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years|d|w|m|y)/i
  );

  if (!match) return null;

  const timeValue = parseFloat(match[1]);
  const timeUnit = match[2].toLowerCase();

  const resultDate = new Date(startDate);

  switch (timeUnit) {
    case "day":
    case "days":
    case "d":
      resultDate.setDate(resultDate.getDate() + timeValue);
      break;
    case "week":
    case "weeks":
    case "w":
      resultDate.setDate(resultDate.getDate() + timeValue * 7);
      break;
    case "month":
    case "months":
    case "m":
      resultDate.setMonth(resultDate.getMonth() + timeValue);
      break;
    case "year":
    case "years":
    case "y":
      resultDate.setFullYear(resultDate.getFullYear() + timeValue);
      break;
    default:
      return null;
  }

  return resultDate;
};

// Function to calculate project completion date based on project type
const calculateProjectCompletionDate = (
  projectData: ProjectData
): Date | null => {
  const startDate = projectData.startDate
    ? new Date(projectData.startDate)
    : new Date();

  // If already has estimated completion date, use it
  if (projectData.estimatedCompletionDate) {
    return new Date(projectData.estimatedCompletionDate);
  }

  // Calculate based on project type
  switch (projectData.pricing?.type) {
    case "milestone":
      // For milestone projects, calculate based on milestones
      if (projectData.milestones && projectData.milestones.length > 0) {
        const totalDays = projectData.milestones.reduce((total, milestone) => {
          if (milestone.timeline) {
            const dueDate = calculateDueDate(startDate, milestone.timeline);
            if (dueDate) {
              const days = Math.ceil(
                (dueDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return total + days;
            }
          }
          return total;
        }, 0);

        if (totalDays > 0) {
          const completionDate = new Date(startDate);
          completionDate.setDate(completionDate.getDate() + totalDays);
          return completionDate;
        }
      }
      break;

    case "hourly":
      // For hourly projects, calculate based on estimated hours
      if (projectData.pricing.estimatedHours) {
        const hours = parseFloat(projectData.pricing.estimatedHours);
        // Assume 8 hours per day, 5 days per week
        const workDays = Math.ceil(hours / 8);
        const calendarDays = Math.ceil(workDays * 1.4); // Add weekends

        const completionDate = new Date(startDate);
        completionDate.setDate(completionDate.getDate() + calendarDays);
        return completionDate;
      }
      break;

    case "fixed":
    default:
      // For fixed projects, use project timeline if available
      if (projectData.projectDetails?.timeline) {
        return calculateDueDate(startDate, projectData.projectDetails.timeline);
      }
      break;
  }

  return null;
};

// Function to calculate milestone due date considering project start and previous milestones
const calculateMilestoneDueDate = (
  projectData: ProjectData,
  milestone: Milestone,
  milestoneIndex: number
): Date | null => {
  const projectStart = projectData.startDate
    ? new Date(projectData.startDate)
    : new Date();

  // If milestone already has a due date, use it
  if (milestone.dueDate) {
    return new Date(milestone.dueDate);
  }

  // Calculate based on milestone timeline
  if (milestone.timeline) {
    // For the first milestone, calculate from project start
    if (milestoneIndex === 0) {
      return calculateDueDate(projectStart, milestone.timeline);
    }

    // For subsequent milestones, calculate from previous milestone's due date
    const previousMilestone = projectData.milestones?.[milestoneIndex - 1];
    if (previousMilestone) {
      const previousDueDate = calculateMilestoneDueDate(
        projectData,
        previousMilestone,
        milestoneIndex - 1
      );
      if (previousDueDate) {
        return calculateDueDate(previousDueDate, milestone.timeline);
      }
    }
  }

  return null;
};

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
    try {
      error.info = await res.json();
    } catch (e: any) {
      error.info = { message: await res.text() };
    }
    error.status = res.status;
    console.error("API Error:", error.status, error.info);
    throw error;
  }

  return res.json();
};

import {
  ProjectData,
  Milestone,
  ProjectFile,
  Payment,
  ProjectUpdate,
  ProjectStatus,
} from "@/types";

type TrackingView =
  | "overview"
  | "timeline"
  | "milestones"
  | "budget"
  | "files"
  | "activity"
  | "chat"
  | "updates"
  | "assignments";

type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
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
const formatCurrency = (amount: number, currency: "USD" | "KES") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "in-progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    overdue: "bg-red-500/20 text-red-300 border-red-500/30",
    paid: "bg-green-500/20 text-green-300 border-green-500/30",
    partial: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    reviewed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    approved: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return colors[status] || colors.pending;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, ReactElement> = {
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

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-300",
    medium: "bg-yellow-500/20 text-yellow-300",
    high: "bg-red-500/20 text-red-300",
    urgent: "bg-red-500/20 text-red-300",
    critical: "bg-red-500/20 text-red-300",
  };
  return colors[priority] || colors.low;
};

interface EnhancedProjectTrackingProps {
  project: ProjectData;
  onBack: () => void;
}

export default function EnhancedProjectTracking({
  project,
  onBack,
}: EnhancedProjectTrackingProps) {
  const [trackingView, setTrackingView] = useState<TrackingView>("overview");
  const [projectData, setProjectData] = useState<ProjectData>(project);
  const { user } = useAuth();
  const { toast, notifications, removeNotification } = useToast();
  const {
    data: activityData,
    isLoading: loadingActivity,
    error: activityError,
  } = useSWR(
    projectData ? `/api/project-activity/${projectData._id}` : null,
    fetcher,
    {
      onError: (error) => {
        // Notify user of general activity fetch error
        toast.error(
          "Activity Fetch Error",
          "An error occurred while fetching activity data. Please try again later."
        );
        // Notify user of unexpected errors other than 404
        if (error?.status !== 404) {
          toast.error("Unexpected Error", "An unexpected error occurred.");
        }
      },
      revalidateOnFocus: false,
      shouldRetryOnError: (error) => {
        // Only retry on non-404 errors
        return error?.status !== 404;
      },
      errorRetryCount: 2, // Reduce retry count
      errorRetryInterval: 2000, // Wait 2 seconds between retries
    }
  );

  // Debug logging
  useEffect(() => {
    // Use these logs for debugging if needed, comment them out in production
    // console.log('Client Dashboard - Project Data:', projectData);
    // console.log('Client Dashboard - Milestones:', projectData.milestones);
    // console.log('Client Dashboard - Pricing:', projectData.pricing);
    // console.log('Client Dashboard - Payments:', projectData.payments);
    // console.log('Client Dashboard - Activity Data:', activityData);
    // console.log('Client Dashboard - Activity Error:', activityError);
  }, [projectData, activityData, activityError]);

  const {
    loading: crudLoading,
    error: crudError,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createFile,
    updateFile,
    deleteFile,
    createPayment,
    updatePayment,
    deletePayment,
    createUpdate,
    deleteUpdate,
  } = useProjectCRUD();

  // Fetch all developers for assignments component
  const [developers, setDevelopers] = useState<SystemUser[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);

  // Fetch developers for assignments
  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoadingDevelopers(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.warn("No auth token found, skipping developers fetch");
          return;
        }

        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            setDevelopers(
              data.users.filter((user: any) => user.role === "developer")
            );
          } else {
            toast.warning("No Data", "No user data was found in the response.");
          }
        } else {
          toast.error("Fetch Error", "Failed to fetch developer data.");
        }
      } catch (error) {
        toast.error(
          "Developer Fetch Error",
          "An error occurred while retrieving developer data."
        );
        // Notify user of unexpected errors other than 404
        if (error instanceof Error && !error.message.includes("404")) {
          toast.error(
            "Unexpected Error",
            "An unexpected error occurred while fetching developers."
          );
        }
      } finally {
        setLoadingDevelopers(false);
      }
    };

    // Only fetch if we're on the assignments view to avoid unnecessary API calls
    if (trackingView === "assignments") {
      fetchDevelopers();
    }
  }, [trackingView]);

  // Convert date strings to Date objects
  useEffect(() => {
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
              completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
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
              completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
              budget:
                typeof m.budget === "string"
                  ? m.budget
                  : String(m.budget || "0"),
              title: m.title || "Untitled Milestone",
              description: m.description || "No description provided",
              status: m.status || "pending",
            }));
          }

          // No fallback to mock data - use only database data
          // If pricing type is milestone but no milestones exist, return empty array
          // This ensures we only display real data from the database

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
          date: p.date
            ? typeof p.date === "string"
              ? p.date
              : new Date(p.date).toISOString().split("T")[0]
            : undefined,
          createdAt: p.createdAt
            ? typeof p.createdAt === "string"
              ? p.createdAt
              : new Date(p.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: p.updatedAt
            ? typeof p.updatedAt === "string"
              ? p.updatedAt
              : new Date(p.updatedAt).toISOString()
            : undefined,
        })),
      };
    };

    setProjectData(convertDates(project));
  }, [project]);

  // State for forms and modals
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<Partial<ProjectFile>>({});
  const [showAddFile, setShowAddFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingMilestoneData, setEditingMilestoneData] = useState<
    Partial<Milestone>
  >({});
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({});
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({});
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [newUpdate, setNewUpdate] = useState<Partial<ProjectUpdate>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Payment tab state
  const [activePaymentTab, setActivePaymentTab] = useState<
    "pending" | "history"
  >("pending");

  // Error and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation modal state
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
    onConfirm: () => {},
    variant: "info",
    loading: false,
  });

  // Show CRUD error if any
  useEffect(() => {
    if (crudError) {
      setError(crudError);
      setTimeout(() => setError(null), 5000);
    }
  }, [crudError]);

  // Calculate project statistics
  const totalMilestones = projectData.milestones?.length || 0;
  const completedMilestones = (projectData.milestones || []).filter(
    (m) => m.status === "completed"
  ).length;
  const milestoneProgress =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const totalBudget = (() => {
    switch (projectData.pricing?.type) {
      case "fixed":
        return projectData.pricing.fixedBudget
          ? parseFloat(projectData.pricing.fixedBudget)
          : 0;
      case "milestone":
        return (projectData.milestones || []).reduce(
          (sum, m) => sum + parseFloat(m.budget),
          0
        );
      case "hourly":
        return projectData.pricing.hourlyRate &&
          projectData.pricing.estimatedHours
          ? parseFloat(projectData.pricing.hourlyRate) *
              parseFloat(projectData.pricing.estimatedHours)
          : 0;
      default:
        return 0;
    }
  })();

  const spentBudget = (projectData.payments || []).reduce(
    (sum, p) => sum + p.amount,
    0
  );
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
  // File CRUD operations
  const handleAddFile = async () => {
    if (selectedFile && newFile.fileName) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", newFile.fileName!);
      formData.append("fileType", newFile.fileType || "document");
      formData.append("uploadedBy", "client");
      if (newFile.description) {
        formData.append("description", newFile.description);
      }

      try {
        const token = localStorage.getItem("auth_token");
        const userEmail = localStorage.getItem("userEmail");

        const response = await fetch(
          `/api/client-projects/${projectData._id}/files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "user-email": userEmail || "",
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (response.ok) {
          const file: ProjectFile = {
            id: result.file.id || Date.now().toString(),
            fileName: result.file.fileName,
            fileUrl: result.file.fileUrl,
            fileType: result.file.fileType as FileType,
            fileSize: result.file.fileSize,
            uploadedBy: "client",
            createdAt: new Date(),
            ...(newFile.description && { description: newFile.description }),
          };

          setProjectData((prev) => ({
            ...prev,
            files: [...(prev.files || []), file],
          }));
          setNewFile({});
          setSelectedFile(null);
          setShowAddFile(false);
          toast.success(
            "File uploaded",
            "The file has been successfully uploaded."
          );
        } else {
          toast.error(
            "Failed to upload file",
            result.error || "Please try again."
          );
        }
      } catch (error) {
        console.error("File upload error:", error);
        toast.error(
          "Failed to upload file",
          "An error occurred while uploading the file."
        );
      }
    } else {
      toast.warning(
        "Missing information",
        "Please select a file and provide a file name."
      );
    }
  };

  const handleUpdateFile = async (
    id: string,
    updatedFile: Partial<ProjectFile>
  ) => {
    const result = await updateFile(projectData._id, id, updatedFile);
    if (result.success) {
      setProjectData((prev) => ({
        ...prev,
        files:
          prev.files?.map((file) =>
            file.id === id ? { ...file, ...updatedFile } : file
          ) || [],
      }));
      setEditingFile(null);
    }
  };

  const handleDeleteFile = async (id: string) => {
    const file = projectData.files?.find((f) => f.id === id);
    if (!file) return;

    setConfirmationModal({
      isOpen: true,
      title: "Delete File",
      message: `Are you sure you want to delete the file "${file.fileName}"? This action cannot be undone.`,
      variant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, loading: true }));

        try {
          const token = localStorage.getItem("auth_token");
          const response = await fetch(
            `/api/client-projects/${projectData._id}/files?fileId=${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            setProjectData((prev) => ({
              ...prev,
              files: prev.files?.filter((file) => file.id !== id) || [],
            }));
            toast.success(
              "File deleted",
              "The file has been successfully deleted."
            );
          } else {
            toast.error(
              "Failed to delete file",
              result.error || "Please try again."
            );
          }
        } catch (error) {
          console.error("File deletion error:", error);
          toast.error(
            "Failed to delete file",
            "An error occurred while deleting the file."
          );
        }

        setConfirmationModal((prev) => ({
          ...prev,
          isOpen: false,
          loading: false,
        }));
      },
    });
  };

  // Milestone CRUD operations
  const handleAddMilestone = async () => {
    if (newMilestone.title && newMilestone.description) {
      const milestoneData: Omit<Milestone, "id"> = {
        title: newMilestone.title,
        description: newMilestone.description,
        budget: newMilestone.budget || "0",
        timeline: newMilestone.timeline || "",
        status: "pending" as ProjectStatus,
        submittedBy: "client" as const,
        dueDate: newMilestone.dueDate,
        order: (projectData.milestones || []).length + 1,
        deliverables: newMilestone.deliverables || [],
      };

      const result = await createMilestone(projectData._id, milestoneData);
      if (result.success) {
        const milestone: Milestone = {
          id: Date.now().toString(),
          ...milestoneData,
        };
        setProjectData((prev) => ({
          ...prev,
          milestones: [...(prev.milestones || []), milestone],
        }));
        setNewMilestone({});
        setShowAddMilestone(false);
        toast.success(
          "Milestone created",
          "The milestone has been successfully created."
        );
      } else {
        toast.error(
          "Failed to create milestone",
          result.error || "Please try again."
        );
      }
    } else {
      toast.warning(
        "Missing information",
        "Please fill in the title and description."
      );
    }
  };

  const handleUpdateMilestone = async (
    id: string,
    updatedMilestone: Partial<Milestone>
  ) => {
    const result = await updateMilestone(projectData._id, id, updatedMilestone);
    if (result.success) {
      setProjectData((prev) => ({
        ...prev,
        milestones:
          prev.milestones?.map((milestone) =>
            milestone.id === id
              ? { ...milestone, ...updatedMilestone }
              : milestone
          ) || [],
      }));
      setEditingMilestone(null);
      setEditingMilestoneData({});
      toast.success(
        "Milestone updated",
        "The milestone has been successfully updated."
      );
    } else {
      toast.error(
        "Failed to update milestone",
        result.error || "Please try again."
      );
    }
  };

  const handleStartEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditingMilestoneData({
      title: milestone.title,
      description: milestone.description,
      budget: milestone.budget,
      timeline: milestone.timeline,
    });
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestone(null);
    setEditingMilestoneData({});
  };

  const handleSaveMilestone = async () => {
    if (editingMilestone && editingMilestoneData) {
      await handleUpdateMilestone(editingMilestone, editingMilestoneData);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    const milestone = projectData.milestones?.find((m) => m.id === id);
    if (!milestone) return;

    setConfirmationModal({
      isOpen: true,
      title: "Delete Milestone",
      message: `Are you sure you want to delete the milestone "${milestone.title}"? This action cannot be undone.`,
      variant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, loading: true }));

        const result = await deleteMilestone(projectData._id, id);
        if (result.success) {
          setProjectData((prev) => ({
            ...prev,
            milestones:
              prev.milestones?.filter((milestone) => milestone.id !== id) || [],
          }));
          toast.success(
            "Milestone deleted",
            "The milestone has been successfully deleted."
          );
        } else {
          toast.error(
            "Failed to delete milestone",
            result.error || "Please try again."
          );
        }

        setConfirmationModal((prev) => ({
          ...prev,
          isOpen: false,
          loading: false,
        }));
      },
    });
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModal((prev) => ({
      ...prev,
      isOpen: false,
      loading: false,
    }));
  };

  // Payment CRUD operations
  const handleAddPayment = async () => {
    if (newPayment.amount && newPayment.date) {
      const paymentData = {
        amount: Number(newPayment.amount),
        date: newPayment.date,
        method: newPayment.method || "Unknown",
        status: "pending" as PaymentStatus,
        submittedBy: "client" as const,
        ...(newPayment.currency && {
          currency: newPayment.currency as "USD" | "KES",
        }),
        ...(newPayment.description && { description: newPayment.description }),
        ...(newPayment.notes && { notes: newPayment.notes }),
        ...(newPayment.invoiceUrl && { invoiceUrl: newPayment.invoiceUrl }),
      };

      // Remove or comment out console logs used for debugging
      // console.log('\n=== FRONTEND PAYMENT CREATION ===');
      // console.log('Payment data being sent:', paymentData);
      // console.log('Project ID:', projectData._id);

      const result = await createPayment(projectData._id, paymentData);
      // console.log('Payment creation result:', result);

      if (result.success) {
        const payment: Payment = {
          id: Date.now().toString(),
          ...paymentData,
          createdAt: new Date().toISOString(),
        };

        // console.log('Adding payment to local state:', payment);

        setProjectData((prev) => ({
          ...prev,
          payments: [...(prev.payments || []), payment],
        }));
        setNewPayment({});
        setShowAddPayment(false);
        toast.success(
          "Payment added",
          "The payment has been successfully added."
        );
      } else {
        toast.error(
          "Failed to add payment",
          result.error || "Please try again."
        );
      }
    } else {
      toast.warning(
        "Missing information",
        "Please fill in the amount and date."
      );
    }
  };

  const handleUpdatePayment = async (
    id: string,
    updatedPayment: Partial<Payment>
  ) => {
    const result = await updatePayment(projectData._id, id, updatedPayment);
    if (result.success) {
      setProjectData((prev) => ({
        ...prev,
        payments:
          prev.payments?.map((payment) =>
            payment.id === id ? { ...payment, ...updatedPayment } : payment
          ) || [],
      }));
      setEditingPayment(null);
      setNewPayment({}); // Reset the form
      toast.success(
        "Payment updated",
        "The payment has been successfully updated."
      );
    } else {
      toast.error(
        "Failed to update payment",
        result.error || "Please try again."
      );
    }
  };

  const handleStartEditPayment = (payment: Payment) => {
    setEditingPayment(payment.id);
    setNewPayment({
      amount: payment.amount,
      description: payment.description,
      date: payment.date,
      method: payment.method,
      currency: payment.currency,
    });
  };

  const handleCancelEditPayment = () => {
    setEditingPayment(null);
    setNewPayment({});
  };

  const handleDeletePayment = async (id: string) => {
    const payment = projectData.payments?.find((p) => p.id === id);
    if (!payment) return;

    const paymentDescription = payment.description || "Payment";
    const paymentAmount = formatCurrency(
      payment.amount,
      payment.currency || "USD"
    );

    setConfirmationModal({
      isOpen: true,
      title: "Delete Payment",
      message: `Are you sure you want to delete the payment "${paymentDescription}" (${paymentAmount})? This action cannot be undone.`,
      variant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, loading: true }));

        const result = await deletePayment(projectData._id, id);
        if (result.success) {
          setProjectData((prev) => ({
            ...prev,
            payments:
              prev.payments?.filter((payment) => payment.id !== id) || [],
          }));
          toast.success(
            "Payment deleted",
            "The payment has been successfully deleted."
          );
        } else {
          toast.error(
            "Failed to delete payment",
            result.error || "Please try again."
          );
        }

        setConfirmationModal((prev) => ({
          ...prev,
          isOpen: false,
          loading: false,
        }));
      },
    });
  };

  // Updates operations
  const handleAddUpdate = async () => {
    if (newUpdate.title && newUpdate.description) {
      const updateData = {
        title: newUpdate.title,
        description: newUpdate.description,
        type: (newUpdate.type || "general") as UpdateType,
        author: "Client",
      };

      const result = await createUpdate(projectData._id, updateData);
      if (result.success) {
        const update: ProjectUpdate = {
          id: Date.now().toString(),
          createdAt: new Date(),
          ...updateData,
        };
        setProjectData((prev) => ({
          ...prev,
          updates: [update, ...(prev.updates || [])],
        }));
        setNewUpdate({});
      }
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
      setProjectData((prev) => ({
        ...prev,
        updates: [reply, ...(prev.updates || [])],
      }));
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const recentActivity = [
    ...(projectData.updates || []).map((u) => ({
      ...u,
      activityType: "update",
      description: `Update by ${u.author}: ${u.description}`,
    })),
    ...(projectData.milestones || [])
      .filter((m) => m.completedAt)
      .map((m) => ({
        id: m.id,
        title: `Milestone Completed: ${m.title}`,
        description: `Milestone completed on ${
          m.completedAt ? new Date(m.completedAt).toLocaleDateString() : "N/A"
        }`,
        createdAt: m.completedAt
          ? typeof m.completedAt === "string"
            ? new Date(m.completedAt)
            : m.completedAt
          : new Date(),
        activityType: "milestone",
      })),
    ...(projectData.payments || [])
      .filter((p) => p.date)
      .map((p) => ({
        id: p.id,
        title: `Payment: ${p.description || "Payment"}`,
        description: `Amount: ${formatCurrency(
          p.amount,
          p.currency || "USD"
        )} - Status: ${p.status}`,
        createdAt: p.date ? new Date(p.date) : new Date(),
        activityType: "payment",
      })),
    {
      // Example Manual Entry
      id: "manual-entry",
      title: "Project Status Changed",
      description: `Status changed to ${projectData.status.replace("_", " ")}`,
      createdAt: new Date(),
      activityType: "statusChange",
    },
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
    .slice(0, 5);

  const trackingTabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "milestones", label: "Milestones", icon: CheckCircle },
    { id: "budget", label: "Budget & Payments", icon: DollarSign },
    { id: "files", label: "Files", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "assignments", label: "Team Assignments", icon: CheckCircle },
    { id: "chat", label: "Project Chat", icon: MessageSquare },
  ] as const;

  const renderTrackingContent = () => {
    switch (trackingView) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Project Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {/* Project Summary Card */}
              <div className="bg-gradient-to-br from-gray-800/10 to-gray-700/5 backdrop-blur-xl border border-gray-600/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300">
                <div className="flex flex-col items-start mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Project Summary
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Start Date:{" "}
                    {projectData.startDate
                      ? new Date(projectData.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Status:{" "}
                    <span className={getStatusColor(projectData.status)}>
                      {projectData.status}
                    </span>
                  </p>
                </div>
                <h3 className="text-white font-semibold mb-2">Last Update</h3>
                <p className="text-gray-400 text-sm">
                  {projectData.updatedAt
                    ? new Date(projectData.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* Progress Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-blue-300" />
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    {projectData.progress}%
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">
                  Overall Progress
                </h3>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${projectData.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {100 - projectData.progress}% remaining
                </p>
              </div>

              {/* Milestones Card */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-purple-300" />
                  </div>
                  <span className="text-2xl font-semibold text-white">
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
                  <span className="text-2xl font-semibold text-white">
                    {formatCurrency(
                      spentBudget,
                      projectData.pricing?.currency || "USD"
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
                    totalBudget,
                    projectData.pricing?.currency || "USD"
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
                  <span className="text-2xl font-semibold text-white">
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
                {/* Show calculated due date if no existing end date */}
                {(() => {
                  const calculatedDueDate =
                    calculateProjectCompletionDate(projectData);
                  if (
                    calculatedDueDate &&
                    !projectData.estimatedCompletionDate
                  ) {
                    return (
                      <div className="mt-3 p-2 bg-orange-500/10 rounded-lg">
                        <p className="text-xs text-orange-300 font-medium">
                          Estimated Due:{" "}
                          {calculatedDueDate.toLocaleDateString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Activity and Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <Activity className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    Recent Activity
                  </h2>
                </div>

                <div className="space-y-6">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-400">
                      No recent activity available
                    </p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="border-b border-gray-700 pb-2 mb-2"
                      >
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {activity.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Project Information */}
              <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    Project Details
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {projectData.projectDetails?.description}
                    </p>
                  </div>

                  {projectData.projectDetails?.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Requirements
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {projectData.projectDetails?.requirements}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-2 block">
                        Priority
                      </label>
                      <span className="text-white font-medium capitalize">
                        {projectData.projectDetails?.priority}
                      </span>
                    </div>

                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-2 block">
                        Timeline
                      </label>
                      <span className="text-white font-medium">
                        {projectData.projectDetails.timeline}
                      </span>
                    </div>

                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-2 block">
                        Expected Completion
                      </label>
                      <span className="text-white font-medium">
                        {(() => {
                          // Use existing completion date if available
                          if (projectData.estimatedCompletionDate) {
                            return new Date(
                              projectData.estimatedCompletionDate
                            ).toLocaleDateString();
                          }

                          // Calculate completion date
                          const calculatedDate =
                            calculateProjectCompletionDate(projectData);
                          if (calculatedDate) {
                            return (
                              <span className="text-blue-400">
                                {calculatedDate.toLocaleDateString()}
                                <span className="text-xs text-gray-500 ml-1 block">
                                  (calculated)
                                </span>
                              </span>
                            );
                          }

                          return "TBD";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-xl">
                  <Target className="w-5 h-5 text-teal-300" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Performance Insights
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Project Health
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        Milestones Completed
                      </span>
                      <span className="text-white font-medium">
                        {completedMilestones} of {totalMilestones}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        Budget Utilized
                      </span>
                      <span className="text-white font-medium">
                        {Math.round(budgetProgress)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Days Active</span>
                      <span className="text-white font-medium">
                        {daysPassed}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Quick Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total Files</span>
                      <span className="text-white font-medium">
                        {projectData.files?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Updates</span>
                      <span className="text-white font-medium">
                        {projectData.updates?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Payments</span>
                      <span className="text-white font-medium">
                        {projectData.payments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                  <Code className="w-5 h-5 text-indigo-300" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Technology Stack
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {projectData.projectDetails.techStack.map((tech, index) => (
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
          </div>
        );

      case "milestones":
        return (
          <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Milestones & Progress
              </h2>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Add Milestone Form */}
            {showAddMilestone && (
              <div className="mb-6 p-6 bg-white/[0.03] rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Add New Milestone
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Milestone Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter milestone title"
                        value={newMilestone.title || ""}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newMilestone.budget || ""}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            budget: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Enter milestone description"
                      value={newMilestone.description || ""}
                      onChange={(e) =>
                        setNewMilestone({
                          ...newMilestone,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 2 weeks"
                        value={newMilestone.timeline || ""}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            timeline: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Due Date
                        {newMilestone.timeline && (
                          <span className="text-xs text-blue-400 ml-2">
                            (auto-calculated from timeline)
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={(() => {
                          // Auto-calculate due date from timeline if timeline exists and no manual date set
                          if (newMilestone.timeline && !newMilestone.dueDate) {
                            const projectStart = projectData.startDate
                              ? new Date(projectData.startDate)
                              : new Date();
                            const lastMilestone =
                              projectData.milestones?.[
                                projectData.milestones.length - 1
                              ];
                            const startDate = lastMilestone?.dueDate
                              ? new Date(lastMilestone.dueDate)
                              : projectStart;

                            const calculatedDate = calculateDueDate(
                              startDate,
                              newMilestone.timeline
                            );
                            if (calculatedDate) {
                              return calculatedDate.toISOString().split("T")[0];
                            }
                          }

                          return newMilestone.dueDate instanceof Date
                            ? newMilestone.dueDate.toISOString().split("T")[0]
                            : "";
                        })()}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            dueDate: new Date(e.target.value),
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.title || !newMilestone.description}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Milestone</span>
                  </button>
                  <button
                    onClick={() => setShowAddMilestone(false)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Milestones List */}
            <div className="space-y-4">
              {projectData.milestones?.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-6 bg-black/10 rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                >
                  {editingMilestone === milestone.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Milestone Title *
                        </label>
                        <input
                          type="text"
                          value={editingMilestoneData.title || ""}
                          onChange={(e) =>
                            setEditingMilestoneData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Enter milestone title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={editingMilestoneData.description || ""}
                          onChange={(e) =>
                            setEditingMilestoneData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          rows={3}
                          placeholder="Enter milestone description"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Budget (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingMilestoneData.budget || ""}
                            onChange={(e) =>
                              setEditingMilestoneData((prev) => ({
                                ...prev,
                                budget: e.target.value,
                              }))
                            }
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Timeline
                          </label>
                          <input
                            type="text"
                            value={editingMilestoneData.timeline || ""}
                            onChange={(e) =>
                              setEditingMilestoneData((prev) => ({
                                ...prev,
                                timeline: e.target.value,
                              }))
                            }
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="e.g., 2 weeks"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleSaveMilestone}
                          disabled={
                            !editingMilestoneData.title ||
                            !editingMilestoneData.description
                          }
                          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={handleCancelEditMilestone}
                          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Clean Milestone Card */}
                      <div className="space-y-4">
                        {/* Milestone Header - Compact */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {milestone.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {milestone.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold text-white">
                              ${milestone.budget}
                            </div>
                            <div className="text-sm text-gray-400">
                              {milestone.timeline || "No timeline"}
                            </div>
                          </div>
                        </div>

                        {/* Milestone Details - Inline */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-700">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-400">
                                Due:
                              </span>
                              <span className="text-sm font-medium text-white">
                                {(() => {
                                  if (milestone.dueDate) {
                                    return (
                                      milestone.dueDate instanceof Date
                                        ? milestone.dueDate
                                        : new Date(milestone.dueDate)
                                    ).toLocaleDateString();
                                  }
                                  if (milestone.timeline) {
                                    const milestoneIndex =
                                      projectData.milestones?.findIndex(
                                        (m) => m.id === milestone.id
                                      ) || 0;
                                    const calculatedDueDate =
                                      calculateMilestoneDueDate(
                                        projectData,
                                        milestone,
                                        milestoneIndex
                                      );
                                    if (calculatedDueDate) {
                                      return calculatedDueDate.toLocaleDateString();
                                    }
                                  }
                                  return "N/A";
                                })()}
                              </span>
                            </div>
                            {milestone.deliverables &&
                              milestone.deliverables.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-400">
                                    {milestone.deliverables.length} deliverables
                                  </span>
                                </div>
                              )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                milestone.status
                              )}`}
                            >
                              {milestone.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {projectData.milestones?.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Milestones Yet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Start tracking your project progress by adding milestones
                  </p>
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add Your First Milestone
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "budget":
        // Filter payments based on active tab
        const pendingPayments = (projectData.payments || []).filter(
          (payment) => payment.status === "pending"
        );
        const historyPayments = (projectData.payments || []).filter(
          (payment) => payment.status !== "pending"
        );

        return (
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
                    {formatCurrency(
                      totalBudget,
                      projectData.pricing?.currency || "USD"
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-xl border border-blue-500/20">
                  <h3 className="text-blue-300 font-semibold mb-2">
                    Amount Paid
                  </h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrency(
                      spentBudget,
                      projectData.pricing?.currency || "USD"
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-purple-300 font-semibold mb-2">
                    Remaining
                  </h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrency(
                      totalBudget - spentBudget,
                      projectData.pricing?.currency || "USD"
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
                    {Math.round(budgetProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payments Section with Tabs */}
            <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Payments</h2>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Payment</span>
                </button>
              </div>

              {/* Payment Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setActivePaymentTab("pending")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activePaymentTab === "pending"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <span>Pending Payments</span>
                  {pendingPayments.length > 0 && (
                    <span className="bg-blue-400/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                      {pendingPayments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActivePaymentTab("history")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activePaymentTab === "history"
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <span>Payment History</span>
                  {historyPayments.length > 0 && (
                    <span className="bg-green-400/20 text-green-300 text-xs px-2 py-1 rounded-full">
                      {historyPayments.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Add Payment Form */}
              {showAddPayment && (
                <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Add New Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newPayment.amount || ""}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          amount: Number(e.target.value),
                        })
                      }
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newPayment.description || ""}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          description: e.target.value,
                        })
                      }
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={newPayment.date || ""}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          date: e.target.value,
                        })
                      }
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    />
                    <select
                      value={newPayment.method || DEFAULT_PAYMENT_METHOD}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          method: e.target.value,
                        })
                      }
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    >
                      {getPaymentMethodsForCurrency(
                        projectData.pricing?.currency || "USD"
                      ).map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.icon} {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <button
                      onClick={handleAddPayment}
                      className="cursor-pointer flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Payment</span>
                    </button>
                    <button
                      onClick={() => setShowAddPayment(false)}
                      className="cursor-pointer flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tabbed Payments Content */}
              <div className="space-y-4">
                {activePaymentTab === "pending" && (
                  <>
                    {pendingPayments.length > 0 ? (
                      pendingPayments.map((payment: Payment) => (
                        <div
                          key={payment.id}
                          className="p-6 bg-black/10 rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingPayment === payment.id ? (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-white mb-4">
                                    Edit Payment
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Amount
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                          newPayment.amount ||
                                          payment.amount ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          setNewPayment({
                                            ...newPayment,
                                            amount: Number(e.target.value),
                                          })
                                        }
                                        placeholder="Amount"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Date
                                      </label>
                                      <input
                                        type="date"
                                        value={
                                          newPayment.date || payment.date || ""
                                        }
                                        onChange={(e) =>
                                          setNewPayment({
                                            ...newPayment,
                                            date: e.target.value,
                                          })
                                        }
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          newPayment.description ||
                                          payment.description ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          setNewPayment({
                                            ...newPayment,
                                            description: e.target.value,
                                          })
                                        }
                                        placeholder="Description"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Payment Method
                                      </label>
                                      <select
                                        value={
                                          newPayment.method ||
                                          payment.method ||
                                          DEFAULT_PAYMENT_METHOD
                                        }
                                        onChange={(e) =>
                                          setNewPayment({
                                            ...newPayment,
                                            method: e.target.value,
                                          })
                                        }
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                                      >
                                        {getPaymentMethodsForCurrency(
                                          projectData.pricing?.currency || "USD"
                                        ).map((method) => (
                                          <option
                                            key={method.value}
                                            value={method.value}
                                          >
                                            {method.icon} {method.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 mt-6">
                                    <button
                                      onClick={() =>
                                        handleUpdatePayment(
                                          payment.id,
                                          newPayment
                                        )
                                      }
                                      disabled={
                                        !newPayment.amount && !payment.amount
                                      }
                                      className="cursor-pointer flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors"
                                    >
                                      <Save className="w-4 h-4" />
                                      <span>Update Payment</span>
                                    </button>
                                    <button
                                      onClick={handleCancelEditPayment}
                                      className="cursor-pointer flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Clean Payment Card */}
                                  <div className="space-y-4">
                                    {/* Payment Header - Compact */}
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold text-white">
                                          {payment.description ||
                                            "Payment Request"}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                          Pending Admin Approval
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-semibold text-white">
                                          {formatCurrency(
                                            payment.amount,
                                            payment.currency || "USD"
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                          {payment.date}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Payment Details - Inline */}
                                    <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                      <div className="flex items-center space-x-2">
                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-400">
                                          Method:
                                        </span>
                                        <span className="text-sm font-medium text-white capitalize">
                                          {formatPaymentMethodLabel(
                                            payment.method as PaymentMethodType
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-yellow-500 font-medium">
                                          Under Review
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex justify-center items-center space-x-2 ml-4">
                              {payment.invoiceUrl && (
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleStartEditPayment(payment)}
                                className="p-2 text-indigo-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="p-2 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Pending Payments
                        </h3>
                        <p className="text-gray-400">
                          You have no pending payment requests at this time
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activePaymentTab === "history" && (
                  <>
                    {historyPayments.length > 0 ? (
                      historyPayments.map((payment: Payment) => (
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
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    payment.status || "pending"
                                  )}`}
                                >
                                  {payment.status || "pending"}
                                </span>
                                {payment.submittedBy && (
                                  <span className="text-xs text-gray-400">
                                    by {payment.submittedBy}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Amount:</span>
                                  <p className="text-white font-medium">
                                    {formatCurrency(
                                      payment.amount,
                                      payment.currency || "USD"
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Date:</span>
                                  <p className="text-white font-medium">
                                    {payment.date}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Method:</span>
                                  <p className="text-white font-medium capitalize">
                                    {formatPaymentMethodLabel(
                                      payment.method as PaymentMethodType
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Status:</span>
                                  <p className="text-white font-medium capitalize">
                                    {payment.status || "pending"}
                                  </p>
                                </div>

                                {payment.status === "rejected" &&
                                  payment.rejectionReason && (
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                      <span className="text-red-400 text-sm font-medium">
                                        Rejection Reason:
                                      </span>
                                      <p className="text-red-300 text-sm mt-1">
                                        {payment.rejectionReason}
                                      </p>
                                    </div>
                                  )}

                                {payment.status === "approved" &&
                                  payment.approvedBy && (
                                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                      <span className="text-green-400 text-sm font-medium">
                                        Approved by:
                                      </span>
                                      <p className="text-green-300 text-sm mt-1">
                                        {payment.approvedBy} on{" "}
                                        {payment.approvedAt
                                          ? new Date(
                                              payment.approvedAt
                                            ).toLocaleDateString()
                                          : ""}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {payment.invoiceUrl && (
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleStartEditPayment(payment)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DollarSign className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Payment History
                        </h3>
                        <p className="text-gray-400">
                          Payment history will appear here once processed
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "files":
        return (
          <div className="bg-black/5 backdrop-blur-xl rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Project Files
              </h2>
              <button
                onClick={() => setShowAddFile(true)}
                className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
            <div className="text-gray-400 mb-4 text-md text-center ">
              Manage your project files here. You can upload, view, and delete
              files related to this project.
              {projectData.files?.length === 0 && !showAddFile && (
                <p className="mt-2 text-md text-gray-500 text-center ">
                  No files uploaded yet. Click "Upload File" to add new files.
                </p>
              )}
            </div>

            {/* Add File Form */}
            {showAddFile && (
              <div className="mb-6 p-6 bg-white/[0.03] rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Upload New File
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="File name"
                    value={newFile.fileName || ""}
                    onChange={(e) =>
                      setNewFile({ ...newFile, fileName: e.target.value })
                    }
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setNewFile({ ...newFile, fileSize: file.size });
                      }
                    }}
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-purple-500 file:text-white hover:file:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                  <select
                    value={newFile.fileType || "document"}
                    onChange={(e) =>
                      setNewFile({
                        ...newFile,
                        fileType: e.target.value as FileType,
                      })
                    }
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                  {selectedFile && (
                    <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white">
                      <p className="text-sm text-gray-400">Selected file:</p>
                      <p className="text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
                <textarea
                  placeholder="File description (optional)"
                  value={newFile.description || ""}
                  onChange={(e) =>
                    setNewFile({ ...newFile, description: e.target.value })
                  }
                  className="w-full mt-4 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={handleAddFile}
                    className="cursor-pointer flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                  <button
                    onClick={() => setShowAddFile(false)}
                    className="cursor-pointer flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Files List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectData.files?.map((file) => (
                <div
                  key={file.id}
                  className="p-6 bg-black/10 rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium truncate">
                          {file.fileName}
                        </h3>
                        <p className="text-gray-400 text-sm">{file.fileType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => window.open(file.fileUrl, "_blank")}
                        className="cursor-pointer p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="cursor-pointer p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">
                        {file.fileSize
                          ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uploaded:</span>
                      <span className="text-white">
                        {(typeof file.createdAt === "string"
                          ? new Date(file.createdAt)
                          : file.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">By:</span>
                      <span className="text-white">
                        {file.uploadedBy || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {file.description && (
                    <p className="text-gray-300 text-sm mt-3 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                </div>
              ))}
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
              {(projectData.milestones || []).map((milestone: Milestone) => (
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

      case "activity":
        return (
          <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {loadingActivity ? (
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
                </div>
              ) : (
                (activityData?.data || []).map((activity: ActivityItem) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
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
                      ) : activity.activityType === "payment" ? (
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <DollarSign className="w-5 h-5 text-yellow-300" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-1">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {(activityData?.data?.length === 0 || activityError) && (
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

      case "chat":
        return (
          <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {user && (
              <ProjectChatComponent
                projectId={projectData._id}
                projectTitle={projectData.projectDetails.title}
                currentUserId={user.id}
                currentUserRole={user.role as "admin" | "client" | "developer"}
                currentUserName={user.name || user.email}
              />
            )}
          </div>
        );

      case "assignments":
        return (
          <div className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {user && (
              <ProjectAssignmentsComponent
                projectId={projectData._id}
                projectTitle={projectData.projectDetails.title}
                projectTechStack={projectData.projectDetails.techStack}
                projectExperienceLevel={
                  projectData.projectDetails.experienceLevel
                }
                developers={developers}
                readOnly={true}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60 shadow-2xl border border-purple-500/30 rounded-2xl p-8 mb-8 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/10 px-3 py-2 rounded-lg"
                    onClick={onBack}
                  >
                    <FaArrowCircleLeft className="w-5 h-5" />
                    <span>Back to Projects</span>
                  </button>
                  <div className="h-6 w-px bg-white/20"></div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                      {projectData.projectDetails?.title}
                    </h1>
                    <p className="text-gray-300 max-w-2xl">
                      {projectData.projectDetails?.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(projectData.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        projectData.status
                      )}`}
                    >
                      {projectData.status.replace("_", " ")}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      projectData.projectDetails?.priority
                    )}`}
                  >
                    {projectData.projectDetails?.priority} priority
                  </div>
                  <div className="text-gray-300">
                    <Code className="w-4 h-4 inline mr-2" />
                    {projectData.projectDetails?.category}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {projectData.projectDetails?.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-0 ml-0 sm:ml-8">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {projectData.progress}%
                  </div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {completedMilestones}/{totalMilestones}
                  </div>
                  <div className="text-gray-400 text-sm">Milestones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {formatCurrency(
                      totalBudget - spentBudget,
                      projectData.pricing?.currency || "USD"
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {(projectData.files || []).length}
                  </div>
                  <div className="text-gray-400 text-sm">Files</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Tracking Navigation */}
        <div className="bg-gradient-to-r from-slate-800/60 via-gray-800/40 to-slate-800/60 shadow-xl backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 mb-8 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-2 overflow-x-auto md:overflow-x-visible py-2">
              {trackingTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTrackingView(tab.id)}
                    className={`cursor-pointer flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                      trackingView === tab.id
                        ? "bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg shadow-indigo-500/25 scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Selected Tab */}
        <div className="pt-4">{renderTrackingContent()}</div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onCancel={handleCloseConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        variant={confirmationModal.variant}
        loading={confirmationModal.loading}
      />
    </div>
  );
}
