"use client";
import { motion } from "framer-motion";
import React from "react";
import LegalPageLayout from "../LegalPageLayout";

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
    <LegalPageLayout title="Client Privacy Policy" lastUpdated="July 14, 2025">
      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">
            Introduction & Data Controller Information
          </span>
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            This Client Privacy Policy describes how Andishi collects, uses, and
            shares personal and business information from our clients, in
            accordance with the Kenya Data Protection Act, 2019 and Legal Notice
            263/2021.
          </p>
          <div className="bg-blue-50 dark:bg-black/30 p-4 rounded-lg border-l-4 border-primary">
            <h3 className="font-semibold text-blue-600 dark:text-white mb-2">
              Data Controller Details:
            </h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>Company:</strong> Andishi Limited
              </li>
              <li>
                <strong>Registration:</strong> Kenya Companies Registry
              </li>
              <li>
                <strong>Office:</strong> Ruiru, Kiambu County, Kenya
              </li>
              <li>
                <strong>Data Officer:</strong> Available upon request
              </li>
              <li>
                <strong>ODPC Registration:</strong> Compliant with Section 25
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Information We Collect</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            We collect only necessary information for the delivery of contracted
            services as per Section 26 of the Data Protection Act:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-600 dark:text-primary mb-3">
                Contact Details
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>• Name, email address, phone number</li>
                <li>• Office address</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-600 dark:text-primary mb-3">
                Business Information
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>• Company name, industry, project scope</li>
                <li>• Payment details, invoices, purchase orders</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-black/30 p-4 rounded-lg border-l-4 border-yellow-400">
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              Important Notice
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              All data is collected in compliance with the{" "}
              <strong>Kenya Data Protection Regulations</strong>
              and only used for{" "}
              <strong>specified, explicit, and legitimate purposes</strong>.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Purpose of Processing</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>Your information is processed for the following purposes:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Primary Purposes
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Fulfilling contractual obligations</li>
                <li>Project tracking, support, and delivery</li>
                <li>Accounting, invoicing, and audit compliance</li>
              </ul>
            </div>
            <div className="bg-yellow-50 dark:bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                Additional Purposes
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Internal analysis for service improvement</li>
                <li>Legal compliance and risk mitigation</li>
                <li>Customer support and engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Data Sharing</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>We may share your data with:</p>
          <div className="bg-green-50 dark:bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
              Who We Share With
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Internal staff under non-disclosure obligations</li>
              <li>
                Service providers (e.g., hosting, payment processors) with
                proper data processing agreements
              </li>
              <li>Regulatory or legal authorities when required</li>
            </ul>
          </div>
          <p>
            We do not sell your data. All third-party sharing is governed under
            Regulation 21 of Kenya's Data Protection Regulations (LN263/2021).
          </p>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Data Retention & Security</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            We retain client data only as long as necessary for service and
            legal reasons. Retention schedules are documented, and expired data
            is anonymised or deleted. Encryption and access control policies are
            in place to prevent misuse.
          </p>
          <div className="bg-blue-50 dark:bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Retention Details
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                Service-related data: Retained for <strong>5 years</strong>
              </li>
              <li>
                Billing records: Retained for <strong>7 years</strong> compliant
                with tax laws
              </li>
            </ul>
          </div>
          <p>
            Regular audits and compliance checks ensure secure data management
            and storage practices.
          </p>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Your Rights</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Clients have the right to access, correct, or request deletion of
            their personal information. Requests will be fulfilled in accordance
            with Kenyan data law within statutory timelines.
          </p>
          <div className="bg-teal-50 dark:bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">
              How to Exercise Rights
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Please contact our Data Protection Officer via the contact details
              provided below. We strive to respond within 21 days.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="ml-3">Contact Us</span>
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>If you have any questions or requests, reach us at:</p>
          <div className="bg-pink-50 dark:bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold text-pink-600 dark:text-pink-400 mb-3">
              Contact Information
            </h3>
            <p className="text-sm border-b border-gray-300 dark:border-gray-600 pb-2 mb-2 text-gray-700 dark:text-gray-300">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@andishi.dev"
                className="text-blue-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                info@andishi.dev
              </a>
            </p>
            <p className="text-sm border-b border-gray-300 dark:border-gray-600 pb-2 mb-2 text-gray-700 dark:text-gray-300">
              <strong>Office:</strong>{" "}
              <a
                href="https://www.google.com/maps"
                className="text-blue-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Ruiru, Kiambu, Kenya
              </a>
            </p>
          </div>
        </div>
      </motion.section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
