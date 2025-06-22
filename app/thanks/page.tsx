"use client";

import React from "react";
import {
  FaCheck,
  FaRocket,
  FaEnvelope,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
  FaStar,
  FaTachometerAlt,
  FaFolderPlus,
  FaClipboardList,
  FaComments,
} from "react-icons/fa";
import Link from "next/link";

export default function ThankYouExistingClientNewProject() {
  const dashboardUrl = "/client-dashboard";
  const nextSteps = [
    {
      icon: FaFolderPlus,
      title: "New Project Created",
      description:
        "Your new project has been added to your dashboard. All your project details are now in one place.",
      time: "Instant",
    },
    {
      icon: FaClipboardList,
      title: "Kickoff Checklist",
      description:
        "Review your project kickoff checklist and upload any initial files or briefs to get started.",
      time: "Today",
    },
    {
      icon: FaCalendarAlt,
      title: "Schedule a Call (Optional)",
      description:
        "Book a call with your project manager if you want to discuss details or timelines.",
      time: "As needed",
    },
    {
      icon: FaComments,
      title: "Ongoing Communication",
      description:
        "Continue collaborating with your team via Slack or email as usual.",
      time: "Anytime",
    },
  ];

  const benefits = [
    "All projects managed in one dashboard",
    "Easy access to briefs, files, and timelines",
    "Direct line to your project manager",
    "Transparent progress tracking",
  ];

  return (
    <section className="min-h-screen py-16 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Success Animation Container */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 animate-pulse">
              <FaCheck className="text-3xl text-white" />
            </div>
            <div className="absolute -inset-4 bg-green-500/20 rounded-full animate-ping"></div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              New Project Started!
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Your new project has been created. We're excited to work with you
            again!
          </p>

          <div className="flex items-center justify-center space-x-2 text-green-400 font-medium">
            <FaStar className="text-md" />
            <span>
              Project ID: #
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </span>
            <FaStar className="text-md" />
          </div>
        </div>

        {/* Main CTA - Go Back to Dashboard */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl mb-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <FaTachometerAlt className="text-2xl text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Back to Your <span className="text-blue-400">Dashboard</span>
            </h2>

            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Manage all your projects, upload briefs, and track progress from
              your dashboard.
            </p>

            <Link
              href={dashboardUrl}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 font-semibold text-lg"
            >
              <FaTachometerAlt className="text-xl" />
              <span>Go to Dashboard</span>
              <FaArrowRight className="text-md" />
            </Link>
          </div>

          {/* Dashboard Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 text-gray-300"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="text-md">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What Happens Next */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <FaUsers className="mr-3 text-blue-400" />
            What Happens Next?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  step.icon === FaFolderPlus
                    ? "bg-gradient-to-r from-blue-500/20 to-green-500/20 border-blue-400/50 shadow-lg shadow-blue-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      step.icon === FaFolderPlus
                        ? "bg-gradient-to-r from-blue-500 to-green-500 shadow-lg shadow-blue-500/25"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25"
                    }`}
                  >
                    <step.icon className="text-white text-lg" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-md mb-3 leading-relaxed">
                      {step.description}
                    </p>
                    <div
                      className={`text-xs font-medium uppercase tracking-wide ${
                        step.icon === FaFolderPlus
                          ? "text-blue-300"
                          : "text-green-300"
                      }`}
                    >
                      {step.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">
            Need Assistance?
          </h3>
          <p className="text-gray-400 mb-4">
            If you have any questions or need support, your project manager is
            available as always.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-300">
            <a
              href="mailto:hello@andishi.co.ke"
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
            >
              <FaEnvelope className="text-md" />
              <span>hello@andishi.co.ke</span>
            </a>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <FaComments className="text-md text-blue-400" />
              <span className="text-md">Continue on Slack</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-28 h-28 bg-green-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "3s" }}
      ></div>
    </section>
  );
}
