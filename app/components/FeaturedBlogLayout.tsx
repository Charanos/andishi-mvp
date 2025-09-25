"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaUser,
  FaArrowLeft,
  FaClock,
  FaBookmark,
  FaEye,
  FaHeart,
  FaShare,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaArrowRight,
  FaComment,
  FaThumbsUp,
  FaQuoteLeft,
  FaCode,
  FaArrowCircleLeft,
  FaCopy,
} from "react-icons/fa";
import RichTextViewer from "./RichTextViewer";
import BlogImage from "./BlogImage";
import ToastNotification from "./ToastNotification";
import { ToastNotification as ToastNotificationType } from "./ToastNotification";

interface BlogPost {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string | null;
  gradient?: string | null;
  authorImage?: string | null;
  readTime: string;
  views: string;
  likes: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedArticle {
  id: string;
  slug?: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

interface Comment {
  id: string;
  author: string;
  authorTitle?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface EnhancedBlogLayoutProps {
  blog: BlogPost;
  relatedArticles?: RelatedArticle[];
  comments?: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  likeCount?: number;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: (content: string) => void;
  onCommentLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  scrollProgress?: number;
}

export default function EnhancedBlogLayout({
  blog,
  relatedArticles = [],
  comments = [],
  isLiked = false,
  isBookmarked = false,
  likeCount = 0,
  onLike,
  onBookmark,
  onComment,
  onCommentLike,
  onReply,
  scrollProgress = 0,
}: EnhancedBlogLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLike = () => {
    setLocalLiked(!localLiked);
    setLocalLikeCount(localLiked ? localLikeCount - 1 : localLikeCount + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setLocalBookmarked(!localBookmarked);
    onBookmark?.();
  };

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

  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      addToast({
        type: "success",
        title: "Success",
        message: "Blog URL copied to clipboard!",
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to copy URL to clipboard",
        duration: 3000,
      });
    }
  };

  const shareToTwitter = () => {
    const url = window.location.href;
    const text = `Check out this article: ${blog.title} by ${blog.author}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedInUrl, "_blank");
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank");
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment?.(commentText);
      setCommentText("");
    }
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" />
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Navigation */}
      <nav className="sticky top-20 z-50 p-6">
        <Link href="/blogs">
          <button className="inline-flex cursor-pointer uppercase text-xs items-center bg-black/10 dark:bg-white/5 backdrop-blur-lg border border-gray-300 dark:border-white/20 my-3 py-2 px-4 shadow-md rounded-full space-x-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
            <FaArrowCircleLeft className="text-sm" />
            <span>Back to Articles</span>
          </button>
        </Link>
      </nav>

      {/* Article Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-0">
          {/* Category Badge */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
              <FaCode className="text-blue-400 text-sm" />
              <span className="text-blue-300 text-sm font-medium">
                {blog.category}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Subtitle/Excerpt */}
          <p className="text-base font-normal text-gray-800 dark:text-gray-300 mb-8 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Author & Meta Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 mb-12">
            <div className="flex items-center space-x-4">
              {blog.authorImage ? (
                <img
                  src={blog.authorImage}
                  alt={blog.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {getAuthorInitials(blog.author)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium">
                  {blog.author}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs monty uppercase">
                  Author
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xs" />
                <span className="monty uppercase">
                  {formatDate(blog.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-xs" />
                <span className="monty uppercase">{blog.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEye className="text-xs" />
                <span className="monty uppercase">{blog.views} views</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-6 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl mb-12">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`cursor-pointer bg-white/70 dark:bg-black/50 backdrop-blur-xl flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  localLiked
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-white/10 hover:border-red-500/30 hover:text-red-400"
                }`}
              >
                <FaHeart className="text-sm" />
                <span className="text-sm font-medium">{localLikeCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`cursor-pointer bg-white/70 dark:bg-black/50 backdrop-blur-xl flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  localBookmarked
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-400"
                }`}
              >
                <FaBookmark className="text-sm" />
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-gray-700 dark:text-gray-400 text-sm">
                Share:
              </span>
              <button
                onClick={copyToClipboard}
                className="cursor-pointer p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors duration-300"
              >
                <FaCopy className="text-sm" />
              </button>
              <button
                onClick={shareToTwitter}
                className="cursor-pointer p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors duration-300"
              >
                <FaTwitter className="text-sm" />
              </button>
              <button
                onClick={shareToLinkedIn}
                className="cursor-pointer p-2 bg-blue-700/20 text-blue-400 rounded-full hover:bg-blue-700/30 transition-colors duration-300"
              >
                <FaLinkedin className="text-sm" />
              </button>
              <button
                onClick={shareToFacebook}
                className="cursor-pointer p-2 bg-blue-800/20 text-blue-400 rounded-full hover:bg-blue-800/30 transition-colors duration-300"
              >
                <FaFacebook className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Featured Image */}
          {blog.image && (
            <div className="mb-12">
              <div className="relative rounded-2xl overflow-hidden">
                <BlogImage
                  src={blog.image}
                  alt={blog.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  priority
                  maxWidth={1200}
                  maxHeight={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          )}

          {/* Article Body */}
          <article className="max-w-none">
            <RichTextViewer html={blog.content} enhanced={true} />
          </article>

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-gradient-to-br from-gray-100/80 to-gray-50/90 dark:from-white/5 dark:to-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-medium">
                  {getAuthorInitials(blog.author)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  About {blog.author}
                </h3>
                <p className="text-blue-600 dark:text-blue-300 text-sm mb-3">
                  Author
                </p>
                <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
                  {blog.author} is a contributor to our blog, sharing insights
                  and expertise on {blog.category.toLowerCase()} and related
                  topics.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={shareToTwitter}
                    className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    <FaTwitter className="text-lg" />
                  </button>
                  <button
                    onClick={shareToLinkedIn}
                    className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    <FaLinkedin className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 mb-16">
              <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-8 flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                <span>Related Articles</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/blogs/${article.slug || article.id}`}
                  >
                    <article className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                      <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      <div className="relative p-4 space-y-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                          {article.title}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <FaUser className="text-xs" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaClock className="text-xs" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>

                        <button className="cursor-pointer flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-300">
                          <span className="text-sm font-medium">
                            Read Article
                          </span>
                          <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="mt-16">
            <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-8 flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <span>Discussion</span>
              <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">
                ({comments.length} comments)
              </span>
            </h2>

            {/* Comment Form */}
            <div className="mb-8 p-6 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this article..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-black/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim()}
                      className="px-6 cursor-pointer py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-6 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {getAuthorInitials(comment.author)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-gray-900 dark:text-white font-medium">
                            {comment.author}
                          </h4>
                          {comment.authorTitle && (
                            <span className="text-blue-600 dark:text-blue-400 text-sm">
                              {comment.authorTitle}
                            </span>
                          )}
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-300 leading-relaxed mb-4">
                          {comment.content}
                        </p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => onCommentLike?.(comment.id)}
                            className="cursor-pointer flex items-center space-x-2 text-gray-700 dark:text-gray-400 hover:text-blue-400 transition-colors duration-300"
                          >
                            <FaThumbsUp className="text-sm" />
                            <span className="text-sm">{comment.likes}</span>
                          </button>
                          <button
                            onClick={() => {
                              // Set reply target
                              setReplyingTo(comment.id);
                            }}
                            className="cursor-pointer text-gray-700 dark:text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="ml-14 mt-4 p-4 bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">
                              {getAuthorInitials("You")}
                            </span>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full p-3 bg-white/90 dark:bg-black/50 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none"
                              rows={3}
                            />
                            <div className="flex items-center justify-end space-x-3 mt-3">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (replyText.trim() && onReply) {
                                    onReply(comment.id, replyText.trim());
                                    setReplyText("");
                                    setReplyingTo(null);
                                  }
                                }}
                                disabled={!replyText.trim()}
                                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-14 mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-4 bg-gray-50/60 dark:bg-white/3 backdrop-blur-sm border border-gray-200 dark:border-white/5 rounded-xl"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {getAuthorInitials(reply.author)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h5 className="text-gray-900 dark:text-white font-medium text-sm">
                                    {reply.author}
                                  </h5>
                                  <span className="text-gray-700 dark:text-gray-400 text-xs">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-300 text-sm leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Newsletter CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-500/10 dark:to-purple-500/10 backdrop-blur-sm border border-blue-200 dark:border-blue-500/20 rounded-2xl text-center">
            <FaCode className="text-4xl text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
              Stay Ahead of the Curve
            </h3>
            <p className="text-gray-800 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Get weekly insights on the latest tech trends, AI developments,
              and remote work strategies delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300"
              />
              <button className="w-full cursor-pointer sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-400 text-sm mt-4">
              Join 10,000+ developers. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Fixed Progress & Share Bar */}
      {scrollProgress > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block">
          <div className="flex items-center space-x-4 px-6 py-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-900 dark:text-white text-sm">
                Reading Progress: {Math.round(scrollProgress)}%
              </span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className="cursor-pointer p-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
              >
                <FaHeart
                  className={`text-sm ${
                    localLiked ? "fill-current text-red-400" : ""
                  }`}
                />
              </button>
              <button
                onClick={handleBookmark}
                className="cursor-pointer p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <FaBookmark
                  className={`text-sm ${
                    localBookmarked ? "fill-current text-blue-400" : ""
                  }`}
                />
              </button>
              <button
                onClick={copyToClipboard}
                className="cursor-pointer p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <FaCopy className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {scrollProgress > 20 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 z-50"
        >
          <FaArrowRight className="transform -rotate-90" />
        </button>
      )}

      {/* Toast Notifications */}
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
