"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaUsers,
  FaCircle,
  FaClock,
  FaFile,
  FaImage,
  FaDownload,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaSearch,
  FaPhone,
  FaTimes,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFolder,
  FaLink,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUpload,
  FaEye,
  FaTag,
  FaInfoCircle,
  FaTasks,
  FaComments,
  FaProjectDiagram,
  FaFlag,
  FaBookmark,
  FaShare,
  FaCog,
  FaFileAlt,
  FaArchive,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useProjectChat } from "../../hooks/useProjectChat";
import { useProjectDetails } from "../../hooks/useProjectDetails";
import ConfirmationModal from "../components/ConfirmationModal";

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
  currentUserId: string;
  currentUserRole: "admin" | "client" | "developer";
  currentUserName: string;
}

interface ChatResource {
  id: string;
  name: string;
  type: "file" | "link" | "image" | "document";
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size?: string;
  description?: string;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedTo: string[];
  priority: "low" | "medium" | "high";
}

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  status: "active" | "paused" | "completed" | "cancelled";
  startDate: Date;
  endDate?: Date;
  priority: "low" | "medium" | "high";
  budget?: number;
  progress: number;
  tags: string[];
  milestones: ProjectMilestone[];
  resources: ChatResource[];
  notes: string;
  lastActivity: Date;
}

const ProjectChat: React.FC<ProjectChatProps> = ({
  projectId,
  projectTitle,
  currentUserId,
  currentUserRole,
  currentUserName,
}) => {
  const {
    messages,
    participants,
    loading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    refetch,
  } = useProjectChat(projectId);

  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<any | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "resources" | "milestones" | "participants"
  >("overview");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    projectDetails,
    loading: projectLoading,
    error: projectError,
  } = useProjectDetails(projectId);

  const permissions = {
    canRead: true,
    canWrite: true,
    canViewAll: currentUserRole === "admin",
    canManageProject: currentUserRole === "admin",
    canUploadFiles: true,
    canEditMilestones:
      currentUserRole === "admin" || currentUserRole === "developer",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !permissions.canWrite) return;
    await sendMessage(newMessage.trim(), replyingTo?.id);
    setNewMessage("");
    setReplyingTo(null);
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editingMessage.content.trim()) return;
    await updateMessage(editingMessage.id, editingMessage.content);
    setEditingMessage(null);
  };

  const handleDeleteMessage = (message: any) => {
    setDeletingMessage(message);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!deletingMessage) return;
    await deleteMessage(deletingMessage.id);
    setDeletingMessage(null);
    setShowDeleteConfirmation(false);
  };

  const cancelDelete = () => {
    setDeletingMessage(null);
    setShowDeleteConfirmation(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleEditMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "client":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "developer":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "client":
        return "from-blue-500 to-blue-600";
      case "developer":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "in-progress":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "overdue":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "active":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "paused":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "cancelled":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FaFileAlt className="text-blue-400" />;
      case "image":
        return <FaImage className="text-purple-400" />;
      case "link":
        return <FaLink className="text-green-400" />;
      case "file":
        return <FaFile className="text-gray-400" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (loading || projectLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-white font-medium">
            Loading Project Chat...
          </span>
        </div>
      </div>
    );
  }

  if (error || projectError || !permissions.canRead) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
          <FaUsers className="text-2xl" />
        </div>
        <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
        <p className="text-sm">You don't have permission to view this chat</p>
      </div>
    );
  }

  // Fallback project details if not loaded yet
  const displayProjectDetails = projectDetails || {
    id: projectId,
    title: projectTitle,
    description: "Loading project details...",
    status: "active",
    startDate: new Date(),
    endDate: undefined,
    priority: "medium",
    budget: undefined,
    progress: 0,
    tags: [],
    milestones: [],
    resources: [],
    notes: "Loading project information...",
    lastActivity: new Date(),
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <FaProjectDiagram className="mr-2" />
          Project Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span
              className={`px-2 py-1 rounded-full text-xs border font-medium uppercase ${getStatusColor(
                displayProjectDetails.status
              )}`}
            >
              {displayProjectDetails.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Priority</span>
            <span
              className={`px-2 py-1 rounded-full text-xs border font-medium uppercase ${getPriorityColor(
                displayProjectDetails.priority
              )}`}
            >
              {displayProjectDetails.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs text-white font-medium">
              {displayProjectDetails.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${displayProjectDetails.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <FaCalendarAlt className="mr-2" />
          Timeline
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Start Date</span>
            <span className="text-xs text-white">
              {formatDate(displayProjectDetails.startDate)}
            </span>
          </div>
          {displayProjectDetails.endDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">End Date</span>
              <span className="text-xs text-white">
                {formatDate(displayProjectDetails.endDate)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Last Activity</span>
            <span className="text-xs text-white">
              {formatTime(displayProjectDetails.lastActivity)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <FaTag className="mr-2" />
          Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {displayProjectDetails.tags.length === 0 ? (
            <span className="text-xs text-gray-500 italic">
              No technologies specified
            </span>
          ) : (
            displayProjectDetails.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Notes */}
      {displayProjectDetails.notes && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <FaInfoCircle className="mr-2" />
            Notes
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {displayProjectDetails.notes}
          </p>
        </div>
      )}
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Resources</h3>
        {permissions.canUploadFiles && (
          <button className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <FaPlus className="text-xs" />
          </button>
        )}
      </div>

      {displayProjectDetails.resources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaFolder className="mx-auto mb-3 text-2xl" />
          <p className="text-sm">No resources available</p>
        </div>
      ) : (
        displayProjectDetails.resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                {getFileIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white truncate">
                    {resource.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button className="cursor-pointer p-1 text-gray-400 hover:text-white transition-colors">
                      <FaEye className="text-xs" />
                    </button>
                    <button className="cursor-pointer p-1 text-gray-400 hover:text-white transition-colors">
                      <FaDownload className="text-xs" />
                    </button>
                    {resource.type === "link" && (
                      <button className="cursor-pointer p-1 text-gray-400 hover:text-white transition-colors">
                        <FaExternalLinkAlt className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    by {resource.uploadedBy}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {resource.size && <span>{resource.size}</span>}
                    <span>{formatDate(resource.uploadedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderMilestonesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Milestones</h3>
        {permissions.canEditMilestones && (
          <button className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <FaPlus className="text-xs" />
          </button>
        )}
      </div>

      {displayProjectDetails.milestones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaTasks className="mx-auto mb-3 text-2xl" />
          <p className="text-sm">No milestones available</p>
        </div>
      ) : (
        displayProjectDetails.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">
                  {milestone.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {milestone.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs border font-medium uppercase ${getStatusColor(
                    milestone.status
                  )}`}
                >
                  {milestone.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs border font-medium uppercase ${getPriorityColor(
                    milestone.priority
                  )}`}
                >
                  {milestone.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Due: {formatDate(milestone.dueDate)}</span>
              <span>{milestone.assignedTo.length} assigned</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderParticipantsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Team Members</h3>
        <span className="text-xs text-gray-500">
          {participants.length} members
        </span>
      </div>

      {participants.map((participant: any) => (
        <div
          key={participant.id}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleGradient(
                  participant.role
                )} flex items-center justify-center border-2 border-gray-900 font-medium text-white text-sm shadow-lg`}
              >
                {getInitials(participant.name)}
              </div>
              {participant.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">
                  {participant.name || "Unknown User"}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs border font-medium uppercase ${getRoleBadge(
                    participant.role
                  )}`}
                >
                  {participant.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {participant.isOnline
                  ? "Online"
                  : `Last seen ${formatTime(
                      participant.lastSeen || new Date()
                    )}`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className=" min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex">
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Confirm Deletion"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
        confirmText="Delete"
      />
      {/* Chat Panel */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          showDetails ? "w-2/3" : "w-full"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUsers className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Project Chat
                  </h2>
                  <p className="text-sm text-indigo-400 font-medium uppercase tracking-wide">
                    {projectTitle}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    window.open(
                      `/admin-dashboard/project-chat/${projectId}`,
                      "_blank"
                    )
                  }
                  className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <FaExternalLinkAlt className="text-sm" />
                </button>
                <button
                  onClick={toggleDetails}
                  className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  {showDetails ? (
                    <FaChevronRight className="text-sm" />
                  ) : (
                    <FaChevronLeft className="text-sm" />
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-medium">
                  {participants.length} members
                </span>
                <div className="flex -space-x-2">
                  {participants.slice(0, 3).map((participant: any) => (
                    <div
                      key={participant.id}
                      className="relative group"
                      title={`${participant.name} (${participant.role})`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleGradient(
                          participant.role
                        )} flex items-center justify-center border-2 border-gray-900 font-medium text-white text-xs shadow-lg hover:scale-110 transition-transform`}
                      >
                        {getInitials(participant.name)}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-gray-900 shadow-lg"></div>
                      )}
                    </div>
                  ))}
                  {participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-300 font-medium shadow-lg">
                      +{participants.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FaUsers className="text-3xl" />
                </div>
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-sm text-center">
                  Start the conversation and get your project moving!
                </p>
              </div>
            ) : (
              messages.map((message: any, index: number) => {
                const isOwnMessage = message.senderId === currentUserId;
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].senderId !== message.senderId;
                const showTimestamp =
                  index === 0 ||
                  new Date(message.timestamp).getTime() -
                    new Date(messages[index - 1].timestamp).getTime() >
                    300000;
                return (
                  <div key={message.id} className="space-y-2">
                    {showTimestamp && (
                      <div className="flex justify-center">
                        <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-end space-x-3 ${
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleGradient(
                            message.senderRole
                          )} flex items-center justify-center text-white text-xs font-medium shadow-lg ${
                            showAvatar ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {getInitials(message.senderName)}
                        </div>
                      )}
                      {/* Message Content */}
                      <div
                        className={`w-[50%] xl:max-w-2xl ${
                          isOwnMessage ? "ml-auto" : ""
                        }`}
                      >
                        {/* Sender Info */}
                        {!isOwnMessage && showAvatar && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-semibold text-white">
                              {message.senderName}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs border uppercase font-medium ${getRoleBadge(
                                message.senderRole
                              )}`}
                            >
                              {message.senderRole}
                            </span>
                          </div>
                        )}
                        {/* Message Bubble */}
                        <div
                          className={`relative px-4 py-3 rounded-2xl shadow-lg group ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-blue-600/70 to-blue-700/70 text-white ml-auto"
                              : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50"
                          } ${showAvatar ? "rounded-tl-md" : ""}`}
                        >
                          {message.replyToMessage && (
                            <div className="p-2 mb-2 bg-black/50 rounded-lg border border-gray-200/10 text-xs text-gray-300">
                              <p className="font-semibold">
                                Replying to {message.replyToMessage.senderName}:
                              </p>
                              <p className="italic truncate">
                                {message.replyToMessage.content}
                              </p>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {isOwnMessage && (
                            <div
                              className="absolute top-0 right-0 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onMouseEnter={() =>
                                setHoveredMessageId(message.id)
                              }
                              onMouseLeave={() => setHoveredMessageId(null)}
                            >
                              <div className="relative">
                                <button
                                  onClick={() => setActiveMessageId(message.id)}
                                  className="p-1 cursor-pointer rounded-full bg-black/20 hover:bg-black/40"
                                >
                                  <FaEllipsisV className="text-white/70 w-3 h-3" />
                                </button>
                                {activeMessageId === message.id && (
                                  <div className="absolute z-10 top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                                    <a
                                      href="#"
                                      onClick={() => {
                                        setReplyingTo(message);
                                        setActiveMessageId(null);
                                      }}
                                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                                    >
                                      Reply
                                    </a>
                                    <a
                                      href="#"
                                      onClick={() => {
                                        setEditingMessage(message);
                                        setActiveMessageId(null);
                                      }}
                                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                                    >
                                      Edit
                                    </a>
                                    <a
                                      href="#"
                                      onClick={() => {
                                        handleDeleteMessage(message);
                                        setActiveMessageId(null);
                                      }}
                                      className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                                    >
                                      Delete
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Message Status */}
                          {isOwnMessage && (
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <span className="text-xs text-blue-200 opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.isRead ? (
                                <FaCheckDouble className="text-xs text-blue-200" />
                              ) : (
                                <FaCheck className="text-xs text-blue-200" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  Someone is typing...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border-t border-gray-800/50 p-4">
          {replyingTo && (
            <div className="flex items-center justify-between p-2 mb-2 bg-blue-900/30 rounded-lg border border-blue-700/50 text-sm text-blue-200">
              <div className="flex-1 truncate">
                Replying to{" "}
                <span className="font-semibold">{replyingTo.senderName}</span>:{" "}
                {replyingTo.content}
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-blue-200 hover:text-white"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-center space-x-3 w-full px-4 py-2">
            <div className="flex-1 relative w-full">
              <textarea
                value={editingMessage ? editingMessage.content : newMessage}
                onChange={(e) =>
                  editingMessage
                    ? setEditingMessage({
                        ...editingMessage,
                        content: e.target.value,
                      })
                    : setNewMessage(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            {editingMessage ? (
              <>
                <button
                  onClick={handleEditMessage}
                  disabled={!editingMessage.content.trim()}
                  className="cursor-pointer p-3 bg-green-600/20 to-green-700/20 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                  <FaCheck className="text-lg w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingMessage(null)}
                  className="cursor-pointer p-3 bg-red-600/20 to-red-700/20 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                  <FaTimes className="text-lg w-3 h-3" />
                </button>
              </>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="cursor-pointer p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
              >
                <FaPaperPlane className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 backdrop-blur-sm px-6 py-3 border-t border-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2">
                <FaCircle className="text-green-500 text-xs" />
                <span>
                  {participants.filter((p: any) => p.isOnline).length} online
                </span>
              </span>
              <span>
                {participants.length} total member
                {participants.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="text-xs" />
              <span>
                Last activity:{" "}
                {messages.length > 0
                  ? formatTime(messages[messages.length - 1].timestamp)
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="w-1/3 bg-black/20 backdrop-blur-sm border-l border-gray-800/50 flex flex-col">
          {/* Details Header */}
          <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Project Details
                </h3>
                <p className="text-sm text-gray-400">
                  {displayProjectDetails.description}
                </p>
              </div>
              <button
                onClick={toggleDetails}
                className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-black/20 backdrop-blur-sm border-b border-gray-800/30 p-4">
            <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
              {[
                { id: "overview", label: "Overview", icon: FaInfoCircle },
                { id: "resources", label: "Resources", icon: FaFolder },
                { id: "milestones", label: "Milestones", icon: FaTasks },
                { id: "participants", label: "Team", icon: FaUsers },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`cursor-pointer flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <tab.icon className="text-xs" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "resources" && renderResourcesTab()}
            {activeTab === "milestones" && renderMilestonesTab()}
            {activeTab === "participants" && renderParticipantsTab()}
          </div>

          {/* Details Footer */}
          <div className="bg-black/20 backdrop-blur-sm border-t border-gray-800/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {permissions.canManageProject && (
                  <>
                    <button className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                      <FaEdit className="text-sm" />
                    </button>
                    <button className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                      <FaCog className="text-sm" />
                    </button>
                  </>
                )}
                <button className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <FaShare className="text-sm" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <FaProjectDiagram className="text-xs" />
                <span>ID: {displayProjectDetails.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectChat;
