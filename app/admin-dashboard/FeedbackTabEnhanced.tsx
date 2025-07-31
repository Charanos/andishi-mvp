"use client";

import React, { useState, useEffect } from "react";
import { ContactFeedback } from "@/types";
import { useFeedback } from "@/hooks/useFeedback";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";
import {
  FiSearch,
  FiFilter,
  FiCheck,
  FiTrash2,
  FiMail,
  FiUser,
  FiClock,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiMessageSquare,
  FiCalendar,
  FiArchive,
  FiAlertCircle,
  FiInbox,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import {
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaUserFriends,
  FaInbox,
} from "react-icons/fa";

const FeedbackTabEnhanced: React.FC = () => {
  const {
    feedback,
    loading,
    error,
    pagination,
    fetchFeedback,
    markAsRead,
    deleteFeedback,
  } = useFeedback();

  // Toast notifications
  const {
    notifications: toastNotifications,
    removeNotification: removeToastNotification,
    toast,
  } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] =
    useState<ContactFeedback | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest"
  );

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] =
    useState<ContactFeedback | null>(null);

  // Fetch feedback when component mounts or filters change
  useEffect(() => {
    fetchFeedback({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
    });
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: "all" | "read" | "unread") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (id: string, read: boolean) => {
    try {
      await markAsRead(id, read);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, read } : null));
      }
      fetchFeedback({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      // Show success toast
      toast.success(
        read ? "Marked as Read" : "Marked as Unread",
        "Feedback status updated successfully",
        3000
      );
    } catch (error) {
      toast.error("Failed to update status", "Please try again later", 5000);
    }
  };

  const handleDeleteClick = (feedback: ContactFeedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;

    try {
      await deleteFeedback(feedbackToDelete.id);
      if (selectedFeedback?.id === feedbackToDelete.id) {
        setSelectedFeedback(null);
      }
      fetchFeedback({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      // Show success toast
      toast.success(
        "Feedback Deleted",
        "Feedback has been permanently removed",
        3000
      );
    } catch (error) {
      toast.error("Failed to delete feedback", "Please try again later", 5000);
    } finally {
      setShowDeleteModal(false);
      setFeedbackToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFeedbackToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUnreadCount = () => feedback.filter((item) => !item.read).length;
  const getTotalCount = () => pagination.total;

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400 monty uppercase">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
        <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-4" />
        <h3 className="text-xl font-medium text-red-400 mb-2">
          Error Loading Feedback
        </h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() =>
            fetchFeedback({
              page: currentPage,
              limit: 10,
              search: searchTerm,
              status: statusFilter,
            })
          }
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw className="text-sm" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3">
              <FaInbox className="text-blue-400" />
              User Feedback Management
            </h2>
            <p className="text-gray-300">
              Monitor and respond to customer inquiries and feedback
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg p-4 text-center min-w-[100px]">
              <div className="text-2xl font-semibold text-blue-400">
                {getTotalCount()}
              </div>
              <div className="text-xs text-blue-300 uppercase tracking-wide">
                Total
              </div>
            </div>
            <div className="bg-yellow-900/40 border border-yellow-500/30 rounded-lg p-4 text-center min-w-[100px]">
              <div className="text-2xl font-semibold text-yellow-400">
                {getUnreadCount()}
              </div>
              <div className="text-xs text-yellow-300 uppercase tracking-wide">
                Unread
              </div>
            </div>
            <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-4 text-center min-w-[100px]">
              <div className="text-2xl font-semibold text-green-400">
                {getTotalCount() - getUnreadCount()}
              </div>
              <div className="text-xs text-green-300 uppercase tracking-wide">
                Read
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 border border-white/10 rounded-xl p-6 my-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search feedback by name, email, subject, or message..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleStatusFilter("all")}
              className={`cursor-pointer px-5 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium border-2 ${
                statusFilter === "all"
                  ? "bg-blue-500/10 border-blue-500/40 text-blue-300/40"
                  : "bg-black/40 backdrop-blur-xl  border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <FiMessageSquare />
              All
            </button>
            <button
              onClick={() => handleStatusFilter("unread")}
              className={`cursor-pointer px-5 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium border-2 ${
                statusFilter === "unread"
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300/40"
                  : "bg-black/40 backdrop-blur-xl  border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <FiMail />
              Unread
              {getUnreadCount() > 0 && (
                <span className="bg-yellow-500/80 text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                  {getUnreadCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => handleStatusFilter("read")}
              className={`cursor-pointer px-5 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium border-2 ${
                statusFilter === "read"
                  ? "bg-green-500/10 border-green-500/40 text-green-300/40"
                  : "bg-black/40 backdrop-blur-xl border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <FiCheck />
              Read
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-4">
          {feedback.length === 0 ? (
            <div className="bg-black/40 backdrop-blur-xl border border-gray-400/40">
              <FiInbox className="mx-auto text-6xl text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                No feedback found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl ${
                  selectedFeedback?.id === item.id
                    ? "ring-2 ring-blue-500 border-blue-500/50 scale-[1.01] bg-gray-800/50"
                    : !item.read
                    ? "bg-yellow-900/10 border-yellow-500/30 hover:bg-yellow-900/20"
                    : "bg-black/20 border-gray-800/70 hover:bg-gray-900/40"
                }`}
                onClick={() => {
                  // If the message is unread, mark it as read automatically
                  if (!item.read) {
                    handleMarkAsRead(item.id, true);
                  }
                  // Always select the feedback for viewing
                  setSelectedFeedback(item);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white truncate">
                        {item.subject}
                      </h3>
                      {!item.read && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-blue-400" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMail className="text-green-400" />
                        <span>{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-purple-400" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id, !item.read);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/60 border border-transparent hover:border-gray-600 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer group"
                      title={item.read ? "Mark as Unread" : "Mark as Read"}
                    >
                      {item.read ? (
                        <FiEyeOff className="text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-yellow-400" />
                      ) : (
                        <FiEye className="text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/60 border border-transparent hover:border-gray-600 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer group"
                      title="Delete Feedback"
                    >
                      <FiTrash2 className="text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {feedback.length > 0 && pagination.totalPages > 1 && (
            <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-400">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, pagination.total)} of{" "}
                  {pagination.total} feedback
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800/50 hover:bg-gray-700/50 text-white"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === pagination.totalPages
                        ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800/50 hover:bg-gray-700/50 text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Details Sidebar */}
        <div className="lg:col-span-1 lg:sticky top-24 self-start">
          {selectedFeedback ? (
            <div className="bg-black/40 backdrop-blur-xl border border-gray-400/40 rounded-xl p-6 sticky top-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-white">
                    {selectedFeedback.subject}
                  </h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="cursor-pointer p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    title="Close details"
                  >
                    <FiXCircle className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center my-10 gap-2 text-sm text-gray-400 mb-1">
                      <FiUser className="text-blue-400" />
                      <span className="monty uppercase">From</span>
                    </div>
                    <p className="text-white font-normal monty">
                      {selectedFeedback.name} ({selectedFeedback.email})
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center my-10 gap-2 text-sm text-gray-400 mb-1">
                      <FiClock className="text-purple-400" />
                      <span className="monty uppercase">Received</span>
                    </div>
                    <p className="text-white font-normal monty">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center my-10 gap-2 text-sm text-gray-400 mb-1">
                      <FiMessageSquare className="text-green-400" />
                      <span className="monty uppercase">Message</span>
                    </div>
                    <div className="bg-white/10 border border-white/10 rounded-lg p-4">
                      <p className="text-white font-normal monty whitespace-pre-wrap">
                        {selectedFeedback.message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      handleMarkAsRead(
                        selectedFeedback.id,
                        !selectedFeedback.read
                      )
                    }
                    className="border border-gray-400/10  backdrop-blur-xl cursor-pointer flex-1 py-3 px-4 rounded-lg bg-white/1 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                    {selectedFeedback.read ? (
                      <>
                        <FiEyeOff className="text-yellow-400" />
                        <span>Mark as Unread</span>
                      </>
                    ) : (
                      <>
                        <FiEye className="text-green-400" />
                        <span>Mark as Read</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedFeedback)}
                    className="border border-gray-400/10  backdrop-blur-xl cursor-pointer flex-1 py-3 px-4 rounded-lg  bg-white/1 hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiTrash2 className="text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-xl border border-gray-400/40 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <FiInbox className="mx-auto text-4xl text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Select a feedback item
              </h3>
              <p className="text-gray-400 text-sm">
                Choose a feedback from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && feedbackToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>
              <h3 className="text-xl font-medium text-white">
                Delete Feedback
              </h3>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete this feedback from{" "}
              <span className="font-medium text-white">
                {feedbackToDelete.name}
              </span>
              ?
            </p>

            <p className="text-sm text-gray-400 mb-6">
              Subject: "{feedbackToDelete.subject}"
            </p>

            <p className="text-sm text-red-400 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        notifications={toastNotifications}
        onRemoveNotification={removeToastNotification}
        position="top-right"
      />
    </div>
  );
};

export default FeedbackTabEnhanced;
