"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaImage,
  FaUser,
  FaTag,
  FaEdit,
  FaFileAlt,
  FaArrowCircleLeft,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import { useBlogCrud } from "@/hooks/useBlogCrud";
import ToastNotification from "@/app/components/ToastNotification";
import { ToastNotification as ToastNotificationType } from "@/app/components/ToastNotification";
import ImageUpload from "@/app/components/ImageUpload";

const RichContentEditor = dynamic(
  () => import("@/app/components/RichContentEditor"),
  { ssr: false }
);

export default function BlogFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
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
    authorImage: "",
  });

  const mode = searchParams.get("mode") || "create";
  const id = searchParams.get("id") || "";

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const addToast = (toast: Omit<ToastNotificationType, "id">) => {
    const newToast = {
      ...toast,
      id: Date.now().toString(),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
              authorImage: result.data.authorImage,
            });
          } else {
            addToast({
              type: "error",
              title: "Error",
              message: result.error || "Failed to load blog data",
            });
          }
        } catch (err) {
          addToast({
            type: "error",
            title: "Error",
            message: "Failed to load blog data",
          });
        }
      };

      loadBlogData();
    }
  }, [mode, id]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => removeToast(toasts[0].id), 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

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

    if (
      !formData.title ||
      !formData.excerpt ||
      !formData.content ||
      !formData.author ||
      !formData.category
    ) {
      addToast({
        type: "error",
        title: "Error",
        message: "Please fill in all required fields",
        duration: 5000,
      });
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
        addToast({
          type: "success",
          title: "Success",
          message: `Blog post ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
          duration: 3000,
        });

        // Redirect to home page after success
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: error || "An error occurred",
        duration: 5000,
      });
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
        {toasts.length > 0 && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              toasts[0].type === "success"
                ? "bg-green-900/50 border border-green-800/50 text-green-200"
                : "bg-red-900/50 border border-red-800/50 text-red-200"
            }`}
          >
            <p>{toasts[0].message}</p>
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
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                >
                  <option className="bg-black/50" value="">
                    Select a category
                  </option>
                  <option className="bg-black/50" value="Technology">
                    Technology
                  </option>
                  <option className="bg-black/50" value="Design">
                    Design
                  </option>
                  <option className="bg-black/50" value="Business">
                    Business
                  </option>
                  <option className="bg-black/50" value="Lifestyle">
                    Lifestyle
                  </option>
                  <option className="bg-black/50" value="Career">
                    Career
                  </option>
                  <option className="bg-black/50" value="AI & Future Tech">
                    AI & Future Tech
                  </option>
                  <option className="bg-black/50" value="Team Leadership">
                    Team Leadership
                  </option>
                  <option className="bg-black/50" value="Web3 & Blockchain">
                    Web3 & Blockchain
                  </option>
                  <option
                    className="bg-black/50"
                    value="Cloud & Infrastructure"
                  >
                    Cloud & Infrastructure
                  </option>
                  <option className="bg-black/50" value="Security">
                    Security
                  </option>
                  <option className="bg-black/50" value="Architecture">
                    Architecture
                  </option>
                </select>
              </div>

              {/* Article Image Upload */}
              <div>
                <ImageUpload
                  label="Article Cover Image"
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  icon={<FaImage className="text-purple-400" />}
                  type="cover"
                />
              </div>

              {/* Author Image Upload */}
              <div>
                <ImageUpload
                  label="Author Image"
                  value={formData.authorImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, authorImage: url }))}
                  icon={<FaUser className="text-green-400" />}
                  type="author"
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
                className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
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
                disabled={isLoading}
                className="cursor-pointer flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
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

      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
