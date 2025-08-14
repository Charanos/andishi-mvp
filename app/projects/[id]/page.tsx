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
} from "react-icons/fa";
import { HomepageProjectType } from "@/hooks/useHomepageProjectCRUD";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectSlug = params.id as string;

  const [project, setProject] = useState<HomepageProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/homepage-projects?slug=${projectSlug}`
        );
        const data = await response.json();

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
    if (project && project.projectImages.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === project.projectImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project && project.projectImages.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? project.projectImages.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-6 py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-gray-300 text-lg">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-6 py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-900/10 border border-red-800/40 backdrop-blur-sm rounded-2xl p-8 w-full mx-auto">
              <h2 className="text-xl font-medium text-white mb-4">
                Project Not Found
              </h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link
                href="/projects"
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <FaArrowLeft />
                <span>Back to Projects</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          {/* Back Button */}
          <Link
            href="/projects"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <FaArrowLeft />
            <span>Back to Projects</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Project Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {project.featured && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                    <FaStar />
                    <span>Featured</span>
                  </div>
                )}
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {project.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    project.status === "completed"
                      ? "bg-green-500/20 text-green-300"
                      : project.status === "in-progress"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  <FaCheckCircle className="inline mr-1" />
                  {project.status}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {project.title}
              </h1>

              <div className="prose prose-invert max-w-none">
                <div
                  className="text-gray-300 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Project Meta */}
              <div className="grid grid-cols-2 gap-4">
                {project.client && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <FaTag className="text-blue-400" />
                    <span>Client: {project.client}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaClock className="text-green-400" />
                  <span>Duration: {project.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaUsers className="text-purple-400" />
                  <span>Team: {project.teamSize}</span>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <FaCode className="text-cyan-400" />
                  <span>Technologies Used</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 rounded-full text-sm hover:bg-white/15 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <FaExternalLinkAlt />
                    <span>View Live</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <FaGithub />
                    <span>View Code</span>
                  </a>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative">
              {project.image && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Gallery */}
      {project.projectImages && project.projectImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Project Gallery
          </h2>

          <div className="relative">
            {/* Main Gallery Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6">
              <Image
                src={project.projectImages[currentImageIndex]}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="w-full h-[600px] object-cover"
              />

              {/* Navigation Arrows */}
              {project.projectImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                {currentImageIndex + 1} / {project.projectImages.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {project.projectImages.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {project.projectImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? "border-blue-500"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Preview Section */}
      {project.liveUrl && (
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Live Preview
          </h2>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-gray-600">
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
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <FaExternalLinkAlt />
                <span>Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
