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
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitStatus("loading");
      toast.info("Sending your message...");

      // Simulate API call
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        setSubmitStatus("success");
        toast.success("Message sent successfully! We'll get back to you soon.");
        // Reset form
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
        toast.error(
          result.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <section className="min-h-screen py-10 relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 my-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Contact <span className="text-purple-400">Andishi</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Get in touch with our team. We'd love to hear about any inquires
              you may have, whether it's about our services, partnerships, or
              just to say hello!
            </p>
          </div>

          {/* Full-width Map Section */}
          <div className="w-full mb-16">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <ContactMap className="w-full" height="500px" />
            </div>
          </div>

          {/* Form and Contact Info in two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <FaPaperPlane className="mr-3 text-blue-400" />
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="flex flex-wrap gap-3">
                    {contactMethods.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => toggleContactMethod(method)}
                        className={`px-4 py-2 rounded-lg border transition-all duration-300 text-sm flex items-center ${
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
                  className={`w-full py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center ${
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
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  Our Contact Info
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaMapMarkerAlt className="text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium uppercase">Location</h4>
                      <p className="text-gray-400">Ruiru, Kiambu - Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaEnvelope className="text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="uppercase font-medium">Email</h4>
                      <a
                        href="mailto:contact@andishi.com"
                        className="text-gray-400 hover:text-blue-300 transition-colors"
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
                      <h4 className="uppercase font-medium">
                        Whatsapp / Phone
                      </h4>
                      <a
                        href="mailto:contact@andishi.com"
                        className="text-gray-400 hover:text-blue-300 transition-colors"
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
                      <h4 className="uppercase font-medium">Hours</h4>
                      <p className="text-gray-400">
                        Monday - Friday: 9:00 AM - 5:00 PM EAT
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <FaGlobe className="mr-3 text-blue-400" />
                  Connect With Us
                </h3>

                <div className="flex space-x-4">
                  <a
                    href="https://linkedin.com/company/andishi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-400 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gray-500/20 hover:border-gray-400 transition-colors"
                    aria-label="GitHub"
                  >
                    <FaGithub />
                  </a>
                  <a
                    href="https://x.com/AndishiSoftware"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-400/20 hover:border-blue-300 transition-colors"
                    aria-label="Twitter"
                  >
                    <FaTwitter />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href={"/"}
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 text-gray-300 monty uppercase hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
