"use client";

import React from "react";
import {
  FaCheck,
  FaRocket,
  FaSlack,
  FaEnvelope,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

export default function ThankYouPage() {
  const slackInviteUrl = "https://join.slack.com/t/andishiworkspace/shared_invite/zt-377bxw976-KMC2vBV90CyMN_6czjfwdQ";

  const nextSteps = [
    {
      icon: FaEnvelope,
      title: "Check Your Email",
      description: "We've sent you a confirmation with your project details",
      time: "Within 5 minutes",
    },
    {
      icon: FaSlack,
      title: "Join Our Slack",
      description: "Connect with our team for real-time communication",
      time: "Right now",
      action: true,
    },
    {
      icon: FaCalendarAlt,
      title: "Initial Consultation",
      description: "We'll schedule a call to discuss your project in detail",
      time: "Within 24 hours",
    },
    {
      icon: FaRocket,
      title: "Project Kickoff",
      description: "Start building your dream project with our expert team",
      time: "Within 48 hours",
    },
  ];

  const benefits = [
    "Direct access to your project team",
    "Real-time updates and progress tracking",
    "Quick questions and instant feedback",
    "File sharing and collaboration",
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
              Thank You!
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Your project submission has been received successfully. We're excited to bring your vision to life!
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-green-400 font-medium">
            <FaStar className="text-md" />
            <span>Project ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <FaStar className="text-md" />
          </div>
        </div>

        {/* Main CTA - Join Slack */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl mb-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <FaSlack className="text-2xl text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Join Our <span className="text-purple-400">Slack Workspace</span>
            </h2>
            
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Connect with our team instantly for real-time collaboration, updates, and support throughout your project journey.
            </p>

            <a
              href={slackInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 font-semibold text-lg"
            >
              <FaSlack className="text-xl" />
              <span>Join Andishi Workspace</span>
              <FaArrowRight className="text-md" />
            </a>
          </div>

          {/* Slack Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
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
                  step.action
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-lg shadow-purple-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    step.action
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25"
                  }`}>
                    <step.icon className="text-white text-lg" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-md mb-3 leading-relaxed">
                      {step.description}
                    </p>
                    <div className={`text-xs font-medium uppercase tracking-wide ${
                      step.action ? "text-purple-300" : "text-blue-300"
                    }`}>
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
            Questions? We're Here to Help
          </h3>
          <p className="text-gray-400 mb-4">
            If you have any immediate questions or concerns, don't hesitate to reach out.
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
              <FaSlack className="text-md text-purple-400" />
              <span className="text-md">Available 24/7 on Slack</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/8 rounded-full blur-3xl animate-pulse"></div>
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
      ></div>
    </section>
  );
}