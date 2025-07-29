"use client";

import React, { useState, useEffect } from "react";
import { ReviewType } from "@/types";
import { useReviewCrud } from "@/hooks/useReviewCrud";
import { useToast } from "@/hooks/useToast";
import ReviewForm from "./ReviewForm";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaClock,
  FaSpinner,
  FaQuoteRight,
  FaCheckCircle,
} from "react-icons/fa";

export default function ReviewsAdmin() {
  const { fetchReviews, deleteReview, isLoading, error } = useReviewCrud();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      const reviewData = await fetchReviews();
      if (reviewData) {
        setReviews(reviewData);
      }
      setLoading(false);
    };

    loadReviews();
  }, [fetchReviews]);

  // Handle create review
  const handleCreate = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  // Handle edit review
  const handleEdit = (review: ReviewType) => {
    setEditingReview(review);
    setShowForm(true);
  };

  // Handle delete review
  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (reviewToDelete) {
      const success = await deleteReview(reviewToDelete);
      if (success) {
        setReviews((prev) =>
          prev.filter((review) => review.id !== reviewToDelete)
        );
        toast.success("Review deleted successfully");
      } else {
        toast.error("Failed to delete review");
      }
      setReviewToDelete(null);
      setShowConfirmation(false);
    }
  };

  const handleFormSuccess = () => {
    // Reload reviews after form submission
    const loadReviews = async () => {
      const reviewData = await fetchReviews();
      if (reviewData) {
        setReviews(reviewData);
      }
    };
    loadReviews();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white">Client Reviews</h1>
          <p className="text-gray-400 mt-1">
            Manage client testimonials and reviews
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <FaPlus />
          <span>Add Review</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <FaQuoteRight className="mx-auto text-4xl text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-500">
            Get started by adding your first client review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{review.name}</h3>
                    <p className="text-sm text-gray-400">{review.position}</p>
                  </div>
                </div>
                {review.featured && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <FaCheckCircle className="text-sm" />
                    <span className="text-xs font-medium">Featured</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${
                        i < review.rating ? "text-yellow-400" : "text-gray-600"
                      } text-sm`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {review.review}
                </p>
              </div>

              <div className="border-t border-gray-700 mt-4 pt-4">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FaClock />
                    <span>{review.timeToHire}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaCheckCircle />
                    <span>{review.keyResult}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(review)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit review"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(review.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingReview(null);
        }}
        onSuccess={handleFormSuccess}
        editingReview={editingReview}
        mode={editingReview ? "edit" : "create"}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onCancel={() => {
          setShowConfirmation(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
