"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaStar,
  FaQuoteRight,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaPlay,
  FaPause,
  FaBuilding,
  FaBullseye,
  FaHandshake,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useAuth } from "@/hooks/useAuth";
import { useReviewCrud } from "@/hooks/useReviewCrud";
import { ReviewType } from "@/types";
import ReviewForm from "@/app/components/ReviewForm";
import ToastNotification from "@/app/components/ToastNotification";
import EnhancedStatsCards from "../components/EnhancedStatsCards";

// Toast state type
interface ToastState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900/95 border border-gray-300 dark:border-gray-700 rounded-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ClientReviews() {
  const { user } = useAuth();
  const {
    fetchReviews,
    deleteReview,
    isLoading: crudLoading,
    error: crudError,
  } = useReviewCrud();

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Admin states
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Toast functions
  const addToast = useCallback((notification: Omit<ToastState, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...notification, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Fetch reviews from API
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const reviewsData = await fetchReviews();
      setReviews(reviewsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load reviews";
      setError(errorMessage);
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1 || hoveredCard !== null) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length, hoveredCard]);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Admin functions
  const handleEditReview = (review: ReviewType) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleDeleteReview = (review: ReviewType) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setIsLoading(true);

      const success = await deleteReview(reviewToDelete.id);

      if (success) {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));

        addToast({
          type: "success",
          title: "Review Deleted",
          message: `Review by ${reviewToDelete.name} has been deleted successfully`,
        });

        // If we deleted the current review, adjust the index
        if (currentIndex >= reviews.length - 1) {
          setCurrentIndex(Math.max(0, reviews.length - 2));
        }
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete review";
      addToast({
        type: "error",
        title: "Delete Failed",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleAddReview = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    // Reload reviews after successful create/update
    loadReviews();

    addToast({
      type: "success",
      title: editingReview ? "Review Updated" : "Review Created",
      message: editingReview
        ? "Review has been updated successfully"
        : "New review has been created successfully",
    });

    // Reset form state
    setEditingReview(null);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <>
        <section
          id="reviews"
          className="py-32 mt-0 relative overflow-hidden bg-gray-50 dark:bg-transparent"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 dark:block hidden"></div>

          {/* Light theme background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:hidden block"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="text-gray-900 dark:text-white text-xl">
                Loading reviews...
              </div>
            </div>
          </div>
        </section>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
            />
          ))}
        </div>

        {/* Confirmation Modal */}
        {isAdmin && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setReviewToDelete(null);
            }}
            onConfirm={confirmDeleteReview}
            title="Delete Review"
            message="Are you sure you want to delete this review? This action cannot be undone."
          />
        )}

        {/* Review Form Modal */}
        {isAdmin && (
          <ReviewForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingReview(null);
            }}
            onSuccess={handleFormSuccess}
            editingReview={editingReview}
            mode={editingReview ? "edit" : "create"}
          />
        )}
      </>
    );
  }

  if (reviews.length === 0) {
    return (
      <>
        <section
          id="reviews"
          className="py-32 mt-0 relative overflow-hidden bg-gray-50 dark:bg-transparent"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 dark:block hidden"></div>

          {/* Light theme background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:hidden block"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="text-gray-900 dark:text-white text-xl">
                No reviews available
              </div>
              {isAdmin && (
                <button
                  onClick={handleAddReview}
                  className="cursor-pointer mt-4 bg-blue-500/70 hover:scale-105 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  <FaPlus className="inline mr-2" />
                  Add Review
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
            />
          ))}
        </div>

        {/* Confirmation Modal */}
        {isAdmin && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setReviewToDelete(null);
            }}
            onConfirm={confirmDeleteReview}
            title="Delete Review"
            message="Are you sure you want to delete this review? This action cannot be undone."
          />
        )}

        {/* Review Form Modal */}
        {isAdmin && (
          <ReviewForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingReview(null);
            }}
            onSuccess={handleFormSuccess}
            editingReview={editingReview}
            mode={editingReview ? "edit" : "create"}
          />
        )}
      </>
    );
  }
  return (
    <>
      <section
        id="reviews"
        className="py-32 mt-0 relative overflow-hidden bg-gray-50 dark:bg-transparent"
      >
        {/* Enhanced Background Elements - only show in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 dark:block hidden"></div>

        {/* Light theme background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:hidden block"></div>

        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 dark:from-blue-500/20 to-cyan-500/10 dark:to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 dark:from-purple-500/20 to-pink-500/10 dark:to-pink-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-500/10 dark:from-indigo-500/20 to-blue-500/10 dark:to-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 md:p-0 relative z-10">
          {/* Enhanced Title Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wider uppercase">
                Client Success Stories
              </span>
            </div>

            <h2 className="text-4xl font-medium bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6">
              Transforming Visions
              <span className="text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
                {" "}
                Into Reality
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real stories from industry leaders who've accelerated their growth
              with our exceptional talent network
            </p>

            {/* Admin Add Button */}
            {isAdmin && (
              <div className="mt-8">
                <button
                  onClick={handleAddReview}
                  className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <FaPlus className="text-sm" />
                  Add Review
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Review Carousel */}
          <div className="relative max-w-5xl mx-auto mb-12">
            {/* Auto-play controls */}
            {/* <div className="flex justify-center mb-8">
              <button
                onClick={toggleAutoPlay}
                className="cursor-pointer flex items-center gap-2 bg-black/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
              >
                {isAutoPlaying ? (
                  <FaPause className="text-sm" />
                ) : (
                  <FaPlay className="text-sm" />
                )}
                <span className="text-sm font-medium">
                  {isAutoPlaying ? "Pause" : "Play"}
                </span>
              </button>
            </div> */}

            <div className="overflow-hidden rounded-3xl ">
              <div
                className="flex transition-all duration-700 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {reviews.map((review, index) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-6">
                    <div
                      className="relative group"
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Main card with enhanced styling */}
                      <div className="backdrop-blur-xl w-full bg-white dark:bg-gradient-to-br dark:from-white/10 dark:via-white/5 dark:to-transparent border border-gray-200 dark:border-white/20 rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-white/15">
                        {/* Quote decoration */}
                        <div className="absolute top-6 right-6 text-6xl text-blue-400/10 font-serif">
                          <FaQuoteRight />
                        </div>

                        {/* Header section */}
                        <div className="flex items-start justify-start w-full mb-8 gap-8">
                          <div className="flex items-center gap-4">
                            {/* Enhanced avatar */}
                            <div className="relative">
                              {review.avatar ? (
                                <img
                                  src={review.avatar}
                                  alt={review.name}
                                  className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-lg ${
                                  review.avatar ? "hidden" : ""
                                }`}
                              >
                                <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center">
                                  <FaUser className="text-gray-500 dark:text-gray-400 text-xl" />
                                </div>
                              </div>
                              {review.featured && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-gray-900 dark:text-white font-semibold text-xl mb-1">
                              {review.name}
                            </h4>
                            <p className="text-blue-600 dark:text-blue-300 font-medium mb-1">
                              {review.position}
                            </p>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <FaBuilding className="text-xs" />
                              <span className="text-xs uppercase">
                                {review.project}
                              </span>
                            </div>
                          </div>

                          {/* Rating with animation */}
                          <div className="absolute top-6 right-10 flex gap-1 items-center justify-end">
                            {/* Admin Controls */}
                            {isAdmin && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="cursor-pointer bg-blue-500/20 backdrop-blur text-blue-600 dark:text-blue-300 p-2 rounded-full hover:bg-blue-500/30 transition-all duration-300"
                                >
                                  <FaEdit className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review)}
                                  className="cursor-pointer bg-red-500/20 backdrop-blur text-red-600 dark:text-red-300 p-2 rounded-full hover:bg-red-500/30 transition-all duration-300"
                                  disabled={isDeleting === review.id}
                                >
                                  <FaTrash className="text-sm" />
                                </button>
                              </div>
                            )}
                            {[...Array(review.rating)].map((_, i) => (
                              <FaStar
                                key={i}
                                className="text-yellow-400 text-sm"
                              />
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <FaStar
                                key={i + review.rating}
                                className="text-gray-400 dark:text-gray-600 text-sm"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review text with better typography */}
                        <blockquote className="text-gray-700 dark:text-gray-100 text-lg leading-relaxed mb-8 font-light relative">
                          {review.review}
                        </blockquote>

                        {/* Enhanced project info cards */}
                        <div className="grid grid-cols-1 items-end justify-baseline md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-100 dark:bg-black/10 backdrop-blur-3xl rounded-xl p-4 border border-gray-300 dark:border-white/10">
                            <div className="text-blue-400 font-semibold text-md mb-1">
                              {review.timeToHire}
                            </div>
                            <div className="text-gray-500 dark:text-gray-200 text-xs tracking-wide uppercase">
                              Time to Hire
                            </div>
                          </div>

                          <div className="bg-gray-100 dark:bg-black/10 backdrop-blur-3xl rounded-xl p-4 border border-gray-300 dark:border-white/10">
                            <div className="text-purple-400 font-semibold text-md mb-1">
                              {review.project}
                            </div>
                            <div className="text-gray-500 dark:text-gray-200 text-xs tracking-wide uppercase">
                              Project Type
                            </div>
                          </div>

                          <div className="bg-gray-100 dark:bg-black/10 backdrop-blur-3xl rounded-xl p-4 border border-gray-300 dark:border-white/10">
                            <div className="text-green-400 font-semibold text-md mb-1">
                              {review.keyResult}
                            </div>
                            <div className="text-gray-500 dark:text-gray-200 text-xs tracking-wide uppercase">
                              Key Result
                            </div>
                          </div>
                        </div>

                        {/* Hover effects */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Navigation */}
            <button
              onClick={prevReview}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 -translate-x-6 w-12 h-12 bg-gray-200 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-full cursor-pointer flex items-center justify-center text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:border-blue-500 dark:hover:border-blue-400/50 group"
            >
              <FaChevronLeft className="text-sm group-hover:text-blue-400 transition-colors duration-300" />
            </button>

            <button
              onClick={nextReview}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 translate-x-6 w-12 h-12 bg-gray-200 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-full cursor-pointer flex items-center justify-center text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:border-blue-500 dark:hover:border-blue-400/50 group"
            >
              <FaChevronRight className="text-sm group-hover:text-blue-400 transition-colors duration-300" />
            </button>
          </div>

          {/* Enhanced Progress Indicators */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-3 rounded-full px-6 py-3">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`cursor-pointer relative transition-all duration-500 ${
                    currentIndex === index
                      ? "w-8 h-3 bg-gradient-to-r from-blue-500 dark:from-blue-400 to-purple-500 dark:to-purple-400 rounded-full"
                      : "w-3 h-3 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40 rounded-full"
                  }`}
                >
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 dark:from-blue-400 to-purple-500 dark:to-purple-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <EnhancedStatsCards />
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
            />
          ))}
        </div>

        {/* Confirmation Modal */}
        {isAdmin && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setReviewToDelete(null);
            }}
            onConfirm={confirmDeleteReview}
            title="Delete Review"
            message="Are you sure you want to delete this review? This action cannot be undone."
          />
        )}

        {/* Review Form Modal */}
        {isAdmin && (
          <ReviewForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingReview(null);
            }}
            onSuccess={handleFormSuccess}
            editingReview={editingReview}
            mode={editingReview ? "edit" : "create"}
          />
        )}
      </section>
    </>
  );
}
