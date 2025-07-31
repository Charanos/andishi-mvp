"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaClock,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaPlus,
  FaFacebook,
  FaInstagram,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaRocket,
  FaCode,
  FaBrain,
  FaDollarSign,
  FaUsers,
  FaShieldAlt,
  FaHeadset,
  FaArrowCircleLeft,
} from "react-icons/fa";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";
import Link from "next/link";

// Dynamic import with SSR disabled
const ContactMap = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="text-center p-6">
        <div className="text-4xl text-blue-400 mb-4">📍</div>
        <p className="text-white font-medium">Ruiru - Kiambu, Kenya</p>
        <p className="text-gray-400 text-sm mt-2">Loading interactive map...</p>
      </div>
    </div>
  ),
});

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactMethod: string[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: "what-is-andishi",
    question: "What is Andishi?",
    answer:
      "Andishi is a global tech talent platform that connects companies with pre-vetted senior developers. We specialize in remote hiring, matching you with experts in web development, mobile apps, AI/ML, blockchain, and other cutting-edge technologies. Think of us as your bridge to world-class talent that's ready to contribute from day one.",
    category: "getting-started",
    icon: <FaRocket className="text-blue-400" />,
  },
  {
    id: "how-to-get-started",
    question: "How do I get started?",
    answer:
      "Simple! Visit our website and click 'Get Started' or 'Share Project Details.' Fill out a quick form about what you need, and we'll have one of our advisors reach out within 24 hours to discuss your project and kick off the matching process. You can also email us at info@andishi.dev or give us a call.",
    category: "getting-started",
    icon: <FaRocket className="text-blue-400" />,
  },
  {
    id: "how-fast-matching",
    question: "How quickly can you find me a developer?",
    answer:
      "We promise to show you qualified candidates within 48 hours of receiving your project details. Most clients start interviewing developers within 2-3 days of contacting us. Our AI-powered matching cuts traditional hiring time by about 75%.",
    category: "getting-started",
    icon: <FaRocket className="text-blue-400" />,
  },
  {
    id: "what-services",
    question: "What kind of projects do you handle?",
    answer:
      "We cover the full spectrum of modern software development: Web Development (React, Next.js, Node.js, Python), Mobile Apps (React Native, Flutter, Swift, Kotlin), AI & Machine Learning (TensorFlow, PyTorch, OpenAI), and Blockchain & Web3 (Smart contracts, DeFi, NFTs). Whether you need an e-commerce site, enterprise dashboard, or cutting-edge AI application, we've got you covered.",
    category: "services",
    icon: <FaCode className="text-purple-400" />,
  },
  {
    id: "ai-integration",
    question: "How do you use AI in your projects?",
    answer:
      "AI isn't just a buzzword for us - it's core to what we do. Our teams include AI/ML specialists who build custom machine learning models, predictive analytics systems, computer vision applications, and intelligent automation tools. We follow an 'AI-first design philosophy,' helping you integrate AI capabilities from the ground up.",
    category: "ai",
    icon: <FaBrain className="text-green-400" />,
  },
  {
    id: "pricing-structure",
    question: "How much does it cost?",
    answer:
      "Pricing is customized based on your specific needs, project scope, and developers required. We work on hourly or project-based rates with no upfront placement fees. Our model delivers significant savings - typically around 60% compared to traditional recruiting agencies - because we eliminate hefty middleman markups while maintaining top-tier quality.",
    category: "pricing",
    icon: <FaDollarSign className="text-yellow-400" />,
  },
  {
    id: "developer-vetting",
    question: "How do you vet your developers?",
    answer:
      "Every developer goes through rigorous screening: technical assessments, in-depth interviews, reference checks, and portfolio reviews. We have 100+ thoroughly vetted senior-level developers with a 4.9/5 client satisfaction score and 94% long-term placement success rate.",
    category: "quality",
    icon: <FaUsers className="text-indigo-400" />,
  },
  {
    id: "security-confidentiality",
    question: "How do you handle security and confidentiality?",
    answer:
      "Security is non-negotiable. We provide 100% secure data protection, NDA coverage for every engagement, confidential handling of your code and project information, and secure communication channels. Your intellectual property is always protected.",
    category: "security",
    icon: <FaShieldAlt className="text-red-400" />,
  },
  {
    id: "support-provided",
    question: "What kind of support do you provide?",
    answer:
      "We're with you every step: 24/7 availability for questions, direct access to your development team, dedicated account management, and post-launch support. You'll have access to our Client Dashboard for real-time progress tracking, direct team chat, and smart notifications.",
    category: "support",
    icon: <FaHeadset className="text-cyan-400" />,
  },
];

const categories = [
  { id: "all", name: "All Questions", icon: <FaQuestionCircle /> },
  { id: "getting-started", name: "Getting Started", icon: <FaRocket /> },
  { id: "services", name: "Services", icon: <FaCode /> },
  { id: "ai", name: "AI & Innovation", icon: <FaBrain /> },
  { id: "pricing", name: "Pricing", icon: <FaDollarSign /> },
  { id: "quality", name: "Quality", icon: <FaUsers /> },
  { id: "security", name: "Security", icon: <FaShieldAlt /> },
  { id: "support", name: "Support", icon: <FaHeadset /> },
];

export default function ContactUsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactMethod: [],
  });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Toast notifications
  const {
    notifications: toastNotifications,
    removeNotification: removeToastNotification,
    toast,
  } = useToast();

  const [activeTab, setActiveTab] = useState<"contact" | "faq">("contact");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const contactMethods = ["Email", "Phone", "WhatsApp"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleContactMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      contactMethod: prev.contactMethod.includes(method)
        ? prev.contactMethod.filter((m) => m !== method)
        : [...prev.contactMethod, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields", "", 5000);
      return;
    }

    try {
      setSubmitStatus("loading");
      toast.info("Sending your message...", "", 5000);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (res.status === 201) {
        setSubmitStatus("success");
        toast.success(
          "Message sent successfully!",
          "We'll get back to you soon.",
          5000
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          contactMethod: [],
        });
      } else {
        setSubmitStatus("error");
        const result = await res.json();
        toast.error(
          "Failed to send message.",
          result.message || "Please try again.",
          5000
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      toast.error("An error occurred.", "Please try again.", 5000);
    }
  };

  const filteredFAQs =
    selectedCategory === "all"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <>
      <section className="min-h-screen py-6 sm:py-10 relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 my-6 sm:my-10">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-4">
              Contact <span className="text-purple-400">Andishi</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Get in touch with our team or find answers to common questions
              about our services, partnerships, and more.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300 flex items-center cursor-pointer ${
                  activeTab === "contact"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaPaperPlane className="mr-2" />
                <span className="hidden sm:inline">Contact Us</span>
                <span className="sm:hidden">Contact</span>
              </button>
              <button
                onClick={() => setActiveTab("faq")}
                className={`px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300 flex items-center cursor-pointer ${
                  activeTab === "faq"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaQuestionCircle className="mr-2" />
                <span>FAQ</span>
              </button>
            </div>
          </div>

          {/* Contact Tab Content */}
          {activeTab === "contact" && (
            <>
              {/* Map Section */}
              <div className="w-full mb-8 sm:mb-16">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <ContactMap className="w-full" height="400px" />
                </div>
              </div>

              {/* Form and Contact Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
                {/* Contact Form */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-8 py-6 sm:py-10 shadow-2xl">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 flex items-center">
                    <FaPaperPlane className="mr-3 text-blue-400" />
                    Send us a message
                  </h2>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Your Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder="+254 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                        placeholder="Tell us about your project or inquiry..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Preferred Contact Method
                      </label>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {contactMethods.map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => toggleContactMethod(method)}
                            className={`px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 text-sm flex items-center cursor-pointer ${
                              formData.contactMethod.includes(method)
                                ? "bg-blue-500/20 border-blue-400 text-blue-300"
                                : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                            }`}
                          >
                            {method}
                            {formData.contactMethod.includes(method) ? (
                              <FaCheck className="ml-2 text-xs" />
                            ) : (
                              <FaPlus className="ml-2 text-xs" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      className={`w-full py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        submitStatus === "loading"
                          ? "bg-blue-500/50 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25"
                      }`}
                    >
                      {submitStatus === "loading" ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <FaPaperPlane className="ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Contact Cards */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                      Our Contact Info
                    </h3>

                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <FaMapMarkerAlt className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium uppercase text-sm sm:text-base">
                            Location
                          </h4>
                          <p className="text-gray-400 text-sm sm:text-base">
                            Ruiru, Kiambu - Kenya
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <FaEnvelope className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="uppercase font-medium text-sm sm:text-base">
                            Email
                          </h4>
                          <a
                            href="mailto:info@andishi.dev"
                            className="text-gray-400 hover:text-blue-300 transition-colors cursor-pointer text-sm sm:text-base"
                          >
                            info@andishi.dev
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <FaPhone className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="uppercase font-medium text-sm sm:text-base">
                            Phone / Whatsapp
                          </h4>
                          <a
                            href="tel:+254759912373"
                            className="text-gray-400 hover:text-blue-300 transition-colors cursor-pointer text-sm sm:text-base"
                          >
                            +254 759 912 373
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <FaClock className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="uppercase font-medium text-sm sm:text-base">
                            Hours
                          </h4>
                          <p className="text-gray-400 text-sm sm:text-base">
                            Monday - Friday: 9:00 AM - 5:00 PM EAT
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                      <FaGlobe className="mr-3 text-blue-400" />
                      Connect With Us
                    </h3>

                    <div className="flex space-x-3 sm:space-x-4">
                      <a
                        href="https://www.facebook.com/andishi.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-400 transition-colors cursor-pointer"
                        aria-label="Facebook"
                      >
                        <FaFacebook />
                      </a>
                      <a
                        href="https://linkedin.com/company/andishi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-400 transition-colors cursor-pointer"
                        aria-label="LinkedIn"
                      >
                        <FaLinkedin />
                      </a>
                      <a
                        href="https://www.instagram.com/andishi.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gray-500/20 hover:border-gray-400 transition-colors cursor-pointer"
                        aria-label="Instagram"
                      >
                        <FaInstagram />
                      </a>
                      <a
                        href="https://x.com/AndishiSoftware"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-400/20 hover:border-blue-300 transition-colors cursor-pointer"
                        aria-label="Twitter"
                      >
                        <FaTwitter />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* FAQ Tab Content */}
          {activeTab === "faq" && (
            <div className="space-y-6 sm:space-y-8">
              {/* FAQ Category Filter */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                  <FaQuestionCircle className="mr-3 text-purple-400" />
                  Frequently Asked Questions
                </h2>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 text-xs sm:text-sm flex items-center cursor-pointer ${
                        selectedCategory === category.id
                          ? "bg-purple-500/20 border-purple-400 text-purple-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="mr-1 sm:mr-2">{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">
                        {category.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 sm:mr-4">{faq.icon}</span>
                        <h3 className="text-sm sm:text-lg font-medium text-white">
                          {faq.question}
                        </h3>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <FaChevronUp className="text-gray-400 flex-shrink-0 ml-2" />
                      ) : (
                        <FaChevronDown className="text-gray-400 flex-shrink-0 ml-2" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                        <div className="ml-7 sm:ml-10 text-sm sm:text-base text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FAQ Call to Action */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  We're always happy to chat with potential partners. Contact us
                  anytime!
                </p>
                <button
                  onClick={() => setActiveTab("contact")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center mx-auto cursor-pointer"
                >
                  <FaPaperPlane className="mr-2" />
                  Contact Us Now
                </button>
              </div>
            </div>
          )}

          {/* Back to Home Button */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              <FaArrowCircleLeft className="w-5 h-5" />
              <span className="text-xs monty uppercase">Back to Home</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Toast Notifications */}
      <ToastContainer
        notifications={toastNotifications}
        onRemoveNotification={removeToastNotification}
        position="top-right"
      />
    </>
  );
}
