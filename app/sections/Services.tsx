import React from "react";
import { FaCode, FaMobile, FaBrain, FaCube } from "react-icons/fa";

export default function Services() {
  const services = [
    {
      icon: FaCode,
      title: "Web Development",
      description:
        "Full-stack web applications with modern frameworks like React, Next.js, Node.js, and Python",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-400/30 to-cyan-400/30",
      hoverGradient: "group-hover:from-blue-500/15 group-hover:to-cyan-500/15",
    },
    {
      icon: FaMobile,
      title: "Mobile App Development",
      description:
        "Native and cross-platform mobile apps using React Native, Flutter, Swift, and Kotlin",
      gradient: "from-purple-500/20 to-pink-500/20",
      borderGradient: "from-purple-400/30 to-pink-400/30",
      hoverGradient:
        "group-hover:from-purple-500/15 group-hover:to-pink-500/15",
    },
    {
      icon: FaBrain,
      title: "AI/ML Solutions",
      description:
        "Machine learning models, data analytics, computer vision, and intelligent automation systems",
      gradient: "from-green-500/20 to-emerald-500/20",
      borderGradient: "from-green-400/30 to-emerald-400/30",
      hoverGradient:
        "group-hover:from-green-500/15 group-hover:to-emerald-500/15",
    },
    {
      icon: FaCube,
      title: "Blockchain/Web3/DeFi",
      description:
        "Smart contracts, DeFi protocols, NFT platforms, and decentralized applications on various blockchains",
      gradient: "from-orange-500/20 to-amber-500/20",
      borderGradient: "from-orange-400/30 to-amber-400/30",
      hoverGradient:
        "group-hover:from-orange-500/15 group-hover:to-amber-500/15",
    },
  ];

  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Our <span className="text-purple-400">Services</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We connect you with expert developers specializing in cutting-edge
            technologies to bring your vision to life
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Side - Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              <img
                className="w-full max-w-md mx-auto lg:max-w-full"
                src="/services.png"
                alt="Services illustration"
              />

              {/* Glassmorphism glow effect behind illustration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-3xl scale-110 opacity-60"></div>
            </div>
          </div>

          {/* Right Side - Services Cards */}
          <div className="space-y-6 order-1 lg:order-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-opacity-40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
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
                {/* Colored gradient overlay specific to each service */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                ></div>

                {/* Colored border effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
                ></div>

                <div className="relative p-6 flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300">
                      <service.icon className="text-xl text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 text-blue-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating particles effect */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400/60 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                <div
                  className="absolute bottom-4 right-6 w-1 h-1 bg-purple-400/50 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
    </section>
  );
}
