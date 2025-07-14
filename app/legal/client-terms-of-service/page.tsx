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
      title="Client Terms of Service"
      lastUpdated="July 14, 2025"
    >
      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Agreement to Terms</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            By engaging Andishi MVP for services, you agree to these Terms.
            These Terms supplement and form the foundation of any
            project-specific Statement of Work (SOW) or signed agreement.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-400 mb-2">Professional Services</h3>
            <p className="text-sm">
              Our services are designed for businesses seeking high-quality software development,
              staff augmentation, and technology consulting solutions.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Scope of Work</span>
        </h2>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            Our services may include software development, staff augmentation,
            or other technology services as outlined in your signed project
            documents.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-2">Software Development</h3>
              <ul className="text-sm space-y-1">
                <li>• Web applications</li>
                <li>• Mobile applications</li>
                <li>• API development</li>
                <li>• Database design</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-400 mb-2">Staff Augmentation</h3>
              <ul className="text-sm space-y-1">
                <li>• Skilled developers</li>
                <li>• Project managers</li>
                <li>• Technical architects</li>
                <li>• Quality assurance</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
              <h3 className="font-semibold text-purple-400 mb-2">Consulting</h3>
              <ul className="text-sm space-y-1">
                <li>• Technology strategy</li>
                <li>• Code reviews</li>
                <li>• Architecture planning</li>
                <li>• Performance optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Client Obligations</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            You are expected to provide timely access, approvals, and
            cooperation as required to avoid project delays or scope changes.
            Non-performance on the client's side may result in deadline
            adjustments or contract review.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-orange-400">
            <h3 className="font-semibold text-orange-400 mb-2">Client Responsibilities</h3>
            <p className="text-sm">
              Timely feedback, resource access, and clear communication are essential
              for project success. Delays in client deliverables may impact project timelines.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Payments & Fees</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Invoices will be issued as per project-specific agreements and are
            payable within 14 days unless otherwise agreed. Late payments may
            attract service suspension or additional fees.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-400 mb-2">Payment Terms</h3>
            <p className="text-sm">
              Standard payment terms are Net 14 days. Late payments may incur interest charges
              or temporary service suspension until account is brought current.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Ownership & Intellectual Property</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Unless otherwise agreed, intellectual property created under a
            contract is transferred to the client upon full payment of all
            dues. Prior assets (e.g., templates, libraries) remain property of
            Andishi MVP unless licensed otherwise.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="font-semibold text-purple-400 mb-2">IP Transfer</h3>
            <p className="text-sm">
              Custom code and designs created specifically for your project transfer
              to you upon full payment. Pre-existing tools and frameworks remain our property.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Confidentiality</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Both parties agree to protect confidential information and not
            disclose it to any third party except as required by law or
            contractual obligations. Confidentiality survives the contract
            term.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-400 mb-2">Information Security</h3>
            <p className="text-sm">
              All client data, business processes, and proprietary information
              are treated with strict confidentiality and protected according to industry standards.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Limitation of Liability</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Andishi MVP's total liability shall not exceed the fees paid for
            the relevant project. We are not liable for indirect or
            consequential damages unless explicitly agreed.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="font-semibold text-red-400 mb-2">Liability Limitations</h3>
            <p className="text-sm">
              Our maximum liability is capped at the project value. We disclaim liability
              for lost profits, business interruption, or consequential damages.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Termination</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Either party may terminate the contract with 14 days' written
            notice. If there is a breach, the other party may terminate
            immediately if the issue is not resolved within 7 days of written
            notice.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-yellow-400">
            <h3 className="font-semibold text-yellow-400 mb-2">Termination Process</h3>
            <p className="text-sm">
              Standard termination requires 14 days notice. Immediate termination
              for breach requires 7-day cure period. Work completed to termination date will be invoiced.
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
            This agreement shall be governed by the laws of Kenya. Any
            disputes will be handled in the courts of Nairobi, unless
            otherwise agreed in writing.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-400 mb-2">Jurisdiction</h3>
            <p className="text-sm">
              All legal matters are subject to Kenyan law and the jurisdiction of Nairobi courts.
              Alternative dispute resolution may be considered by mutual agreement.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="ml-3">Contact Information</span>
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            If you have any questions or requests regarding these terms, please reach us at:
          </p>
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
            <h3 className="font-semibold text-green-400 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Company:</strong> Andishi MVP</p>
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