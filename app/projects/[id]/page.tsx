"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaGithub,
  FaStar,
  FaClock,
  FaUsers,
  FaTag,
  FaCheckCircle,
  FaCode,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaRocket,
  FaExpand,
  FaArrowCircleLeft,
} from "react-icons/fa";
import { HomepageProjectType } from "@/hooks/useHomepageProjectCRUD";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectSlug = params.id as string;

  const [project, setProject] = useState<HomepageProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        // Try to fetch by slug first, then by id if slug fails
        let response = await fetch(
          `/api/homepage-projects?slug=${projectSlug}`
        );
        let data = await response.json();

        // If slug fetch fails, try with id
        if (!response.ok || !data.success) {
          response = await fetch(`/api/homepage-projects?id=${projectSlug}`);
          data = await response.json();
        }

        if (response.ok && data.success) {
          setProject(data.data);
        } else {
          setError(data.message || "Project not found");
        }
      } catch (err) {
        setError("Failed to load project details");
        console.error("Error fetching project:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectSlug) {
      fetchProject();
    }
  }, [projectSlug]);

  const nextImage = () => {
    if (
      project &&
      project.projectImages.length > 0 &&
      selectedImageIndex !== null
    ) {
      setSelectedImageIndex((prev) =>
        prev === project.projectImages.length - 1 ? 0 : prev! + 1
      );
    }
  };

  const prevImage = () => {
    if (
      project &&
      project.projectImages.length > 0 &&
      selectedImageIndex !== null
    ) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? project.projectImages.length - 1 : prev! - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-400 mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400/50 mx-auto"></div>
            </div>
            <p className="text-gray-300 text-lg mt-6 font-medium">
              Loading project details...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please wait while we fetch the information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen ">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaEye className="text-red-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Project Not Found
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed">{error}</p>
                <Link
                  href="/projects"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FaArrowLeft className="text-sm" />
                  <span>Back to Projects</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getMosaicClass = (index: number, total: number) => {
    const patterns = [
      // Pattern for different numbers of images
      {
        condition: total >= 6,
        classes: [
          "col-span-2 row-span-2",
          "col-span-1 row-span-1",
          "col-span-1 row-span-1",
          "col-span-1 row-span-2",
          "col-span-2 row-span-1",
          "col-span-1 row-span-1",
        ],
      },
      {
        condition: total >= 4,
        classes: [
          "col-span-2 row-span-2",
          "col-span-1 row-span-1",
          "col-span-1 row-span-1",
          "col-span-2 row-span-1",
        ],
      },
      {
        condition: total >= 3,
        classes: [
          "col-span-2 row-span-1",
          "col-span-1 row-span-2",
          "col-span-1 row-span-1",
        ],
      },
      {
        condition: total >= 2,
        classes: ["col-span-2 row-span-1", "col-span-2 row-span-1"],
      },
      { condition: total >= 1, classes: ["col-span-4 row-span-2"] },
    ];

    const pattern =
      patterns.find((p) => p.condition) || patterns[patterns.length - 1];
    return (
      pattern.classes[index % pattern.classes.length] || "col-span-1 row-span-1"
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Subtle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-80 h-80 bg-cyan-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Navigation */}
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              <FaArrowCircleLeft className="w-5 h-5" />
              <span className="text-xs monty uppercase">Back to Projects</span>
            </Link>
          </div>

          {/* Hero Section - Improved Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {/* Project Info - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                {project.featured && (
                  <div className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-500/25 text-yellow-300 rounded-lg text-xs font-medium backdrop-blur-md">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span>Featured Project</span>
                  </div>
                )}
                <div className="px-3.5 py-2 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/25 text-blue-300 rounded-lg text-xs font-medium backdrop-blur-md">
                  <FaTag className="inline mr-1.5 text-xs" />
                  {project.category}
                </div>
                <div
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium backdrop-blur-md border ${
                    project.status === "completed"
                      ? "bg-gradient-to-r from-green-500/15 to-emerald-500/15 border-green-500/25 text-green-300"
                      : project.status === "in-progress"
                      ? "bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border-yellow-500/25 text-yellow-300"
                      : "bg-gradient-to-r from-gray-500/15 to-slate-500/15 border-gray-500/25 text-gray-300"
                  }`}
                >
                  <FaCheckCircle className="inline mr-1.5 text-xs" />
                  {project.status.replace("-", " ")}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 leading-tight">
                  {project.title}
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Description */}
              <div className="prose prose-lg prose-invert max-w-none">
                <div
                  className="text-gray-300 leading-relaxed text-md"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                  >
                    <FaRocket className="group-hover:rotate-6 transition-transform duration-300 text-sm" />
                    <span>View Live Project</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-2.5 px-6 py-3 bg-white/8 backdrop-blur-md border border-white/15 hover:bg-white/12 hover:border-white/25 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
                  >
                    <FaGithub className="group-hover:rotate-6 transition-transform duration-300 text-sm" />
                    <span>View Source Code</span>
                  </a>
                )}
              </div>
            </div>

            {/* Cover Image - Takes 2 columns */}
            <div className="lg:col-span-2 relative">
              {project.image && (
                <div className="group relative rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent z-10"></div>
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700 p-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent z-20"></div>
                </div>
              )}
            </div>
          </div>

          {/* Project Meta Grid - Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {project.client && (
              <div className="group p-5 bg-white/3 backdrop-blur-md border border-white/8 rounded-xl hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <FaUsers className="text-blue-400 text-base" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      Client
                    </p>
                    <p className="text-white font-semibold text-sm mt-1">
                      {project.client}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="group p-5 bg-white/3 backdrop-blur-md border border-white/8 rounded-xl hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 bg-gradient-to-br from-green-500/15 to-emerald-500/15 rounded-lg flex items-center justify-center border border-green-500/20">
                  <FaClock className="text-green-400 text-base" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Duration
                  </p>
                  <p className="text-white font-semibold text-sm mt-1">
                    {project.duration}
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-5 bg-white/3 backdrop-blur-md border border-white/8 rounded-xl hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-lg flex items-center justify-center border border-purple-500/20">
                  <FaUsers className="text-purple-400 text-base" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Team Size
                  </p>
                  <p className="text-white font-semibold text-sm mt-1">
                    {project.teamSize}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies - Full Width */}
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <FaCode className="text-cyan-400 text-base" />
              </div>
              <h3 className="text-2xl font-semibold text-white">
                Technologies Used
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="group px-4 py-2.5 bg-white/3 backdrop-blur-md border border-white/8 text-white/90 rounded-lg text-sm font-medium hover:bg-white/6 hover:border-white/15 hover:scale-[1.02] transition-all duration-300 cursor-default hover:shadow-md hover:shadow-cyan-500/5"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mosaic Gallery */}
        {project.projectImages && project.projectImages.length > 0 && (
          <div className="py-16 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4">
                  Project Gallery
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
              </div>

              {/* Mosaic Grid */}
              <div className="grid grid-cols-4 grid-rows-3 gap-3 h-[600px] lg:h-[700px]">
                {project.projectImages.slice(0, 6).map((image, index) => (
                  <div
                    key={index}
                    className={`group relative ${getMosaicClass(
                      index,
                      project.projectImages.length
                    )} cursor-pointer`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/3 border border-white/8 hover:border-white/20 transition-all duration-300">
                      <Image
                        src={image}
                        alt={`${project.title} - Gallery ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                          <FaExpand className="text-white text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional images indicator */}
              {project.projectImages.length > 6 && (
                <div className="text-center mt-6">
                  <p className="text-gray-400">
                    +{project.projectImages.length - 6} more images - Click any
                    image to view all
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Preview Section */}
        {project.liveUrl && (
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4">
                  Live Preview
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
              </div>

              <div className="bg-white/3 backdrop-blur-md border border-white/8 rounded-2xl p-6 lg:p-8 shadow-2xl">
                <div className="relative w-full h-[400px] lg:h-[600px] rounded-xl overflow-hidden border border-gray-600/20 shadow-inner">
                  <iframe
                    src={project.liveUrl}
                    className="w-full h-full"
                    title={`${project.title} Live Preview`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
                <div className="text-center mt-6">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                  >
                    <FaExternalLinkAlt className="group-hover:rotate-6 transition-transform duration-300 text-sm" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl z-10"
            >
              ✕
            </button>

            <div className="relative">
              <Image
                src={project.projectImages[selectedImageIndex]}
                alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />

              {project.projectImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
                  >
                    <FaChevronLeft className="mx-auto" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
                  >
                    <FaChevronRight className="mx-auto" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
                {selectedImageIndex + 1} of {project.projectImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
