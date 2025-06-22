import React, { useState, useEffect } from "react";
import { FileText, Search, Users, Rocket } from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: FileText,
      title: "Share Project Details",
      description:
        "Tell us about your project requirements and ideal developer profile",
      color: "#3b83f670",
      gradient: "from-blue-400 via-blue-500 to-cyan-500",
    },
    {
      icon: Search,
      title: "Match with Developers",
      description:
        "Our AI matches you with pre-vetted developers from our global talent pool",
      color: "#8a5cf673",
      gradient: "from-purple-400 via-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Meet & Interview",
      description:
        "Connect with matched candidates through video calls and technical interviews",
      color: "#10b9817c",
      gradient: "from-emerald-400 via-emerald-500 to-teal-500",
    },
    {
      icon: Rocket,
      title: "Start & Onboard",
      description:
        "Begin your project with seamless onboarding and ongoing support",
      color: "#f59f0b83",
      gradient: "from-orange-400 via-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`absolute w-80 h-80 rounded-full blur-3xl transition-all duration-2000 ${
              activeStep === index
                ? "opacity-20 scale-150"
                : "opacity-5 scale-100"
            }`}
            style={{
              background: `radial-gradient(circle, ${step.color}40 0%, transparent 70%)`,
              top: `${20 + (index % 2) * 60}%`,
              left: `${10 + index * 20}%`,
              animationDelay: `${index * 500}ms`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-18">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-xl lg:text-4xl font-semibold text-white mb-6 leading-tight">
              How We Do It in{" "}
              <span className="text-purple-400">4 Simple Steps</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From concept to code, we make developer hiring effortless
            </p>
          </div>
        </div>

        {/* Steps Flow */}
        <div className="relative">
          {/* Flowing Path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="pathGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient
                id="activePathGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#a78bfa" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Base Path */}
            <path
              d="M 100 400 Q 300 200 500 400 T 900 300 Q 1000 250 1100 400"
              stroke="url(#pathGradient)"
              strokeWidth="4"
              fill="none"
              className="opacity-30"
            />

            {/* Active Path */}
            <path
              d="M 100 400 Q 300 200 500 400 T 900 300 Q 1000 250 1100 400"
              stroke="url(#activePathGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="20 10"
              className="animate-pulse"
              style={{
                strokeDashoffset: -1000,
                animation: "dash 8s linear infinite",
              }}
            />
          </svg>

          {/* Steps positioned along the path */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 pt-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const delay = index * 200;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col items-center transition-all duration-1000 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    transitionDelay: `${delay}ms`,
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  {/* Floating Icon Container */}
                  <div
                    className={`relative mb-8 transition-all duration-700 cursor-pointer ${
                      isActive
                        ? "scale-125 -translate-y-4"
                        : "hover:scale-110 hover:-translate-y-2"
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    {/* Glowing Ring */}
                    <div
                      className={`
                      absolute inset-0 rounded-full transition-all duration-700
                      ${
                        isActive
                          ? `bg-gradient-to-r ${step.gradient} p-1 animate-spin-slow shadow-2xl`
                          : "bg-white/10 p-1 hover:bg-white/20"
                      }
                    `}
                    >
                      <div className="w-full h-full bg-gray-900 rounded-full"></div>
                    </div>

                    {/* Icon */}
                    <div
                      className={`
                      relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
                      ${
                        isActive
                          ? `bg-gradient-to-r ${step.gradient} text-white shadow-2xl`
                          : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                      }
                    `}
                    >
                      <Icon className="w-8 h-8" />

                      {/* Pulsing dot for active step */}
                      {isActive && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
                      )}
                    </div>

                    {/* Step number */}
                    <div
                      className={`
                      absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                      ${
                        isActive
                          ? `bg-gradient-to-r ${step.gradient} text-white shadow-lg`
                          : "bg-gray-700 text-gray-300"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`
                    text-center max-w-xs transition-all duration-500
                    ${isActive ? "scale-105" : ""}
                  `}
                  >
                    <h3
                      className={`
                      text-xl font-bold mb-3 transition-all duration-300
                      ${
                        isActive
                          ? `bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`
                          : "text-white hover:text-gray-200"
                      }
                    `}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={`
                      text-sm leading-relaxed transition-colors duration-300
                      ${isActive ? "text-gray-200" : "text-gray-400"}
                    `}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Active step glow effect */}
                  {isActive && (
                    <div
                      className="absolute -inset-8 rounded-full opacity-20 blur-2xl animate-pulse"
                      style={{ background: step.color }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Progress */}
        <div className="flex justify-center mt-16">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`
                  relative w-12 h-2 rounded-full transition-all duration-500 overflow-hidden
                  ${
                    activeStep === index
                      ? "bg-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }
                `}
              >
                {activeStep === index && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${step.gradient} animate-pulse`}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: -1000;
          }
          100% {
            stroke-dashoffset: 1000;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
}
