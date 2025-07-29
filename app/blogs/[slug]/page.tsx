"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  Bookmark,
  Share,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  ThumbsUp,
  ArrowRight,
  Lightbulb,
  Quote,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { FaArrowCircleLeft } from "react-icons/fa";
import RichTextViewer from "../../components/RichTextViewer";
import useToast from "../../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { IoIosMail } from "react-icons/io";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
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
  const slug = params.slug as string;
  const { notifications, removeNotification, toast } = useToast();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // Fetch blog data
        const blogResponse = await fetch(`/api/blogs/${slug}`);
        const blogResult = await blogResponse.json();

        if (blogResult.success) {
          setBlog(blogResult.data);
          setLikeCount(parseInt(blogResult.data.likes) || 0);

          // Increment view count
          try {
            await fetch(`/api/blogs/${slug}/view`, { method: "POST" });
          } catch (viewError) {
            console.error("Error incrementing view count:", viewError);
          }

          // Check like status
          try {
            const likeResponse = await fetch(`/api/blogs/${slug}/like`);
            const likeResult = await likeResponse.json();
            if (likeResult.success) {
              setIsLiked(likeResult.liked);
            }
          } catch (likeError) {
            console.error("Error checking like status:", likeError);
          }

          // Check bookmark status
          try {
            const bookmarkResponse = await fetch(`/api/blogs/${slug}/bookmark`);
            const bookmarkResult = await bookmarkResponse.json();
            if (bookmarkResult.success) {
              setIsBookmarked(bookmarkResult.bookmarked);
            }
          } catch (bookmarkError) {
            console.error("Error checking bookmark status:", bookmarkError);
          }

          // Fetch comments
          try {
            const commentsResponse = await fetch(`/api/blogs/${slug}/comment`);
            const commentsResult = await commentsResponse.json();
            if (commentsResult.success) {
              setComments(commentsResult.data);
            }
          } catch (commentsError) {
            console.error("Error fetching comments:", commentsError);
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

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Scroll progress tracking
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
      const response = await fetch(`/api/blogs/${slug}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success) {
        setIsLiked(result.data.liked);
        setLikeCount(result.data.likes);
        toast.success(
          result.data.liked ? "Blog liked!" : "Like removed",
          result.data.liked
            ? "You liked this blog post"
            : "You unliked this blog post"
        );
      } else {
        toast.error(
          "Like action failed",
          result.error || "Unable to process like action"
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Like action failed", "Unable to process like action");
      // Revert UI changes on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/blogs/${slug}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success) {
        setIsBookmarked(result.data.bookmarked);
        toast.success(
          result.data.bookmarked ? "Blog bookmarked!" : "Bookmark removed",
          result.data.bookmarked
            ? "You bookmarked this blog post"
            : "You unbookmarked this blog post"
        );
      } else {
        toast.error(
          "Bookmark action failed",
          result.error || "Unable to process bookmark action"
        );
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error(
        "Bookmark action failed",
        "Unable to process bookmark action"
      );
      // Revert UI changes on error
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/blogs/${slug}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const result = await response.json();

      if (result.success) {
        setComments([result.data, ...comments]);
        setNewComment("");
        toast.success(
          "Comment added!",
          "Your comment has been posted successfully"
        );
      } else {
        toast.error(
          "Comment failed",
          result.error || "Unable to post your comment"
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Comment failed", "Unable to post your comment");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 monty uppercase">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-normal text-white mb-4">404</h1>
          <p className="text-gray-300 mb-8">{error || "Blog post not found"}</p>
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen my-16">
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
        position="top-right"
      />
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className=" z-50 p-6 sticky top-20">
        <Link
          href={"/blogs"}
          className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-lg"
        >
          <FaArrowCircleLeft className="w-5 h-5" />
          <span className="text-xs monty uppercase">Back to Blogs</span>
        </Link>
      </nav>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Article Header */}
      <header className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Category and Tags */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-sm font-normal">
                {blog.category}
              </span>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4 leading-tight">
            {blog.title}
          </h1>

          <p className="text-base text-gray-300 mb-8 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Author & Meta Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-medium">{blog.author}</h3>
                <p className="text-gray-400 text-sm">Content Author</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-12">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/30 hover:text-red-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-normal">{likeCount}</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isBookmarked
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-blue-500/30 hover:text-blue-400"
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-normal">Save</span>
              </button>

              <button className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-normal">Comment</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">Share:</span>
              <button className="cursor-pointer p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="cursor-pointer p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors duration-300">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="p-2 cursor-pointer bg-blue-700/20 text-blue-400 rounded-full hover:bg-blue-700/30 transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <article className="space-y-8 mb-8">
            <RichTextViewer html={blog.content} />
          </article>

          {/* Author Bio */}
          <div className="p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl mb-8">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-white mb-2">
                  About {blog.author}
                </h3>
                <p className="text-blue-300 text-sm mb-3">Content Author</p>
                <p className="text-gray-300 leading-relaxed">
                  Passionate about sharing insights and knowledge with our
                  community. Dedicated to creating valuable content that helps
                  readers stay informed about the latest trends and
                  developments.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="max-w-full mx-auto mb-16">
            <h3 className="text-xl font-medium text-white mb-6 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex flex-col space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-800/30 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {comment.user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {comment.user.name}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl text-center mb-16">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoIosMail className="text-white w-6 h-6" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest articles and insights delivered straight to your
              inbox. Join our community of readers and never miss an update.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-full mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-[50%] px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300"
              />
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-normal rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Join thousands of readers. Unsubscribe anytime.
            </p>
          </div>

          {/* Navigation */}
          <div className="text-center mb-16">
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Blogs
            </Link>
          </div>
        </div>
      </main>

      {/* Fixed Progress & Share Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block">
        <div className="flex items-center space-x-4 px-6 py-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">
              Reading Progress: {Math.round(scrollProgress)}%
            </span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "fill-current text-red-400" : ""
                }`}
              />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked ? "fill-current text-blue-400" : ""
                }`}
              />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 z-50"
        style={{ display: scrollProgress > 20 ? "block" : "none" }}
      >
        <ArrowRight className="w-5 h-5 transform -rotate-90" />
      </button>
    </div>
  );
}
