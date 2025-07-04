"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ProjectAssignment } from "@/types/project";
import {
  FaUser,
  FaProjectDiagram,
  FaCode,
  FaStar,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaRocket,
  FaBell,
  FaWallet,
} from "react-icons/fa";
import DevAnalytics from "./DevAnalytics";
import DevAchievements from "./DevAchievements";
import DevSkills from "./devSkills";
import DevProjects from "./DevProjects";
import EnhancedDeveloperOverview from "./DevOverview";

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
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await fetch("/api/developer-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Failed to load profile: ${error}`);
        }
        const profileData = await res.json();
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        // You might want to show an error message to the user here
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
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaTrophy className="text-2xl text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.completedProjects}
              </div>
              <div className="text-xs text-gray-400 monty uppercase">
                Completed
              </div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaStar className="text-2xl text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.averageRating}
              </div>
              <div className="text-xs text-gray-400 monty uppercase">
                Rating
              </div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaWallet className="text-2xl text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                ${(profile.stats.totalEarnings / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400 monty uppercase">
                Earned
              </div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaCode className="text-2xl text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {(profile.stats.totalCodeLines / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400 monty uppercase">Lines</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaFire className="text-2xl text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.activeDays}
              </div>
              <div className="text-xs text-gray-400 monty uppercase">
                Active Days
              </div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <FaRocket className="text-2xl text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {profile.stats.clientRetention}%
              </div>
              <div className="text-xs text-gray-400 monty uppercase">
                Retention
              </div>
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
          <EnhancedDeveloperOverview profile={profile} />
        )}

        {activeTab === "skills" && <DevSkills profile={profile} />}

        {activeTab === "projects" && (
          <DevProjects projects={profile.projects} />
        )}

        {activeTab === "analytics" && <DevAnalytics profile={profile} />}

        {activeTab === "achievements" && (
          <DevAchievements achievements={profile.achievements} />
        )}
      </div>
    </div>
  );
}
