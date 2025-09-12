"use client";
import { motion } from "framer-motion";
import React from "react";
import ScrollToTop from "../components/ScrollToTop";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
} as const;

const LegalPageLayout = ({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
      className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-transparent"
    >
      <motion.header
        variants={sectionVariants}
        className="text-center mb-10 sm:mb-12 lg:mb-16"
      >
        <h1 className="text-4xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-3 sm:mt-4 text-sm lg:text-md text-gray-600 dark:text-gray-300">
          Last updated: {lastUpdated}
        </p>
      </motion.header>

      <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      <ScrollToTop />
    </motion.div>
  );
};

export default LegalPageLayout;
