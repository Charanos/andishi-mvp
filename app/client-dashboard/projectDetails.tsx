"use client";

import React, { useState, useEffect, ReactElement } from "react";
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

import {
  ProjectData,
  Milestone,
  ProjectFile,
  Payment,
  ProjectUpdate,
} from "@/types";

type TrackingView =
  | "overview"
  | "timeline"
  | "milestones"
  | "budget"
  | "files"
  | "activity"
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
        milestones: (data.milestones?.length
          ? data.milestones
          : data.pricing?.milestones || []
        ).map((m) => ({
          ...m,
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
        })),
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

    setProjectData(convertDates(project));
  }, [project]);

  // Files state
  const [files, setFiles] = useState<ProjectFile[]>(projectData.files || []);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<Partial<ProjectFile>>({});
  const [showAddFile, setShowAddFile] = useState(false);

  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>(
    projectData.milestones?.length
      ? projectData.milestones
      : projectData.pricing?.milestones || []
  );
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({});
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // Payments state
  const [payments, setPayments] = useState<Payment[]>(
    projectData.payments || []
  );
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({});
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Updates state
  const [updates, setUpdates] = useState<ProjectUpdate[]>(
    projectData.updates || []
  );
  const [newUpdate, setNewUpdate] = useState<Partial<ProjectUpdate>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Error and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show CRUD error if any
  useEffect(() => {
    if (crudError) {
      setError(crudError);
      setTimeout(() => setError(null), 5000);
    }
  }, [crudError]);

  // Calculate project statistics
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const milestoneProgress =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const totalBudget =
    projectData.pricing?.type === "fixed" && projectData.pricing.fixedBudget
      ? parseFloat(projectData.pricing.fixedBudget)
      : milestones.reduce((sum, m) => sum + parseFloat(m.budget), 0);

  const spentBudget = payments.reduce((sum, p) => sum + p.amount, 0);
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
    if (newFile.fileName && newFile.fileUrl) {
      const fileData = {
        fileName: newFile.fileName,
        fileUrl: newFile.fileUrl,
        ...(newFile.fileSize && { fileSize: newFile.fileSize }),
        ...(newFile.fileType && { fileType: newFile.fileType }),
        ...(newFile.uploadedBy && { uploadedBy: newFile.uploadedBy }),
        ...(newFile.description && { description: newFile.description }),
      };

      const result = await createFile(projectData._id, fileData);
      if (result.success) {
        const file: ProjectFile = {
          id: Date.now().toString(),
          createdAt: new Date(),
          ...fileData,
        };
        setFiles([...files, file]);
        setNewFile({});
        setShowAddFile(false);
      }
    }
  };

  const handleUpdateFile = async (
    id: string,
    updatedFile: Partial<ProjectFile>
  ) => {
    const result = await updateFile(projectData._id, id, updatedFile);
    if (result.success) {
      setFiles(
        files.map((file) =>
          file.id === id ? { ...file, ...updatedFile } : file
        )
      );
      setEditingFile(null);
    }
  };

  const handleDeleteFile = async (id: string) => {
    const result = await deleteFile(projectData._id, id);
    if (result.success) {
      setFiles(files.filter((file) => file.id !== id));
    }
  };

  // Milestone CRUD operations
  const handleAddMilestone = async () => {
    if (newMilestone.title && newMilestone.description) {
      const milestoneData = {
        title: newMilestone.title,
        description: newMilestone.description,
        budget: newMilestone.budget || "0",
        timeline: newMilestone.timeline || "",
        status: "pending" as MilestoneStatus,
        submittedBy: "client" as const,
        dueDate: newMilestone.dueDate || new Date(),
        order: milestones.length + 1,
        deliverables: newMilestone.deliverables || [],
      };

      const result = await createMilestone(projectData._id, milestoneData);
      if (result.success) {
        const milestone: Milestone = {
          id: Date.now().toString(),
          ...milestoneData,
        };
        setMilestones([...milestones, milestone]);
        setNewMilestone({});
        setShowAddMilestone(false);
      }
    }
  };

  const handleUpdateMilestone = async (
    id: string,
    updatedMilestone: Partial<Milestone>
  ) => {
    const result = await updateMilestone(projectData._id, id, updatedMilestone);
    if (result.success) {
      setMilestones(
        milestones.map((milestone) =>
          milestone.id === id
            ? { ...milestone, ...updatedMilestone }
            : milestone
        )
      );
      setEditingMilestone(null);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    const result = await deleteMilestone(projectData._id, id);
    if (result.success) {
      setMilestones(milestones.filter((milestone) => milestone.id !== id));
    }
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

      const result = await createPayment(projectData._id, paymentData);
      if (result.success) {
        const payment: Payment = {
          id: Date.now().toString(),
          ...paymentData,
        };
        setPayments([...payments, payment]);
        setNewPayment({});
        setShowAddPayment(false);
      }
    }
  };

  const handleUpdatePayment = async (
    id: string,
    updatedPayment: Partial<Payment>
  ) => {
    const result = await updatePayment(projectData._id, id, updatedPayment);
    if (result.success) {
      setPayments(
        payments.map((payment) =>
          payment.id === id ? { ...payment, ...updatedPayment } : payment
        )
      );
      setEditingPayment(null);
    }
  };

  const handleDeletePayment = async (id: string) => {
    const result = await deletePayment(projectData._id, id);
    if (result.success) {
      setPayments(payments.filter((payment) => payment.id !== id));
    }
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
        setUpdates([update, ...updates]);
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
      setUpdates([reply, ...updates]);
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const recentActivity = [
    ...updates.map((u) => ({ ...u, activityType: "update" })),
    ...milestones
      .filter((m) => m.completedAt)
      .map((m) => ({
        id: m.id,
        title: `Milestone: ${m.title}`,
        description: "Milestone completed",
        createdAt: m.completedAt!,
        activityType: "milestone",
      })),
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
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "milestones", label: "Milestones", icon: CheckCircle },
    { id: "budget", label: "Budget & Payments", icon: DollarSign },
    { id: "files", label: "Files", icon: FileText },
    { id: "updates", label: "Updates", icon: MessageSquare },
    { id: "activity", label: "Activity", icon: Activity },
  ] as const;

  const renderTrackingContent = () => {
    switch (trackingView) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Project Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Progress Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-blue-300" />
                  </div>
                  <span className="text-2xl font-bold text-white">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      case "timeline":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Project Timeline
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Created
                </label>
                <p className="text-white font-medium">
                  {new Date(projectData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {projectData.startDate && (
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <label className="text-sm font-medium text-gray-400 mb-1 block">
                    Started
                  </label>
                  <p className="text-white font-medium">
                    {(typeof projectData.startDate === "string"
                      ? new Date(projectData.startDate)
                      : projectData.startDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {projectData.estimatedCompletionDate && (
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <label className="text-sm font-medium text-gray-400 mb-1 block">
                    {projectData.actualCompletionDate
                      ? "Estimated Completion"
                      : "Expected Completion"}
                  </label>
                  <p className="text-white font-medium">
                    {(typeof projectData.estimatedCompletionDate === "string"
                      ? new Date(projectData.estimatedCompletionDate)
                      : projectData.estimatedCompletionDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {projectData.actualCompletionDate && (
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <label className="text-sm font-medium text-green-400 mb-1 block">
                    Completed
                  </label>
                  <p className="text-white font-medium">
                    {(typeof projectData.actualCompletionDate === "string"
                      ? new Date(projectData.actualCompletionDate)
                      : projectData.actualCompletionDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "milestones":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Milestones & Progress
              </h2>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Milestone title"
                    value={newMilestone.title || ""}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        title: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Milestone description"
                    value={newMilestone.description || ""}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        description: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    rows={3}
                  />
                  <input
                    type="text"
                    placeholder="Budget (e.g., 5000)"
                    value={newMilestone.budget || ""}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        budget: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Timeline (e.g., 2 weeks)"
                    value={newMilestone.timeline || ""}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        timeline: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={
                      newMilestone.dueDate instanceof Date
                        ? newMilestone.dueDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        dueDate: new Date(e.target.value),
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                  <select
                    value={newMilestone.status || "pending"}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        status: e.target.value as MilestoneStatus,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={handleAddMilestone}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Milestone</span>
                  </button>
                  <button
                    onClick={() => setShowAddMilestone(false)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Milestones List */}
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
                >
                  {editingMilestone === milestone.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) =>
                          handleUpdateMilestone(milestone.id, {
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <textarea
                        value={milestone.description}
                        onChange={(e) =>
                          handleUpdateMilestone(milestone.id, {
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        rows={3}
                      />
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingMilestone(null)}
                          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingMilestone(null)}
                          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {milestone.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                milestone.status
                              )}`}
                            >
                              {milestone.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4">
                            {milestone.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                  ? (milestone.dueDate instanceof Date
                                      ? milestone.dueDate
                                      : new Date(milestone.dueDate)
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <p className="text-white font-medium capitalize">
                                {milestone.status.replace("_", " ")}
                              </p>
                            </div>
                          </div>

                          {milestone.deliverables &&
                            milestone.deliverables.length > 0 && (
                              <div className="mt-4">
                                <span className="text-gray-400 text-sm">
                                  Deliverables:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {milestone.deliverables.map(
                                    (deliverable, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                                      >
                                        {deliverable}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {(!milestone.submittedBy ||
                            milestone.status === "rejected") && (
                            <>
                              <button
                                onClick={() =>
                                  setEditingMilestone(milestone.id)
                                }
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMilestone(milestone.id)
                                }
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {milestone.submittedBy === "client" &&
                            milestone.status === "pending" && (
                              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                                Awaiting Approval
                              </span>
                            )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-8">
            {/* Budget Overview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Budget Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/20">
                  <h3 className="text-green-300 font-semibold mb-2">
                    Total Budget
                  </h3>
                  <p className="text-2xl font-bold text-white">
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
                  <p className="text-2xl font-bold text-white">
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
                  <p className="text-2xl font-bold text-white">
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

            {/* Payments Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Payments</h2>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Payment</span>
                </button>
              </div>

              {/* Add Payment Form */}
              {showAddPayment && (
                <div className="mb-6 p-6 bg-white/[0.03] rounded-xl border border-white/10">
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
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
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
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
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
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    />
                    <select
                      value={newPayment.method || "credit_card"}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          method: e.target.value,
                        })
                      }
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <button
                      onClick={handleAddPayment}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Payment</span>
                    </button>
                    <button
                      onClick={() => setShowAddPayment(false)}
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Payments List */}
              <div className="space-y-4">
                {payments.map((payment) => (
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
                              {payment.method}
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

                          {payment.status === "pending" &&
                            payment.submittedBy === "client" && (
                              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <span className="text-yellow-400 text-sm font-medium">
                                  Status:
                                </span>
                                <p className="text-yellow-300 text-sm mt-1">
                                  Waiting for admin approval
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
                          onClick={() => setEditingPayment(payment.id)}
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
                ))}
              </div>
            </div>
          </div>
        );

      case "files":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Project Files</h2>
              <button
                onClick={() => setShowAddFile(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
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
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="File URL"
                    value={newFile.fileUrl || ""}
                    onChange={(e) =>
                      setNewFile({ ...newFile, fileUrl: e.target.value })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                  <select
                    value={newFile.fileType || "document"}
                    onChange={(e) =>
                      setNewFile({
                        ...newFile,
                        fileType: e.target.value as FileType,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="number"
                    placeholder="File size (bytes)"
                    value={newFile.fileSize || ""}
                    onChange={(e) =>
                      setNewFile({
                        ...newFile,
                        fileSize: Number(e.target.value),
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  />
                </div>
                <textarea
                  placeholder="File description (optional)"
                  value={newFile.description || ""}
                  onChange={(e) =>
                    setNewFile({ ...newFile, description: e.target.value })
                  }
                  className="w-full mt-4 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={handleAddFile}
                    className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                  <button
                    onClick={() => setShowAddFile(false)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Files List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] transition-all duration-200"
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
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingFile(file.id)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

      case "updates":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Project Updates
            </h2>

            {/* Add Update Form */}
            <div className="mb-8 p-6 bg-white/[0.03] rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Post an Update
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Update title"
                  value={newUpdate.title || ""}
                  onChange={(e) =>
                    setNewUpdate({ ...newUpdate, title: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
                <textarea
                  placeholder="What's the update about?"
                  value={newUpdate.description || ""}
                  onChange={(e) =>
                    setNewUpdate({ ...newUpdate, description: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  rows={4}
                />
                <div className="flex items-center space-x-4">
                  <select
                    value={newUpdate.type || "general"}
                    onChange={(e) =>
                      setNewUpdate({
                        ...newUpdate,
                        type: e.target.value as UpdateType,
                      })
                    }
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  >
                    <option value="general">General Update</option>
                    <option value="milestone">Milestone Update</option>
                    <option value="payment">Payment Update</option>
                    <option value="file">File Update</option>
                  </select>
                  <button
                    onClick={handleAddUpdate}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post Update</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Updates List */}
            <div className="space-y-6">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={`p-6 rounded-xl border transition-all duration-200 ${
                    update.isAdminResponse
                      ? "bg-blue-500/5 border-blue-500/20 ml-8"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {update.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            update.type === "admin_response"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }`}
                        >
                          {update.type.replace("_", " ")}
                        </span>
                        {update.isAdminResponse && (
                          <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{update.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>By {update.author || "Unknown"}</span>
                        <span>•</span>
                        <span>
                          {(typeof update.createdAt === "string"
                            ? new Date(update.createdAt)
                            : update.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          {(typeof update.createdAt === "string"
                            ? new Date(update.createdAt)
                            : update.createdAt
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Section */}
                  {!update.isAdminResponse && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      {replyingTo === update.id ? (
                        <div className="space-y-3">
                          <textarea
                            placeholder="Write your response..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleReply(update.id)}
                              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              <span>Send Reply</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(update.id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {updates.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Updates Yet
                  </h3>
                  <p className="text-gray-400">
                    Post your first update to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "milestones":
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
            <div className="space-y-4">
              {(milestones || []).map((milestone) => (
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
                    <div className="text-lg font-bold text-white mt-2">
                      {formatCurrency(
                        parseFloat(milestone.budget),
                        projectData.pricing?.currency || "USD"
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(milestones || []).length === 0 && (
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
            <h2 className="text-2xl font-bold text-white mb-6">Payments</h2>
            <div className="space-y-4">
              {(payments || []).map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/[0.03] p-4 rounded-lg border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {payment.description || "Payment"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Method: {payment.method}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Date: {new Date(payment.date).toLocaleDateString()}
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
                    <div className="text-lg font-bold text-white mt-2">
                      {formatCurrency(
                        payment.amount,
                        payment.currency || "USD"
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(payments || []).length === 0 && (
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
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
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
                      {(typeof activity.createdAt === "string"
                        ? new Date(activity.createdAt)
                        : activity.createdAt
                      ).toLocaleDateString()}
                    </p>
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
        <div className="backdrop-blur-xl bg-indigo-900/80 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
                  onClick={onBack}
                >
                  <FaArrowCircleLeft className="w-5 h-5" />
                  <span>Back to Projects</span>
                </button>
                <div className="h-6 w-px bg-white/20"></div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {projectData.projectDetails?.title}
                  </h1>
                  <p className="text-gray-300 max-w-2xl">
                    {projectData.projectDetails?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
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
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {projectData.progress}%
                </div>
                <div className="text-gray-400 text-sm">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {completedMilestones}/{totalMilestones}
                </div>
                <div className="text-gray-400 text-sm">Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(
                    totalBudget - spentBudget,
                    projectData.pricing?.currency || "USD"
                  )}
                </div>
                <div className="text-gray-400 text-sm">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {files.length}
                </div>
                <div className="text-gray-400 text-sm">Files</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Tracking Navigation */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-8">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {trackingTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTrackingView(tab.id)}
                  className={`flex cursor-pointer items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                    trackingView === tab.id
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Based on Selected Tab */}
        <div className="pt-4">{renderTrackingContent()}</div>
      </div>
    </div>
  );
}
