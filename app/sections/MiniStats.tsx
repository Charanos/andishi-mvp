"use client";

import * as React from "react";
import {
  FaShieldAlt,
  FaClock,
  FaHandshake,
  FaGlobe,
  FaAward,
  FaLock,
} from "react-icons/fa";

interface TrustBadge {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  gradient: string;
  iconColor: string;
}

export default function TrustBadgesSection(): React.JSX.Element {
  const trustBadges: TrustBadge[] = [
    {
      icon: FaShieldAlt,
      title: "100% Secure",
      subtitle: "Data Protection",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-400",
    },
    {
      icon: FaClock,
      title: "24/7 Support",
      subtitle: "Always Available",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: FaHandshake,
      title: "Trusted Partner",
      subtitle: "Reliable Service",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-400",
    },
    {
      icon: FaGlobe,
      title: "Global Reach",
      subtitle: "Worldwide Service",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-400",
    },
    {
      icon: FaAward,
      title: "Premium Quality",
      subtitle: "Excellence Guaranteed",
      gradient: "from-yellow-500/10 to-amber-500/10",
      iconColor: "text-yellow-400",
    },
    {
      icon: FaLock,
      title: "Confidential",
      subtitle: "NDA Protected",
      gradient: "from-red-500/10 to-pink-500/10",
      iconColor: "text-red-400",
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background gradient overlay */}

      {/* Subtle background elements */}
      {/* <div className="absolute top-8 left-16 w-16 h-16 bg-blue-500/3 rounded-full blur-xl"></div>
      <div className="absolute bottom-8 right-16 w-20 h-20 bg-purple-500/3 rounded-full blur-xl"></div> */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {trustBadges.map((badge: TrustBadge, index: number) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 p-4 text-center"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.02) 0%, 
                  rgba(255, 255, 255, 0.01) 100%)`,
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.03)
                `,
              }}
            >
              {/* Colored gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-3 flex justify-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all duration-300">
                    <badge.icon
                      className={`text-lg ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">
                  {badge.title}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {badge.subtitle}
                </p>
              </div>

              {/* Small accent dot */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Minimal background decoration */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/2 to-purple-500/2 rounded-full blur-3xl"></div>
    </section>
  );
}
