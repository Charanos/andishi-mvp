"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

export default function ProjectShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Tech icons as simple text badges for Next.js compatibility
  const techColors: { [key: string]: string } = {
    React: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Next.js": "bg-gray-800/20 text-gray-300 border-gray-600/30",
    "Node.js": "bg-green-500/20 text-green-300 border-green-500/30",
    TypeScript: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    Python: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Tailwind CSS": "bg-teal-500/20 text-teal-300 border-teal-500/30",
    MongoDB: "bg-green-600/20 text-green-400 border-green-600/30",
    PostgreSQL: "bg-blue-700/20 text-blue-400 border-blue-700/30",
    Firebase: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    AWS: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    "Vue.js": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Blockchain: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const projects = [
    {
      id: 1,
      title: "AI-Powered E-commerce Platform",
      description:
        "A full-stack e-commerce solution with AI-driven product recommendations, real-time inventory management, and advanced analytics dashboard.",
      category: "Web Development",
      image: "/images/project1.jpg",
      technologies: ["React", "Node.js", "MongoDB", "AWS", "TypeScript"],
      gradient: "from-blue-500/20 to-cyan-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "TechCorp Inc.",
      duration: "3 months",
      teamSize: "4 developers",
    },
    {
      id: 2,
      title: "Decentralized Finance Dashboard",
      description:
        "A comprehensive DeFi platform for portfolio tracking, yield farming, and cross-chain transactions with real-time market data integration.",
      category: "Blockchain",
      image: "/images/project2.jpg",
      technologies: ["Next.js", "Blockchain", "TypeScript", "Tailwind CSS"],
      gradient: "from-purple-500/20 to-pink-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "CryptoFinance Ltd.",
      duration: "4 months",
      teamSize: "5 developers",
    },
    {
      id: 3,
      title: "Healthcare Management System",
      description:
        "HIPAA-compliant healthcare platform with patient management, appointment scheduling, telemedicine integration, and medical records system.",
      category: "Web Development",
      image: "/images/project3.jpg",
      technologies: ["Vue.js", "Python", "PostgreSQL", "AWS"],
      gradient: "from-green-500/20 to-emerald-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "MedTech Solutions",
      duration: "6 months",
      teamSize: "6 developers",
    },
    {
      id: 4,
      title: "Real-time Collaboration Tool",
      description:
        "A Slack-alternative with real-time messaging, video calls, file sharing, and project management features for remote teams.",
      category: "Mobile Development",
      image: "/images/project4.jpg",
      technologies: ["React", "Node.js", "Firebase", "TypeScript"],
      gradient: "from-orange-500/20 to-red-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "RemoteWork Inc.",
      duration: "5 months",
      teamSize: "7 developers",
    },
    {
      id: 5,
      title: "Machine Learning Analytics Platform",
      description:
        "Advanced data analytics platform with ML models for predictive analysis, data visualization, and automated reporting for enterprise clients.",
      category: "AI/ML",
      image: "/images/project5.jpg",
      technologies: ["Python", "React", "PostgreSQL", "AWS"],
      gradient: "from-indigo-500/20 to-blue-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "DataTech Analytics",
      duration: "4 months",
      teamSize: "5 developers",
    },
    {
      id: 6,
      title: "NFT Marketplace Platform",
      description:
        "Full-featured NFT marketplace with minting, trading, auctions, and royalty management on multiple blockchain networks.",
      category: "Blockchain",
      image: "/images/project6.jpg",
      technologies: ["Next.js", "Blockchain", "MongoDB", "Tailwind CSS"],
      gradient: "from-violet-500/20 to-purple-500/10",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      client: "NFT Collective",
      duration: "5 months",
      teamSize: "6 developers",
    },
  ];

  const categories = [
    "all",
    "AI/ML",
    "Blockchain",
    "Web Development",
    "Mobile Development",
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Featured <span className="text-purple-400">Projects</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Discover our portfolio of successful projects across various
            industries and technologies
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full backdrop-blur-md border transition-all duration-300 capitalize ${
                  selectedCategory === category
                    ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                {category === "all" ? "All Projects" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.03) 0%, 
                  rgba(147, 51, 234, 0.02) 50%, 
                  rgba(236, 72, 153, 0.03) 100%)`,
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
              }}
            >
              {/* Colored gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              ></div>

              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                </div>

                {/* Project Links */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={project.liveUrl}
                    className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                    aria-label="View live project"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                  <Link
                    href={project.githubUrl}
                    className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                    aria-label="View source code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Title */}
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <div
                      key={tech}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        techColors[tech] ||
                        "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }`}
                    >
                      {tech}
                    </div>
                  ))}
                </div>

                {/* Project Stats */}
                <div className="pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                    <div>
                      <span className="text-gray-500">Client:</span>
                      <div className="text-gray-300 font-medium">
                        {project.client}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="text-gray-300 font-medium">
                        {project.duration}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Team Size:</span>
                      <div className="text-gray-300 font-medium">
                        {project.teamSize}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
              <div
                className="absolute bottom-6 right-6 w-1 h-1 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                style={{ animationDelay: "1s" }}
              ></div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            href="/our-portfolio"
            className="group inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <span>View All Projects</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
}
