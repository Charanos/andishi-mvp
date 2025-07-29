"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaImage,
  FaPalette,
  FaUser,
  FaTag,
  FaEdit,
  FaFileAlt,
  FaArrowCircleLeft,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useBlogCrud } from "@/hooks/useBlogCrud";
import { BlogPostType } from "@/lib/blogData";
import dynamic from "next/dynamic";

const RichContentEditor = dynamic(
  () => import("@/app/components/RichContentEditor"),
  { ssr: false }
);

export default function BlogFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { createBlog, updateBlog, isLoading, error, clearError } =
    useBlogCrud();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: user?.name || "",
    category: "",
    image: "",
    gradient: "",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mode = searchParams.get("mode") || "create";
  const id = searchParams.get("id") || "";

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  // Load blog data for editing
  useEffect(() => {
    if (mode === "edit" && id) {
      const loadBlogData = async () => {
        try {
          const response = await fetch(`/api/blogs/${id}`);
          const result = await response.json();

          if (response.ok && result.data) {
            setFormData({
              title: result.data.title,
              excerpt: result.data.excerpt,
              content: result.data.content,
              author: result.data.author,
              category: result.data.category,
              image: result.data.image,
              gradient: result.data.gradient,
            });
          } else {
            setNotification({
              type: "error",
              message: result.error || "Failed to load blog data",
            });
          }
        } catch (err) {
          setNotification({
            type: "error",
            message: "Failed to load blog data",
          });
        }
      };

      loadBlogData();
    }
  }, [mode, id]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

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
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (mode === "create") {
        result = await createBlog(formData);
      } else if (id) {
        result = await updateBlog(id, formData);
      }

      if (result) {
        setNotification({
          type: "success",
          message: `Blog post ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
        });

        // Redirect to home page after success
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: error || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
          <FaUser className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page.
          </p>
          <Link
            href="/"
            className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            <FaArrowCircleLeft className="w-5 h-5" />
            <span className="text-xs monty uppercase">Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href={"/blogs"}
            className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            <FaArrowCircleLeft className="w-5 h-5" />
            <span className="text-xs monty uppercase">Back to Projects</span>
          </Link>
          <h1 className="text-3xl font-medium text-white mt-4">
            {mode === "create" ? "Create New Blog Post" : "Edit Blog Post"}
          </h1>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-900/50 border border-green-800/50 text-green-200"
                : "bg-red-900/50 border border-red-800/50 text-red-200"
            }`}
          >
            <p>{notification.message}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-800/50 text-red-200">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-black/10 shadow shadow-amber-50/5 border border-gray-700 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <FaEdit className="text-blue-400" />
                  <span>Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter blog post title"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Author name"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Career">Career</option>
                  <option value="AI & Future Tech">AI & Future Tech</option>
                  <option value="Team Leadership">Team Leadership</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Cloud & Infrastructure">
                    Cloud & Infrastructure
                  </option>
                  <option value="Security">Security</option>
                  <option value="Architecture">Architecture</option>
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
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
              <div className="w-full">
                <RichContentEditor
                  value={formData.content}
                  onChange={(html: string) =>
                    setFormData((prev) => ({ ...prev, content: html }))
                  }
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
              <Link
                href="/"
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="cursor-pointer flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting || isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                <span>
                  {isSubmitting || isLoading
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
    </div>
  );
}
