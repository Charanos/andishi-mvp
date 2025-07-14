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

const PrivacyPolicyPage = () => {
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
          Client Privacy Policy
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-300">
          Last updated: July 14, 2025
        </p>
      </motion.header>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-300 leading-relaxed">
            This Client Privacy Policy describes how Andishi MVP collects, uses,
            and shares personal and business information from our clients, in
            accordance with the Kenya Data Protection Act, 2019 and Legal
            Notice 263/2021.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            2. Information We Collect
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We collect only necessary information for the delivery of
            contracted services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Contact details (name, email, phone, address)</li>
            <li>
              Business information (company name, industry, project scope)
            </li>
            <li>
              Billing information (payment details, invoices, purchase orders)
            </li>
            <li>
              Service-related communication (emails, calls, signed documents)
            </li>
          </ul>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            3. Purpose of Processing
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Your information is processed for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Fulfilling contractual obligations</li>
            <li>Project tracking, support, and delivery</li>
            <li>Accounting, invoicing, and audit compliance</li>
            <li>Internal analysis for service improvement</li>
            <li>Legal compliance and risk mitigation</li>
          </ul>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            4. Data Sharing
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may share your data with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Internal staff under non-disclosure obligations</li>
            <li>
              Service providers (e.g., hosting, payment processors) with proper
              data processing agreements
            </li>
            <li>Regulatory or legal authorities when required</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            We do not sell your data. All third-party sharing is governed under
            Regulation 21 of Kenya’s Data Protection Regulations (LN263/2021).
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            5. Data Retention & Security
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We retain client data only as long as necessary for service and
            legal reasons. Retention schedules are documented, and expired data
            is anonymised or deleted. Encryption and access control policies
            are in place to prevent misuse.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            6. Your Rights
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Clients have the right to access, correct, or request deletion of
            their personal information. Requests will be fulfilled in
            accordance with Kenyan data law within statutory timelines.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            7. Contact Us
          </h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions or requests, reach us at:
            <br />
            Email:{" "}
            <a
              href="mailto:info@andishi.dev"
              className="text-primary-400 hover:underline"
            >
              info@andishi.dev
            </a>
            <br />
            Address: Ruiru, Kiambu, Kenya
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;