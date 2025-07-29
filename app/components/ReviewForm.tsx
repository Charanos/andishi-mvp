"use client";

import React, { useState, useEffect } from "react";
import { ReviewType, ReviewFormData } from "@/types";
import { useReviewCrud } from "@/hooks/useReviewCrud";
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaUser,
  FaBriefcase,
  FaStar,
  FaQuoteRight,
  FaProjectDiagram,
  FaImage,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingReview?: ReviewType | null;
  mode: "create" | "edit";
}

export default function ReviewForm({
  isOpen,
  onClose,
  onSuccess,
  editingReview,
  mode,
}: ReviewFormProps) {
  const { createReview, updateReview, isLoading, error, clearError } =
    useReviewCrud();

  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    position: "",
    avatar: "",
    rating: 5,
    review: "",
    project: "",
    featured: false,
    timeToHire: "",
    keyResult: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingReview && mode === "edit") {
      setFormData({
        name: editingReview.name,
        position: editingReview.position,
        avatar: editingReview.avatar || "",
        rating: editingReview.rating,
        review: editingReview.review,
        project: editingReview.project,
        featured: editingReview.featured,
        timeToHire: editingReview.timeToHire || "",
        keyResult: editingReview.keyResult || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        position: "",
        avatar: "",
        rating: 5,
        review: "",
        project: "",
        featured: false,
        timeToHire: "",
        keyResult: "",
      });
    }
  }, [editingReview, mode, isOpen]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (
      !formData.name ||
      !formData.position ||
      !formData.review ||
      !formData.project
    ) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    try {
      let result;
      if (mode === "create") {
        result = await createReview(formData);
      } else if (editingReview) {
        result = await updateReview(editingReview.id, formData);
      }

      if (result) {
        setNotification({
          type: "success",
          message: `Review ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: error || "An error occurred",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && "checked" in e.target) {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Update avatar preview when URL changes
      if (name === "avatar") {
        setAvatarPreview(value);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaQuoteRight className="text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-white">
              {mode === "create" ? "Create New Review" : "Edit Review"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-900/30 border border-green-800 text-green-300"
                : "bg-red-900/30 border border-red-800 text-red-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaUser className="text-blue-400" />
                <span>Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Client name"
                required
              />
            </div>

            {/* Position */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaBriefcase className="text-yellow-400" />
                <span>Position *</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Client position"
                required
              />
            </div>

            {/* Project */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaProjectDiagram className="text-purple-400" />
                <span>Project *</span>
              </label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Project name"
                required
              />
            </div>

            {/* Time to Hire */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaClock className="text-blue-400" />
                <span>Time to Hire</span>
              </label>
              <input
                type="text"
                name="timeToHire"
                value={formData.timeToHire || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="e.g., 2-4 weeks"
              />
            </div>

            {/* Key Result */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaCheckCircle className="text-green-400" />
                <span>Key Result</span>
              </label>
              <input
                type="text"
                name="keyResult"
                value={formData.keyResult || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="e.g., 95% Success"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaStar className="text-yellow-400" />
                <span>Rating *</span>
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaImage className="text-cyan-400" />
                <span>Avatar URL</span>
              </label>
              <div className="flex gap-4 items-start">
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatarPreview && (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        setAvatarPreview("");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span>Featured Review</span>
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Featured reviews will be highlighted on the homepage
              </p>
            </div>

            {/* Review */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaQuoteRight className="text-orange-400" />
                <span>Review *</span>
              </label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="Client review content..."
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Review"
                  : "Update Review"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
