"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DevProfileModalProps {
  isOpen: boolean;
  onClose: () => void;

  developer: {
    id: number;
    name: string;
    role: string;
    experience: string;
    location: string;
    avatar: string;
    skills: string[];
    specialties: string[];
    availability: string;
    rating: number;
    projectsCompleted: number;
    gradient: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    bio: string;
    about: string;
    languages: string[];
    education: string;
    certifications: string[];
    projectHighlights: Array<{
      title: string;
      description: string;
      tech: string[];
      duration: string;
    }>;
    testimonials: Array<{
      client: string;
      feedback: string;
      project: string;
      rating: number;
    }>;
    workHistory: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
  };
}

export default function DevProfileModal({
  isOpen,
  onClose,
  developer,
}: DevProfileModalProps) {
  // Skill colors for badges
  const skillColors: { [key: string]: string } = {
    React:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    "Next.js":
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    "Node.js":
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    TypeScript:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Python:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    "Tailwind CSS":
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    MongoDB:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    PostgreSQL:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Firebase:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    AWS: "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    "Vue.js":
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Blockchain:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Flutter:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Django:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Express:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Redis:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Docker:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    ML: "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Kubernetes:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    GraphQL:
      "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
    Web3: "bg-indigo-400/10 backdrop-blur-sm text-indigo-400/80 border border-indigo-400/20 hover:border-indigo-400/30 hover:bg-indigo-400/15",
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 100,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  } as const;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.1,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const renderStars = (rating: number, prefix: string = "") => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={`${prefix}star-${i}`}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400" : "text-gray-600"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            {/* Scrollable Content */}
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <motion.div
                className="p-8"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Header Section */}
                <motion.div
                  className="flex flex-col lg:flex-row gap-8 mb-8"
                  variants={itemVariants}
                >
                  {/* Avatar and Basic Info */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                        <Image
                          src={developer.avatar}
                          alt={developer.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            developer.availability === "Available"
                              ? "bg-green-500/50 text-white"
                              : "bg-orange-500/50 text-white"
                          }`}
                        >
                          {developer.availability}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name, Role, and Key Stats */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {developer.name}
                    </h2>
                    <p className="text-sm text-purple-400 monty uppercase font-medium mb-4">
                      {developer.role}
                    </p>

                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-300">
                          {developer.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-300">
                          {developer.experience}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(developer.rating, "header")}
                        <span className="text-white font-medium ml-2">
                          {developer.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {developer.projectsCompleted}
                        </div>
                        <div className="text-sm text-gray-400">
                          Projects Completed
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    {/* <div className="flex space-x-3">
                      <Link
                        href={developer.portfolioUrl}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                      >
                        Portfolio
                      </Link>
                      <Link
                        href={developer.githubUrl}
                        className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 cursor-pointer"
                      >
                        GitHub
                      </Link>
                      <Link
                        href={developer.linkedinUrl}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
                      >
                        LinkedIn
                      </Link>
                    </div> */}
                  </div>
                </motion.div>

                {/* About Section */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {developer.about}
                  </p>
                </motion.div>

                {/* Skills Section */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Skills & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {developer.skills.map((skill, index) => (
                      <motion.div
                        key={`skill-${index}-${skill}`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                          skillColors[skill] ||
                          "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        {skill}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Specialties Section */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Specialties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {developer.specialties.map((specialty, index) => (
                      <motion.div
                        key={`specialty-${index}-${specialty}`}
                        className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">
                          {specialty}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Project Highlights */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Featured Projects
                  </h3>
                  <div className="space-y-4">
                    {developer.projectHighlights.map((project, index) => (
                      <motion.div
                        key={`project-${index}-${project.title}`}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">
                            {project.title}
                          </h4>
                          <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded">
                            {project.duration}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, techIndex) => (
                            <span
                              key={`project-${index}-tech-${techIndex}-${tech}`}
                              className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded border border-purple-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Client Testimonials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {developer.testimonials.map((testimonial, index) => (
                      <motion.div
                        key={`testimonial-${index}-${testimonial.client}`}
                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(
                            testimonial.rating,
                            `testimonial-${index}`
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3 italic">
                          "{testimonial.feedback}"
                        </p>
                        <div className="text-xs text-gray-400">
                          <div className="font-medium text-white">
                            {testimonial.client}
                          </div>
                          <div>{testimonial.project}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Contact Button */}
                {/* <motion.div
                  className="text-center pt-8 border-t border-white/10"
                  variants={itemVariants}
                >
                  <motion.button
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact {developer.name}
                  </motion.button>
                </motion.div> */}
              </motion.div>
            </div>
          </motion.div>

          {/* Ambient background effects */}
          {/* <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-28 h-28 bg-pink-500/8 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
