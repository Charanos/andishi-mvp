import React from "react";
import { FaBullseye, FaHandshake } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";

const EnhancedStatsCards = () => {
  const stats = [
    {
      value: "50+",
      label: "Success Stories",
      color: "from-blue-400 to-cyan-400",
      icon: <FaBullseye />,
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      shadowColor: "shadow-blue-500/25",
      glowColor: "group-hover:shadow-blue-500/40",
    },
    {
      value: "4.9/5",
      label: "Client Satisfaction",
      color: "from-purple-400 to-pink-400",
      icon: <IoIosStar />,
      bgGradient: "from-purple-500/20 to-pink-500/20",
      shadowColor: "shadow-purple-500/25",
      glowColor: "group-hover:shadow-purple-500/40",
    },
    {
      value: "98%",
      label: "Long-term Partnerships",
      color: "from-green-400 to-emerald-400",
      icon: <FaHandshake />,
      bgGradient: "from-green-500/20 to-emerald-500/20",
      shadowColor: "shadow-green-500/25",
      glowColor: "group-hover:shadow-emerald-500/40",
    },
  ];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map((stat, index) => {
          return (
            <div
              key={index}
              className="group cursor-pointer transform hover:scale-110 transition-all duration-500 ease-out hover:-translate-y-2 mx-auto"
              style={{
                animationDelay: `${index * 200}ms`,
                willChange: "transform",
              }}
            >
              {/* Outer glow ring */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 scale-110 pointer-events-none`}
              ></div>

              {/* Main card container */}
              <div className="relative">
                {/* Rotating border */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${stat.color} p-[2px] group-hover:animate-pulse`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900/80"></div>
                </div>

                {/* Card content */}
                <div
                  className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border border-white/20 rounded-full w-46 h-46 md:w-54 md:h-54 flex items-center justify-center flex-col shadow-2xl ${stat.shadowColor} ${stat.glowColor} transition-all duration-500 group-hover:border-white/30`}
                >
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-1 h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                        style={{
                          left: `${20 + i * 12}%`,
                          top: `${15 + i * 10}%`,
                          animationDelay: `${i * 150}ms`,
                          animation: "floatParticles 3s ease-in-out infinite",
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Icon with pulsing effect */}
                  <div className="text-4xl md:text-5xl mb-4 md:mb-6 transform group-hover:scale-125 transition-transform duration-300 text-white/40 relative z-10">
                    {stat.icon}
                  </div>

                  {/* Value with counter animation */}
                  <div
                    className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-gray-300 font-medium tracking-widest uppercase text-xs group-hover:text-white transition-colors duration-300 px-4 relative z-10">
                    {stat.label}
                  </div>

                  {/* Inner highlight */}
                  <div
                    className={`absolute top-6 md:top-8 left-6 md:left-8 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-sm pointer-events-none`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes floatParticles {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px) rotate(180deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedStatsCards;
