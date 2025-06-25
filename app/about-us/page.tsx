"use client";

import React, { useState, useEffect } from "react";
import {
  FaGlobe,
  FaUsers,
  FaRocket,
  FaEye,
  FaBullseye,
  FaHeart,
  FaLightbulb,
  FaHandshake,
  FaChartLine,
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaGem,
  FaClock,
  FaSeedling,
  FaCode,
  FaNetworkWired,
  FaTrophy,
  FaGraduationCap,
  FaBuilding,
} from "react-icons/fa";

import { IoIosAirplane } from "react-icons/io";
import TeamSection from "./our-team";
import Link from "next/link";

export default function AndishiAboutPage() {
  const [activeSection, setActiveSection] = useState<string>("mission");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeTimelineItem, setActiveTimelineItem] = useState<number>(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const missionElements = [
    {
      icon: FaGlobe,
      title: "Democratizing Global Tech Opportunity",
      description:
        "Breaking down barriers that prevent talented individuals from accessing global tech opportunities",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaSearch,
      title: "Discovering & Nurturing Talent",
      description:
        "Identifying exceptional developers and providing them with the support they need to thrive",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: FaChartLine,
      title: "Creating Economic Growth",
      description:
        "Building bridges that enable economic prosperity across borders and communities",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: FaGem,
      title: "Unlocking Overlooked Talent",
      description:
        "Revealing the world's hidden tech gems who have been limited by geography, not ability",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const visionElements = [
    {
      icon: FaRocket,
      title: "Talent Thrives Unbound",
      description:
        "A world where brilliant minds flourish regardless of their physical location",
      delay: "0s",
    },
    {
      icon: IoIosAirplane,
      title: "Innovation Flows Freely",
      description:
        "Ideas and expertise crossing borders seamlessly to create global impact",
      delay: "0.2s",
    },
    {
      icon: FaUsers,
      title: "Communities Flourish",
      description:
        "Local ecosystems strengthened through meaningful global connections",
      delay: "0.4s",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Geography as Data",
      description:
        "Location becomes irrelevant; talent and merit become everything",
      delay: "0.6s",
    },
  ];

  const coreValues = [
    {
      icon: FaStar,
      title: "Skill Recognition",
      subtitle: "Regardless of Location",
      description:
        "We evaluate talent based purely on capability, not geography",
      color: "blue",
    },
    {
      icon: FaLightbulb,
      title: "Holistic Development",
      subtitle: "Technical + Soft Skills",
      description:
        "Nurturing both technical expertise and essential soft skills for complete professional growth",
      color: "purple",
    },
    {
      icon: FaHeart,
      title: "Ethical Connections",
      subtitle: "Sustainable & Fair",
      description:
        "Building relationships that benefit all parties while maintaining the highest ethical standards",
      color: "green",
    },
    {
      icon: FaGlobe,
      title: "Local Impact",
      subtitle: "Global Reach",
      description:
        "Creating meaningful change in local communities through global opportunities",
      color: "orange",
    },
    {
      icon: FaHandshake,
      title: "Innovation Through Inclusion",
      subtitle: "Diversity Drives Progress",
      description:
        "Harnessing diverse perspectives to fuel breakthrough innovations",
      color: "pink",
    },
    {
      icon: FaCheckCircle,
      title: "Evidence-Based Approach",
      subtitle: "Challenging Biases",
      description:
        "Using data and evidence to overcome unconscious biases and create fair opportunities",
      color: "indigo",
    },
  ];

  const timelineEvents = [
    {
      year: "2023",
      quarter: "Q1",
      title: "The Spark",
      subtitle: "Recognizing the Problem",
      description:
        "Identified the massive talent gap between exceptional developers in emerging markets and global opportunities. The vision was born.",
      icon: FaSeedling,
      gradient: "from-green-400 to-emerald-500",
      achievements: [
        "Market research completed",
        "Problem validation",
        "Initial concept development",
      ],
      impact:
        "Discovered that 70% of world-class developers were geographically limited",
    },
    {
      year: "2023",
      quarter: "Q2",
      title: "Foundation Building",
      subtitle: "From Idea to Reality",
      description:
        "Established Andishi's core mission and began building the foundational technology and processes for talent discovery.",
      icon: FaBuilding,
      gradient: "from-blue-400 to-cyan-500",
      achievements: [
        "Company incorporation",
        "Core team assembly",
        "Technology stack selection",
      ],
      impact:
        "Built the infrastructure to evaluate talent beyond traditional barriers",
    },
    {
      year: "2023",
      quarter: "Q3",
      title: "First Connections",
      subtitle: "Proving the Concept",
      description:
        "Successfully matched our first developers with international opportunities, validating our approach and methodology.",
      icon: IoIosAirplane,
      gradient: "from-purple-400 to-pink-500",
      achievements: [
        "First 10 developer placements",
        "Partnership agreements",
        "Process refinement",
      ],
      impact: "Demonstrated that geography doesn't define capability",
    },
    {
      year: "2023",
      quarter: "Q4",
      title: "Scaling Connections",
      subtitle: "Expanding Our Reach",
      description:
        "Expanded our talent network and established partnerships with forward-thinking companies seeking exceptional developers.",
      icon: FaNetworkWired,
      gradient: "from-orange-400 to-red-500",
      achievements: [
        "50+ developers in network",
        "Multiple client partnerships",
        "Quality assurance protocols",
      ],
      impact: "Created sustainable income streams for talented developers",
    },
    {
      year: "2024",
      quarter: "Q1",
      title: "Recognition & Growth",
      subtitle: "Making Waves",
      description:
        "Gained recognition in the tech community for our innovative approach to global talent matching and inclusive hiring practices.",
      icon: FaTrophy,
      gradient: "from-indigo-400 to-purple-500",
      achievements: [
        "Industry recognition",
        "Media coverage",
        "Thought leadership",
      ],
      impact: "Influenced hiring practices across the tech industry",
    },
    {
      year: "2024",
      quarter: "Q2",
      title: "Skills Development",
      subtitle: "Beyond Matching",
      description:
        "Launched comprehensive skill development programs, including soft skills training and technical advancement courses.",
      icon: FaGraduationCap,
      gradient: "from-pink-400 to-rose-500",
      achievements: [
        "Training programs launched",
        "Certification partnerships",
        "Mentorship network",
      ],
      impact: "Empowered developers with complete professional growth",
    },
    {
      year: "2024",
      quarter: "Q3",
      title: "Global Impact",
      subtitle: "Changing Lives Worldwide",
      description:
        "Reached significant milestones in developer placements and began seeing measurable economic impact in local communities.",
      icon: FaGlobe,
      gradient: "from-cyan-400 to-blue-500",
      achievements: [
        "500+ successful placements",
        "Community impact studies",
        "Economic growth metrics",
      ],
      impact: "Generated $2M+ in income for underserved communities",
    },
    {
      year: "2024",
      quarter: "Q4",
      title: "Technology Evolution",
      subtitle: "AI-Powered Matching",
      description:
        "Integrated advanced AI systems for better talent-opportunity matching, ensuring even more precise connections.",
      icon: FaCode,
      gradient: "from-emerald-400 to-green-500",
      achievements: [
        "AI matching system",
        "Predictive analytics",
        "Success rate optimization",
      ],
      impact: "Achieved 95% placement success rate",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      green: "from-green-500 to-emerald-500",
      orange: "from-orange-500 to-red-500",
      pink: "from-pink-500 to-rose-500",
      indigo: "from-indigo-500 to-purple-500",
    };
    return colorMap[color] || "from-blue-500 to-cyan-500";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      <div className="relative z-10 pt-4 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div
            className={`text-center mb-10 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="max-w-6xl mx-auto px-6 relative z-10 mt-14 mb-10">
              <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
                <span className="text-white">About </span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Andishi
                </span>
              </h1>

              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Transforming overlooked minds into architects of tomorrow's
                digital world
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {["mission", "vision", "values", "journey"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-6 py-3 rounded-full cursor-pointer font-semibold monty uppercase text-sm transition-all duration-300 ${
                    activeSection === section
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          {activeSection === "mission" && (
            <div className="transition-all duration-500 animate-fade-in">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-12">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-6">
                    <FaBullseye className="text-3xl text-blue-400 mr-4" />
                    <h2 className="text-3xl font-semibold text-white">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    We exist to democratize global tech opportunities,
                    discovering and nurturing exceptional talent while creating
                    economic growth that transcends borders.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {missionElements.map((element, index) => (
                    <div
                      key={index}
                      className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-r ${element.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <element.icon className="text-white text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {element.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed">
                            {element.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vision Section */}
          {activeSection === "vision" && (
            <div className="transition-all duration-500 animate-fade-in">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-12">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-6">
                    <FaEye className="text-3xl text-purple-400 mr-4" />
                    <h2 className="text-3xl font-semibold text-white">
                      Our Vision
                    </h2>
                  </div>
                  <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    A tech ecosystem where talent is evaluated solely on merit,
                    where geography becomes just a data point, and innovation
                    flows freely across all borders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visionElements.map((element, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105"
                      style={{ animationDelay: element.delay }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <element.icon className="text-white text-xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                          {element.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {element.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Values Section */}
          {activeSection === "values" && (
            <div className="transition-all duration-500 animate-fade-in">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-12">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-6">
                    <FaHeart className="text-3xl text-green-400 mr-4" />
                    <h2 className="text-3xl font-semibold text-white">
                      Core Values
                    </h2>
                  </div>
                  <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    These principles guide every decision we make and every
                    connection we facilitate.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {coreValues.map((value, index) => (
                    <div
                      key={index}
                      className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/8"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-r ${getColorClasses(
                          value.color
                        )} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <value.icon className="text-white text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-sm font-medium text-blue-300 mb-3">
                        {value.subtitle}
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Journey/Timeline Section */}
          {activeSection === "journey" && (
            <div className="transition-all duration-500 animate-fade-in">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-12">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-6">
                    <FaClock className="text-3xl text-cyan-400 mr-4" />
                    <h2 className="text-3xl font-semibold text-white">
                      Our Journey
                    </h2>
                  </div>
                  <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    From a spark of an idea to transforming lives globally.
                    Here's how we've grown to bridge the talent gap.
                  </p>
                </div>

                {/* Timeline Navigation */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                  {timelineEvents.map((event, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTimelineItem(index)}
                      className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTimelineItem === index
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {event.year} {event.quarter}
                    </button>
                  ))}
                </div>

                {/* Active Timeline Item */}
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full opacity-30"></div>

                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/30 transition-all duration-500">
                      {/* Timeline Dot */}
                      <div className="absolute left-8 top-8 transform -translate-x-1/2">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-r ${timelineEvents[activeTimelineItem].gradient} shadow-lg`}
                        ></div>
                      </div>

                      <div className="ml-16">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${timelineEvents[activeTimelineItem].gradient} flex items-center justify-center`}
                              >
                                {(() => {
                                  const Icon =
                                    timelineEvents[activeTimelineItem].icon;
                                  return (
                                    <Icon className="text-white text-xl" />
                                  );
                                })()}
                              </div>
                              <div>
                                <h3 className="text-2xl font-semibold text-white">
                                  {timelineEvents[activeTimelineItem].title}
                                </h3>
                                <p className="text-cyan-300 font-medium">
                                  {timelineEvents[activeTimelineItem].subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              {timelineEvents[activeTimelineItem].year}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timelineEvents[activeTimelineItem].quarter}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 leading-relaxed mb-6">
                          {timelineEvents[activeTimelineItem].description}
                        </p>

                        {/* Achievements & Impact */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-white font-semibold mb-3 flex items-center">
                              <FaCheckCircle className="text-green-400 mr-2" />
                              Key Achievements
                            </h4>
                            <ul className="space-y-2">
                              {timelineEvents[
                                activeTimelineItem
                              ].achievements.map((achievement, i) => (
                                <li
                                  key={i}
                                  className="text-gray-400 text-sm flex items-start"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-3 flex-shrink-0"></div>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-white font-semibold mb-3 flex items-center">
                              <FaStar className="text-yellow-400 mr-2" />
                              Impact Created
                            </h4>
                            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {timelineEvents[activeTimelineItem].impact}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() =>
                        setActiveTimelineItem(
                          Math.max(0, activeTimelineItem - 1)
                        )
                      }
                      disabled={activeTimelineItem === 0}
                      className="flex items-center cursor-pointer px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
                    >
                      <FaArrowRight className="rotate-180 mr-2" />
                      Previous
                    </button>

                    <button
                      onClick={() =>
                        setActiveTimelineItem(
                          Math.min(
                            timelineEvents.length - 1,
                            activeTimelineItem + 1
                          )
                        )
                      }
                      disabled={
                        activeTimelineItem === timelineEvents.length - 1
                      }
                      className="flex cursor-pointer items-center px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
                    >
                      Next
                      <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <TeamSection />

          {/* Call to Action */}
          <div className="text-center backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to Transform the Future?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join us in building a world where exceptional talent thrives
              without boundaries. Whether you're a developer looking for
              opportunities or a company seeking top talent, let's create
              something extraordinary together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/join-talent-pool"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 cursor-pointer monty transition-all duration-300 flex items-center justify-center group"
              >
                Join Our Talent Pool
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/start-project"
                className="px-8 monty cursor-pointer py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
}
