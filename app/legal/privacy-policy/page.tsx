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
        <h1 className="text-4xl sm:text-3xl lg:text-5xl font-semibold tracking-tight text-white">
          Privacy Policy
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
              Andishi ("we", "us", "our") is committed to protecting your personal
              data in strict compliance with the <strong className="text-white">Data Protection Act, 2019</strong> and its
              implementing regulations under <strong className="text-white">Legal Notice 263/2021</strong>. We emphasise transparency, fairness,
              and accountability in how we collect, process, store, and share your data.
            </p>
            <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-primary">
              <h3 className="font-semibold text-white mb-2">Data Controller Details:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Company:</strong> Andishi Limited</li>
                <li><strong>Registration:</strong> Kenya Companies Registry</li>
                <li><strong>Physical Address:</strong> Ruiru, Kiambu County, Kenya</li>
                <li><strong>Data Protection Officer:</strong> Available upon request</li>
                <li><strong>ODPC Registration:</strong> In compliance with Section 25 of the Data Protection Act</li>
              </ul>
            </div>
            <p>
              This Privacy Policy governs the collection and processing of personal data from users of our
              software development platform, talent pool, and related services. By using our services, you
              acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">2.</span>
            <span className="ml-3">Personal Data We Collect</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We collect only necessary personal data, in strict adherence to the principles of
              <strong className="text-white"> data minimisation</strong> and <strong className="text-white">purpose limitation</strong>
              as outlined in Section 26 of the Data Protection Act, 2019:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-3">🎯 Developer Data</h3>
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

              <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-3">🏢 Client Data</h3>
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

            <div className="bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Important Notice</h3>
              <p className="text-sm">
                Where personal data is obtained indirectly (e.g., through referrals, public profiles, or third parties),
                we will notify you within <strong>14 days</strong> as required by Regulation 4 of LN 263/2021.
              </p>
            </div>

            <div className="bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">🔒 Sensitive Data</h3>
              <p className="text-sm">
                We do not intentionally collect sensitive personal data as defined in Section 31 of the Act.
                If such data is inadvertently provided, we will seek your explicit consent or delete it promptly.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">3.</span>
            <span className="ml-3">Purpose and Legal Basis for Processing</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              All personal data processing is conducted based on lawful grounds as specified in
              <strong className="text-white"> Section 30</strong> of the Data Protection Act, 2019:
            </p>

            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Contractual Performance</h3>
                  <p className="text-sm">Processing necessary for the performance of contracts with developers and clients, including project matching, payment processing, and service delivery.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-green-900/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Legitimate Business Interests</h3>
                  <p className="text-sm">Platform security, fraud prevention, service improvement, customer support, and business analytics (balanced against your rights and freedoms).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-purple-900/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Consent</h3>
                  <p className="text-sm">Where explicitly required, such as for marketing communications, optional features, or processing that goes beyond core service delivery.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-red-900/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Legal Compliance</h3>
                  <p className="text-sm">Processing required to comply with legal obligations under Kenyan law, including tax reporting, regulatory compliance, and court orders.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-2">📋 Purpose Limitation Principle</h3>
              <p className="text-sm">
                Personal data is processed only for <strong>specified, explicit, and legitimate purposes</strong>
                and not used further in a way incompatible with those purposes, as mandated by Section 26(c) of the Act.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">4.</span>
            <span className="ml-3">Data Disclosure & Sharing</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We may share your data only under legally permitted circumstances as outlined in
              <strong className="text-white"> Section 35 and Regulation 21</strong> of LN 263/2021:
            </p>

            <div className="grid gap-4">
              <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 p-4 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-2">🤝 Service Providers</h3>
                <p className="text-sm mb-2">Trusted third-party processors under strict data processing agreements:</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Cloud hosting services (AWS, Google Cloud)</li>
                  <li>• Payment processors (Stripe, PayPal)</li>
                  <li>• Email services (SendGrid, Mailgun)</li>
                  <li>• Analytics platforms (Google Analytics)</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-4 rounded-lg border border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-2">⚖️ Legal Obligations</h3>
                <p className="text-sm">When required by law, court orders, or regulatory authorities</p>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-purple-400 mb-2">🔗 Business Transfers</h3>
                <p className="text-sm">In case of merger, acquisition, or sale of business assets (with prior notice)</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-semibold text-yellow-400 mb-2">📋 Sharing Requirements</h3>
              <p className="text-sm">
                All data sharing requires <strong>written agreements</strong> specifying purpose, retention period,
                and safeguards in compliance with Regulation 21 of LN 263/2021. We conduct due diligence
                on all processors to ensure adequate data protection measures.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">5.</span>
            <span className="ml-3">Data Retention & Security</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Personal data is retained only for as long as is necessary for the purposes stated in this policy,
              in accordance with our <strong className="text-white">Data Retention Schedule</strong>. After that, it is securely deleted
              or anonymised.
            </p>

            <div className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-400">
              <h3 className="font-semibold text-red-400 mb-2">Durations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Financial records: Retained for <strong>7 years</strong> for audit and tax purposes</li>
                <li>Project files: Retained for up to <strong>3 years</strong> after project completion</li>
                <li>User profiles: Deleted <strong>1 year</strong> after account inactivity</li>
              </ul>
            </div>

            <div className="bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-primary mb-2">🛡️ Security Measures</h3>
              <p className="text-sm">
                We employ a combination of technical, administrative, and physical safeguards to ensure data
                integrity, confidentiality, and availability. These measures include encryption, access controls,
                regular audits, and staff training, aligned with industry standards and regulatory requirements.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="!bg-gradient-to-r from-primary to-purple !text-transparent !bg-clip-text">6.</span>
            <span className="ml-3">Your Rights as a Data Subject</span>
          </h2>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              In accordance with the <strong className="text-white">Data Protection Act, 2019</strong>, you have the following rights:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access and retrieve a copy of your data within <strong>21 days</strong> upon request</li>
                  <li>Request correction of inaccurate or incomplete data</li>
                  <li>Demand deletion of data processed unlawfully</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Object to or restrict data processing based on legitimate grounds</li>
                  <li>Request data portability to another controller</li>
                  <li>Withdraw consent at any time (without affecting prior lawful processing)</li>
                </ul>
              </div>
            </div>

            <p>
              All requests should be submitted to our Data Protection Officer
              through the contact details provided below. We are committed to responding
              promptly and within statutory timeframes, free of charge.
            </p>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-lg font-medium text-white mb-4">
            7. Automated Decision-Making
          </h2>
          <p className="text-gray-300 leading-relaxed">
            If we use automated profiling or decision-making, you’ll be
            informed of the logic involved and have the right to human review
            and objection under the Act.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-lg font-medium text-white mb-4">
            8. Data Protection Officer & Complaints
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We are registered with the ODPC and may appoint a Data Protection
            Officer. You may lodge complaints with the Data Commissioner or
            through our internal complaints process.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <h2 className="text-lg font-medium text-white mb-4">
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
              className="text-primary-400 hover:underline cursor-pointer"
            >
              info@andishi.dev
            </a>
            <br />
            Phone:{" "}
            <a href="tel:+254759912373" className="text-primary-400 hover:underline cursor-pointer">
              +254 759 912 373
            </a>
          </p>
        </motion.section>
      </div>
      <ScrollToTop />
    </motion.div>
  );
};

export default PrivacyPolicyPage;
