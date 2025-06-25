import React, { useState } from "react";
import Link from "next/link";
import {
  FaCode,
  FaMobile,
  FaBrain,
  FaCube,
  FaArrowRight,
  FaCheck,
  FaUsers,
  FaChartLine,
  FaComments,
  FaBell,
} from "react-icons/fa";

interface Service {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  gradient: string;
  borderGradient: string;
  hoverGradient: string;
  iconColor: string;
  deliverables: string;
}

interface DashboardFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

export default function ServicesWithDashboard(): React.JSX.Element {
  // Set AI/ML card (index 2) as expanded by default
  const [expandedService, setExpandedService] = useState<number | null>(2);

  const services: Service[] = [
    {
      icon: FaCode,
      title: "Web Development",
      description:
        "Full-stack web applications with modern frameworks like React, Next.js, Node.js, and Python",
      technologies: [
        "React",
        "Next.js",
        "Node.js",
        "Python",
        "TypeScript",
        "PostgreSQL",
      ],
      features: [
        "Responsive Design",
        "API Integration",
        "Performance Optimization",
        "SEO Ready",
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-400/30 to-cyan-400/30",
      hoverGradient: "group-hover:from-blue-500/15 group-hover:to-cyan-500/15",
      iconColor: "text-blue-400",
      deliverables: "Custom web apps, e-commerce platforms, dashboards",
    },
    {
      icon: FaMobile,
      title: "Mobile App Development",
      description:
        "Native and cross-platform mobile apps using React Native, Flutter, Swift, and Kotlin",
      technologies: [
        "React Native",
        "Flutter",
        "Swift",
        "Kotlin",
        "Firebase",
        "Redux",
      ],
      features: [
        "Cross-Platform",
        "Native Performance",
        "Push Notifications",
        "Offline Support",
      ],
      gradient: "from-purple-500/20 to-pink-500/20",
      borderGradient: "from-purple-400/30 to-pink-400/30",
      hoverGradient:
        "group-hover:from-purple-500/15 group-hover:to-pink-500/15",
      iconColor: "text-purple-400",
      deliverables: "iOS/Android apps, progressive web apps, hybrid solutions",
    },
    {
      icon: FaBrain,
      title: "AI/ML Solutions",
      description:
        "Machine learning models, data analytics, computer vision, and intelligent automation systems",
      technologies: [
        "TensorFlow",
        "PyTorch",
        "OpenAI",
        "Scikit-learn",
        "Pandas",
        "AWS ML",
      ],
      features: [
        "Custom Models",
        "Data Processing",
        "Computer Vision",
        "NLP Integration",
      ],
      gradient: "from-green-500/20 to-emerald-500/20",
      borderGradient: "from-green-400/30 to-emerald-400/30",
      hoverGradient:
        "group-hover:from-green-500/15 group-hover:to-emerald-500/15",
      iconColor: "text-green-400",
      deliverables: "AI chatbots, recommendation systems, predictive analytics",
    },
    {
      icon: FaCube,
      title: "Blockchain/Web3/DeFi",
      description:
        "Smart contracts, DeFi protocols, NFT platforms, and decentralized applications on various blockchains",
      technologies: [
        "Solidity",
        "Ethereum",
        "Polygon",
        "Web3.js",
        "Hardhat",
        "IPFS",
      ],
      features: [
        "Smart Contracts",
        "DeFi Protocols",
        "NFT Marketplaces",
        "DAO Development",
      ],
      gradient: "from-orange-500/20 to-amber-500/20",
      borderGradient: "from-orange-400/30 to-amber-400/30",
      hoverGradient:
        "group-hover:from-orange-500/15 group-hover:to-amber-500/15",
      iconColor: "text-orange-400",
      deliverables: "DApps, token contracts, DeFi platforms, Web3 integrations",
    },
  ];

  const clientFeatures: DashboardFeature[] = [
    {
      icon: FaChartLine,
      title: "Project Progress",
      description: "Real-time project tracking and milestones",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: FaComments,
      title: "Direct Communication",
      description: "Chat directly with your development team",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: FaBell,
      title: "Smart Notifications",
      description: "Stay updated on every project milestone",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="relative">
      {/* Transition Bridge */}
      <div className="absolute h-32 overflow-hidden ">
        {/* Seamless gradient bridge */}

        {/* Floating connector dots */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div
          className="absolute top-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-24 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-400/60 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      {/* Services Section */}
      <section id="services" className="py-32 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Title */}
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Our Expertise</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
              Premium{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Development Services
              </span>
            </h2>
            <p className="text-lg text-gray-300 mx-auto leading-relaxed">
              We connect you with world-class developers who specialize in
              cutting-edge technologies, delivering exceptional solutions that
              drive your business forward
            </p>
          </div>

          {/* Main Content - Mosaic Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
            {/* Services Grid - Takes up more space */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => {
                // Different shapes for each service
                const shapes = [
                  "rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl", // Diagonal corners
                  "rounded-[2rem] rounded-tl-none", // Cut corner
                  "rounded-tl-[3rem] rounded-tr-[3rem] rounded-bl-xl rounded-br-xl", // Top heavy curves
                  "rounded-[2rem] rounded-br-none", // Bottom cut corner
                ];

                return (
                  <div
                    key={index}
                    className={`group h-fit relative overflow-hidden ${shapes[index]} backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
                    onClick={() =>
                      setExpandedService(
                        expandedService === index ? null : index
                      )
                    }
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
                      className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                    ></div>

                    <div className="relative p-6">
                      {/* Main service info */}
                      <div className="flex items-start space-x-4 mb-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300 backdrop-blur-sm">
                            <service.icon
                              className={`text-2xl ${service.iconColor} group-hover:scale-110 transition-transform duration-300`}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-md font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed text-sm">
                            {service.description}
                          </p>
                        </div>

                        {/* Expand indicator */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${
                              expandedService === index
                                ? "rotate-90 bg-blue-500/20"
                                : "group-hover:bg-white/10"
                            }`}
                          >
                            <FaArrowRight className="text-sm text-blue-400" />
                          </div>
                        </div>
                      </div>

                      {/* Technology tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.technologies
                          .slice(0, 3)
                          .map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-full backdrop-blur-sm border border-white/5"
                            >
                              {tech}
                            </span>
                          ))}
                        {service.technologies.length > 3 && (
                          <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full backdrop-blur-sm border border-blue-400/20">
                            +{service.technologies.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Expanded content */}
                      <div
                        className={`transition-all duration-500 overflow-hidden ${
                          expandedService === index
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pt-4 ">
                          {/* Key Features */}
                          <div className="my-2 py-3 border-y border-white/10">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2">
                              Key Features
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {service.features.map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center gap-2"
                                >
                                  <FaCheck className="text-md text-green-400" />
                                  <span className="text-xs text-gray-300">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Deliverables */}
                          <div className="mb-4">
                            <h4 className="text-md font-semibold text-purple-300 mb-2">
                              What You Get
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {service.deliverables}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/60 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                    <div
                      className="absolute bottom-6 right-8 w-1 h-1 bg-purple-400/50 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* Right Sidebar - Illustration and CTA */}
            <div className="lg:col-span-4 space-y-8">
              {/* Illustration */}
              <div className="relative">
                <div className="relative">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-xl rounded-bl-xl flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <FaCode className="text-3xl text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Expert Developers
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Ready to build your vision
                      </p>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <FaBrain className="text-lg text-purple-400" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <FaCube className="text-sm text-green-400" />
                  </div>

                  {/* Glassmorphism glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-3xl scale-110 opacity-60"></div>
                </div>
              </div>

              {/* CTA Cards */}
              <div className="space-y-4">
                {/* Main CTA */}
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 p-6">
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Ready to Start?
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                      Transform your ideas into reality with our expert
                      development team. Let's discuss your project today.
                    </p>
                    <Link
                      href="/start-project"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 w-full justify-center"
                    >
                      Get Started
                      <FaArrowRight className="text-sm" />
                    </Link>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50"></div>
                </div>

                {/* Stats/Info Cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FaCheck className="text-green-400 text-sm" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm monty">
                          94% Success Rate
                        </p>
                        <p className="text-gray-400">
                          On-time project delivery
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FaBrain className="text-blue-400 text-sm" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm monty">
                          AI-Powered Solutions
                        </p>
                        <p className="text-gray-400">
                          Next-gen technology stacks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced ambient background effects */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        <div
          className="absolute top-10 right-1/4 w-20 h-20 bg-green-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </section>
    </div>
  );
}
