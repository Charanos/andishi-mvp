"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import PageTransition from "./PageTransition";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import DevLoginHelper from "./DevLoginHelper";
import { UserRole } from "@/types/auth";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Enhanced route configurations
const ROUTE_CONFIG = {
  AUTH_ROUTES: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/callback",
  ],
  PUBLIC_ROUTES: [
    "/",
    "/about-us",
    "/contact-us",
    "/our-portfolio",
    "/tech-talent-pool",
    "/start-project",
    "/join-talent-pool",
    "/thank-you-start-project",
    "/thank-you-join-talent-pool",
    "/privacy-policy",
    "/terms-of-service",
    "/blogs",
  ],
  DASHBOARD_ROUTES: [
    "/admin-dashboard",
    "/client-dashboard",
    "/developer-dashboard",
  ],
  // Routes that should have minimal layout (no navbar/footer)
  MINIMAL_LAYOUT_ROUTES: ["/onboarding", "/setup", "/maintenance"],
};

// Enhanced loading states
const LoadingStates = {
  INITIAL: "initial",
  AUTHENTICATING: "authenticating",
  REDIRECTING: "redirecting",
  ERROR: "error",
} as const;

type LoadingState = (typeof LoadingStates)[keyof typeof LoadingStates];

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingStates.INITIAL
  );
  const [redirectMessage, setRedirectMessage] = useState<string>("");
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  // Enhanced route checking
  const isAuthRoute = ROUTE_CONFIG.AUTH_ROUTES.includes(pathname);
  const isPublicRoute =
    ROUTE_CONFIG.PUBLIC_ROUTES.includes(pathname) || isAuthRoute;
  const isDashboardRoute = ROUTE_CONFIG.DASHBOARD_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isMinimalLayout = ROUTE_CONFIG.MINIMAL_LAYOUT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Network status detection
  useEffect(() => {
    const handleOnline = () => setShowOfflineMessage(false);
    const handleOffline = () => setShowOfflineMessage(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Enhanced loading state management
  useEffect(() => {
    if (isLoading) {
      setLoadingState(LoadingStates.AUTHENTICATING);
    } else if (!user && !isPublicRoute) {
      setLoadingState(LoadingStates.REDIRECTING);
      setRedirectMessage("Redirecting to login...");

      // Delayed redirect with smooth transition
      const timer = setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setLoadingState(LoadingStates.INITIAL);
    }
  }, [isLoading, user, isPublicRoute, pathname, router]);

  // Enhanced loading component
  const EnhancedLoadingScreen = ({
    state,
    message,
  }: {
    state: LoadingState;
    message?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto w-16 h-16 relative"
        >
          <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold uppercase text-white">
            {state === LoadingStates.AUTHENTICATING && "Authenticating..."}
            {state === LoadingStates.REDIRECTING && "Access Required"}
            {state === LoadingStates.INITIAL && "Loading..."}
          </h2>

          {message && <p className="text-gray-300 animate-pulse">{message}</p>}

          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  backgroundColor: ["#64748b", "#3b82f6", "#64748b"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-slate-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Unauthorized access component
  const UnauthorizedAccess = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex items-center justify-center"
    >
      <div className="text-center space-y-6 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md mx-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-6xl mb-4"
        >
          🔒
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-gray-300">
            Please log in to continue to this page
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/logout`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
          >
            Go to Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors duration-200 border border-white/30"
          >
            Go Home
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // Offline indicator
  const OfflineIndicator = () => (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex items-center justify-center text-white text-center py-2 px-4"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-medium">
              You're offline. Some features may not work.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Role-based dashboard access control with admin privileges
  const hasValidDashboardAccess = () => {
    if (!user || !isDashboardRoute) return true;

    // Admins can access any dashboard
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // For non-admin users, check specific role requirements
    const roleRouteMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: "/admin-dashboard",
      [UserRole.CLIENT]: "/client-dashboard",
      [UserRole.DEVELOPER]: "/developer-dashboard",
    };

    const expectedRoute = roleRouteMap[user.role];
    return pathname.startsWith(expectedRoute);
  };

  // Show loading screen for various states
  if (loadingState !== LoadingStates.INITIAL) {
    return (
      <EnhancedLoadingScreen state={loadingState} message={redirectMessage} />
    );
  }

  // Show unauthorized if trying to access protected route without authentication
  if (!user && !isPublicRoute) {
    return <UnauthorizedAccess />;
  }

  // Check dashboard access permissions
  if (user && isDashboardRoute && !hasValidDashboardAccess()) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover flex items-center justify-center"
      >
        <div className="text-center space-y-6 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Wrong Dashboard</h2>
            <p className="text-gray-300">
              You don't have access to this dashboard
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              router.push(
                user.role === "admin"
                  ? "/admin-dashboard"
                  : user.role === "client"
                  ? "/client-dashboard"
                  : "/developer-dashboard"
              )
            }
            className="px-6 py-3 cursor-pointer bg-blue-600/40 monty hover:bg-blue-700/40 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
          >
            Go to Your Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Determine layout configuration
  const showNavbar = !isAuthRoute && !isMinimalLayout;
  const showFooter = !isAuthRoute && !isMinimalLayout && !isDashboardRoute;
  const mainPadding = showNavbar ? "pt-19" : "";

  return (
    <div className="min-h-screen flex flex-col">
      <OfflineIndicator />

      {/* Enhanced navbar with conditional rendering */}
      <AnimatePresence mode="wait">
        {showNavbar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with enhanced styling */}
      <motion.main
        className={`flex-1 ${mainPadding} ${
          isDashboardRoute
            ? "inset-0 bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover"
            : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PageTransition>{children}</PageTransition>

        {/* Development tools */}
        {/* {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <DevLoginHelper />
          </motion.div>
        )} */}
      </motion.main>

      {/* Enhanced footer with conditional rendering */}
      <AnimatePresence mode="wait">
        {showFooter && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
