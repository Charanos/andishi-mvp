"use client";

import Link from "next/link";
import React, { useState } from "react";
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
  FaCode,
  FaQuoteLeft,
  FaLightbulb,
  FaRocket,
  FaArrowRight,
  FaComment,
  FaThumbsUp,
} from "react-icons/fa";

export default function SingleArticleView() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(156);

  const article = {
    id: 1,
    title:
      "The Future of Remote Work: How AI is Revolutionizing Tech Hiring in 2025",
    subtitle:
      "Exploring the transformative impact of artificial intelligence on remote recruitment processes",
    author: {
      name: "Sarah Mitchell",
      title: "Senior Tech Recruiter & AI Specialist",
      avatar: "/author-avatar.jpg",
      bio: "Sarah has been leading tech recruitment transformations for over 8 years, specializing in AI-driven hiring solutions.",
    },
    date: "June 8, 2025",
    readTime: "3 min read",
    views: "2.1K",
    category: "AI & Future Tech",
    tags: ["AI", "Remote Work", "Hiring", "Technology", "Future of Work"],
    content: [
      {
        type: "paragraph",
        content:
          "The landscape of remote work has undergone a seismic shift, and artificial intelligence is at the epicenter of this transformation. As we navigate through 2025, companies worldwide are discovering that traditional hiring methods are no longer sufficient to identify and secure top talent in an increasingly competitive market.",
      },
      {
        type: "heading",
        content: "The AI Revolution in Recruitment",
      },
      {
        type: "paragraph",
        content:
          "Artificial intelligence has moved beyond simple resume screening tools. Today's AI-powered recruitment platforms can analyze communication patterns, predict cultural fit, and even assess problem-solving capabilities through interactive coding challenges that adapt in real-time to a candidate's skill level.",
      },
      {
        type: "highlight",
        content:
          "Companies using AI-driven recruitment processes report a 40% reduction in time-to-hire and a 60% improvement in candidate quality scores.",
      },
      {
        type: "paragraph",
        content:
          "The most significant breakthrough has been in natural language processing. Modern AI systems can conduct preliminary interviews, ask follow-up questions based on candidate responses, and provide detailed assessments that rival those of experienced human recruiters.",
      },
      {
        type: "heading",
        content: "Key Technologies Shaping the Future",
      },
      {
        type: "list",
        items: [
          "Predictive Analytics for candidate success modeling",
          "Real-time skill assessment through adaptive coding environments",
          "Bias detection and mitigation algorithms",
          "Automated reference checking and verification",
          "Cultural fit analysis through communication pattern recognition",
        ],
      },
      {
        type: "paragraph",
        content:
          "These technologies aren't replacing human judgment—they're augmenting it. The most successful companies are those that have learned to combine AI efficiency with human empathy and intuition.",
      },
      {
        type: "quote",
        content:
          "AI doesn't eliminate the human element in hiring; it amplifies our ability to make better decisions faster.",
        author: "Dr. Elena Rodriguez, MIT AI Research Lab",
      },
      {
        type: "heading",
        content: "Challenges and Considerations",
      },
      {
        type: "paragraph",
        content:
          "Despite these advances, implementing AI in recruitment isn't without challenges. Privacy concerns, algorithm bias, and the need for continuous model training require careful consideration and ongoing investment.",
      },
      {
        type: "paragraph",
        content:
          "Organizations must also consider the candidate experience. While AI can streamline processes, maintaining personal connection and transparency throughout the hiring journey remains crucial for attracting top talent.",
      },
      {
        type: "heading",
        content: "Looking Ahead: The Next Frontier",
      },
      {
        type: "paragraph",
        content:
          "As we look toward the remainder of 2025 and beyond, the integration of AI in remote hiring will only deepen. Virtual reality interviews, AI-powered team dynamics simulation, and even more sophisticated predictive modeling are already in development.",
      },
      {
        type: "paragraph",
        content:
          "The companies that embrace these technologies while maintaining their human-centered values will be the ones that attract and retain the best talent in our increasingly digital world.",
      },
    ] as ArticleContent[],
  };

  const relatedArticles = [
    {
      id: 2,
      title: "Building High-Performance Remote Development Teams",
      author: "Michael Rodriguez",
      date: "June 5, 2025",
      readTime: "8 min read",
      category: "Team Leadership",
    },
    {
      id: 3,
      title: "Web3 Development: Skills in High Demand",
      author: "Alex Chen",
      date: "June 2, 2025",
      readTime: "6 min read",
      category: "Web3 & Blockchain",
    },
    {
      id: 4,
      title: "The Psychology of Code Reviews",
      author: "Nina Patel",
      date: "May 20, 2025",
      readTime: "9 min read",
      category: "Development Culture",
    },
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  interface HeadingContent {
    type: "heading";
    content: string;
  }

  interface ParagraphContent {
    type: "paragraph";
    content: string;
  }

  interface HighlightContent {
    type: "highlight";
    content: string;
  }

  interface QuoteContent {
    type: "quote";
    content: string;
    author?: string;
  }

  interface ListContent {
    type: "list";
    items: string[];
  }

  type ArticleContent =
    | HeadingContent
    | ParagraphContent
    | HighlightContent
    | QuoteContent
    | ListContent;

  const renderContent = (
    item: ArticleContent,
    index: number
  ): React.ReactNode => {
    switch (item.type) {
      case "heading":
        return (
          <h2
            key={index}
            className="text-2xl lg:text-3xl font-semibold text-white mb-6 mt-12 flex items-center space-x-3"
          >
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
            <span>{item.content}</span>
          </h2>
        );
      case "paragraph":
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-6 text-lg">
            {item.content}
          </p>
        );
      case "highlight":
        return (
          <div
            key={index}
            className="my-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl"
          >
            <div className="flex items-start space-x-4">
              <FaLightbulb className="text-yellow-400 text-xl mt-1 flex-shrink-0" />
              <p className="text-blue-200 font-medium text-lg leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        );
      case "quote":
        return (
          <blockquote
            key={index}
            className="my-8 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl relative"
          >
            <FaQuoteLeft className="absolute top-4 left-4 text-purple-400/50 text-2xl" />
            <p className="text-purple-200 font-medium text-xl leading-relaxed mb-4 ml-8">
              "{item.content}"
            </p>
            {item.author && (
              <cite className="text-purple-300 text-sm font-medium ml-8">
                — {item.author}
              </cite>
            )}
          </blockquote>
        );
      case "list":
        return (
          <ul key={index} className="space-y-3 mb-6 ml-4">
            {(item as ListContent).items.map(
              (listItem: string, listIndex: number) => (
                <li key={listIndex} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <span className="text-gray-300 leading-relaxed text-lg">
                    {listItem}
                  </span>
                </li>
              )
            )}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen my-16">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10  h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10  h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <Link href={"/"} className="mx-auto">
          <button className="inline-flex cursor-pointer monty uppercase text-xs items-center bg-white/5 backdrop-blur-lg border-white/70 my-3 py-2 px-4 rounded-full space-x-2 text-gray-400 hover:text-white transition-colors duration-300">
            <FaArrowLeft className="text-sm" />
            <span>Back to Articles</span>
          </button>
        </Link>
      </nav>

      {/* Article Header */}
      <header className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
              <FaRocket className="text-blue-400 text-sm" />
              <span className="text-blue-300 text-sm font-medium">
                {article.category}
              </span>
            </div>
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {article.subtitle}
          </p>

          {/* Author & Meta Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {article.author.name}
                </h3>
                <p className="text-gray-400 text-sm">{article.author.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xs" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-xs" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEye className="text-xs" />
                <span>{article.views}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-12">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/30 hover:text-red-400"
                }`}
              >
                <FaHeart className="text-sm" />
                <span className="text-sm font-medium">{likeCount}</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isBookmarked
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-blue-500/30 hover:text-blue-400"
                }`}
              >
                <FaBookmark className="text-sm" />
                <span className="text-sm font-medium">Save</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all duration-300">
                <FaComment className="text-sm" />
                <span className="text-sm font-medium">Comment</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">Share:</span>
              <button className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors duration-300">
                <FaTwitter className="text-sm" />
              </button>
              <button className="p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors duration-300">
                <FaLinkedin className="text-sm" />
              </button>
              <button className="p-2 bg-blue-700/20 text-blue-400 rounded-full hover:bg-blue-700/30 transition-colors duration-300">
                <FaFacebook className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          <article className="prose prose-lg prose-invert max-w-none">
            {article.content.map((item, index) => renderContent(item, index))}
          </article>

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  About {article.author.name}
                </h3>
                <p className="text-blue-300 text-sm mb-3">
                  {article.author.title}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {article.author.bio}
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                    <FaTwitter className="text-lg" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                    <FaLinkedin className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <section className="mt-16 mb-16">
            <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-8 flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <span>Related Articles</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <article
                  key={relatedArticle.id}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {relatedArticle.category}
                      </span>
                    </div>
                  </div>

                  <div className="relative p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                      {relatedArticle.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-xs" />
                        <span>{relatedArticle.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-xs" />
                        <span>{relatedArticle.readTime}</span>
                      </div>
                    </div>

                    <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-300">
                      <span className="text-sm font-medium">Read Article</span>
                      <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="mt-16">
            <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-8 flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <span>Discussion</span>
              <span className="text-lg text-gray-400 font-normal">
                (24 comments)
              </span>
            </h2>

            {/* Comment Form */}
            <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    placeholder="Share your thoughts on this article..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <button className="hover:text-blue-400 transition-colors duration-300">
                        <FaCode className="mr-1" /> Code
                      </button>
                      <button className="hover:text-blue-400 transition-colors duration-300">
                        <FaQuoteLeft className="mr-1" /> Quote
                      </button>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {/* Comment 1 */}
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">JD</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-white font-semibold">John Doe</h4>
                      <span className="text-blue-400 text-sm">
                        Senior Developer
                      </span>
                      <span className="text-gray-400 text-sm">2 hours ago</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      This is exactly what we've been experiencing at our
                      company. The AI-powered screening has reduced our initial
                      interview time by 60%, and the quality of candidates
                      reaching the final rounds has improved dramatically. Great
                      insights, Sarah!
                    </p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaThumbsUp className="text-sm" />
                        <span className="text-sm">12</span>
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply */}
                <div className="ml-14 mt-4 p-4 bg-white/3 backdrop-blur-sm border border-white/5 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        SM
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="text-white font-semibold text-sm">
                          Sarah Mitchell
                        </h5>
                        <span className="text-yellow-400 text-xs">Author</span>
                        <span className="text-gray-400 text-xs">
                          1 hour ago
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Thanks John! It's great to hear real-world validation.
                        Which AI tools have you found most effective for your
                        team's screening process?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment 2 */}
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">AR</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-white font-semibold">Alex Rivera</h4>
                      <span className="text-blue-400 text-sm">Tech Lead</span>
                      <span className="text-gray-400 text-sm">4 hours ago</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      While I agree AI is transformative, we need to be careful
                      about bias in algorithms. Has anyone encountered issues
                      with AI systems inadvertently filtering out qualified
                      candidates from underrepresented groups?
                    </p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaThumbsUp className="text-sm" />
                        <span className="text-sm">8</span>
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment 3 */}
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">MK</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-white font-semibold">Maya Khan</h4>
                      <span className="text-blue-400 text-sm">HR Director</span>
                      <span className="text-gray-400 text-sm">6 hours ago</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Excellent article! We're implementing some of these AI
                      tools next quarter. The predictive analytics for candidate
                      success modeling sounds particularly promising. Do you
                      have any specific vendor recommendations?
                    </p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaThumbsUp className="text-sm" />
                        <span className="text-sm">15</span>
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load More Comments */}
              <div className="text-center pt-6">
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-full hover:bg-white/20 transition-all duration-300">
                  Load More Comments (21 remaining)
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <div className="mt-16  p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl text-center">
            <FaRocket className="text-4xl text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Stay Ahead of the Curve
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get weekly insights on the latest tech trends, AI developments,
              and remote work strategies delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-300"
              />
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Join 10,000+ developers. Unsubscribe anytime.
            </p>
          </div>

          {/* Reading Progress & Share Bar */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:block hidden">
            <div className="flex items-center space-x-4 px-6 py-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">
                  Reading Progress: 100%
                </span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FaHeart className="text-sm" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FaBookmark className="text-sm" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FaShare className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 z-50"
          >
            <FaArrowRight className="transform -rotate-90" />
          </button>
        </div>
      </main>

      {/* Footer Spacer */}
      <div className="h-16"></div>
    </div>
  );
}
