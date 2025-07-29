"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaHeart,
  FaBookmark,
  FaShare,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import FeaturedBlogLayout from "@/app/components/FeaturedBlogLayout";
import ToastContainer from "../../components/ToastContainer";
import { ToastNotification as ToastNotificationType } from "../../components/ToastNotification";
import "../../components/rich-content-enhanced.css";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string | null;
  gradient: string | null;
  readTime: string;
  views: string;
  likes: string;
  createdAt: string;
  updatedAt: string;
}

export default function EnhancedBlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // Fetch blog data and all related data in parallel for better performance
        const [
          blogResponse,
          likeResponse,
          bookmarkResponse,
          commentsResponse
        ] = await Promise.all([
          fetch(`/api/blogs/${id}`),
          fetch(`/api/blogs/${id}/like`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`/api/blogs/${id}/bookmark`),
          fetch(`/api/blogs/${id}/comment`)
        ]);

        const blogResult = await blogResponse.json();

        if (blogResult.success) {
          setBlog(blogResult.data);
          setLikeCount(parseInt(blogResult.data.likes) || 0);

          // Increment view count (fire and forget)
          fetch(`/api/blogs/${id}/view`, { method: "POST" }).catch(viewError => {
            console.error("Error incrementing view count:", viewError);
          });

          // Check like status
          if (likeResponse.ok) {
            const likeData = await likeResponse.json();
            setIsLiked(likeData.liked);
          }

          // Check bookmark status
          if (bookmarkResponse.ok) {
            const bookmarkData = await bookmarkResponse.json();
            setIsBookmarked(bookmarkData.bookmarked);
          }

          // Load comments
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData.data || []);
          }
        } else {
          setError(blogResult.error || "Blog post not found");
        }
      } catch (err) {
        setError("Failed to load blog post");
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  // Scroll progress tracking
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

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestName: "Anonymous", // For anonymous users, we can use a default name
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.data.liked);
        setLikeCount((prev) => (data.data.liked ? prev + 1 : prev - 1));
        // Show success message
        if (data.data.liked) {
          addToast({
            type: "success",
            title: "Success",
            message: "Blog liked!",
            duration: 3000,
          });
        } else {
          addToast({
            type: "success",
            title: "Success",
            message: "Blog unliked!",
            duration: 3000,
          });
        }
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to like blog",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to like blog",
        duration: 3000,
      });
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}/bookmark`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.data.bookmarked);
        // Show success message
        if (data.data.bookmarked) {
          addToast({
            type: "success",
            title: "Success",
            message: "Blog bookmarked!",
            duration: 3000,
          });
        } else {
          addToast({
            type: "success",
            title: "Success",
            message: "Blog unbookmarked!",
            duration: 3000,
          });
        }
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to bookmark blog",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error bookmarking blog:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to bookmark blog",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400 monty uppercase">Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl text-red-400 mb-4">😞</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error || "The blog post you're looking for doesn't exist."}
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
          >
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {blog && (
        <FeaturedBlogLayout
          blog={blog}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          likeCount={likeCount}
          comments={comments}
          scrollProgress={scrollProgress}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onComment={async (content) => {
            try {
              const response = await fetch(`/api/blogs/${id}/comment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
              });

              if (response.ok) {
                const newComment = await response.json();
                setComments((prev: any[]) => [newComment.data, ...prev]);
                addToast({
                  type: "success",
                  title: "Success",
                  message: "Comment added successfully!",
                  duration: 3000,
                });
              } else {
                addToast({
                  type: "error",
                  title: "Error",
                  message: "Failed to add comment",
                  duration: 3000,
                });
              }
            } catch (error) {
              console.error("Error adding comment:", error);
              addToast({
                type: "error",
                title: "Error",
                message: "Failed to add comment",
                duration: 3000,
              });
            }
          }}
          onCommentLike={async (commentId) => {
            try {
              const response = await fetch(
                `/api/blogs/${id}/comment/${commentId}/like`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.ok) {
                const result = await response.json();
                // Update the comments state to reflect the like/unlike
                setComments((prev: any[]) =>
                  prev.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          likes: result.data.liked
                            ? comment.likes + 1
                            : comment.likes - 1,
                        }
                      : comment
                  )
                );
                addToast({
                  type: "success",
                  title: "Success",
                  message: result.data.liked
                    ? "Comment liked!"
                    : "Comment unliked!",
                  duration: 3000,
                });
              } else {
                addToast({
                  type: "error",
                  title: "Error",
                  message: "Failed to like comment",
                  duration: 3000,
                });
              }
            } catch (error) {
              console.error("Error liking comment:", error);
              addToast({
                type: "error",
                title: "Error",
                message: "Failed to like comment",
                duration: 3000,
              });
            }
          }}
          onReply={async (commentId, content) => {
            try {
              const response = await fetch(
                `/api/blogs/${id}/comment/${commentId}/reply`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content }),
                }
              );

              if (response.ok) {
                const newReply = await response.json();
                // Update the comments state to add the new reply
                setComments((prev: any[]) =>
                  prev.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          replies: [...comment.replies, newReply.data],
                        }
                      : comment
                  )
                );
                addToast({
                  type: "success",
                  title: "Success",
                  message: "Reply added successfully!",
                  duration: 3000,
                });
              } else {
                const error = await response.json();
                addToast({
                  type: "error",
                  title: "Error",
                  message: error.error || "Failed to add reply",
                  duration: 3000,
                });
              }
            } catch (error) {
              console.error("Error adding reply:", error);
              addToast({
                type: "error",
                title: "Error",
                message: "Failed to add reply",
                duration: 3000,
              });
            }
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer
        notifications={toasts}
        onRemoveNotification={removeToast}
        position="top-right"
      />
    </>
  );
}
