"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaCheck,
  FaClock,
  FaProjectDiagram,
  FaCode,
  FaBriefcase,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLanguage,
  FaStar,
  FaCalendarAlt,
  FaDollarSign,
  FaTasks,
  FaHourglassHalf,
  FaEdit,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaRocket,
  FaShieldAlt,
  FaBell,
  FaDownload,
  FaShareAlt,
  FaBookmark,
  FaEye,
  FaThumbsUp,
  FaComments,
  FaCoffee,
  FaLightbulb,
  FaGem,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaWallet,
  FaChartPie,
  FaHistory,
  FaCertificate,
  FaGraduationCap,
  FaTools,
  FaCloud,
  FaDatabase,
  FaMobile,
  FaDesktop,
  FaGamepad,
  FaAtom,
  FaRobot,
  FaPalette,
  FaSearchPlus,
} from "react-icons/fa";

// Enhanced interfaces
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

interface ProjectAssignment {
  id: string;
  title: string;
  description: string;
  status: "assigned" | "in-progress" | "completed" | "on-hold" | "review";
  startDate: string;
  deadline: string;
  budget: number;
  technologies: string[];
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  client: string;
  teamSize: number;
  metrics: ProjectMetrics;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    estimatedHours: number;
    actualHours?: number;
  }[];
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
    payment: number;
  }[];
  riskLevel: "low" | "medium" | "high";
  satisfaction: number; // 1-5 stars
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
    hourlyRate: number;
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

export default function EnhancedDeveloperDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "projects" | "skills" | "analytics" | "achievements"
  >("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  useEffect(() => {
    if (!user) return; // wait until user is loaded
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/developer-profiles");
        if (!res.ok) throw new Error("Failed to load profiles");
        const list = await res.json();
        let myProfile = null;
        if (Array.isArray(list)) {
          myProfile = list.find((p: any) => (p.user?.email || '').toLowerCase() === (user?.email || '').toLowerCase());
        }
        setProfile(myProfile || (Array.isArray(list) ? list[0] : list));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: "text-yellow-400 bg-yellow-500/20 border-yellow-400/30",
      "in-progress": "text-blue-400 bg-blue-500/20 border-blue-400/30",
      completed: "text-green-400 bg-green-500/20 border-green-400/30",
      "on-hold": "text-red-400 bg-red-500/20 border-red-400/30",
      review: "text-purple-400 bg-purple-500/20 border-purple-400/30",
    };
    return (
      colors[status as keyof typeof colors] ||
      "text-gray-400 bg-gray-500/20 border-gray-400/30"
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-400",
      medium: "text-yellow-400",
      high: "text-orange-400",
      critical: "text-red-400",
    };
    return colors[priority as keyof typeof colors] || "text-gray-400";
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "from-gray-500 to-gray-600",
      rare: "from-blue-500 to-blue-600",
      epic: "from-purple-500 to-purple-600",
      legendary: "from-yellow-500 to-orange-600",
    };
    return colors[rarity as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 90) return "from-green-500 to-emerald-500";
    if (level >= 80) return "from-blue-500 to-cyan-500";
    if (level >= 70) return "from-yellow-500 to-orange-500";
    return "from-gray-500 to-slate-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D0E]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-blue-400 mx-auto"></div>
          </div>
          <p className="text-white mt-4 text-lg font-semibold monty uppercase">
            Loading your dashboard...
          </p>
          <p className="text-gray-400 mt-2 monty">
            Fetching projects, stats, and achievements
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover px-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FaUser className="text-white text-2xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">
              No Profile Found
            </h2>
            <p className="text-gray-400 mb-8">
              Join our elite tech talent network to create your developer
              profile and access premium opportunities
            </p>
            <button
              onClick={() => router.push("/join-tech-talent")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <FaRocket className="text-lg" />
              <span>Join Elite Network</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {profile.personalInfo.firstName[0]}
                  {profile.personalInfo.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-white font-semibold">
                  {profile.personalInfo.firstName}{" "}
                  {profile.personalInfo.lastName}
                </h1>
                <p className="text-gray-400 text-sm">
                  {profile.professionalInfo.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaBell className="text-xl" />
                  {profile?.notifications?.filter((n) => !n.read).length >
                    0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {profile?.notifications?.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {(profile?.notifications ?? []).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 ${
                            !notification.read ? "bg-blue-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(
                                notification.priority
                              )}`}
                            ></div>
                            <div className="flex-1">
                              <h4 className="text-white text-sm font-medium">
                                {notification.title}
                              </h4>
                              <p className="text-gray-400 text-xs mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats Banner */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
              <FaTrophy className="text-2xl text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.completedProjects}
              </div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 text-center">
              <FaStar className="text-2xl text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.averageRating}
              </div>
              <div className="text-xs text-gray-400">Rating</div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 text-center">
              <FaWallet className="text-2xl text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                ${(profile.stats.totalEarnings / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400">Earned</div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-4 text-center">
              <FaCode className="text-2xl text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {(profile.stats.totalCodeLines / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400">Lines</div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-400/30 rounded-xl p-4 text-center">
              <FaFire className="text-2xl text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.activeDays}
              </div>
              <div className="text-xs text-gray-400">Active Days</div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-400/30 rounded-xl p-4 text-center">
              <FaRocket className="text-2xl text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.clientRetention}%
              </div>
              <div className="text-xs text-gray-400">Retention</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 relative">
          <div className="backdrop-blur-md sticky top-0 bg-white/5 border border-white/10 rounded-xl p-2">
            <div className="flex space-x-2">
              {[
                { id: "overview", label: "Overview", icon: FaUser },
                { id: "projects", label: "Projects", icon: FaProjectDiagram },
                { id: "skills", label: "Skills", icon: FaCode },
                { id: "analytics", label: "Analytics", icon: FaChartLine },
                { id: "achievements", label: "Achievements", icon: FaTrophy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Profile Overview */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-3xl font-semibold">
                        {profile.personalInfo.firstName[0]}
                        {profile.personalInfo.lastName[0]}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0B0D0E] flex items-center justify-center">
                      <FaCheck className="text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {profile.personalInfo.firstName}{" "}
                      {profile.personalInfo.lastName}
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                      {profile.professionalInfo.title}
                    </p>
                    <p className="text-gray-400 mb-4 max-w-2xl">
                      {profile.personalInfo.tagline}
                    </p>
                    <div className="flex items-center space-x-6">
                      <a
                        href={profile.personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
                      >
                        <FaGithub className="text-2xl" />
                      </a>
                      <a
                        href={profile.personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
                      >
                        <FaLinkedin className="text-2xl" />
                      </a>
                      <a
                        href={profile.personalInfo.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
                      >
                        <FaRocket className="text-2xl" />
                      </a>
                      <div className="flex items-center text-gray-400">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{profile.personalInfo.location}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FaDollarSign className="mr-1" />
                        <span>${profile.professionalInfo.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg mb-2">
                      <FaCheck className="text-green-400 mr-2" />
                      <span className="text-green-400 text-sm font-medium">
                        Available for Projects
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Response time: {profile.stats.responseTime}
                    </div>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600/20 hover:bg-blue-700/20 text-white rounded-lg transition-all transform hover:scale-105">
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FaHistory className="mr-3 text-blue-400" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {(profile.recentActivity ?? []).map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
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
                  {profile?.timeEntries?.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
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
                          {entry.hours}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total this week:</span>
                      <span className="text-white font-bold text-lg">
                        {profile?.timeEntries?.reduce(
                          (sum, entry) => sum + entry.hours,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-8">
            {/* Project Filters */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-white font-medium">
                    Filter by status:
                  </span>
                  <div className="flex space-x-2">
                    {["all", "in-progress", "completed", "review"].map(
                      (status) => (
                        <button
                          key={status}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors capitalize"
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaSearchPlus className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-8">
              {(profile.projects ?? []).map((project) => (
                <div
                  key={project.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4 gap-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold !text-blue-400">
                          {project.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {project.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 my-6">
                        {project.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-300">
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2 text-blue-400" />
                          {project.client}
                        </div>
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-green-400" />
                          {project.teamSize} members
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-orange-400" />
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <FaDollarSign className="mr-2 text-green-400" />$
                          {project.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">
                        {project.progress}%
                      </div>
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Project Metrics */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <FaCode className="text-blue-400 mx-auto mb-1" />
                      <div className="text-white font-semibold">
                        {(project.metrics.linesOfCode / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-400">Lines</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <FaGithub className="text-green-400 mx-auto mb-1" />
                      <div className="text-white font-semibold">
                        {project.metrics.commits}
                      </div>
                      <div className="text-xs text-gray-400">Commits</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <FaShieldAlt className="text-purple-400 mx-auto mb-1" />
                      <div className="text-white font-semibold">
                        {project.metrics.testsWritten}
                      </div>
                      <div className="text-xs text-gray-400">Tests</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <FaTools className="text-orange-400 mx-auto mb-1" />
                      <div className="text-white font-semibold">
                        {project.metrics.bugsFixed}
                      </div>
                      <div className="text-xs text-gray-400">Bugs Fixed</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <FaEye className="text-yellow-400 mx-auto mb-1" />
                      <div className="text-white font-semibold">
                        {project.metrics.codeReviews}
                      </div>
                      <div className="text-xs text-gray-400">Reviews</div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {(project.technologies ?? []).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg text-gray-300 text-sm border border-gray-600/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {(project.milestones ?? []).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                milestone.completed
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              } flex items-center justify-center`}
                            >
                              {milestone.completed && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                milestone.completed
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              {milestone.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              Due:{" "}
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-green-400 font-semibold">
                            ${milestone.payment.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm text-gray-400">Tasks Progress</h4>
                      <span className="text-xs text-gray-500">
                        {project.tasks.filter((t) => t.completed).length} /{" "}
                        {project.tasks.length} completed
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(project.tasks ?? []).slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center space-x-3 p-2 bg-white/5 rounded"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              task.completed ? "bg-green-500" : "bg-gray-500"
                            }`}
                          ></div>
                          <span
                            className={`text-sm flex-1 ${
                              task.completed
                                ? "text-gray-400 line-through"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                      {project.tasks.length > 3 && (
                        <div className="text-center pt-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            View all {project.tasks.length} tasks
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-8">
            {/* Skills Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Primary Skills */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FaCode className="mr-3 text-blue-400" />
                  Primary Skills
                </h2>
                <div className="space-y-4">
                  {(profile.technicalSkills?.primarySkills ?? []).map((skill) => (
                    <div
                      key={skill.name}
                      className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">
                            {skill.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {skill.trending === "up" && (
                              <FaArrowUp className="text-green-400 text-xs" />
                            )}
                            {skill.trending === "down" && (
                              <FaArrowDown className="text-red-400 text-xs" />
                            )}
                            {skill.trending === "stable" && (
                              <FaEquals className="text-gray-400 text-xs" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">
                            {skill.endorsements} endorsements
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getSkillLevelColor(
                            skill.level
                          )} transition-all duration-1000`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {skill.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last used: {skill.lastUsed}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frameworks */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FaAtom className="mr-3 text-purple-400" />
                  Frameworks & Libraries
                </h2>
                <div className="space-y-4">
                  {(profile.technicalSkills?.frameworks ?? []).map((skill) => (
                    <div
                      key={skill.name}
                      className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">
                            {skill.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {skill.trending === "up" && (
                              <FaArrowUp className="text-green-400 text-xs" />
                            )}
                            {skill.trending === "down" && (
                              <FaArrowDown className="text-red-400 text-xs" />
                            )}
                            {skill.trending === "stable" && (
                              <FaEquals className="text-gray-400 text-xs" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">
                            {skill.endorsements} endorsements
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getSkillLevelColor(
                            skill.level
                          )} transition-all duration-1000`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {skill.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last used: {skill.lastUsed}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Skills Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Databases */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaDatabase className="mr-2 text-green-400" />
                  Databases
                </h3>
                <div className="space-y-3">
                  {(profile.technicalSkills?.databases ?? []).map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-300">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getSkillLevelColor(
                              skill.level
                            )}`}
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {skill.level}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud Platforms */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaCloud className="mr-2 text-blue-400" />
                  Cloud Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.technicalSkills?.cloudPlatforms ?? []).map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaRocket className="mr-2 text-purple-400" />
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.technicalSkills?.specializations ?? []).map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-400 text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaCertificate className="mr-3 text-yellow-400" />
                Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(profile.professionalInfo?.certifications ?? []).map((cert, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FaGraduationCap className="text-2xl text-yellow-400" />
                      <div>
                        <h4 className="text-white font-medium">{cert}</h4>
                        <p className="text-gray-400 text-sm">Verified</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-2xl text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <FaArrowUp className="mr-1" />
                      +12%
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  $24,500
                </div>
                <div className="text-gray-400 text-sm">Monthly Revenue</div>
              </div>

              <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                    <FaUser className="text-2xl text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <FaArrowUp className="mr-1" />
                      +8%
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">142</div>
                <div className="text-gray-400 text-sm">Active Clients</div>
              </div>

              <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                    <FaTasks className="text-2xl text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <FaArrowUp className="mr-1" />
                      +5%
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">89%</div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>

              <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center">
                    <FaClock className="text-2xl text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-sm font-medium flex items-center">
                      <FaArrowDown className="mr-1" />
                      -3%
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">2.3h</div>
                <div className="text-gray-400 text-sm">Avg Response Time</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Revenue Trend
                </h3>
                <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FaChartLine className="text-4xl text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400">
                      Interactive chart would be rendered here
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Distribution */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Project Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Web Development</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-blue-500"></div>
                      </div>
                      <span className="text-white text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Mobile Apps</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-green-500"></div>
                      </div>
                      <span className="text-white text-sm">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Development</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-1/5 h-full bg-purple-500"></div>
                      </div>
                      <span className="text-white text-sm">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Consulting</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-1/10 h-full bg-orange-500"></div>
                      </div>
                      <span className="text-white text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold">94%</span>
                    </div>
                  </div>
                  <h4 className="text-white font-medium">
                    Client Satisfaction
                  </h4>
                  <p className="text-gray-400 text-sm">Based on 89 reviews</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
                    <div
                      className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent"
                      style={{ transform: "rotate(45deg)" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold">87%</span>
                    </div>
                  </div>
                  <h4 className="text-white font-medium">On-Time Delivery</h4>
                  <p className="text-gray-400 text-sm">Last 12 months</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
                    <div
                      className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent"
                      style={{ transform: "rotate(90deg)" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold">92%</span>
                    </div>
                  </div>
                  <h4 className="text-white font-medium">Quality Score</h4>
                  <p className="text-gray-400 text-sm">Code review average</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-8">
            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4 text-center">
                <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-sm text-gray-400">Total Badges</div>
              </div>
              <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
                <FaFire className="text-3xl text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
              <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 text-center">
                <FaStar className="text-3xl text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-sm text-gray-400">Top Rated</div>
              </div>
              <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 text-center">
                <FaRocket className="text-3xl text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-gray-400">Milestones</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <FaTrophy className="text-xl text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Perfect Score</h4>
                      <p className="text-gray-400 text-sm">
                        Achieved 100% client satisfaction
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Earned 2 days ago</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FaCode className="text-xl text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Code Master</h4>
                      <p className="text-gray-400 text-sm">
                        Written 100K+ lines of code
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Earned 1 week ago</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <FaShieldAlt className="text-xl text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        Security Expert
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Completed security audit certification
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Earned 2 weeks ago
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FaFire className="text-xl text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Streak Legend</h4>
                      <p className="text-gray-400 text-sm">
                        150+ day active streak
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Earned 3 weeks ago
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <FaRocket className="text-xl text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Fast Delivery</h4>
                      <p className="text-gray-400 text-sm">
                        Delivered 5 projects ahead of schedule
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Earned 1 month ago
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="text-xl text-teal-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Certified Pro</h4>
                      <p className="text-gray-400 text-sm">
                        Earned AWS Solutions Architect certification
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Earned 1 month ago
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Towards Next Achievement */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Progress Towards Next Achievement
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <FaTrophy className="text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          Elite Performer
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Complete 50 projects with 5-star rating
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-semibold">42/50</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      style={{ width: "84%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>84% Complete</span>
                    <span>8 more to go</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FaCode className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          Code Architect
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Contribute to 10 open source projects
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-semibold">6/10</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>60% Complete</span>
                    <span>4 more to go</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FaWallet className="text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          Six Figure Freelancer
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Earn $100K+ in annual revenue
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-semibold">$87K/$100K</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: "87%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>87% Complete</span>
                    <span>$13K more to go</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
