"use client";

import { Skill } from "@/lib/types";
import React, { useState } from "react";
import {
  FaCode,
  FaAtom,
  FaDatabase,
  FaCloud,
  FaRocket,
  FaCertificate,
  FaGraduationCap,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaTools,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaStar,
  FaFire,
  FaBookOpen,
  FaLaptopCode,
  FaServer,
  FaMobile,
  FaGlobe,
  FaShieldAlt,
  FaEye,
  FaHeart,
  FaCalendarAlt,
  FaUsers,
  FaTrophy,
  FaLightbulb,
  FaBullseye,
} from "react-icons/fa";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DeveloperProfile } from "./page"; // or wherever DeveloperProfile is defined

interface DevSkillsProps {
  profile: DeveloperProfile;
}

const SkillsDashboard = ({ profile }: DevSkillsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [skillView, setSkillView] = useState("grid"); // grid, radar, chart

  // Mock data based on your interfaces

  const getSkillLevelColor = (level: any) => {
    if (level >= 90) return "from-emerald-400 to-green-500";
    if (level >= 80) return "from-blue-400 to-cyan-500";
    if (level >= 70) return "from-yellow-400 to-orange-500";
    if (level >= 60) return "from-purple-400 to-pink-500";
    return "from-gray-400 to-gray-500";
  };

  const getSkillLevelLabel = (level: any) => {
    if (level >= 90) return "Expert";
    if (level >= 80) return "Advanced";
    if (level >= 70) return "Intermediate";
    if (level >= 60) return "Beginner";
    return "Novice";
  };

  const getCategoryIcon = (category: any) => {
    const iconMap = {
      "Programming Language": FaCode,
      "Frontend Framework": FaLaptopCode,
      "Backend Framework": FaServer,
      "SQL Database": FaDatabase,
      "NoSQL Database": FaDatabase,
      "Cache Database": FaDatabase,
      "Search Engine": FaSearch,
      "Version Control": FaTools,
      Containerization: FaShieldAlt,
      Orchestration: FaGlobe,
      "CI/CD": FaRocket,
      "Build Tool": FaTools,
      IDE: FaLaptopCode,
    };
    return iconMap[category as keyof typeof iconMap] || FaCode;
  };

  const allSkills = [
    ...profile.technicalSkills.primarySkills,
    ...profile.technicalSkills.frameworks,
    ...profile.technicalSkills.databases,
    ...profile.technicalSkills.tools,
  ];

  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...new Set(allSkills.map((skill) => skill.category)),
  ];

  const skillsRadarData = [
    { skill: "Frontend", level: 89 },
    { skill: "Backend", level: 85 },
    { skill: "Database", level: 82 },
    { skill: "DevOps", level: 79 },
    { skill: "Cloud", level: 76 },
    { skill: "Mobile", level: 68 },
  ];

  const skillDistributionData = [
    {
      name: "Expert (90+)",
      value: allSkills.filter((s) => s.level >= 90).length,
      color: "#10B981",
    },
    {
      name: "Advanced (80-89)",
      value: allSkills.filter((s) => s.level >= 80 && s.level < 90).length,
      color: "#3B82F6",
    },
    {
      name: "Intermediate (70-79)",
      value: allSkills.filter((s) => s.level >= 70 && s.level < 80).length,
      color: "#F59E0B",
    },
    {
      name: "Beginner (60-69)",
      value: allSkills.filter((s) => s.level >= 60 && s.level < 70).length,
      color: "#8B5CF6",
    },
    {
      name: "Novice (<60)",
      value: allSkills.filter((s) => s.level < 60).length,
      color: "#6B7280",
    },
  ];

  const trendingSkills = allSkills
    .filter((skill) => skill.trending === "up")
    .slice(0, 6);

  const SkillCard = ({ skill }: { skill: Skill }) => {
    const IconComponent = getCategoryIcon(skill.category);

    return (
      <div
        className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <IconComponent className="text-blue-400" />
            </div>
            <div>
              <span className="text-white font-medium">{skill.name}</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {getSkillLevelLabel(skill.level)}
                </span>
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
          </div>
          <div className="text-right">
            <div className="text-white font-semibold text-lg">
              {skill.level}%
            </div>
            <div className="text-gray-400 text-xs">
              {skill.endorsements} endorsements
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full bg-gradient-to-r ${getSkillLevelColor(
              skill.level
            )} transition-all duration-1000`}
            style={{ width: `${skill.level}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{skill.category}</span>
          <span>Last used: {skill.lastUsed}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 my-18">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Technical Skills
          </h2>
          <p className="text-gray-400">
            Manage and showcase your technical expertise
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-gray-800">
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {["grid", "radar", "chart"].map((view) => (
              <button
                key={view}
                onClick={() => setSkillView(view)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  skillView === view
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {view === "grid" && <FaFilter />}
                {view === "radar" && <FaBullseye />}
                {view === "chart" && <FaChartLine />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FaCode className="text-2xl text-blue-400" />
            <span className="text-2xl font-semibold text-white">
              {allSkills.length}
            </span>
          </div>
          <div className="text-gray-400 text-sm monty uppercase">
            Total Skills
          </div>
        </div>

        <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FaTrophy className="text-2xl text-green-400" />
            <span className="text-2xl font-semibold text-white">
              {allSkills.filter((s) => s.level >= 90).length}
            </span>
          </div>
          <div className="text-gray-400 text-sm monty uppercase">
            Expert Level
          </div>
        </div>

        <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FaFire className="text-2xl text-purple-400" />
            <span className="text-2xl font-semibold text-white">
              {trendingSkills.length}
            </span>
          </div>
          <div className="text-gray-400 text-sm monty uppercase">
            Trending Up
          </div>
        </div>

        <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FaHeart className="text-2xl text-orange-400" />
            <span className="text-2xl font-semibold text-white">
              {allSkills.reduce((sum, s) => sum + s.endorsements, 0)}
            </span>
          </div>
          <div className="text-gray-400 text-sm monty uppercase">
            Total Endorsements
          </div>
        </div>
      </div>

      {/* Skills Visualization */}
      {skillView === "radar" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Skills Radar
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsRadarData}>
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

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Skill Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${percent?.toFixed(0) || 0}%`
                  }
                >
                  {skillDistributionData.map((entry, index) => (
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
        </div>
      )}

      {skillView === "chart" && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Skills Proficiency Chart
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredSkills.slice(0, 10)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#9CA3AF"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="level" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trending Skills */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FaFire className="mr-2 text-orange-400" />
          Trending Skills
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingSkills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {skillView === "grid" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Primary Skills */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaCode className="mr-3 text-blue-400" />
              Primary Skills
            </h3>
            <div className="space-y-4">
              {profile.technicalSkills.primarySkills.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          </div>

          {/* Frameworks */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaAtom className="mr-3 text-purple-400" />
              Frameworks & Libraries
            </h3>
            <div className="space-y-4">
              {profile.technicalSkills.frameworks.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Skills Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Databases */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaDatabase className="mr-2 text-green-400" />
            Databases
          </h3>
          <div className="space-y-3">
            {profile.technicalSkills.databases.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FaDatabase className="text-green-400 text-sm" />
                  </div>
                  <span className="text-gray-300">{skill.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getSkillLevelColor(
                        skill.level
                      )}`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{skill.level}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaTools className="mr-2 text-orange-400" />
            Tools & Technologies
          </h3>
          <div className="space-y-3">
            {profile.technicalSkills.tools.slice(0, 5).map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FaTools className="text-orange-400 text-sm" />
                  </div>
                  <span className="text-gray-300">{skill.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getSkillLevelColor(
                        skill.level
                      )}`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{skill.level}%</span>
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
            {profile.technicalSkills.cloudPlatforms.map((platform) => (
              <span
                key={platform}
                className="px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FaRocket className="mr-2 text-purple-400" />
          Specializations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.technicalSkills.specializations.map((spec) => (
            <div
              key={spec}
              className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FaLightbulb className="text-purple-400 text-xl" />
                <span className="text-white font-medium">{spec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FaCertificate className="mr-3 text-yellow-400" />
          Certifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.professionalInfo.certifications.map((cert, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg hover:bg-gradient-to-br hover:from-yellow-500/20 hover:to-orange-500/20 transition-all"
            >
              <div className="flex items-center space-x-3">
                <FaGraduationCap className="text-2xl text-yellow-400" />
                <div>
                  <h4 className="text-white font-medium">{cert}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-green-400 text-sm">✓ Verified</span>
                    <FaStar className="text-yellow-400 text-xs" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsDashboard;
