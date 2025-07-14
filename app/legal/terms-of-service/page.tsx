"use client";
import { motion } from "framer-motion";
import React from "react";

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

const TermsOfServicePage = () => {
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
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"
    >
      <motion.header
        variants={sectionVariants}
        className="text-center mb-10 sm:mb-12 lg:mb-16"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Terms of Service
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-300">
          Last updated: July 14, 2025
        </p>
      </motion.header>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing Andishi services, you agree to these Terms and our
            Privacy Policy. If you disagree, please discontinue use.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            2. Services and Use
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Users are prohibited from misuse, including unlawful content,
            infringing others’ rights, or disrupting service operations.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            3. Intellectual Property
          </h2>
          <p className="text-gray-300 leading-relaxed">
            All website and software content is protected under copyright laws
            and remains the property of Andishi or its licensors.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            4. Disclaimers & Limitation of Liability
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Services are provided “as is.” We are not liable for indirect,
            incidental, or consequential damages.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            5. Governing Law
          </h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms are governed by Kenyan law and subject to the
            jurisdiction of Kenyan courts.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            6. Contact Us
          </h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions or requests, reach us at:
            <br />
            Andishi LTD
            <br />
            Ruiru, Kiambu, Kenya
            <br />
            Email:{" "}
            <a
              href="mailto:info@andishi.dev"
              className="text-primary-400 hover:underline"
            >
              info@andishi.dev
            </a>
            <br />
            Phone:{" "}
            <a href="tel:+254759912373" className="text-primary-400 hover:underline">
              +254 759 912 373
            </a>
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;
