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
  FaEdit,
  FaTrash,
  FaPlus,
  FaExclamationTriangle,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useBlogCrud } from "@/hooks/useBlogCrud";
import ToastNotification from "@/app/components/ToastNotification";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { ToastNotification as ToastNotificationType } from "@/app/components/ToastNotification";

export default function LatestInsights() {
  const { user, isLoading: authLoading, token } = useAuth();
  const { fetchBlogs, deleteBlog, isLoading, error } = useBlogCrud();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [mainFeaturedBlog, setMainFeaturedBlog] = useState<Blog | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { blogs: blogData } = await fetchBlogs();
        if (blogData) {
          setBlogs(blogData);

          // Fetch featured blogs from the API endpoint
          const featuredResponse = await fetch("/api/blogs/featured");
          const featuredResult = await featuredResponse.json();

          if (featuredResponse.ok && featuredResult.data) {
            const mainFeatured = featuredResult.data.mainFeaturedBlog;
            const featured = featuredResult.data.featuredBlogs || [];

            setMainFeaturedBlog(mainFeatured || blogData[0]);
            setFeaturedBlogs(
              featured.length > 0 ? featured.slice(0, 3) : blogData.slice(0, 3)
            );
          } else {
            // Fallback to first 3 blogs
            setFeaturedBlogs(blogData.slice(0, 3));
            setMainFeaturedBlog(blogData[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load blogs:", err);
      }
    };

    loadBlogs();
  }, [fetchBlogs]);

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

  const handleDeleteBlog = async (id: string, title: string) => {
    setBlogToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  // Social sharing functions
  const shareBlog = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const title = blog.title;
    const text = `Check out this article: ${title}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      addToast({
        type: "success",
        title: "Success",
        message: "Blog URL copied to clipboard!",
        duration: 3000,
      });
    }).catch(() => {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to copy URL to clipboard",
        duration: 3000,
      });
    });
  };

  const shareToTwitter = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const text = `Check out this article: ${blog.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToLinkedIn = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
  };

  const shareToFacebook = (blog: Blog) => {
    const url = `${window.location.origin}/blogs/${blog.slug || blog.id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;

    const { id, title } = blogToDelete;
    setIsDeleteModalOpen(false);
    setIsDeleting(id);

    try {
      const success = await deleteBlog(id);
      if (success) {
        addToast({
          type: "success",
          title: "Success",
          message: "Blog post deleted successfully!",
          duration: 5000,
        });
        fetchBlogs(); // Refresh the blog list
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to delete blog post",
          duration: 5000,
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: "An error occurred while deleting the blog post",
        duration: 5000,
      });
    } finally {
      setIsDeleting(null);
      setBlogToDelete(null);
    }
  };

  interface Blog {
    id: string;
    slug?: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    views?: string;
    likes?: string;
    category: string;
    gradient?: string;
    authorImage?: string;
    size?: "large" | "medium" | "small";
    image?: string;
    featured?: boolean;
  }

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

  if (authLoading || isLoading) {
    return (
      <section id="blogs" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-6">
              <FaRocket className="text-blue-400 text-sm" />
              <span className="text-blue-300 text-sm font-medium">
                Loading Insights
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Discover the Future of{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Tech Innovation
              </span>
            </h2>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400 monty uppercase">Loading blogs...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="blogs" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center bg-red-900/30 border border-red-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaExclamationTriangle className="text-red-400 text-2xl" />
              <h3 className="text-2xl font-medium text-white">
                Error Loading Blogs
              </h3>
            </div>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => fetchBlogs()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blogs" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-6">
            <FaBookmark className="text-blue-400 text-sm" />
            <span className="text-blue-300 text-sm font-medium">
              Latest Insights
            </span>
          </div>

          <div className="flex items-center justify-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Discover the Future of{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Tech Innovation
              </span>
            </h2>
          </div>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Stay ahead of the curve with cutting-edge insights on remote work,
            AI, blockchain, and the technologies shaping tomorrow's development
            landscape
          </p>
        </div>

        {/* Featured Article */}
        {mainFeaturedBlog && (
          <div className="mb-16">
            <Link
              href={`/blogs/${mainFeaturedBlog.slug || mainFeaturedBlog.id}`}
              className="group relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-[1.01] cursor-pointer block"
            >
              {/* Admin Controls for Featured Blog - Only visible to admins */}
              {isAdmin && (
                <div className="absolute top-6 right-6 z-10 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/blog-form?mode=edit&id=${mainFeaturedBlog.id}`;
                    }}
                    className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full text-white hover:bg-blue-600 transition-colors duration-300"
                    title="Edit Post"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteBlog(
                        mainFeaturedBlog.id,
                        mainFeaturedBlog.title
                      );
                    }}
                    disabled={isDeleting === mainFeaturedBlog.id}
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
                    title="Delete Post"
                  >
                    {isDeleting === mainFeaturedBlog.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    ) : (
                      <FaTrash className="text-xs" />
                    )}
                  </button>
                </div>
              )}

              <div
                className={`absolute inset-0 bg-gradient-to-br ${mainFeaturedBlog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              ></div>

              <div className="relative grid md:grid-cols-2 gap-0 min-h-[400px]">
                {/* Content */}
                <div className="relative p-8 lg:p-12 flex flex-col justify-center space-y-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
                      <CategoryIcon category={mainFeaturedBlog.category} />
                      <span className="text-blue-300 text-sm font-medium">
                        {mainFeaturedBlog.category}
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
                    {mainFeaturedBlog.title}
                  </h3>

                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed text-lg">
                    {mainFeaturedBlog.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-xs" />
                        <span>{mainFeaturedBlog.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-xs" />
                        <span>{mainFeaturedBlog.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-xs" />
                        <span>{mainFeaturedBlog.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 monty uppercase hover:to-purple-600 transition-all duration-300 hover:scale-105 group/btn">
                      <span>Read Full Article</span>
                      <FaArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </div>

                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaEye className="text-xs" />
                        <span className="text-sm">
                          {mainFeaturedBlog.views}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaHeart className="text-xs" />
                        <span className="text-sm">
                          {mainFeaturedBlog.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="relative bg-gradient-to-br from-gray-700 to-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-6 right-6 w-3 h-3 bg-blue-400/50 rounded-full animate-pulse"></div>
                  {mainFeaturedBlog.image && (
                    <Image
                      width={5000}
                      height={5000}
                      alt="featured blog image"
                      src={mainFeaturedBlog.image}
                      className="w-full z-30 h-full object-cover rounded-b-3xl"
                    />
                  )}
                  <div
                    className="absolute bottom-8 left-6 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other Featured Blogs */}
        {featuredBlogs.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featuredBlogs
              .filter((blog) => blog.id !== mainFeaturedBlog?.id)
              .slice(0, 2)
              .map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug || blog.id}`}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer block"
                >
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/blog-form?mode=edit&id=${blog.id}`;
                        }}
                        className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full text-white hover:bg-blue-600 transition-colors duration-300"
                        title="Edit Post"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteBlog(blog.id, blog.title);
                        }}
                        disabled={isDeleting === blog.id}
                        className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
                        title="Delete Post"
                      >
                        {isDeleting === blog.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        ) : (
                          <FaTrash className="text-xs" />
                        )}
                      </button>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${blog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  ></div>

                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {blog.image && (
                      <Image
                        width={5000}
                        height={5000}
                        alt="blog image"
                        src={blog.image}
                        className="w-full z-30 h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                        <CategoryIcon category={blog.category} />
                        <span className="text-white text-xs font-medium">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <FaUser className="text-xs" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaClock className="text-xs" />
                          <span>{blog.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <FaEye className="text-xs" />
                          <span>{blog.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaHeart className="text-xs" />
                          <span>{blog.likes}</span>
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
                              const shareMenu = e.currentTarget.nextElementSibling as HTMLElement;
                              if (shareMenu) {
                                shareMenu.classList.toggle('hidden');
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
                                const shareMenu = e.currentTarget.parentElement as HTMLElement;
                                if (shareMenu) {
                                  shareMenu.classList.add('hidden');
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
                                const shareMenu = e.currentTarget.parentElement as HTMLElement;
                                if (shareMenu) {
                                  shareMenu.classList.add('hidden');
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
                                const shareMenu = e.currentTarget.parentElement as HTMLElement;
                                if (shareMenu) {
                                  shareMenu.classList.add('hidden');
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
                                const shareMenu = e.currentTarget.parentElement as HTMLElement;
                                if (shareMenu) {
                                  shareMenu.classList.add('hidden');
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

        {/* CTA Section */}
        <div className="text-center sm:mt-40 mt-16">
          <Link
            href="/blogs"
            className="group monty inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full capitalize hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
          >
            <span> more articles</span>
            <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
