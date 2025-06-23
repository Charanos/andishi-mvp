"use client";

import Link from "next/link";
import { RBACService } from "@/utils/rbac";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth"; // Adjust path as needed
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isLoading } = useAuth();

  // Removed isActive here; use inside .map() if needed

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  // Handle navigation clicks
  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const elementId = href.substring(1);
      smoothScrollTo(elementId);
    } else {
      setIsOpen(false);
    }
  };

  // Get dashboard route using RBACService
  const getDashboardRoute = () => {
    if (!user) return "/login";
    return RBACService.getDashboardRoute(user);
  };

  // Public navigation links
  const publicLinks = [
    { label: "Our Portfolio", href: "/our-portfolio" },
    { label: "Tech Talent Pool", href: "/tech-talent-pool" },
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
  ];

  const navVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const mobileMenuVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const linkItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-100 ${
        scrolled
          ? "bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg"
          : "bg-white/5 backdrop-blur-lg border-b border-white/10"
      }`}
    >
      <div className="mx-auto flex items-center justify-between py-4 px-6 md:px-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            href="/"
            className="text-2xl font-semibold font-montserrat text-white"
            onClick={() => setIsOpen(false)}
          >
            <img src="./logo.svg" alt="logo" className="w-10 h-10" />
          </Link>
        </motion.div>

        {/* Desktop Links */}
        <motion.ul
          className="hidden md:flex items-center gap-8 text-white monty uppercase text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Public Routes */}
          {publicLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <motion.li
                key={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`hover:text-[#96aeff] transition-colors duration-150 cursor-pointer uppercase ${
                    isActive
                      ? "text-[#96aeff] underline underline-offset-8"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              </motion.li>
            );
          })}

          {/* User Authentication State */}
          {isLoading ? (
            <motion.li>
              <div className="w-20 h-8 bg-white/20 animate-pulse rounded-lg"></div>
            </motion.li>
          ) : user ? (
            // Logged in user - show dashboard and logout
            <>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={getDashboardRoute()}
                  className="hover:text-[#c156ff] transition-colors duration-150 cursor-pointer uppercase"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </motion.li>

              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-80 capitalize">
                    Hi, {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 bg-red-500/60 rounded-lg font-semibold hover:bg-red-600/60 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg text-xs"
                  >
                    Logout
                  </button>
                </div>
              </motion.li>
            </>
          ) : (
            // Not logged in - show login CTA
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="px-4 py-2 bg-[#02A4E6] rounded-lg font-semibold hover:bg-[#0291CC] transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            </motion.li>
          )}
        </motion.ul>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden text-white cursor-pointer"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden bg-[#05122273] backdrop-blur-lg border-t border-white/10 monty uppercase text-sm"
          >
            <motion.ul
              className="flex flex-col gap-4 p-6 text-white"
              initial="hidden"
              animate="visible"
            >
              {/* Public Routes Mobile */}
              {publicLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  custom={index}
                  variants={linkItemVariants}
                  className="border-b border-white/20 pb-2"
                >
                  <Link
                    href={link.href}
                    className="hover:text-[#02A4E6] transition-colors duration-200 w-full text-left uppercase block"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}

              {/* Authentication Mobile */}
              {isLoading ? (
                <motion.li custom={publicLinks.length}>
                  <div className="w-full h-10 bg-white/20 animate-pulse rounded-lg"></div>
                </motion.li>
              ) : user ? (
                <>
                  <motion.li
                    custom={publicLinks.length}
                    variants={linkItemVariants}
                    className="border-b border-white/20 pb-2"
                  >
                    <div className="text-xs opacity-80 mb-2">
                      Welcome, {user.name || user.email?.split("@")[0]}
                    </div>
                    <Link
                      href={getDashboardRoute()}
                      className="hover:text-[#02A4E6] transition-colors duration-200 w-full text-left uppercase block"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </motion.li>
                  <motion.li
                    custom={publicLinks.length + 1}
                    variants={linkItemVariants}
                  >
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="cursor-pointer w-fit px-4 py-2 bg-red-500/60 rounded-lg font-semibold hover:bg-red-600/60 transition-all duration-200 shadow-md hover:shadow-lg text-left"
                    >
                      Logout
                    </button>
                  </motion.li>
                </>
              ) : (
                <motion.li
                  custom={publicLinks.length}
                  variants={linkItemVariants}
                >
                  <Link
                    href="/login"
                    className="inline-block w-full px-4 py-2 bg-[#02A4E6] rounded-lg font-semibold hover:bg-[#0291CC] transition-all duration-200 shadow-md hover:shadow-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </motion.li>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
