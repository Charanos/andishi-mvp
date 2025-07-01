"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCode,
  FaServer,
  FaCloud,
  FaDatabase,
  FaMobile,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCodeBranch,
  FaRocket,
  FaBuilding,
  FaGlobe,
  FaStar,
} from "react-icons/fa";
import { SiTypescript, SiDocker, SiKubernetes } from "react-icons/si";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

// Tech icon data for the interactive graphic
const techIcons = [
  { icon: FaCode, color: "#61DAFB", name: "React" },
  { icon: SiTypescript, color: "#3178C6", name: "TypeScript" },
  { icon: FaServer, color: "#339933", name: "Node.js" },
  { icon: FaDatabase, color: "#FF6B35", name: "Database" },
  { icon: FaMobile, color: "#A855F7", name: "Mobile" },
  { icon: FaCloud, color: "#0EA5E9", name: "Cloud" },
  { icon: SiDocker, color: "#2496ED", name: "Docker" },
  { icon: SiKubernetes, color: "#326CE5", name: "Kubernetes" },
  { icon: FaShieldAlt, color: "#EF4444", name: "Security" },
];

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginAttemptInfo {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

export default function LoginPage() {
  const {
    login,
    redirectToDashboard,
    user,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    remember: false,
  });

  // Client testimonials data
  const testimonials = [
    {
      name: "Aisha Patel",
      company: "FintechEdge Inc.",
      role: "Chief Technology Officer",
      avatar: "AP",
      rating: 5,
      text: "Andishi's engineers didn't just build our payments platform—they architected it like fintech veterans. Launched 30% faster than projected, ahead of our biggest competitor.",
      icon: FaRocket,
      color: "#10B981",
    },
    {
      name: "James Carter",
      company: "UrbanRetail Co.",
      role: "Founder & CEO",
      avatar: "JC",
      rating: 5,
      text: "Burned through agencies before. Andishi assembled a dream team faster than I could blink—now we're shipping features that actually excite our users again.",
      icon: FaBuilding,
      color: "#3B82F6",
    },
    {
      name: "Carlos Mendoza",
      company: "HealthSync Global",
      role: "Product Manager",
      avatar: "CM",
      rating: 5,
      text: "Patient portal was a digital disaster. Their React Native wizard rebuilt it in 48 hours—turned user exodus into 45% engagement boost. Pure magic. ✨",
      icon: FaGlobe,
      color: "#8B5CF6",
    },
    {
      name: "Grace Njeri",
      company: "Andishi",
      role: "Lead Software Engineer",
      avatar: "GN",
      rating: 5,
      text: "Building the tools that make remote collaboration feel effortless. Watching clients transform from chaos to choreography never gets old. This is what we live for",
      icon: FaCode,
      color: "#F59E0B",
    },
  ];

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptInfo>({
    attempts: 0,
    lastAttempt: 0,
  });

  // Form validation state
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginFormData, boolean>>
  >({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      redirectToDashboard();
    }
  }, [user, authLoading, redirectToDashboard]);

  // Initialize canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match its display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let animationFrameId: number;
    const particles: any[] = [];

    // Create particles for the background animation
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, 
                  ${Math.floor(Math.random() * 100 + 155)}, 
                  ${Math.floor(Math.random() * 255)}, 
                  ${Math.random() * 0.3 + 0.1})`,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 255, ${
              0.1 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x <= 0 || p.x >= canvas.width) p.speedX *= -1;
        if (p.y <= 0 || p.y >= canvas.height) p.speedY *= -1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Load login attempts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("loginAttempts");
    if (stored) {
      const parsed = JSON.parse(stored);
      setLoginAttempts(parsed);
    }
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if account is temporarily blocked
  const isAccountBlocked = (): boolean => {
    if (loginAttempts.blockedUntil && Date.now() < loginAttempts.blockedUntil) {
      return true;
    }
    return false;
  };

  // Get remaining block time in minutes
  const getRemainingBlockTime = (): number => {
    if (loginAttempts.blockedUntil && Date.now() < loginAttempts.blockedUntil) {
      return Math.ceil((loginAttempts.blockedUntil - Date.now()) / 60000);
    }
    return 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if form is valid
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Check if account is blocked
    if (isAccountBlocked()) {
      const remainingTime = getRemainingBlockTime();
      toast.error(
        `Too many failed attempts. Try again in ${remainingTime} minutes.`
      );
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);

      // Reset login attempts on successful login
      const resetAttempts = { attempts: 0, lastAttempt: 0 };
      setLoginAttempts(resetAttempts);
      localStorage.setItem("loginAttempts", JSON.stringify(resetAttempts));

      toast.success("Login successful! Redirecting to your dashboard...");
    } catch (error: any) {
      // Handle failed login attempt
      const now = Date.now();
      const newAttempts = loginAttempts.attempts + 1;

      let newLoginAttempts: LoginAttemptInfo = {
        attempts: newAttempts,
        lastAttempt: now,
      };

      // Block account after 5 failed attempts
      if (newAttempts >= 5) {
        newLoginAttempts.blockedUntil = now + 15 * 60 * 1000; // 15 minutes
        toast.error(
          "Too many failed attempts. Account blocked for 15 minutes."
        );
      } else {
        const remainingAttempts = 5 - newAttempts;
        toast.error(
          `Invalid credentials. ${remainingAttempts} attempts remaining.`
        );
      }

      setLoginAttempts(newLoginAttempts);
      localStorage.setItem("loginAttempts", JSON.stringify(newLoginAttempts));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Don't render if user is already logged in and being redirected
  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg monty uppercase">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Login Form */}
        <div className="w-full lg:w-1/2 py-16 px-4 sm:px-6 lg:px-12 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="max-w-md w-full mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-medium text-white mb-2">
                Welcome to <span className="text-purple-400">Andishi</span>
              </h1>
              <p className="text-lg text-gray-300">
                Sign in to access your respective dashboard
              </p>

              {/* Show account blocked warning */}
              {isAccountBlocked() && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-2" />
                  <span className="text-red-300 text-sm">
                    Account temporarily blocked. Try again in{" "}
                    {getRemainingBlockTime()} minutes.
                  </span>
                </div>
              )}
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 text-sm px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        errors.email
                          ? "border-red-400 focus:border-red-400"
                          : "border-white/10 focus:border-blue-400"
                      }`}
                      placeholder="your@email.com"
                      required
                      disabled={isAccountBlocked()}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 text-sm pr-10 px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        errors.password
                          ? "border-red-400 focus:border-red-400"
                          : "border-white/10 focus:border-blue-400"
                      }`}
                      placeholder="Enter your password"
                      required
                      disabled={isAccountBlocked()}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                      disabled={isAccountBlocked()}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-500 bg-white/5 border border-white/10 rounded focus:ring-blue-500"
                      disabled={isAccountBlocked()}
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isAccountBlocked()}
                  className={`w-full monty uppercase cursor-pointer py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    isLoading || isAccountBlocked()
                      ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center monty uppercase cursor-pointer">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loging in...
                    </span>
                  ) : isAccountBlocked() ? (
                    "Account Blocked"
                  ) : (
                    "Log In"
                  )}
                </button>

                {/* Login attempts indicator */}
                {loginAttempts.attempts > 0 && !isAccountBlocked() && (
                  <div className="text-center text-xs monty uppercase text-yellow-400">
                    {loginAttempts.attempts} failed attempt
                    {loginAttempts.attempts > 1 ? "s" : ""}.
                    {5 - loginAttempts.attempts} remaining.
                  </div>
                )}
              </form>

              {/* Role-based account creation notice */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="!text-blue-300 font-medium mb-2">
                  Need an Account?
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  Create your account based on your role:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-2">
                      <span>
                        <FaCodeBranch className="ml-1 text-green-400" />
                      </span>
                      Developers & Talent
                    </span>
                    <Link
                      href="/join-talent-pool"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Join Talent Pool →
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-2">
                      <span className="">
                        <FaUser className="ml-1 text-indigo-400" />
                      </span>
                      Clients & Businesses
                    </span>
                    <Link
                      href="/start-project"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Start Project →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center monty uppercase px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Home Page
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Interactive Graphic */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20">
          {/* Animated background */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Floating tech icons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-96 h-96">
              {/* Central glowing orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full bg-transparent backdrop-blur-3xl flex items-center justify-center shadow-2xl">
                  <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping opacity-70"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                  <div className=" z-10">
                    <Image
                      src={"/logo.svg"}
                      alt="logo"
                      width={30}
                      height={30}
                      className="w-30"
                    />
                  </div>
                </div>
              </div>

              {/* Orbiting tech icons */}
              {techIcons.map((tech, index) => {
                const angle =
                  index * (360 / techIcons.length) * (Math.PI / 180);
                const distance = 160;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      animation: `orbit ${20 + index}s linear infinite`,
                      animationDelay: `${index * 0.5}s`,
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-125 hover:shadow-xl hover:bg-white/20">
                      <tech.icon
                        className="text-xl"
                        style={{ color: tech.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating text elements */}
          {testimonials.map((testimonial, index) => {
            const positions = [
              { top: "2%", left: "8%" }, // Top-left
              { bottom: "2%", right: "8%" }, // Bottom-right
              { top: "45%", left: "5%" }, // Middle-left
              { top: "20%", right: "2%" }, // Top-right
            ];

            return (
              <div
                key={index}
                className={`absolute backdrop-blur-md bg-white/8 border border-white/20 rounded-xl p-5 max-w-xs transition-all duration-300 hover:scale-105 hover:bg-white/12 hover:border-white/30 hover:shadow-xl hover:shadow-blue-500/20`}
                style={{
                  ...positions[index],
                  animation: `float ${4 + index}s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                {/* Testimonial Header */}
                <div className="flex items-center mb-3">
                  {/* Avatar Placeholder */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-lg"
                    style={{ backgroundColor: testimonial.color }}
                  >
                    {testimonial.avatar}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-300 text-xs">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>

                  {/* Company Icon */}
                  <testimonial.icon
                    className="text-lg ml-2"
                    style={{ color: testimonial.color }}
                  />
                </div>

                {/* Star Rating */}
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Subtle gradient overlay */}
                <div
                  className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${testimonial.color}20, transparent)`,
                  }}
                ></div>
              </div>
            );
          })}

          <style jsx>{`
            @keyframes orbit {
              from {
                transform: translate(-50%, -50%) rotate(0deg) translateX(160px)
                  rotate(0deg);
              }
              to {
                transform: translate(-50%, -50%) rotate(360deg)
                  translateX(160px) rotate(-360deg);
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
