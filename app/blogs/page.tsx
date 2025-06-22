import React from "react";
import Link from "next/link";
import { FaCalendarAlt, FaUser, FaArrowRight, FaClock } from "react-icons/fa";

export default function BlogsSection() {
  const blogs = [
    {
      id: 1,
      title: "The Future of Remote Work: How AI is Transforming Tech Hiring",
      excerpt:
        "Discover how artificial intelligence is revolutionizing the way companies find and hire remote developers, making the process faster and more efficient.",
      author: "Sarah Mitchell",
      date: "June 8, 2025",
      readTime: "5 min read",
      category: "AI & Hiring",
      image: "/blog1.jpg",
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      id: 2,
      title: "Building High-Performance Remote Development Teams",
      excerpt:
        "Learn the essential strategies and best practices for creating and managing successful remote development teams that deliver exceptional results.",
      author: "Michael Rodriguez",
      date: "June 5, 2025",
      readTime: "7 min read",
      category: "Team Management",
      image: "/blog2.jpg",
      gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
      id: 3,
      title: "Web3 Development: Skills That Are in High Demand",
      excerpt:
        "Explore the most sought-after blockchain and Web3 development skills that companies are looking for in 2025 and beyond.",
      author: "Alex Chen",
      date: "June 2, 2025",
      readTime: "6 min read",
      category: "Web3 & Blockchain",
      image: "/blog3.jpg",
      gradient: "from-green-500/20 to-emerald-500/10",
    },
  ];

  return (
    <section id="blogs" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Latest <span className="text-purple-400">Insights</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest trends in remote hiring, technology,
            and development best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.02) 50%, rgba(236, 72, 153, 0.03) 100%)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${blog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              ></div>

              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FaUser className="text-xs" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaCalendarAlt className="text-xs" />
                      <span>{blog.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaClock className="text-xs" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4">
                  <Link
                    href="#"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    <span className="text-sm font-medium">Read More</span>
                    <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
              <div
                className="absolute bottom-6 right-6 w-1 h-1 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                style={{ animationDelay: "1s" }}
              ></div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blogs"
            className="group inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <span>View All Articles</span>
            <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
}
