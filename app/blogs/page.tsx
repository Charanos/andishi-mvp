import React from "react";
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
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import Image from "next/image";

export default function BlogsSection() {
  const featuredBlog = {
    id: 1,
    title:
      "The Future of Remote Work: How AI is Revolutionizing Tech Hiring in 2025",
    excerpt:
      "Dive deep into the transformative power of artificial intelligence in remote hiring. From automated candidate screening to predictive analytics, discover how AI is reshaping the entire recruitment landscape and what it means for developers worldwide.",
    author: "Sarah Mitchell",
    date: "June 8, 2025",
    readTime: "12 min read",
    views: "2.1K",
    likes: "156",
    category: "AI & Future Tech",
    image: "/featured-blog.jpg",
    gradient: "from-blue-500/30 to-cyan-400/20",
    featured: true,
  };

  const blogs: Blog[] = [
    {
      id: 2,
      title: "Building High-Performance Remote Development Teams",
      excerpt:
        "Master the art of creating cohesive remote teams that deliver exceptional results through proven strategies and modern collaboration tools.",
      author: "Michael Rodriguez",
      date: "June 5, 2025",
      readTime: "8 min read",
      views: "1.8K",
      likes: "142",
      category: "Team Leadership",
      gradient: "from-purple-500/25 to-pink-500/15",
      size: "medium",
    },
    {
      id: 3,
      title: "Web3 Skills in High Demand",
      excerpt:
        "The blockchain revolution continues. Here are the most sought-after Web3 development skills for 2025.",
      author: "Alex Chen",
      date: "June 2, 2025",
      readTime: "6 min read",
      views: "3.2K",
      likes: "201",
      category: "Web3 & Blockchain",
      gradient: "from-green-500/25 to-emerald-400/15",
      size: "small",
    },
    {
      id: 4,
      title: "The Rise of Edge Computing: What Developers Need to Know",
      excerpt:
        "Edge computing is transforming how we build applications. Learn why it matters and how to leverage it in your next project.",
      author: "Emma Thompson",
      date: "May 30, 2025",
      readTime: "10 min read",
      views: "1.5K",
      likes: "98",
      category: "Cloud & Infrastructure",
      gradient: "from-orange-500/25 to-red-400/15",
      size: "medium",
    },
    {
      id: 5,
      title: "Microservices vs Monoliths in 2025",
      excerpt:
        "The eternal debate continues. We break down when to choose microservices over monolithic architecture.",
      author: "David Park",
      date: "May 28, 2025",
      readTime: "7 min read",
      views: "2.7K",
      likes: "185",
      category: "Architecture",
      gradient: "from-indigo-500/25 to-blue-400/15",
      size: "small",
    },
    {
      id: 6,
      title: "Cybersecurity for Remote Teams: A Complete Guide",
      excerpt:
        "Protect your remote development team with these essential security practices and tools that every tech leader should implement.",
      author: "Lisa Kumar",
      date: "May 25, 2025",
      readTime: "11 min read",
      views: "1.9K",
      likes: "167",
      category: "Security",
      gradient: "from-red-500/25 to-pink-400/15",
      size: "large",
    },
    {
      id: 7,
      title: "No-Code Tools for Developers",
      excerpt:
        "How no-code platforms are actually empowering developers to build faster and focus on complex problems.",
      author: "James Wilson",
      date: "May 22, 2025",
      readTime: "5 min read",
      views: "1.3K",
      likes: "87",
      category: "Tools & Productivity",
      gradient: "from-teal-500/25 to-cyan-400/15",
      size: "small",
    },
    {
      id: 8,
      title:
        "The Psychology of Code Reviews: Building Better Development Culture",
      excerpt:
        "Transform your code review process from a source of stress into a powerful tool for team growth and knowledge sharing.",
      author: "Nina Patel",
      date: "May 20, 2025",
      readTime: "9 min read",
      views: "2.4K",
      likes: "203",
      category: "Development Culture",
      gradient: "from-violet-500/25 to-purple-400/15",
      size: "medium",
    },
    {
      id: 9,
      title:
        "The Psychology of Code Reviews: Building Better Development Culture",
      excerpt:
        "Transform your code review process from a source of stress into a powerful tool for team growth and knowledge sharing.",
      author: "Nina Patel",
      date: "May 20, 2025",
      readTime: "9 min read",
      views: "2.4K",
      likes: "203",
      category: "Development Culture",
      gradient: "from-violet-500/25 to-purple-400/15",
      size: "medium",
    },
    {
      id: 10,
      title:
        "The Psychology of Code Reviews: Building Better Development Culture",
      excerpt:
        "Transform your code review process from a source of stress into a powerful tool for team growth and knowledge sharing.",
      author: "Nina Patel",
      date: "May 20, 2025",
      readTime: "9 min read",
      views: "2.4K",
      likes: "203",
      category: "Development Culture",
      gradient: "from-violet-500/25 to-purple-400/15",
      size: "medium",
    },
  ];

  interface Blog {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    views: string;
    likes: string;
    category: string;
    gradient: string;
    size?: "large" | "medium" | "small";
    image?: string;
    featured?: boolean;
  }

  interface GetCardSizeClasses {
    (size?: "large" | "medium" | "small"): string;
  }

  const getCardSizeClasses: GetCardSizeClasses = (size) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2";
      case "medium":
        return "md:col-span-2 md:row-span-1";
      case "small":
      default:
        return "md:col-span-1 md:row-span-1";
    }
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

  return (
    <section id="blogs" className="py-24 relative overflow-hidden">
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
        <div className="text-center mb-24">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-6">
            <FaBookmark className="text-blue-400 text-sm" />
            <span className="text-blue-300 text-sm font-medium">
              Latest Insights
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Discover the Future of{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tech Innovation
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Stay ahead of the curve with cutting-edge insights on remote work,
            AI, blockchain, and the technologies shaping tomorrow's development
            landscape
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-16">
          <article className="group relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-[1.01] cursor-pointer">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${featuredBlog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
            ></div>

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
                      <span>{featuredBlog.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-xs" />
                      <span>{featuredBlog.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-xs" />
                      <span>{featuredBlog.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Link
                    href="#"
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 monty uppercase hover:to-purple-600 transition-all duration-300 hover:scale-105 group/btn"
                  >
                    <span>Read Full Article</span>
                    <FaArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>

                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FaEye className="text-xs" />
                      <span className="text-sm">{featuredBlog.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaHeart className="text-xs" />
                      <span className="text-sm">{featuredBlog.likes}</span>
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
                  src={"/images/featured-blog.jpg"}
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

        {/* Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr mb-16">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className={`group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${getCardSizeClasses(
                blog.size
              )}`}
              style={{
                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.02) 50%, rgba(236, 72, 153, 0.03) 100%)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${blog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              ></div>

              {/* Image Section */}
              <div
                className={`relative bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden ${
                  blog.size === "large"
                    ? "h-48"
                    : blog.size === "medium"
                    ? "h-32"
                    : "h-24"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <div className="flex items-center space-x-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                    <CategoryIcon category={blog.category} />
                    <span className="text-white text-xs font-medium">
                      {blog.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-4 lg:p-6 space-y-3 flex-1 flex flex-col">
                <h3
                  className={`font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2 ${
                    blog.size === "large" ? "text-xl" : "text-lg"
                  }`}
                >
                  {blog.title}
                </h3>

                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed line-clamp-3 flex-1">
                  {blog.excerpt}
                </p>

                <div className="space-y-3 pt-2">
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
                    <Link
                      href="#"
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      <span className="text-sm font-medium">Read More</span>
                      <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                        <FaBookmark className="text-xs" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-300">
                        <FaShare className="text-xs" />
                      </button>
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
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center sm:mt-40 mt-32">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/blogs"
              className="group monty inline-flex items-center space-x-3 px-8 py-4 "
            >
              <span>Get more insights</span>
              <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1 rotate-90 md:rotate-0" />
            </Link>
            <Link
              href="/newsletter"
              className="group monty inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
            >
              <FaBookmark className="text-sm" />
              <span>Subscribe to Our Newsletter</span>
            </Link>
          </div>
          <p className="text-gray-400 text-sm my-8">
            Join 100+ developers getting weekly insights delivered to their
            inbox
          </p>
        </div>
      </div>
    </section>
  );
}
