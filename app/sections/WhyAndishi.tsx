// app/sections/WhyAndishi.tsx

import Link from "next/link";
import React from "react";
import {
  FaBolt,
  FaBullseye,
  FaDollarSign,
  FaGlobe,
  FaRocket,
  FaBrain,
} from "react-icons/fa";
import InteractiveTalentVisualization from "../components/InteractiveTalentVisualization";

export default function WhyAndishi() {
  const stats = [
    {
      icon: FaBolt,
      value: "75%",
      label: "Faster Hiring",
      description: "Reduce time-to-hire from 12+ weeks to just 3 weeks",
    },
    {
      icon: FaBullseye,
      value: "94%",
      label: "Success Rate",
      description: "Long-term placement success with perfect matches",
    },
    {
      icon: FaDollarSign,
      value: "60%",
      label: "Cost Savings",
      description: "Save thousands in traditional recruiting fees",
    },
    {
      icon: FaGlobe,
      value: "50+",
      label: "Countries",
      description: "Access global talent pool across continents",
    },
    {
      icon: FaRocket,
      value: "48hrs",
      label: "First Match",
      description: "Get your first candidate matches within 2 days",
    },
    {
      icon: FaBrain,
      value: "AI-Powered",
      label: "Smart Matching",
      description: "Advanced algorithms for precise skill matching",
    },
  ];

  return (
    <section id="why" className="py-32 mt-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

      <div className="max-w-6xl mx-auto flex flex-col items-center px-6 space-y-12 text-center relative z-10">
        <h2 className="text-3xl lg:text-4xl font-medium text-white">
          Why Choose <span className="text-purple-400">Andishi</span> for Remote
          Tech Hiring?
        </h2>

        <p className="text-lg text-gray-300 mb-16">
          Traditional tech recruiting takes 12+ weeks and costs thousands in
          fees. Our AI-powered talent matching platform revolutionizes how you
          hire remote developers, reducing time-to-hire by 75% while maintaining
          a 94% long-term placement success rate.
        </p>

        <div className="sm:my-16 my-8">
          <InteractiveTalentVisualization />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mt-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all duration-500 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.1) 0%, 
                  rgba(147, 51, 234, 0.05) 50%, 
                  rgba(236, 72, 153, 0.1) 100%)`,
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 0 20px rgba(59, 130, 246, 0.1)
                `,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 transition-all duration-700"></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

              <div className="relative p-4 sm:p-6 text-center space-y-3">
                <div className="text-3xl sm:text-4xl mb-3 relative flex justify-center">
                  <stat.icon className="relative z-10 text-blue-400" />
                  <stat.icon className="absolute inset-0 blur-lg text-blue-400 opacity-50" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="monty text-base sm:text-lg font-semibold text-purple-300 group-hover:text-purple-200 transition-colors duration-300">
                  {stat.label}
                </div>
                <div className="monty text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed px-2">
                  {stat.description}
                </div>
              </div>

              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
              <div
                className="absolute bottom-4 left-3 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 text-md">
          <p className="text-gray-300 ">
            Ready to transform your hiring process?
            <Link
              href="/start-project"
              className="text-blue-400 font-medium ml-1"
            >
              Get started today
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
    </section>
  );
}
