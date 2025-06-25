import React from "react";
import {
  FaUsers,
  FaChartLine,
  FaComments,
  FaBell,
  FaCalendarAlt,
  FaCreditCard,
} from "react-icons/fa";

interface DashboardFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

export default function ClientDashboardSection(): React.JSX.Element {
  const clientFeatures: DashboardFeature[] = [
    {
      icon: FaChartLine,
      title: "Project Progress",
      description: "Real-time project tracking and milestones",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: FaComments,
      title: "Direct Communication",
      description: "Chat directly with your development team",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: FaBell,
      title: "Smart Notifications",
      description: "Stay updated on every project milestone",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            Client <span className="text-blue-400">Dashboard</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Stay in complete control with our intuitive client portal designed
            for transparency and collaboration
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Dashboard Screenshot */}
          <div className="relative order-2 lg:order-1">
            <div className="relative group">
              {/* Dashboard mockup container */}
              <div
                className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 p-6 group-hover:border-white/20 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.03) 0%, 
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
                      client.andishi.com
                    </span>
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-48 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded"></div>
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-white/5 rounded-lg border border-white/10 p-3"
                      >
                        <div className="h-3 w-12 bg-blue-400/40 rounded mb-2"></div>
                        <div className="h-5 w-8 bg-white/20 rounded"></div>
                      </div>
                    ))}
                  </div>

                  {/* Progress section */}
                  <div className="h-32 bg-white/5 rounded-lg border border-white/10 p-4">
                    <div className="h-4 w-32 bg-green-400/40 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Messages preview */}
                  <div className="h-24 bg-white/5 rounded-lg border border-white/10 p-4">
                    <div className="h-3 w-24 bg-purple-400/40 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/10 rounded"></div>
                      <div className="h-2 w-4/5 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl scale-110 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6 order-1 lg:order-2">
            {clientFeatures.map((feature: DashboardFeature, index: number) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.03) 0%, 
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
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
}
