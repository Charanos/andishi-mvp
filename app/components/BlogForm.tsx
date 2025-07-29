"use client";

import React, { useState, useEffect } from "react";
import { BlogPostType } from "@/lib/blogData";
import { BlogFormData, useBlogCrud } from "@/hooks/useBlogCrud";
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaImage,
  FaPalette,
  FaUser,
  FaTag,
  FaEdit,
  FaFileAlt,
} from "react-icons/fa";
import dynamic from "next/dynamic";

const RichContentEditor = dynamic(() => import("./RichContentEditor"), {
  ssr: false,
});

interface BlogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBlog?: BlogPostType | null;
  mode: "create" | "edit";
}

export default function BlogForm({
  isOpen,
  onClose,
  onSuccess,
  editingBlog,
  mode,
}: BlogFormProps) {
  const { createBlog, updateBlog, isLoading, error, clearError } =
    useBlogCrud();

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    image: "",
    gradient: "",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingBlog && mode === "edit") {
      setFormData({
        title: editingBlog.title,
        excerpt: editingBlog.excerpt,
        content: editingBlog.content,
        author: editingBlog.author,
        category: editingBlog.category,
        image: editingBlog.image,
        gradient: editingBlog.gradient,
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        category: "",
        image: "",
        gradient: "",
      });
    }
  }, [editingBlog, mode, isOpen]);

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
      !formData.title ||
      !formData.excerpt ||
      !formData.content ||
      !formData.author ||
      !formData.category
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
        result = await createBlog(formData);
      } else if (editingBlog) {
        result = await updateBlog(editingBlog.id, formData);
      }

      if (result) {
        setNotification({
          type: "success",
          message: `Blog post ${
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaEdit className="text-blue-400 text-xl" />
            <h2 className="text-2xl font-semibold text-white">
              {mode === "create" ? "Create New Blog Post" : "Edit Blog Post"}
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
                ? "bg-green-500/20 border border-green-500/30 text-green-300"
                : "bg-red-500/20 border border-red-500/30 text-red-300"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaFileAlt className="text-blue-400" />
                <span>Title *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Enter blog post title..."
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaUser className="text-green-400" />
                <span>Author *</span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Author name..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaTag className="text-purple-400" />
                <span>Category *</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              >
                <option value="">Select category...</option>
                <option value="AI & Future Tech">AI & Future Tech</option>
                <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                <option value="Team Leadership">Team Leadership</option>
                <option value="Security">Security</option>
                <option value="Development">Development</option>
                <option value="Remote Work">Remote Work</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaImage className="text-yellow-400" />
                <span>Image URL</span>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Gradient */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <FaPalette className="text-pink-400" />
                <span>Gradient Classes</span>
              </label>
              <input
                type="text"
                name="gradient"
                value={formData.gradient}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="from-blue-500/20 to-purple-500/10"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <FaFileAlt className="text-cyan-400" />
              <span>Excerpt *</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Brief description of the blog post..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <FaEdit className="text-orange-400" />
              <span>Content *</span>
            </label>
            <RichContentEditor
              value={formData.content}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, content: val }))
              }
              placeholder="Write engaging content…"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Post"
                  : "Update Post"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
