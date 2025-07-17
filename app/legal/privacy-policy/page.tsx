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
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="July 14, 2025"
    >
      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">1.</span>
          <span className="ml-3">Introduction & Data Controller Information</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Andishi is committed to protecting your personal
            data in strict compliance with the Data Protection Act, 2019 and its
            implementing regulations under Legal Notice 263/2021.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-400 mb-2">Data Controller Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Company:</strong> Andishi Limited</p>
              <p><strong>Registration:</strong> Kenya Companies Registry</p>
              <p><strong>Address:</strong> Ruiru, Kiambu County, Kenya</p>
              <p><strong>ODPC Registration:</strong> In compliance with Section 25</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Personal Data We Collect</span>
        </h2>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            We collect only necessary personal data, in strict adherence to the principles of
            data minimisation and purpose limitation as outlined in Section 26 of the Data Protection Act, 2019.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-3">Developer Data</h3>
              <ul className="space-y-1 text-sm">
                <li>• Full name and professional title</li>
                <li>• Email address and phone number</li>
                <li>• Technical skills and certifications</li>
                <li>• Work experience and portfolio</li>
                <li>• Educational background</li>
                <li>• Geographic location</li>
                <li>• Availability and rate preferences</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-3">Client Data</h3>
              <ul className="space-y-1 text-sm">
                <li>• Company name and industry</li>
                <li>• Contact person details</li>
                <li>• Project requirements and scope</li>
                <li>• Budget and timeline preferences</li>
                <li>• Communication preferences</li>
                <li>• Billing and payment information</li>
              </ul>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-yellow-400/10">
            <h3 className="font-semibold text-yellow-400 mb-2">Important Notice</h3>
            <p className="text-sm">
              Where personal data is obtained indirectly, we will notify you within 14 days
              as required by Regulation 4 of LN 263/2021.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Legal Basis for Processing</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            All personal data processing is conducted based on lawful grounds as specified in
            Section 30 of the Data Protection Act, 2019.
          </p>

          <div className="grid gap-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">Contractual Performance</h3>
              <p className="text-sm">Processing necessary for contract performance with developers and clients, including project matching and payment processing.</p>
            </div>

            <div className="bg-black/30 to-teal-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Legitimate Business Interests</h3>
              <p className="text-sm">Platform security, fraud prevention, service improvement, and business analytics (balanced against your rights).</p>
            </div>

            <div className="bg-black/30 to-pink-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">Consent</h3>
              <p className="text-sm">Where explicitly required, such as for marketing communications or optional features.</p>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-red-400 mb-2">Legal Compliance</h3>
              <p className="text-sm">Processing required to comply with legal obligations under Kenyan law.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Data Disclosure & Sharing</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            We may share your data only under legally permitted circumstances as outlined in
            Section 35 and Regulation 21 of LN 263/2021.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-3">Trusted Service Providers</h3>
              <ul className="space-y-1 text-sm">
                <li>• Cloud hosting services</li>
                <li>• Payment processors</li>
                <li>• Email services</li>
                <li>• Analytics platforms</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-red-400 mb-3">Legal Requirements</h3>
              <ul className="space-y-1 text-sm">
                <li>• Court orders and legal processes</li>
                <li>• Regulatory compliance</li>
                <li>• Government authorities</li>
                <li>• Law enforcement requests</li>
              </ul>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="font-semibold text-purple-400 mb-2">Data Protection Standards</h3>
            <p className="text-sm">
              All data sharing requires written agreements specifying purpose, retention period,
              and safeguards in compliance with Regulation 21 of LN 263/2021.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Data Retention & Security</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Personal data is retained only for as long as necessary for the stated purposes,
            in accordance with our Data Retention Schedule.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-400 mb-3">Retention Periods</h3>
              <ul className="space-y-1 text-sm">
                <li>• Financial records: 7 years</li>
                <li>• Project files: 3 years after completion</li>
                <li>• User profiles: 1 year after inactivity</li>
                <li>• Communication logs: 2 years</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-3">Security Measures</h3>
              <ul className="space-y-1 text-sm">
                <li>• End-to-end encryption</li>
                <li>• Multi-factor authentication</li>
                <li>• Regular security audits</li>
                <li>• Staff training programs</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Your Rights as a Data Subject</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            In accordance with the Data Protection Act, 2019, you have the following rights:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-3">Access & Control Rights</h3>
              <ul className="space-y-1 text-sm">
                <li>• Access and retrieve your data (21 days)</li>
                <li>• Request correction of inaccurate data</li>
                <li>• Demand deletion of unlawfully processed data</li>
                <li>• Data portability to another controller</li>
              </ul>
            </div>

            <div className="bg-black/30 to-pink-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-3">Processing Rights</h3>
              <ul className="space-y-1 text-sm">
                <li>• Object to processing on legitimate grounds</li>
                <li>• Restrict processing in certain cases</li>
                <li>• Withdraw consent at any time</li>
                <li>• Human review of automated decisions</li>
              </ul>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-400 mb-2">How to Exercise Your Rights</h3>
            <p className="text-sm">
              Submit requests to our Data Protection Officer through the contact details below.
              We respond promptly within statutory timeframes, free of charge.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Automated Decision-Making</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            If we use automated profiling or decision-making that significantly affects you,
            we will inform you of the logic involved and provide options for human review.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-yellow-400">
            <h3 className="font-semibold text-yellow-400 mb-2">Your Rights</h3>
            <p className="text-sm">
              You have the right to human intervention, express your point of view,
              and contest automated decisions under the Data Protection Act.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold !text-white mb-6 flex items-center">
          <span className="ml-3">Data Protection Officer & Complaints</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            We are registered with the Office of the Data Protection Commissioner (ODPC)
            and maintain high standards of data protection compliance.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="font-semibold text-red-400 mb-2">Filing Complaints</h3>
            <p className="text-sm">
              You may lodge complaints with the Data Protection Commissioner or
              through our internal complaints process. We are committed to resolving
              issues promptly and transparently.
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
            If you have any questions or requests regarding your personal data, reach us at:
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

export default PrivacyPolicyPage;