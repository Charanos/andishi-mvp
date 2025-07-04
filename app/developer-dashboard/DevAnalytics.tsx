"use client";

import React, { useState, useMemo } from "react";
import {
  FaChartLine,
  FaProjectDiagram,
  FaTasks,
  FaCode,
  FaTrophy,
  FaClock,
  FaUsers,
  FaBug,
  FaGitAlt,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaCalendarAlt,
  FaRocket,
  FaShieldAlt,
  FaLightbulb,
  FaHandshake,
  FaGraduationCap,
  FaMedal,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// TypeScript interfaces
interface Skill {
  name: string;
  level: number;
  category: string;
  endorsements?: number;
  lastUsed?: string;
  trending?: "up" | "down" | "stable";
}

interface ProjectAssignment {
  id: string;
  title: string;
  status:
    | "assigned"
    | "in-progress"
    | "completed"
    | "on-hold"
    | "review"
    | "cancelled";
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  satisfaction?: number;
  completedAt?: string;
  startedAt?: string;
  metrics?: {
    linesOfCode?: number;
    commits?: number;
    testsWritten?: number;
    bugsFixed?: number;
    codeReviews?: number;
  };
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: "technical" | "project" | "collaboration" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface TimeEntry {
  id?: string; // Optional since it's only in one file
  date: string;
  hours: number;
  project?: string; // From page.tsx
  description?: string; // From page.tsx
  commits?: number; // From DevAnalytics.tsx
  productivity?: number; // From DevAnalytics.tsx
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

interface DeveloperProfile {
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

interface DevAnalyticsProps {
  profile: DeveloperProfile | null;
}

const DevAnalytics: React.FC<DevAnalyticsProps> = ({ profile }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6m");

  // Memoized computed data
  const chartData = useMemo(() => {
    if (!profile) return null;

    // Revenue data based on projects completion dates
    // const revenueData = profile.projects
    //   .filter((p) => p.status === "completed" && p.completedAt)
    //   .reduce((acc, project) => {
    //     const date = new Date(project.completedAt!);
    //     const monthKey = date.toLocaleString("default", { month: "short" });
    //     const existingMonth = acc.find((item) => item.month === monthKey);

    //     if (existingMonth) {
    //       existingMonth.projects += 1;
    //       existingMonth.revenue += profile.professionalInfo.hourlyRate * 40; // Estimate
    //     } else {
    //       acc.push({
    //         month: monthKey,
    //         projects: 1,
    //         revenue: profile.professionalInfo.hourlyRate * 40,
    //       });
    //     }
    //     return acc;
    //   }, [] as { month: string; projects: number; revenue: number }[]);

    // Skills radar data
    const skillsRadarData = profile.technicalSkills.primarySkills
      .slice(0, 6)
      .map((skill) => ({
        skill: skill.name,
        level: skill.level,
      }));

    // Project status distribution
    const projectStatusData = [
      {
        name: "Completed",
        value: profile.projects.filter((p) => p.status === "completed").length,
        color: "#22c55e",
      },
      {
        name: "In Progress",
        value: profile.projects.filter((p) => p.status === "in-progress")
          .length,
        color: "#3b82f6",
      },
      {
        name: "On Hold",
        value: profile.projects.filter((p) => p.status === "on-hold").length,
        color: "#f59e0b",
      },
      {
        name: "Review",
        value: profile.projects.filter((p) => p.status === "review").length,
        color: "#8b5cf6",
      },
    ];

    // Productivity data from time entries
    const productivityData = profile.timeEntries.slice(-7).map((entry) => {
      const date = new Date(entry.date);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        commits: entry.commits || 0,
        hours: entry.hours,
        productivity: entry.productivity || Math.floor(Math.random() * 40 + 60),
      };
    });

    return {
      //   revenueData,
      skillsRadarData,
      projectStatusData,
      productivityData,
    };
  }, [profile]);

  const getAchievementIcon = (icon: string, rarity: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      code: FaCode,
      bug: FaBug,
      users: FaUsers,
      rocket: FaRocket,
      trophy: FaTrophy,
      star: FaStar,
      shield: FaShieldAlt,
      lightbulb: FaLightbulb,
      handshake: FaHandshake,
      graduation: FaGraduationCap,
      medal: FaMedal,
    };

    const IconComponent = iconMap[icon] || FaTrophy;
    const rarityColors = {
      common: "text-gray-400",
      rare: "text-blue-400",
      epic: "text-purple-400",
      legendary: "text-yellow-400",
    };

    return (
      <IconComponent
        className={`text-xl ${
          rarityColors[rarity as keyof typeof rarityColors]
        }`}
      />
    );
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    trend?: number;
    color: string;
    gradient: string;
  }> = ({ title, value, subtitle, icon: Icon, trend, color, gradient }) => (
    <div
      className={`backdrop-blur-md bg-gradient-to-br ${gradient} border ${color} rounded-xl p-6 hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${color
            .replace("border-", "bg-")
            .replace(
              "/30",
              "/30"
            )} rounded-xl flex items-center justify-center`}
        >
          <Icon
            className={`text-2xl ${color
              .replace("border-", "text-")
              .replace("/30", "")}`}
          />
        </div>
        {trend && (
          <div className="text-right">
            <div className="text-green-400 text-sm font-medium flex items-center">
              {trend > 0 ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              {Math.abs(trend)}%
            </div>
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-white mb-1 monty">
        {value}
      </div>
      <div className="text-gray-400 text-sm monty uppercase">{subtitle}</div>
    </div>
  );

  // Loading state
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-18">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">
          Analytics Dashboard
        </h2>
        <div className="flex space-x-2">
          {["1m", "3m", "6m", "1y", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              {range === "all" ? "All Time" : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`$${profile.stats.totalEarnings.toLocaleString()}`}
          subtitle="Total Earnings"
          icon={FaChartLine}
          trend={12}
          color="border-blue-400/30"
          gradient="from-blue-500/20 to-cyan-500/20"
        />
        <StatCard
          title="Projects"
          value={profile.stats.totalProjects}
          subtitle="Total Projects"
          icon={FaProjectDiagram}
          trend={8}
          color="border-green-400/30"
          gradient="from-green-500/20 to-emerald-500/20"
        />
        <StatCard
          title="Rating"
          value={`${profile.stats.averageRating}/5.0`}
          subtitle="Average Rating"
          icon={FaStar}
          trend={5}
          color="border-yellow-400/30"
          gradient="from-yellow-500/20 to-orange-500/20"
        />
        <StatCard
          title="Code Lines"
          value={`${(profile.stats.totalCodeLines / 1000).toFixed(0)}k`}
          subtitle="Lines of Code"
          icon={FaCode}
          trend={15}
          color="border-purple-400/30"
          gradient="from-purple-500/20 to-pink-500/20"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Days"
          value={profile.stats.activeDays}
          subtitle="This Year"
          icon={FaCalendarAlt}
          trend={12}
          color="border-indigo-400/30"
          gradient="from-indigo-500/20 to-blue-500/20"
        />
        <StatCard
          title="Client Retention"
          value={`${profile.stats.clientRetention}%`}
          subtitle="Return Rate"
          icon={FaHandshake}
          trend={12}
          color="border-teal-400/30"
          gradient="from-teal-500/20 to-cyan-500/20"
        />
        <StatCard
          title="Commits"
          value={profile.stats.totalCommits}
          subtitle="Total Commits"
          icon={FaGitAlt}
          trend={12}
          color="border-orange-400/30"
          gradient="from-orange-500/20 to-red-500/20"
        />
        <StatCard
          title="Response Time"
          value={profile.stats.responseTime}
          subtitle="Average Response"
          icon={FaClock}
          trend={12}
          color="border-pink-400/30"
          gradient="from-pink-500/20 to-rose-500/20"
        />
      </div>

      {/* Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          {chartData.productivityData.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Revenue & Projects Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Skills Radar Chart */}
          {chartData.skillsRadarData.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Skills Assessment
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData.skillsRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "#9CA3AF" }} />
                  <PolarRadiusAxis
                    angle={0}
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF" }}
                    tickCount={6}
                  />
                  <Radar
                    name="Skills"
                    dataKey="level"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Project Status Pie Chart */}
          {chartData.projectStatusData.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Project Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.projectStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                    }
                  >
                    {chartData.projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly Productivity */}
          {chartData.productivityData.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Weekly Productivity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="productivity"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Skills Progress */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Technical Skills Progress
        </h3>
        <div className="space-y-4">
          {profile.technicalSkills.primarySkills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {skill.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{skill.name}</div>
                  <div className="text-gray-400 text-sm">
                    {skill.endorsements || 0} endorsements
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-medium">{skill.level}%</div>
                  <div className="text-gray-400 text-sm flex items-center">
                    {skill.trending === "up" ? (
                      <FaArrowUp className="text-green-400 mr-1" />
                    ) : skill.trending === "down" ? (
                      <FaArrowDown className="text-red-400 mr-1" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                    )}
                    {skill.category}
                  </div>
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      {profile.achievements.length > 0 && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  {getAchievementIcon(achievement.icon, achievement.rarity)}
                  <div className="text-sm text-gray-400">
                    {new Date(achievement.earnedDate).toLocaleDateString()}
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">
                  {achievement.title}
                </h4>
                <p className="text-gray-400 text-sm mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      achievement.rarity === "legendary"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : achievement.rarity === "epic"
                        ? "bg-purple-500/20 text-purple-400"
                        : achievement.rarity === "rare"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {achievement.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent transform -rotate-90"
                style={{
                  background: `conic-gradient(#3B82F6 0deg, #3B82F6 ${
                    (profile.stats.averageRating / 5) * 360
                  }deg, transparent ${
                    (profile.stats.averageRating / 5) * 360
                  }deg)`,
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60%, black 60%)",
                  mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profile.stats.averageRating}
                </span>
              </div>
            </div>
            <h4 className="text-white font-medium">Client Satisfaction</h4>
            <p className="text-gray-400 text-sm">Average Rating</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent transform -rotate-90"
                style={{
                  background: `conic-gradient(#10B981 0deg, #10B981 ${
                    (profile.stats.completedProjects /
                      profile.stats.totalProjects) *
                    360
                  }deg, transparent ${
                    (profile.stats.completedProjects /
                      profile.stats.totalProjects) *
                    360
                  }deg)`,
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60%, black 60%)",
                  mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {Math.round(
                    (profile.stats.completedProjects /
                      profile.stats.totalProjects) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
            <h4 className="text-white font-medium">Project Completion</h4>
            <p className="text-gray-400 text-sm">
              {profile.stats.completedProjects}/{profile.stats.totalProjects}{" "}
              projects
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent transform -rotate-90"
                style={{
                  background: `conic-gradient(#8B5CF6 0deg, #8B5CF6 ${
                    profile.stats.clientRetention * 3.6
                  }deg, transparent ${profile.stats.clientRetention * 3.6}deg)`,
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60%, black 60%)",
                  mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profile.stats.clientRetention}%
                </span>
              </div>
            </div>
            <h4 className="text-white font-medium">Client Retention</h4>
            <p className="text-gray-400 text-sm">Return customers</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <div className="w-full h-full rounded-full border-4 border-gray-700"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent transform -rotate-90"
                style={{
                  background: `conic-gradient(#F59E0B 0deg, #F59E0B ${
                    (profile.stats.activeDays / 365) * 360
                  }deg, transparent ${
                    (profile.stats.activeDays / 365) * 360
                  }deg)`,
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60%, black 60%)",
                  mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {Math.round((profile.stats.activeDays / 365) * 100)}%
                </span>
              </div>
            </div>
            <h4 className="text-white font-medium">Activity Rate</h4>
            <p className="text-gray-400 text-sm">
              {profile.stats.activeDays} days active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevAnalytics;
