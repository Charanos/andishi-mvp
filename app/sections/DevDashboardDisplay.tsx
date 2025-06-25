import Link from "next/link";
import React, { JSX } from "react";
import {
  FaCode,
  FaTasks,
  FaClock,
  FaDollarSign,
  FaGithub,
  FaRocket,
} from "react-icons/fa";

interface DashboardFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

export default function DevDashboardSection(): JSX.Element {
  const devFeatures: DashboardFeature[] = [
    {
      icon: FaTasks,
      title: "Project Management",
      description: "Organize tasks, deadlines, and deliverables efficiently",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400",
    },
    {
      icon: FaClock,
      title: "Time Tracking",
      description: "Accurate time logging with automated reporting",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: FaDollarSign,
      title: "Earnings Dashboard",
      description: "Track payments, invoices, and financial metrics",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-slate-900/50">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-orange-900/20 to-purple-900/20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Developer <span className="text-orange-400">Dashboard</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Powerful tools designed for developers to manage projects, track
            progress, and maximize productivity
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6 order-1 lg:order-1">
            {devFeatures.map((feature: DashboardFeature, index: number) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(251, 146, 60, 0.03) 0%, 
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
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                ></div>

                <div className="relative p-6 flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300">
                      <feature.icon
                        className={`text-lg ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/join-talent-pool"
                className="group relative inline-flex items-center gap-3 px-6 py-3 mt-6 rounded-xl bg-purple-500/80 shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              >
                <span className="relative z-10 text-md font-medium text-white tracking-wide monty drop-shadow-sm group-hover:text-orange-100 transition-colors duration-300">
                  Join as Developer
                </span>
                <FaRocket className="text-white/80 text-xl group-hover:animate-bounce transition-transform duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></span>
              </Link>
            </div>
          </div>

          {/* Right Side - Dashboard Screenshot */}
          <div className="relative order-2 lg:order-2">
            <div className="relative group">
              {/* Dashboard mockup container */}
              <div
                className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 p-6 group-hover:border-white/20 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(251, 146, 60, 0.03) 0%, 
                    rgba(147, 51, 234, 0.02) 50%, 
                    rgba(236, 72, 153, 0.03) 100%)`,
                  boxShadow: `
                    0 20px 40px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                {/* Browser header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                  </div>
                  <div className="flex-1 mx-4 h-6 bg-white/5 rounded-md flex items-center px-3">
                    <span className="text-xs text-gray-400">
                      dev.andishi.com
                    </span>
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="space-y-4">
                  {/* Header with profile */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                      <div>
                        <div className="h-3 w-20 bg-white/30 rounded mb-1"></div>
                        <div className="h-2 w-16 bg-orange-400/40 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <FaGithub className="text-gray-400" />
                      <div className="h-4 w-4 bg-green-400/60 rounded-full"></div>
                    </div>
                  </div>

                  {/* Active projects */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-white/5 rounded-lg border border-white/10 p-3">
                      <div className="h-3 w-16 bg-orange-400/40 rounded mb-2"></div>
                      <div className="h-2 w-12 bg-white/20 rounded mb-1"></div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-white/5 rounded-lg border border-white/10 p-3">
                      <div className="h-3 w-14 bg-purple-400/40 rounded mb-2"></div>
                      <div className="h-2 w-10 bg-white/20 rounded mb-1"></div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Time tracking section */}
                  <div className="h-24 bg-white/5 rounded-lg border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaClock className="text-green-400 text-sm" />
                      <div className="h-3 w-20 bg-green-400/40 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-16 bg-white/20 rounded text-center flex items-center justify-center">
                        <span className="text-xs text-green-400 font-mono">
                          42h
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="h-2 w-12 bg-white/10 rounded mb-1"></div>
                        <div className="h-2 w-8 bg-green-400/30 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings section */}
                  <div className="h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-purple-400 text-sm" />
                        <div className="h-3 w-16 bg-purple-400/40 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded text-center flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            $2,840
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 blur-2xl scale-110 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-orange-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 left-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
}
