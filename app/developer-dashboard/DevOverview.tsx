"use client";

import { ProjectAssignment } from "@/types/project";
import React, { useState } from "react";
import {
  FaCheck,
  FaGithub,
  FaLinkedin,
  FaRocket,
  FaMapMarkerAlt,
  FaHistory,
  FaTasks,
  FaStar,
  FaCode,
  FaTrophy,
  FaClock,
  FaFire,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaChartLine,
  FaUsers,
  FaBug,
  FaCodeBranch,
  FaEye,
  FaGraduationCap,
  FaMedal,
  FaGem,
  FaCrown,
  FaCalendarAlt,
  FaLightbulb,
  FaHandshake,
  FaRocket as FaRocketIcon,
  FaChevronRight,
  FaComment,
  FaExclamationTriangle,
  FaCog,
} from "react-icons/fa";
import { HiShieldExclamation } from "react-icons/hi";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: "technical" | "project" | "collaboration" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Skill {
  name: string;
  level: number; // 1-100
  category: string;
  trending: "up" | "down" | "stable";
  endorsements: number;
  lastUsed: string;
}

interface ProjectMetrics {
  linesOfCode: number;
  commits: number;
  testsWritten: number;
  bugsFixed: number;
  codeReviews: number;
}

interface TimeEntry {
  date: string;
  hours: number;
  project: string;
  description: string;
}

interface Notification {
  id: string;
  type: "project" | "achievement" | "message" | "deadline";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

interface DeveloperStats {
  totalProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  totalCodeLines: number;
  activeDays: number;
  clientRetention: number;
  responseTime: string;
  totalCommits: number;
  bugsFixed: number;
  codeReviewsGiven: number;
  mentoringSessions: number;
}

export interface DeveloperProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    timeZone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    avatar?: string;
    tagline: string;
  };
  professionalInfo: {
    title: string;
    experienceLevel: string;
    yearsOfExperience: string;
    availability: string;
    languages: string[];
    bio: string;
    preferredWorkType: string[];
    workingHours: string;
    certifications: string[];
  };
  technicalSkills: {
    primarySkills: Skill[];
    frameworks: Skill[];
    databases: Skill[];
    tools: Skill[];
    cloudPlatforms: string[];
    specializations: string[];
  };
  projects: ProjectAssignment[];
  stats: DeveloperStats;
  achievements: Achievement[];
  recentActivity: any[];
  notifications: Notification[];
  timeEntries: TimeEntry[];
}

interface EnhancedDeveloperOverviewProps {
  profile: DeveloperProfile;
}

const EnhancedDeveloperOverview = ({
  profile,
}: EnhancedDeveloperOverviewProps) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500";
      case "epic":
        return "from-purple-400 to-pink-500";
      case "rare":
        return "from-blue-400 to-cyan-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return <FaCrown className="text-yellow-400" />;
      case "epic":
        return <FaGem className="text-purple-400" />;
      case "rare":
        return <FaMedal className="text-blue-400" />;
      default:
        return <HiShieldExclamation className="text-gray-400" />;
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case "code":
        return <FaCode />;
      case "trophy":
        return <FaTrophy />;
      case "graduation":
        return <FaGraduationCap />;
      case "bug":
        return <FaBug />;
      default:
        return <FaStar />;
    }
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case "up":
        return <FaArrowUp className="text-green-400 text-xs" />;
      case "down":
        return <FaArrowDown className="text-red-400 text-xs" />;
      default:
        return <FaMinus className="text-gray-400 text-xs" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FaRocketIcon className="text-blue-400" />;
      case "achievement":
        return <FaTrophy className="text-yellow-400" />;
      case "message":
        return <FaComment className="text-green-400" />;
      case "deadline":
        return <FaExclamationTriangle className="text-red-400" />;
      default:
        return <FaCog className="text-gray-400" />;
    }
  };

  const allSkills = [
    ...profile.technicalSkills.primarySkills,
    ...profile.technicalSkills.frameworks,
    ...profile.technicalSkills.databases,
    ...profile.technicalSkills.tools,
  ].sort((a, b) => b.level - a.level);

  const displayedSkills = showAllSkills ? allSkills : allSkills.slice(0, 6);
  const displayedAchievements = showAllAchievements
    ? profile.achievements
    : profile.achievements.slice(0, 3);

  return (
    <div className="min-h-screen my-18">
      <div className="max-w-7xl mx-auto space-y-8 mb-0">
        {/* Enhanced Profile Header */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white text3xl font-semibold">
                      {profile.personalInfo.firstName[0]}
                      {profile.personalInfo.lastName[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                    <FaCheck className="text-white text-sm" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-white mb-2">
                    {profile.personalInfo.firstName}{" "}
                    {profile.personalInfo.lastName}
                  </h1>
                  <p className="text-md text-indigo-300 monty uppercase mb-3">
                    {profile.professionalInfo.title}
                  </p>
                  <p className="text-gray-400 mb-4 max-w-2xl leading-relaxed">
                    {profile.personalInfo.tagline}
                  </p>
                  <div className="flex items-center space-x-6">
                    <a
                      href={profile.personalInfo.github}
                      className="text-gray-400 hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaGithub className="text-xl" />
                    </a>
                    <a
                      href={profile.personalInfo.linkedin}
                      className="text-gray-400 hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaLinkedin className="text-xl" />
                    </a>
                    <a
                      href={profile.personalInfo.portfolio}
                      className="text-gray-400 hover:text-white transition-all transform hover:scale-110"
                    >
                      <FaRocket className="text-xl" />
                    </a>
                    <div className="flex items-center text-gray-400">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{profile.personalInfo.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg mb-2">
                    <FaCheck className="text-green-400 mr-2" />
                    <span className="text-green-400 text-sm monty uppercase font-medium">
                      Available for Projects
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm monty">
                    Response time: {profile.stats.responseTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Projects",
              value: profile.stats.totalProjects,
              icon: FaRocketIcon,
              color: "blue",
            },
            {
              label: "Avg Rating",
              value: `${profile.stats.averageRating}/5`,
              icon: FaStar,
              color: "yellow",
            },
            {
              label: "Lines of Code",
              value: profile.stats.totalCodeLines.toLocaleString(),
              icon: FaCode,
              color: "green",
            },
            {
              label: "Client Retention",
              value: `${profile.stats.clientRetention}%`,
              icon: FaHandshake,
              color: "purple",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`text-${stat.color}-400 text-xl`} />
                </div>
                <FaChartLine className="text-gray-400 text-sm" />
              </div>
              <div className="text-2xl monty font-semibold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm monty uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Skills */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaFire className="mr-3 text-orange-400" />
                  Top Skills
                </h2>
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  {showAllSkills ? "Show Less" : "Show All"}
                  <FaChevronRight className="ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {skill.name}
                        </span>
                        {getTrendingIcon(skill.trending)}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{skill.category}</span>
                      <span>{skill.endorsements} endorsements</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaTrophy className="mr-3 text-yellow-400" />
                  Recent Achievements
                </h2>
                <button
                  onClick={() => setShowAllAchievements(!showAllAchievements)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  {showAllAchievements ? "Show Less" : "Show All"}
                  <FaChevronRight className="ml-1" />
                </button>
              </div>
              <div className="grid gap-4">
                {displayedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(
                          achievement.rarity
                        )} rounded-lg flex items-center justify-center`}
                      >
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium">
                            {achievement.title}
                          </h3>
                          {getRarityIcon(achievement.rarity)}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                          {achievement.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          {achievement.earnedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Time Tracking */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaHistory className="mr-3 text-blue-400" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {profile.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {activity.type === "task" && (
                        <FaTasks className="text-white" />
                      )}
                      {activity.type === "feedback" && (
                        <FaStar className="text-white" />
                      )}
                      {activity.type === "code" && (
                        <FaCode className="text-white" />
                      )}
                      {activity.type === "achievement" && (
                        <FaTrophy className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-gray-400 text-xs">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaClock className="mr-3 text-green-400" />
                This Week's Time
              </h2>
              <div className="space-y-4">
                {profile.timeEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {entry.project}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {entry.description}
                      </p>
                      <p className="text-gray-500 text-xs">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-semibold">
                        {entry.hours}h
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total this week:</span>
                    <span className="text-white font-semibold text-lg">
                      {profile.timeEntries.reduce(
                        (sum, entry) => sum + entry.hours,
                        0
                      )}
                      h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="backdrop-blur-md w-full bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaLightbulb className="mr-3 text-yellow-400" />
            Notifications
          </h2>
          <div className="space-y-3">
            {profile.notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg transition-all ${
                  notification.read
                    ? "bg-white/5"
                    : "bg-blue-500/10 border border-blue-500/20"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDeveloperOverview;
