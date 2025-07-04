"use client";

import React, { useState, useMemo } from "react";
import {
  FaTrophy,
  FaFire,
  FaStar,
  FaRocket,
  FaCode,
  FaShieldAlt,
  FaGraduationCap,
  FaMedal,
  FaLightbulb,
  FaHandshake,
  FaUsers,
  FaBug,
  FaGitAlt,
  FaChartLine,
  FaProjectDiagram,
  FaClock,
  FaBookOpen,
  FaBullseye,
  FaWallet,
  FaCalendarAlt,
  FaEye,
  FaHeart,
  FaThumbsUp,
  FaCoffee,
  FaLaptopCode,
  FaTools,
  FaServer,
  FaDatabase,
  FaCloud,
  FaLock,
  FaCheck,
  FaGem,
  FaCrown,
  FaAward,
} from "react-icons/fa";
import { IoIosFlash } from "react-icons/io";

// Updated TypeScript interfaces
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: "technical" | "project" | "collaboration" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  achievements: Achievement[];
}

interface DevAchievementsProps {
  achievements: Achievement[];
}

const DevAchievements: React.FC<DevAchievementsProps> = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");

  const displayAchievements = achievements;

  // Calculate stats from achievements
  const stats = useMemo(() => {
    const totalAchievements = displayAchievements.length;
    const rarityBreakdown = displayAchievements.reduce((acc, achievement) => {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = displayAchievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAchievements,
      rarityBreakdown,
      categoryBreakdown,
    };
  }, [displayAchievements]);

  // Achievement categories
  const categories: AchievementCategory[] = [
    {
      id: "all",
      name: "All",
      icon: "trophy",
      color: "text-yellow-400",
      achievements: displayAchievements,
    },
    {
      id: "technical",
      name: "Technical",
      icon: "code",
      color: "text-blue-400",
      achievements: displayAchievements.filter(
        (a) => a.category === "technical"
      ),
    },
    {
      id: "project",
      name: "Project",
      icon: "project",
      color: "text-green-400",
      achievements: displayAchievements.filter((a) => a.category === "project"),
    },
    {
      id: "collaboration",
      name: "Collaboration",
      icon: "users",
      color: "text-purple-400",
      achievements: displayAchievements.filter(
        (a) => a.category === "collaboration"
      ),
    },
    {
      id: "milestone",
      name: "Milestone",
      icon: "target",
      color: "text-orange-400",
      achievements: displayAchievements.filter(
        (a) => a.category === "milestone"
      ),
    },
  ];

  // Filter achievements based on selected category and rarity
  const filteredAchievements = useMemo(() => {
    let filtered = displayAchievements;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (selectedRarity !== "all") {
      filtered = filtered.filter((a) => a.rarity === selectedRarity);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime()
    );
  }, [displayAchievements, selectedCategory, selectedRarity]);

  const getAchievementIcon = (icon: string, rarity: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      trophy: FaTrophy,
      code: FaCode,
      shield: FaShieldAlt,
      fire: FaFire,
      rocket: FaRocket,
      star: FaStar,
      graduation: FaGraduationCap,
      medal: FaMedal,
      lightbulb: FaLightbulb,
      handshake: FaHandshake,
      users: FaUsers,
      bug: FaBug,
      git: FaGitAlt,
      "chart-line": FaChartLine,
      project: FaProjectDiagram,
      clock: FaClock,
      target: FaBullseye,
      book: FaBookOpen,
      bullseye: FaBullseye,
      wallet: FaWallet,
      calendar: FaCalendarAlt,
      eye: FaEye,
      heart: FaHeart,
      thumbs: FaThumbsUp,
      coffee: FaCoffee,
      laptop: FaLaptopCode,
      tools: FaTools,
      server: FaServer,
      database: FaDatabase,
      cloud: FaCloud,
      lock: FaLock,
      gem: FaGem,
      crown: FaCrown,
      flash: IoIosFlash,
      award: FaAward,
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

  const getRarityGradient = (rarity: string) => {
    const gradients = {
      common: "from-gray-500/20 to-gray-600/20",
      rare: "from-blue-500/20 to-cyan-500/20",
      epic: "from-purple-500/20 to-pink-500/20",
      legendary: "from-yellow-500/20 to-orange-500/20",
    };
    return gradients[rarity as keyof typeof gradients] || gradients.common;
  };

  const getRarityBorder = (rarity: string) => {
    const borders = {
      common: "border-gray-400/20",
      rare: "border-blue-400/20",
      epic: "border-purple-400/20",
      legendary: "border-yellow-400/20",
    };
    return borders[rarity as keyof typeof borders] || borders.common;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
    gradient: string;
  }> = ({ title, value, subtitle, icon: Icon, color, gradient }) => (
    <div
      className={`backdrop-blur-md bg-gradient-to-br ${gradient} border ${color} rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200`}
    >
      <Icon
        className={`text-3xl mx-auto mb-2 ${color
          .replace("border-", "text-")
          .replace("/30", "")}`}
      />
      <div className="text-2xl font-semibold text-white monty">{value}</div>
      <div className="text-sm text-gray-400 monty uppercase">{subtitle}</div>
    </div>
  );

  return (
    <div className="space-y-8 my-18">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Achievements</h2>
          <p className="text-gray-400 mt-1">
            Your earned badges and milestones
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-white">
            {stats.totalAchievements}
          </div>
          <div className="text-sm text-gray-400">Total Earned</div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Badges"
          value={stats.totalAchievements}
          subtitle="Achievements Earned"
          icon={FaTrophy}
          color="border-yellow-400/30"
          gradient="from-yellow-500/20 to-orange-500/20"
        />
        <StatCard
          title="Legendary"
          value={stats.rarityBreakdown.legendary || 0}
          subtitle="Legendary Badges"
          icon={FaCrown}
          color="border-orange-400/30"
          gradient="from-orange-500/20 to-red-500/20"
        />
        <StatCard
          title="Epic"
          value={stats.rarityBreakdown.epic || 0}
          subtitle="Epic Badges"
          icon={FaGem}
          color="border-purple-400/30"
          gradient="from-purple-500/20 to-pink-500/20"
        />
        <StatCard
          title="Recent"
          value={filteredAchievements.slice(0, 5).length}
          subtitle="Latest Achievements"
          icon={FaFire}
          color="border-blue-400/30"
          gradient="from-blue-500/20 to-cyan-500/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-22 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-white font-medium monty uppercase">
            Category:
          </span>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              {category.name} ({category.achievements.length})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-white font-medium monty uppercase">
            Rarity:
          </span>
          {["all", "common", "rare", "epic", "legendary"].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedRarity === rarity
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-6 bg-gradient-to-br ${getRarityGradient(
              achievement.rarity
            )} border ${getRarityBorder(
              achievement.rarity
            )} rounded-xl hover:scale-105 transition-all duration-200`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
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
            </div>

            {/* Achievement Icon */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white/10">
                {getAchievementIcon(achievement.icon, achievement.rarity)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {achievement.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 capitalize">
                {achievement.category}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <FaCheck className="inline mr-1 text-green-400" />
                Earned {new Date(achievement.earnedDate).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="text-white text-sm font-medium">
                  {achievement.rarity === "legendary"
                    ? "1000"
                    : achievement.rarity === "epic"
                    ? "500"
                    : achievement.rarity === "rare"
                    ? "250"
                    : "100"}
                </span>
              </div>
            </div>

            {/* Unlock Celebration Effect */}
            {achievement.rarity === "legendary" && (
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-20 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No achievements found
          </h3>
          <p className="text-gray-400">
            Try adjusting your filters to see more achievements.
          </p>
        </div>
      )}

      {/* Rarity Breakdown */}
      <div className="backdrop-blur-md my-10 bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Achievement Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-500/10 rounded-lg">
            <div className="text-2xl font-semibold text-gray-400 mb-1">
              {stats.rarityBreakdown.common || 0}
            </div>
            <div className="text-sm text-gray-400 monty uppercase">Common</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-semibold text-blue-400 mb-1">
              {stats.rarityBreakdown.rare || 0}
            </div>
            <div className="text-sm text-blue-400 monty uppercase">Rare</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <div className="text-2xl font-semibold text-purple-400 mb-1">
              {stats.rarityBreakdown.epic || 0}
            </div>
            <div className="text-sm text-purple-400 monty uppercase">Epic</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-semibold text-yellow-400 mb-1">
              {stats.rarityBreakdown.legendary || 0}
            </div>
            <div className="text-sm text-yellow-400 monty uppercase">
              Legendary
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="backdrop-blur-md my-10 bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Category Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
            <div
              key={category}
              className="text-center p-4 bg-white/5 rounded-lg"
            >
              <div className="text-2xl font-semibold text-white mb-1">
                {count}
              </div>
              <div className="text-sm text-gray-400 monty uppercase">
                {category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevAchievements;
