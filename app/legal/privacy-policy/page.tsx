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
          Privacy Policy
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
            Andishi MVP (“we”, “us”) is committed to protecting your personal
            data in compliance with the Data Protection Act, 2019 and its
            General Regulations, 2021. We emphasise transparency, fairness,
            and accountability in how we collect, process, store, and share
            your data.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            2. Personal Data We Collect
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We collect only necessary personal data, in line with the
            principles of data minimisation and purpose limitation. Examples
            include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Name, email address, phone number</li>
            <li>Professional data such as skills, experience, portfolio</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Where data is provided indirectly (e.g., via third parties), we
            will notify you within 14 days.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            3. Purpose and Legal Basis for Processing
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Processing is conducted based on lawful legal grounds such as:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Performance of contractual obligations</li>
            <li>Legitimate business interests (e.g., customer support)</li>
            <li>Your consent, where required</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Personal data is processed only for specified, explicit, and
            legitimate purposes and not used further in a way incompatible
            with those purposes.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            4. Disclosure & Sharing of Your Data
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may share your data under legally permitted circumstances, or
            when:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              Working with service providers (e.g., hosting, email, analytics)
            </li>
            <li>Complying with legal obligations</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Where sharing occurs, we require written requests specifying
            purpose, retention period, and safeguards in compliance with
            Regulation 21 of LN 263_2021.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            5. Data Retention & Security
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We retain personal data only as long as necessary, in line with a
            documented retention schedule, and securely delete or anonymise it
            thereafter. We implement organisational, administrative, and
            technical safeguards to protect data integrity, confidentiality,
            and availability.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            6. Your Rights as a Data Subject
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Under Kenyan law, you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Access and receive a copy of your data</li>
            <li>Request correction or deletion of inaccurate data</li>
            <li>Restrict or object to processing</li>
            <li>Request portability of your data</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Requests must be fulfilled within statutory timeframes free of
            charge.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            7. Automated Decision-Making
          </h2>
          <p className="text-gray-300 leading-relaxed">
            If we use automated profiling or decision-making, you’ll be
            informed of the logic involved and have the right to human review
            and objection under the Act.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            8. Data Protection Officer & Complaints
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We are registered with the ODPC and may appoint a Data Protection
            Officer. You may lodge complaints with the Data Commissioner or
            through our internal complaints process.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            9. Contact Us
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

export default PrivacyPolicyPage;
