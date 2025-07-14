"use client";
import { motion } from "framer-motion";
import React from "react";
import ScrollToTop from "../../components/ScrollToTop";

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
      className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"
    >
      <motion.header
        variants={sectionVariants}
        className="text-center mb-10 sm:mb-12 lg:mb-16"
      >
        <h1 className="text-4xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Client Privacy Policy
        </h1>
        <p className="mt-3 sm:mt-4 text-sm lg:text-md text-gray-300">
          Last updated: July 14, 2025
        </p>
      </motion.header>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">1.</span>
            <span className="ml-3">Introduction & Data Controller Information</span>
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              This Client Privacy Policy describes how Andishi collects, uses,
              and shares personal and business information from our clients, in
              accordance with the Kenya Data Protection Act, 2019 and Legal
              Notice 263/2021.
            </p>
            <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-primary">
              <h3 className="font-semibold text-white mb-2">Data Controller Details:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Company:</strong> Andishi Limited</li>
                <li><strong>Registration:</strong> Kenya Companies Registry</li>
                <li><strong>Office:</strong> Ruiru, Kiambu County, Kenya</li>
                <li><strong>Data Officer:</strong> Available upon request</li>
                <li><strong>ODPC Registration:</strong> Compliant with Section 25</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">2.</span>
            <span className="ml-3">Information We Collect</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We collect only necessary information for the delivery of
              contracted services as per Section 26 of the Data Protection Act:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-3">Contact Details</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Name, email address, phone number</li>
                  <li>• Office address</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-3">Business Information</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Company name, industry, project scope</li>
                  <li>• Payment details, invoices, purchase orders</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-semibold text-yellow-400 mb-2">Important Notice</h3>
              <p className="text-sm">
                All data is collected in compliance with the <strong>Kenya Data Protection Regulations</strong>
                and only used for <strong>specified, explicit, and legitimate purposes</strong>.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">3.</span>
            <span className="ml-3">Purpose of Processing</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Your information is processed for the following purposes:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-400 mb-2">Primary Purposes</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Fulfilling contractual obligations</li>
                  <li>Project tracking, support, and delivery</li>
                  <li>Accounting, invoicing, and audit compliance</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">Additional Purposes</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Internal analysis for service improvement</li>
                  <li>Legal compliance and risk mitigation</li>
                  <li>Customer support and engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">4.</span>
            <span className="ml-3">Data Sharing</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We may share your data with:
            </p>
            <div className="bg-gradient-to-r from-yellow-900/30 to-green-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Who We Share With</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Internal staff under non-disclosure obligations</li>
                <li>
                  Service providers (e.g., hosting, payment processors) with proper
                  data processing agreements
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

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">5.</span>
            <span className="ml-3">Data Retention & Security</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We retain client data only as long as necessary for service and
              legal reasons. Retention schedules are documented, and expired data
              is anonymised or deleted. Encryption and access control policies
              are in place to prevent misuse.
            </p>
            <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-400 mb-2">Retention Details</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Service-related data: Retained for <strong>5 years</strong></li>
                <li>Billing records: Retained for <strong>7 years</strong> compliant with tax laws</li>
              </ul>
            </div>
            <p>
              Regular audits and compliance checks ensure secure data management
              and storage practices.
            </p>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">6.</span>
            <span className="ml-3">Your Rights</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Clients have the right to access, correct, or request deletion of
              their personal information. Requests will be fulfilled in
              accordance with Kenyan data law within statutory timelines.
            </p>
            <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-400 mb-2">How to Exercise Rights</h3>
              <p className="text-sm">
                Please contact our Data Protection Officer via the contact details
                provided below. We strive to respond within 21 days.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple text-transparent bg-clip-text">7.</span>
            <span className="ml-3">Contact Us</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              If you have any questions or requests, reach us at:
            </p>
            <div className="bg-gradient-to-r from-yellow-900/30 to-pink-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-400 mb-3">Contact Information</h3>
              <p className="text-sm border-b border-gray-600 pb-2 mb-2"><strong>Email:</strong> <a href="mailto:info@andishi.dev" className="text-primary-400 hover:underline cursor-pointer">info@andishi.dev</a></p>
              <p className="text-sm border-b border-gray-600 pb-2 mb-2"><strong>Office:</strong> <a href="https://www.google.com/maps" className="text-primary-400 hover:underline cursor-pointer">Ruiru, Kiambu, Kenya</a></p>
            </div>
          </div>
        </motion.section>
      </div>
      <ScrollToTop />
    </motion.div>
  );
};

export default PrivacyPolicyPage;
