"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { FaClock, FaGlobeAmericas, FaLightbulb, FaUsers } from "react-icons/fa";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio: string;
  image: string;
  email: string;
  linkedin: string;
  twitter?: string;
  skills: string[];
  experience: string;
  education: string;
  achievements: string[];
  gradient: string;
  quote: string;
}

export default function TeamSection() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Ian Mwangi",
      position: "Chief Executive Officer & Founder",
      department: "Executive",
      bio: "Architect of digital ecosystems who sees patterns where others see chaos. Builds companies the way jazz musicians build solos—structured improvisation with perfect timing.",
      image: "/images/team/ian.jpg",
      email: "ian@andishi.dev",
      linkedin: "https://linkedin.com/in/ianmwangi",
      twitter: "https://twitter.com/ianmwangi",
      skills: [
        "Systems Thinking",
        "Revenue Architecture",
        "Team Psychology",
        "Market Timing",
      ],
      experience: "7+ years",
      education: "BBIT, Jomo Kenyatta University",
      achievements: [
        "Turned Andishi from bedroom idea into distributed talent engine",
        "Orchestrated three exits that made early employees wealthy",
        "Spoke at TEDx Nairobi on 'Building for Emergence, Not Just Growth'",
      ],
      gradient: "from-purple-500/20 to-pink-500/10",
      quote:
        "Most founders build companies. I prefer building conditions where remarkable things become inevitable.",
    },
    {
      id: 4,
      name: "Isaac John",
      position: "Chief Financial Officer",
      department: "Finance",
      bio: "Financial translator who turns spreadsheet poetry into boardroom prose. Treats cash flow like a chess game—always thinking three moves ahead.",
      image: "/images/team/isaac.jpg",
      email: "isaack@andishi.dev",
      linkedin: "https://linkedin.com/in/isaacjohn",
      skills: [
        "Capital Choreography",
        "Risk Archaeology",
        "Deal Architecture",
        "Financial Forensics",
      ],
      experience: "7+ years",
      education: "CPA, MBA Finance, Kenyatta University",
      achievements: [
        "Structured $100K+ in funding rounds that investors still use as templates",
        "Turned 5 acquisitions into cultural integrations, not corporate divorces",
        "Won East Africa CFO Award by making finance sexy (somehow)",
      ],
      gradient: "from-orange-500/20 to-red-500/10",
      quote:
        "Every balance sheet is a poem about choices made in the dark. My job is reading between the lines.",
    },

    {
      id: 3,
      name: "Dennis Munge",
      position: "Marketing Manager",
      department: "Marketing",
      bio: "Brand whisperer who transforms corporate monologues into human conversations. Believes the best marketing doesn't feel like marketing at all.",
      image: "/images/team/dennis.jpg",
      email: "dennis@andishi.dev",
      linkedin: "https://linkedin.com/in/dennismunge",
      twitter: "https://twitter.com/dennismunge",
      skills: [
        "Narrative Surgery",
        "Attention Economics",
        "Cultural Fluency",
        "Story Velocity",
      ],
      experience: "6+ years",
      education: "BICT, Scott Christian University",
      achievements: [
        "Created Andishi's voice from scratch—now other brands try to sound like us",
        "Rebranded ourselves across platforms without losing our soul",
        "Tripled qualified leads by making our content actually useful",
      ],
      gradient: "from-blue-500/20 to-sky-500/10",
      quote:
        "Great marketing is anthropology in disguise. I study what people actually care about, then speak that language fluently.",
    },

    {
      id: 5,
      name: "Eric Kibuchi",
      position: "Project Manager",
      department: "Operations",
      bio: "Chaos conductor who turns organizational entropy into purposeful momentum. Sees projects as living systems, not just timelines with checkboxes.",
      image: "/images/team/eric.jpg",
      email: "eric@andishi.dev",
      linkedin: "https://linkedin.com/in/erickibuchi",
      skills: [
        "Complexity Navigation",
        "Systems Integration",
        "Velocity Optimization",
        "Stakeholder Diplomacy",
      ],
      experience: "5+ years",
      education: "MAC(Mathematics and Computer Science), KEMU",
      achievements: [
        "Shepherded 30+ projects through the valley of competing priorities",
        "Eliminated 40% of meetings that should have been Slack messages",
        "Green Belt in making things happen without drama",
      ],
      gradient: "from-sky-500/20 to-blue-500/10",
      quote:
        "Good project management is invisible. When everything flows smoothly, nobody asks how—they just marvel at the results.",
    },

    {
      id: 6,
      name: "Yvette Janes",
      position: "Marketing Strategist",
      department: "Marketing",
      bio: "Pattern detective who reads market signals like tea leaves, then transforms insights into campaigns that feel inevitable in hindsight.",
      image: "/images/team/yvette.jpg",
      email: "yvettel@andishi.dev",
      linkedin: "https://linkedin.com/in/yvettejanes",
      skills: [
        "Market Psychology",
        "Campaign Architecture",
        "Channel Orchestration",
        "Behavioral Triggers",
      ],
      experience: "3+ years",
      education: "Bachelors in Marketing, Cooperative University",
      achievements: [
        "Boosted brand resonance 60% by understanding what people don't say",
        "Coordinated campaigns across 4 continents without losing local flavor",
        "Named Rising Marketing Talent for campaigns that competitors still study",
      ],
      gradient: "from-pink-500/20 to-purple-500/10",
      quote:
        "Anyone can buy attention. The real art is earning it by being genuinely worth remembering.",
    },
  ];

  const departments = [
    "all",
    "Executive",
    "Marketing",
    "Finance",
    "Operations",
  ];

  const filteredMembers =
    selectedDepartment === "all"
      ? teamMembers
      : teamMembers.filter(
          (member) => member.department === selectedDepartment
        );

  return (
    <section
      id="team"
      className="py-20 relative my-16 bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Meet Our <span className="text-purple-400">Team</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Passionate innovators and industry veterans driving Andishi's
            mission to transform the digital landscape through cutting-edge
            technology and visionary leadership.
          </p>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-6 py-2 rounded-full backdrop-blur-md border transition-all duration-150 capitalize ${
                  selectedDepartment === dept
                    ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                {dept === "all" ? "All Departments" : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-black/10 border border-white/10 hover:border-white/20 transition-all duration-250 hover:scale-[1.02]"
              // style={{
              //   background: `linear-gradient(135deg,
              //     rgba(59, 130, 246, 0.03) 0%,
              //     rgba(147, 51, 234, 0.02) 50%,
              //     rgba(236, 72, 153, 0.03) 100%)`,
              //   boxShadow: `
              //     0 8px 32px rgba(0, 0, 0, 0.2),
              //     inset 0 1px 0 rgba(255, 255, 255, 0.05)
              //   `,
              // }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Colored gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />

              {/* Profile Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-250 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Department Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {member.department}
                  </span>
                </div>

                {/* Social Links */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <Link
                    href={member.linkedin}
                    className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-blue-500/20 transition-all duration-150"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Link>
                  {member.twitter && (
                    <Link
                      href={member.twitter}
                      className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-blue-400/20 transition-all duration-150"
                      aria-label={`${member.name} Twitter`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href={`mailto:${member.email}`}
                    className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-green-500/20 transition-all duration-150"
                    aria-label={`Email ${member.name}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Quote overlay on hover */}
                <div
                  className={`absolute inset-x-4 bottom-4 transform transition-all duration-250 ${
                    hoveredMember === member.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="bg-black/50 backdrop-blur-md rounded-lg p-3">
                    <p className="text-white text-xs italic leading-relaxed">
                      "{member.quote}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Name & Position */}
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-150">
                    {member.name}
                  </h3>
                  <p className="text-blue-400 font-medium text-sm">
                    {member.position}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-150 text-sm leading-relaxed line-clamp-3">
                  {member.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-500/2 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-full text-xs font-medium">
                      +{member.skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <div className="text-gray-300 font-medium">
                        {member.experience}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Education:</span>
                      <div className="text-gray-300 font-medium">
                        {member.education}
                      </div>
                    </div>
                  </div>

                  {/* Achievements (shown on hover) */}
                  <div
                    className={`mt-4 overflow-hidden transition-all duration-250 ${
                      hoveredMember === member.id
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-gray-500 text-xs">
                        Key Achievements:
                      </span>
                      {member.achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="text-gray-300 text-xs flex items-start space-x-2"
                        >
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 left-1/2 w-1 h-1 bg-purple-400/40 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-250" />
              <div
                className="absolute bottom-8 left-8 w-2 h-2 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-250"
                style={{ animationDelay: "0.5s" }}
              />
            </article>
          ))}
        </div>

        {/* Team Stats */}
        {/* <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              label: "Team Members",
              value: "50+",
              icon: <FaUsers className="text-blue-400 text-xl" />,
            },
            {
              label: "Years Combined Experience",
              value: "200+",
              icon: <FaClock className="text-yellow-400 text-xl" />,
            },
            {
              label: "Countries Represented",
              value: "12",
              icon: <FaGlobeAmericas className="text-green-400 text-xl" />,
            },
            {
              label: "Patents Filed",
              value: "35+",
              icon: <FaLightbulb className="text-purple-400 text-xl" />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center flex items-center flex-col p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all duration-150 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-150">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white my-2 monty group-hover:text-purple-300 transition-colors duration-150">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm monty uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}
