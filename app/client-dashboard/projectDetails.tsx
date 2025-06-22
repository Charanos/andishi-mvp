import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import {
  Target,
  Calendar,
  DollarSign,
  Code,
  FileText,
  CheckCircle,
  Clock,
  Circle,
  Activity,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  X,
  Save,
  Upload,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";

// Enhanced interfaces with CRUD operations
interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: Date;
  completedAt?: Date;
  order: number;
}

interface Update {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
}

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
  milestones?: Milestone[];
  updates?: Update[];
  files?: ProjectFile[];
}

interface CRUDOperations {
  // Project operations
  updateProject: (
    id: string,
    data: Partial<ProjectWithDetails>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Milestone operations
  createMilestone: (
    projectId: string,
    milestone: Omit<Milestone, "id">
  ) => Promise<void>;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    data: Partial<Milestone>
  ) => Promise<void>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;

  // Update operations
  createUpdate: (
    projectId: string,
    update: Omit<Update, "id" | "createdAt">
  ) => Promise<void>;
  updateUpdate: (
    projectId: string,
    updateId: string,
    data: Partial<Update>
  ) => Promise<void>;
  deleteUpdate: (projectId: string, updateId: string) => Promise<void>;

  // File operations
  uploadFile: (projectId: string, file: File) => Promise<void>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
}
deleteUpdate: (projectId: string, updateId: string) => Promise<void>;

// File operations
uploadFile: (projectId: string, file: File) => Promise<void>;
deleteFile: (projectId: string, fileId: string) => Promise<void>;

const renderProjectDetail = (
  project: ProjectWithDetails,
  crudOperations: CRUDOperations,
  setViewMode: React.Dispatch<React.SetStateAction<"list" | "detail">>,
  canEdit: boolean = true,
  canDelete: boolean = true,
  canUpload: boolean = true
): JSX.Element => {
  // State management for CRUD operations
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [formData, setFormData] =
    useState<Partial<ProjectWithDetails>>(project);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({});
  const [newUpdate, setNewUpdate] = useState<Partial<Update>>({});
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    ...(project.updates?.map((u) => ({ ...u, activityType: "update" })) || []),
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

  // CRUD Handlers
  const handleSaveProject = async () => {
    try {
      await crudOperations.updateProject(project.id, formData);
      setIsEditing(false);
      setEditingSection(null);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await crudOperations.deleteProject(project.id);
      setViewMode("list");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleCreateMilestone = async () => {
    try {
      if (
        newMilestone.title &&
        newMilestone.description &&
        newMilestone.budget &&
        newMilestone.timeline &&
        newMilestone.status
      ) {
        await crudOperations.createMilestone(project.id, {
          title: newMilestone.title,
          description: newMilestone.description,
          budget: newMilestone.budget,
          timeline: newMilestone.timeline,
          status: newMilestone.status,
          dueDate: newMilestone.dueDate,
          completedAt: newMilestone.completedAt,
          order: (project.milestones?.length || 0) + 1,
        });
        setShowAddMilestone(false);
        setNewMilestone({});
      } else {
        // Optionally, show an error or validation message here
        console.error("All required milestone fields must be filled.");
      }
      setShowAddMilestone(false);
      setNewMilestone({});
    } catch (error) {
      console.error("Failed to create milestone:", error);
    }
  };

  const handleUpdateMilestone = async (
    milestoneId: string,
    data: Partial<Milestone>
  ) => {
    try {
      await crudOperations.updateMilestone(project.id, milestoneId, data);
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await crudOperations.deleteMilestone(project.id, milestoneId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete milestone:", error);
    }
  };

  const handleCreateUpdate = async () => {
    try {
      if (
        typeof newUpdate.title === "string" &&
        typeof newUpdate.description === "string" &&
        typeof newUpdate.type === "string"
      ) {
        await crudOperations.createUpdate(project.id, {
          title: newUpdate.title,
          description: newUpdate.description,
          type: newUpdate.type,
        });
        setShowAddUpdate(false);
        setNewUpdate({});
      } else {
        // Optionally, show an error or validation message here
        console.error("All required update fields must be filled.");
      }
    } catch (error) {
      console.error("Failed to create update:", error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await crudOperations.uploadFile(project.id, file);
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await crudOperations.deleteFile(project.id, fileId);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && canUpload) {
      handleFileUpload(files);
    }
  };

  // Form input handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTechStackChange = (index: number, value: string) => {
    const newTechStack = [...(formData.techStack || [])];
    newTechStack[index] = value;
    handleInputChange("techStack", newTechStack);
  };

  const addTechStack = () => {
    handleInputChange("techStack", [...(formData.techStack || []), ""]);
  };

  const removeTechStack = (index: number) => {
    const newTechStack = (formData.techStack || []).filter(
      (_, i) => i !== index
    );
    handleInputChange("techStack", newTechStack);
  };

  // Utility functions
  const formatCurrency = (
    amount: string | number,
    currency: string = "USD"
  ) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(numAmount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-400" />;
      case "cancelled":
        return <X className="w-5 h-5 text-red-400" />;
      case "on_hold":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
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
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "on_hold":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      {/* Header Section with CRUD Actions */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/5 px-3 py-2 rounded-lg"
              >
                <FaArrowCircleLeft className="w-5 h-5" />
                <span>Back to Projects</span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                {isEditing && editingSection === "header" ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="text-2xl font-bold bg-white/10 text-white px-3 py-1 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.category || ""}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      placeholder="Category"
                      className="text-sm bg-white/10 text-gray-300 px-3 py-1 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">
                      {project.title}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                      {project.category}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
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

              {/* CRUD Action Buttons */}
              {canEdit && (
                <div className="flex items-center space-x-2">
                  {isEditing && editingSection === "header" ? (
                    <>
                      <button
                        onClick={handleSaveProject}
                        className="p-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors"
                        title="Save Changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingSection(null);
                          setFormData(project);
                        }}
                        className="p-2 bg-gray-500/20 text-gray-300 rounded-xl hover:bg-gray-500/30 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditingSection("header");
                      }}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors"
                      title="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm("project")}
                      className="p-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-6 space-y-8"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Project Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-300" />
              </div>
              {canEdit && (
                <div className="flex items-center space-x-1">
                  {isEditing && editingSection === "progress" ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "progress",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 text-sm bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-white text-sm">%</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {project.progress}%
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (isEditing && editingSection === "progress") {
                        handleSaveProject();
                      } else {
                        setIsEditing(true);
                        setEditingSection("progress");
                      }
                    }}
                    className="p-1 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {isEditing && editingSection === "progress" ? (
                      <Save className="w-3 h-3" />
                    ) : (
                      <Edit3 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
              {!canEdit && (
                <span className="text-2xl font-bold text-white">
                  {project.progress}%
                </span>
              )}
            </div>
            <h3 className="text-white font-semibold mb-2">Overall Progress</h3>
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
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  {completedMilestones}/{totalMilestones}
                </span>
                {canEdit && (
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="p-1 text-purple-300 hover:text-purple-200 transition-colors"
                    title="Add Milestone"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
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
              {formatCurrency(totalBudget, project.pricing?.currency || "USD")}{" "}
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Project Information
                  </h2>
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      if (isEditing && editingSection === "info") {
                        handleSaveProject();
                      } else {
                        setIsEditing(true);
                        setEditingSection("info");
                      }
                    }}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    {isEditing && editingSection === "info" ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Description
                  </h3>
                  {isEditing && editingSection === "info" ? (
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="w-full bg-white/10 text-gray-300 px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Requirements
                  </h3>
                  {isEditing && editingSection === "info" ? (
                    <textarea
                      value={formData.requirements || ""}
                      onChange={(e) =>
                        handleInputChange("requirements", e.target.value)
                      }
                      placeholder="Project requirements..."
                      className="w-full bg-white/10 text-gray-300 px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {project.requirements || "No requirements specified"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Urgency
                    </label>
                    {isEditing && editingSection === "info" ? (
                      <select
                        value={formData.urgency || ""}
                        onChange={(e) =>
                          handleInputChange("urgency", e.target.value)
                        }
                        className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select urgency</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    ) : (
                      <span className="text-white font-medium capitalize">
                        {project.urgency || "Not specified"}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Timeline
                    </label>
                    {isEditing && editingSection === "info" ? (
                      <input
                        type="text"
                        value={formData.timeline || ""}
                        onChange={(e) =>
                          handleInputChange("timeline", e.target.value)
                        }
                        placeholder="e.g., 4-6 weeks"
                        className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {project.timeline || "Not specified"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                    <Code className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Technology Stack
                  </h2>
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      if (isEditing && editingSection === "tech") {
                        handleSaveProject();
                      } else {
                        setIsEditing(true);
                        setEditingSection("tech");
                      }
                    }}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    {isEditing && editingSection === "tech" ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {isEditing && editingSection === "tech" ? (
                <div className="space-y-4">
                  {(formData.techStack || []).map((tech, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) =>
                          handleTechStackChange(index, e.target.value)
                        }
                        className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Technology name"
                      />
                      <button
                        onClick={() => removeTechStack(index)}
                        className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTechStack}
                    className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Technology</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-medium hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-purple-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Milestones</h2>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Milestone</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {project.milestones?.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(milestone.status)}
                          <h3 className="text-lg font-semibold text-white">
                            {milestone.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              milestone.status
                            )}`}
                          >
                            {milestone.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {milestone.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              {formatCurrency(milestone.budget)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">
                              {milestone.timeline}
                            </span>
                          </div>
                          {milestone.dueDate && (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-orange-400" />
                              <span className="text-gray-300">
                                {milestone.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center space-x-2 ml-4">
                          <select
                            value={milestone.status}
                            onChange={(e) =>
                              handleUpdateMilestone(milestone.id, {
                                status: e.target.value as any,
                              })
                            }
                            className="bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500 focus:outline-none text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {canDelete && (
                            <button
                              onClick={() =>
                                setShowDeleteConfirm(
                                  `milestone-${milestone.id}`
                                )
                              }
                              className="p-1 text-red-300 hover:text-red-200 transition-colors"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!project.milestones || project.milestones.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No milestones yet</p>
                    <p className="text-gray-500 text-sm">
                      Add milestones to track project progress
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Updates */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl">
                    <Activity className="w-5 h-5 text-green-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Updates & Activity
                  </h2>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddUpdate(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Update</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.activityType === "milestone"
                                ? "bg-purple-400"
                                : "bg-green-400"
                            }`}
                          ></div>
                          <h4 className="text-white font-medium">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {activity.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm pl-5">
                          {activity.description}
                        </p>
                      </div>
                      {canEdit && activity.activityType === "update" && (
                        <button
                          onClick={() =>
                            crudOperations.deleteUpdate(project.id, activity.id)
                          }
                          className="p-1 text-red-300 hover:text-red-200 transition-colors ml-4"
                          title="Delete Update"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No activity yet</p>
                    <p className="text-gray-500 text-sm">
                      Updates and milestones will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Project Status & Metadata */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Project Status</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <label className="text-sm font-medium text-gray-400 mb-2 block">
                    Current Status
                  </label>
                  {canEdit ? (
                    <select
                      value={project.status}
                      onChange={(e) =>
                        crudOperations.updateProject(project.id, {
                          status: e.target.value as any,
                        })
                      }
                      className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                  <label className="text-sm font-medium text-gray-400 mb-2 block">
                    Priority
                  </label>
                  {canEdit ? (
                    <select
                      value={project.priority}
                      onChange={(e) =>
                        crudOperations.updateProject(project.id, {
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                        project.priority
                      )}`}
                    >
                      {project.priority}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-1 block">
                      Created
                    </label>
                    <span className="text-white text-sm">
                      {project.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-1 block">
                      Updated
                    </label>
                    <span className="text-white text-sm">
                      {project.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            {project.pricing && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Pricing Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-gray-400 mb-1 block">
                      Pricing Type
                    </label>
                    <span className="text-white font-medium capitalize">
                      {project.pricing.type}
                    </span>
                  </div>

                  {project.pricing.fixedBudget && (
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <label className="text-sm font-medium text-gray-400 mb-1 block">
                        Total Budget
                      </label>
                      <span className="text-white font-medium">
                        {formatCurrency(
                          project.pricing.fixedBudget,
                          project.pricing.currency
                        )}
                      </span>
                    </div>
                  )}

                  {project.pricing.hourlyRate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-1 block">
                          Hourly Rate
                        </label>
                        <span className="text-white font-medium">
                          {formatCurrency(
                            project.pricing.hourlyRate,
                            project.pricing.currency
                          )}
                          /hr
                        </span>
                      </div>
                      {project.pricing.estimatedHours && (
                        <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                          <label className="text-sm font-medium text-gray-400 mb-1 block">
                            Est. Hours
                          </label>
                          <span className="text-white font-medium">
                            {project.pricing.estimatedHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {project.pricing.totalPaid && (
                    <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                      <label className="text-sm font-medium text-green-400 mb-1 block">
                        Total Paid
                      </label>
                      <span className="text-green-300 font-bold text-lg">
                        {formatCurrency(
                          project.pricing.totalPaid,
                          project.pricing.currency
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Files */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-yellow-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Project Files
                  </h3>
                </div>
                {canUpload && (
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files)
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-xl hover:bg-yellow-500/30 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mb-4 p-3 bg-blue-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="w-4 h-4 text-blue-300" />
                    <span className="text-blue-300 text-sm">
                      Uploading files...
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {project.files?.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">
                          {file.fileName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {file.fileSize &&
                            `${(file.fileSize / 1024 / 1024).toFixed(
                              2
                            )} MB`}{" "}
                          •{file.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
                        title="View File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-300 hover:text-red-200 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!project.files || project.files.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No files uploaded</p>
                    {canUpload && (
                      <p className="text-gray-500 text-sm mt-1">
                        Drag and drop files here or click upload
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Add New Milestone
              </h2>
              <button
                onClick={() => setShowAddMilestone(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newMilestone.title || ""}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none"
                  placeholder="Milestone title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newMilestone.description || ""}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Milestone description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget
                  </label>
                  <input
                    type="text"
                    value={newMilestone.budget || ""}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        budget: e.target.value,
                      }))
                    }
                    className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={newMilestone.timeline || ""}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        timeline: e.target.value,
                      }))
                    }
                    className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 2 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    newMilestone.dueDate
                      ? newMilestone.dueDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      dueDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowAddMilestone(false)}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMilestone}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Create Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showAddUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Add Project Update
              </h2>
              <button
                onClick={() => setShowAddUpdate(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newUpdate.title || ""}
                  onChange={(e) =>
                    setNewUpdate((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none"
                  placeholder="Update title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newUpdate.description || ""}
                  onChange={(e) =>
                    setNewUpdate((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                  placeholder="What's the latest update on this project?"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowAddUpdate(false)}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUpdate}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Add Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-red-500/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this{" "}
              {showDeleteConfirm.includes("milestone") ? "milestone" : "item"}?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.includes("milestone")) {
                    const milestoneId = showDeleteConfirm.split("-")[1];
                    crudOperations.deleteMilestone(project.id, milestoneId);
                  }
                  setShowDeleteConfirm(null);
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default renderProjectDetail;
