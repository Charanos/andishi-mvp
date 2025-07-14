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

const TermsOfServicePage = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="July 14, 2025"
    >
      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Acceptance of Terms</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            By accessing Andishi services, you agree to these Terms and our
            Privacy Policy. If you disagree, please discontinue use.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-400 mb-2">Legal Framework</h3>
            <p className="text-sm">
              These Terms are governed by Kenyan law and are subject to periodic updates.
              Continued use of our services constitutes acceptance of any modifications.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Services and Acceptable Use</span>
        </h2>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            Andishi provides a platform connecting clients with skilled developers.
            All users must comply with our acceptable use policy.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-3">Permitted Uses</h3>
              <ul className="space-y-1 text-sm">
                <li>• Professional networking and collaboration</li>
                <li>• Legitimate business transactions</li>
                <li>• Educational and skill development</li>
                <li>• Portfolio showcasing</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-red-400 mb-3">Prohibited Activities</h3>
              <ul className="space-y-1 text-sm">
                <li>• Unlawful content or activities</li>
                <li>• Infringement of intellectual property</li>
                <li>• Harassment or discriminatory behavior</li>
                <li>• System disruption or unauthorized access</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Intellectual Property</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            All website and software content is protected under copyright laws
            and remains the property of Andishi or its licensors.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="font-semibold text-purple-400 mb-2">Protected Content</h3>
            <p className="text-sm">
              This includes but is not limited to: source code, designs, trademarks,
              logos, documentation, and proprietary algorithms.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Disclaimers & Limitation of Liability</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Services are provided "as is." We are not liable for indirect,
            incidental, or consequential damages.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="font-semibold text-red-400 mb-2">Liability Limitations</h3>
            <p className="text-sm">
              Our total liability is limited to the amount paid for services.
              We disclaim warranties except as required by law.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Governing Law</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            These Terms are governed by Kenyan law and subject to the
            jurisdiction of Kenyan courts.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-400 mb-2">Jurisdiction</h3>
            <p className="text-sm">
              Any disputes will be resolved in the courts of Nairobi, Kenya.
              Alternative dispute resolution may be considered by mutual agreement.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Contact Us</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            If you have any questions or requests, reach us at:
          </p>
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
            <h3 className="font-semibold text-green-400 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Company:</strong> Andishi LTD</p>
              <p><strong>Address:</strong> Ruiru, Kiambu, Kenya</p>
              <p><strong>Email:</strong> <a href="mailto:info@andishi.dev" className="text-primary-400 hover:underline cursor-pointer">info@andishi.dev</a></p>
              <p><strong>Phone:</strong> <a href="tel:+254759912373" className="text-primary-400 hover:underline cursor-pointer">+254 759 912 373</a></p>
            </div>
          </div>
        </div>
      </motion.section>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;
