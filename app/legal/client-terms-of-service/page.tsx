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
          Client Terms of Service
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-300">
          Last updated: July 14, 2025
        </p>
      </motion.header>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            1. Agreement to Terms
          </h2>
          <p className="text-gray-300 leading-relaxed">
            By engaging Andishi MVP for services, you agree to these Terms.
            These Terms supplement and form the foundation of any
            project-specific Statement of Work (SOW) or signed agreement.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            2. Scope of Work
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Our services may include software development, staff augmentation,
            or other technology services as outlined in your signed project
            documents.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            3. Client Obligations
          </h2>
          <p className="text-gray-300 leading-relaxed">
            You are expected to provide timely access, approvals, and
            cooperation as required to avoid project delays or scope changes.
            Non-performance on the client’s side may result in deadline
            adjustments or contract review.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            4. Payments & Fees
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Invoices will be issued as per project-specific agreements and are
            payable within 14 days unless otherwise agreed. Late payments may
            attract service suspension or additional fees.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            5. Ownership & IP
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Unless otherwise agreed, intellectual property created under a
            contract is transferred to the client upon full payment of all
            dues. Prior assets (e.g., templates, libraries) remain property of
            Andishi MVP unless licensed otherwise.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            6. Confidentiality
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Both parties agree to protect confidential information and not
            disclose it to any third party except as required by law or
            contractual obligations. Confidentiality survives the contract
            term.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Andishi MVP’s total liability shall not exceed the fees paid for
            the relevant project. We are not liable for indirect or
            consequential damages unless explicitly agreed.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            8. Termination
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Either party may terminate the contract with 14 days’ written
            notice. If there is a breach, the other party may terminate
            immediately if the issue is not resolved within 7 days of written
            notice.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            9. Governing Law
          </h2>
          <p className="text-gray-300 leading-relaxed">
            This agreement shall be governed by the laws of Kenya. Any
            disputes will be handled in the courts of Nairobi, unless
            otherwise agreed in writing.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            10. Contact Information
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Email:{" "}
            <a
              href="mailto:legal@andishi.dev"
              className="text-primary-400 hover:underline"
            >
              legal@andishi.dev
            </a>
            <br />
            Address: Ruiru, Kiambu, Kenya
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;