"use client";

import React, { useState, useEffect } from "react";
import {
  FaReact,
  FaPython,
  FaNodeJs,
  FaDatabase,
  FaMobile,
  FaCloud,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";
import { SiTypescript, SiDocker } from "react-icons/si";

const skills = [
  { icon: FaReact, color: "#61DAFB", name: "React" },
  { icon: FaPython, color: "#3776AB", name: "Python" },
  { icon: FaNodeJs, color: "#339933", name: "Node.js" },
  { icon: SiTypescript, color: "#3178C6", name: "TypeScript" },
  { icon: FaDatabase, color: "#FF6B35", name: "Database" },
  { icon: FaMobile, color: "#A855F7", name: "Mobile" },
  { icon: FaCloud, color: "#0EA5E9", name: "Cloud" },
  { icon: SiDocker, color: "#2496ED", name: "Docker" },
  { icon: FaShieldAlt, color: "#EF4444", name: "Security" },
];

const TalentOrb: React.FC = () => {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 100);

    const pulseInterval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 3);
    }, 2000);

    return () => {
      clearInterval(rotateInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const getSkillPosition = (index: number) => {
    const angle = (index * 360) / skills.length - 90;
    const radius = 100;
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180) * 0.35;
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180) * 0.35;
    return { x, y, angle };
  };

  return (
    <div className="relative lg:w-100 lg:h-100 w-80 h-80 mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-spin-slow blur-sm"></div>

      {/* Main circular container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-900/90 via-blue-900/40 to-purple-900/60 backdrop-blur-md border border-white/20 overflow-hidden">
        {/* Central AI core */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <FaCog
              className="text-white text-2xl"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
          </div>

          {/* AI pulse rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-blue-400/20 animate-pulse"
              style={{
                width: `${120 + i * 20}%`,
                height: `${120 + i * 20}%`,
                left: `${-10 - i * 10}%`,
                top: `${-10 - i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>

        {/* Skill nodes arranged in circle */}
        {skills.map((skill, index) => {
          const { x, y } = getSkillPosition(index);
          const isActive = activeSkill === index;

          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setActiveSkill(index)}
              onMouseLeave={() => setActiveSkill(null)}
            >
              <div
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  backdrop-blur-sm border transition-all duration-300
                  ${
                    isActive
                      ? "scale-125 border-white/40 bg-white/20 shadow-lg"
                      : "border-white/20 bg-white/10 hover:scale-110"
                  }
                `}
                style={{
                  boxShadow: isActive ? `0 0 20px ${skill.color}40` : "none",
                }}
              >
                <skill.icon
                  className="text-lg transition-colors duration-300"
                  style={{ color: isActive ? skill.color : "#94A3B8" }}
                />

                {/* Connection line to center */}
                <div
                  className={`absolute w-px bg-gradient-to-r transition-opacity duration-500 ${
                    isActive ? "opacity-60" : "opacity-20"
                  }`}
                  style={{
                    height: "60px",
                    background: `linear-gradient(to bottom, ${skill.color}80, transparent)`,
                    left: "50%",
                    top: "50%",
                    transformOrigin: "top",
                    transform: `translate(-50%, -50%) rotate(${
                      (Math.atan2(50 - y, 50 - x) * 180) / Math.PI + 90
                    }deg)`,
                  }}
                />

                {/* Skill name tooltip */}
                {isActive && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 animate-fade-in">
                    {skill.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Orbiting particles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${
                rotation + i * 90
              }deg) translateY(-80px)`,
            }}
          />
        ))}

        {/* Data flow animation */}
        <div
          className="absolute inset-4 rounded-full border border-dashed border-white/10 animate-spin-reverse"
          style={{ animationDuration: "20s" }}
        >
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full -top-1 left-1/2 transform -translate-x-1/2 animate-pulse" />
        </div>

        {/* Bottom status */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/60 text-center">
          AI Talent Matching
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 20s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TalentOrb;
