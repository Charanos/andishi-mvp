"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaClock,
  FaBookmark,
  FaEye,
  FaHeart,
  FaShare,
  FaCode,
  FaRocket,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useBlogCrud } from "@/hooks/useBlogCrud";
import { BlogPostType as Blog } from "@/lib/blogData";
import ToastContainer from "../components/ToastContainer";
import ConfirmationModal from "../components/ConfirmationModal";
import useToast from "../../hooks/useToast";

export default function BlogsSection() {
  const { user } = useAuth();
  const { fetchBlogs, deleteBlog, isLoading, error } = useBlogCrud();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Toast notifications
  const {
    notifications: toastNotifications,
    removeNotification: removeToastNotification,
    toast,
  } = useToast();

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
    loading: false,
  });

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { blogs: blogData } = await fetchBlogs();
        if (blogData) {
          setAllBlogs(blogData);

          // Fetch featured blogs from the API endpoint
          const featuredResponse = await fetch("/api/blogs/featured");
          const featuredResult = await featuredResponse.json();

          if (featuredResponse.ok && featuredResult.data) {
            const mainFeatured = featuredResult.data.mainFeaturedBlog;
            setFeaturedBlog(mainFeatured || blogData[0]);

            // Filter out the main featured blog from the regular blogs list
            const filteredBlogs = mainFeatured
              ? blogData.filter((blog) => blog.id !== mainFeatured.id)
              : blogData.slice(1); // If no main featured, exclude first blog
            setBlogs(filteredBlogs);
          } else {
            // Fallback: use first blog as featured and exclude it from list
            setFeaturedBlog(blogData[0]);
            setBlogs(blogData.slice(1));
          }
        }
      } catch (err) {
        console.error("Failed to load blogs:", err);
        // Fallback to fetch blogs only if featured API fails
        try {
          const { blogs: blogData } = await fetchBlogs();
          if (blogData) {
            setAllBlogs(blogData);
            setFeaturedBlog(blogData[0]);
            setBlogs(blogData.slice(1));
          }
        } catch (fallbackErr) {
          console.error("Failed to load blogs in fallback:", fallbackErr);
        }
      }
    };

    loadBlogs();
  }, [fetchBlogs]);

  // Handle delete blog
  const handleDeleteBlog = async (id: string, title: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Blog Post",
      message: `Are you sure you want to delete the blog post "${title}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteBlog(id),
      variant: "danger",
      loading: false,
    });
  };

  // Confirm delete blog
  const confirmDeleteBlog = async (id: string) => {
    setConfirmationModal((prev) => ({ ...prev, loading: true }));

    try {
      const success = await deleteBlog(id);
      if (success) {
        toast.success("Success", "Blog post deleted successfully!");
        // Refresh the blog list
        const { blogs: blogData } = await fetchBlogs();
        if (blogData) {
          setAllBlogs(blogData);

          // Update featured blog if necessary
          if (featuredBlog?.id === id) {
            const featuredResponse = await fetch("/api/blogs/featured");
            const featuredResult = await featuredResponse.json();

            if (featuredResponse.ok && featuredResult.data) {
              const mainFeatured = featuredResult.data.mainFeaturedBlog;
              setFeaturedBlog(mainFeatured || blogData[0]);

              // Filter out the main featured blog from the regular blogs list
              const filteredBlogs = mainFeatured
                ? blogData.filter((blog) => blog.id !== mainFeatured.id)
                : blogData.slice(1);
              setBlogs(filteredBlogs);
            } else {
              setFeaturedBlog(blogData[0]);
              setBlogs(blogData.slice(1));
            }
          } else {
            // If deleted blog wasn't featured, just filter the list
            const filteredBlogs = featuredBlog
              ? blogData.filter((blog) => blog.id !== featuredBlog.id)
              : blogData.slice(1);
            setBlogs(filteredBlogs);
          }
        }
      } else {
        toast.error("Error", "Failed to delete blog post");
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
      toast.error("Error", "An error occurred while deleting the blog post");
    } finally {
      setConfirmationModal({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        variant: "info",
        loading: false,
      });
    }
  };

  // Close confirmation modal
  const handleCloseConfirmationModal = () => {
    setConfirmationModal((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: () => {},
    }));
  };

  // Handle setting main featured blog
  const handleSetMainFeatured = async (blog: Blog) => {
    try {
      // Immediately update the UI to reflect the change
      setFeaturedBlog(blog);
      setBlogs(prevBlogs => prevBlogs.filter(b => b.id !== blog.id));
      
      const response = await fetch(`/api/blogs/featured`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featuredBlogids: [],
          mainFeaturedBlogid: blog.id
        })
      });

      if (response.ok) {
        toast.success("Success", "Featured blog updated successfully!");
        // Refresh the blog list and featured blog data from API to confirm the change
        const { blogs: blogData } = await fetchBlogs();
        if (blogData) {
          setAllBlogs(blogData);

          // Fetch updated featured blogs from the API endpoint
          const featuredResponse = await fetch("/api/blogs/featured");
          const featuredResult = await featuredResponse.json();

          if (featuredResponse.ok && featuredResult.data) {
            const mainFeatured = featuredResult.data.mainFeaturedBlog;
            setFeaturedBlog(mainFeatured || blogData[0]);

            // Filter out the main featured blog from the regular blogs list
            const filteredBlogs = mainFeatured
              ? blogData.filter((b) => b.id !== mainFeatured.id)
              : blogData.slice(1);
            setBlogs(filteredBlogs);
          } else {
            // Fallback
            setFeaturedBlog(blog);
            const filteredBlogs = blogData.filter((b) => b.id !== blog.id);
            setBlogs(filteredBlogs);
          }
        }
      } else {
        // If the API call fails, revert the UI changes
        const { blogs: blogData } = await fetchBlogs();
        if (blogData) {
          setAllBlogs(blogData);
          
          // Fetch current featured blogs from the API endpoint
          const featuredResponse = await fetch("/api/blogs/featured");
          const featuredResult = await featuredResponse.json();

          if (featuredResponse.ok && featuredResult.data) {
            const mainFeatured = featuredResult.data.mainFeaturedBlog;
            setFeaturedBlog(mainFeatured || blogData[0]);

            // Filter out the main featured blog from the regular blogs list
            const filteredBlogs = mainFeatured
              ? blogData.filter((b) => b.id !== mainFeatured.id)
              : blogData.slice(1);
            setBlogs(filteredBlogs);
          } else {
            setFeaturedBlog(blogData[0]);
            setBlogs(blogData.slice(1));
          }
        }
        
        const errorData = await response.json();
        toast.error(
          "Error",
          errorData.error || "Failed to update featured blog"
        );
      }
    } catch (err) {
      // If there's an error, revert the UI changes
      const { blogs: blogData } = await fetchBlogs();
      if (blogData) {
        setAllBlogs(blogData);
        
        // Fetch current featured blogs from the API endpoint
        const featuredResponse = await fetch("/api/blogs/featured");
        const featuredResult = await featuredResponse.json();

        if (featuredResponse.ok && featuredResult.data) {
          const mainFeatured = featuredResult.data.mainFeaturedBlog;
          setFeaturedBlog(mainFeatured || blogData[0]);

          // Filter out the main featured blog from the regular blogs list
          const filteredBlogs = mainFeatured
            ? blogData.filter((b) => b.id !== mainFeatured.id)
            : blogData.slice(1);
          setBlogs(filteredBlogs);
        } else {
          setFeaturedBlog(blogData[0]);
          setBlogs(blogData.slice(1));
        }
      }
      
      console.error("Error setting featured blog:", err);
      toast.error("Error", "Failed to update featured blog");
    }
  };

  // Social sharing functions
  const shareBlog = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const title = blog.title;
    const text = `Check out this article: ${title}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Success", "Blog URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Error", "Failed to copy URL to clipboard");
      });
  };

  const shareToTwitter = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const text = `Check out this article: ${blog.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareToLinkedIn = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedInUrl, "_blank");
  };

  const shareToFacebook = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank");
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
      case "AI & Future Tech":
        return <FaRocket className="text-xs" />;
      case "Web3 & Blockchain":
        return <FaCode className="text-xs" />;
      case "Security":
        return <FaBookmark className="text-xs" />;
      default:
        return <FaRocket className="text-xs" />;
    }
  };

  const getCardSizeClasses = (size?: "large" | "medium" | "small") => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2"; // Takes up 4 grid cells
      case "medium":
        return "md:col-span-2 md:row-span-1"; // Takes up 2 grid cells
      case "small":
      default:
        return "md:col-span-1 md:row-span-1"; // Takes up 1 grid cell
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl lg:text-4xl font-medium text-white">
                Tech{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Insights
                </span>
              </h1>
              {isAdmin && (
                <Link
                  href="/blog-form?mode=create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                  title="Create New Post"
                >
                  <FaPlus className="text-sm" />
                  <span>New Post</span>
                </Link>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Explore the latest insights on remote work, AI, blockchain, and the
            technologies shaping tomorrow's development landscape
          </p>
        </div>

        {/* Featured Article */}
        {featuredBlog && (
          <div className="mb-16">
            <article className="group relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-[1.01] cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="relative grid md:grid-cols-2 gap-0 min-h-[400px]">
                {/* Content */}
                <div className="relative p-8 lg:p-12 flex flex-col justify-center space-y-6 md-4">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
                      <span className="text-blue-300 text-sm font-medium">
                        {featuredBlog.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <IoMdTrendingUp className="text-xs" />
                      <span className="text-xs font-medium monty uppercase">
                        Featured
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl lg:text-3xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                    {featuredBlog.title}
                  </h3>

                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed text-lg">
                    {featuredBlog.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-xs" />
                        <span className="monty uppercase">
                          {featuredBlog.author}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-xs" />
                        <span className="monty uppercase">
                          {featuredBlog.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-xs" />
                        <span className="monty uppercase">
                          {featuredBlog.readTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Link
                      href={`/blogs/${featuredBlog.slug || featuredBlog.id}`}
                      className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 monty uppercase hover:to-purple-600 transition-all duration-300 hover:scale-105 group/btn"
                    >
                      <span>Read Full Article</span>
                      <FaArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>

                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaEye className="text-xs" />
                        <span className="monty uppercase text-sm">
                          {featuredBlog.views}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaHeart className="text-xs" />
                        <span className="monty uppercase text-sm">
                          {featuredBlog.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="relative bg-gradient-to-br from-gray-700 to-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-6 right-6 w-3 h-3 bg-blue-400/50 rounded-full animate-pulse"></div>
                  <Image
                    width={5000}
                    height={5000}
                    alt="featured blog image"
                    src={featuredBlog.image || " "}
                    className="w-full z-30 h-full object-cover rounded-b-3xl"
                  />
                  <div
                    className="absolute bottom-8 left-6 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400 monty uppercase">Loading blogs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-red-900/30 border border-red-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-medium text-white mb-4">
                Error Loading Blogs
              </h3>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug || blog.id}`}
                className={`group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-[1.02] cursor-pointer block ${getCardSizeClasses(
                  blog.size
                )}`}
                style={{
                  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.02) 50%, rgba(236, 72, 153, 0.03) 100%)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
                }}
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSetMainFeatured(blog);
                      }}
                      className="cursor-pointer p-2 bg-yellow-600/80 backdrop-blur-sm text-white rounded-full hover:bg-yellow-700/80 transition-colors duration-300"
                      title="Set as Featured Blog"
                    >
                      <FaStar className="text-xs" />
                    </button>
                    <Link
                      href={`/blog-form?mode=edit&id=${blog.id}`}
                      className="cursor-pointer p-2 bg-blue-600/80 backdrop-blur-sm text-white rounded-full hover:bg-blue-700/80 transition-colors duration-300"
                      title="Edit Blog"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit className="text-xs" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteBlog(blog.id, blog.title);
                      }}
                      disabled={isDeleting === blog.id}
                      className="cursor-pointer p-2 bg-red-600/80 backdrop-blur-sm text-white rounded-full hover:bg-red-700/80 transition-colors duration-300 disabled:opacity-50"
                      title="Delete Blog"
                    >
                      {isDeleting === blog.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        <FaTrash className="text-xs" />
                      )}
                    </button>
                  </div>
                )}

                {/* Blog Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                  {blog.image && (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                      <CategoryIcon category={blog.category} />
                      <span className="text-xs font-medium text-white">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-medium text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <FaUser className="text-xs" />
                        <span className="monty uppercase">{blog.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span className="monty uppercase">{blog.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <FaEye className="text-xs" />
                        <span className="monty uppercase">{blog.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaHeart className="text-xs" />
                        <span className="monty uppercase">{blog.likes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-300">
                      <span className="text-sm font-medium">Read More</span>
                      <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaBookmark className="text-xs" />
                      </button>
                      <div className="relative group/share">
                        <button
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Show sharing options dropdown
                            const shareMenu = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (shareMenu) {
                              shareMenu.classList.toggle("hidden");
                            }
                          }}
                        >
                          <FaShare className="text-xs" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 hidden">
                          <button
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              shareBlog(blog);
                              // Hide the menu
                              const shareMenu = e.currentTarget
                                .parentElement as HTMLElement;
                              if (shareMenu) {
                                shareMenu.classList.add("hidden");
                              }
                            }}
                          >
                            <FaShare className="text-xs" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-blue-400 hover:bg-gray-700 hover:text-blue-300 transition-colors duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              shareToTwitter(blog);
                              // Hide the menu
                              const shareMenu = e.currentTarget
                                .parentElement as HTMLElement;
                              if (shareMenu) {
                                shareMenu.classList.add("hidden");
                              }
                            }}
                          >
                            <FaTwitter className="text-xs" />
                            <span>Twitter</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              shareToLinkedIn(blog);
                              // Hide the menu
                              const shareMenu = e.currentTarget
                                .parentElement as HTMLElement;
                              if (shareMenu) {
                                shareMenu.classList.add("hidden");
                              }
                            }}
                          >
                            <FaLinkedin className="text-xs" />
                            <span>LinkedIn</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-blue-600 hover:bg-gray-700 hover:text-blue-500 transition-colors duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              shareToFacebook(blog);
                              // Hide the menu
                              const shareMenu = e.currentTarget
                                .parentElement as HTMLElement;
                              if (shareMenu) {
                                shareMenu.classList.add("hidden");
                              }
                            }}
                          >
                            <FaFacebook className="text-xs" />
                            <span>Facebook</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                <div
                  className="absolute bottom-3 right-3 w-1 h-1 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                  style={{ animationDelay: "1s" }}
                ></div>
              </Link>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-20">
            <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-medium text-white mb-4">
                Error Loading Blogs
              </h3>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={() => {
                  // Clear error and try to reload
                  const loadBlogs = async () => {
                    try {
                      const { blogs: blogData } = await fetchBlogs();
                      if (blogData) {
                        setAllBlogs(blogData);

                        // Fetch featured blogs
                        const featuredResponse = await fetch(
                          "/api/blogs/featured"
                        );
                        const featuredResult = await featuredResponse.json();

                        if (featuredResponse.ok && featuredResult.data) {
                          const mainFeatured =
                            featuredResult.data.mainFeaturedBlog;
                          setFeaturedBlog(mainFeatured || blogData[0]);

                          // Filter out the main featured blog from the regular blogs list
                          const filteredBlogs = mainFeatured
                            ? blogData.filter(
                                (blog) => blog.id !== mainFeatured.id
                              )
                            : blogData.slice(1);
                          setBlogs(filteredBlogs);
                        } else {
                          setFeaturedBlog(blogData[0]);
                          setBlogs(blogData.slice(1));
                        }
                      }
                    } catch (err) {
                      console.error("Failed to reload blogs:", err);
                    }
                  };
                  loadBlogs();
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-full hover:from-red-700 hover:to-orange-700 transition-all duration-300"
              >
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogs.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-medium text-white mb-4">
                No Blogs Found
              </h3>
              <p className="text-gray-400 mb-6">
                There are no blog posts available at the moment.
              </p>
              {isAdmin && (
                <Link
                  href="/blog-form?mode=create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  <FaPlus className="text-sm" />
                  <span>Create First Post</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <ToastContainer
          notifications={toastNotifications}
          onRemoveNotification={removeToastNotification}
          position="top-right"
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={handleCloseConfirmationModal}
          variant={confirmationModal.variant}
          loading={confirmationModal.loading}
        />
      </div>
    </section>
  );
}
