"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaHeart,
  FaPhone,
  FaGithub,
  FaTwitter,
  FaArrowUp,
  FaLinkedin,
  FaEnvelope,
  FaFacebook,
  FaMapMarkerAlt,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about-us" },
      { name: "Our Team", href: "/about-us" },
      { name: "Careers", href: "/join-talent-pool" },
      { name: "Contact", href: "/contact-us" },
    ],
    resources: [
      { name: "Blog", href: "/feaured-blog" },
      { name: "Case Studies", href: "#case-studies" },
      { name: "Developer Guide", href: "#guide" },
      { name: "API Documentation", href: "#docs" },
    ],
    legal: [
      { name: "Developer Terms of Service", href: "/legal/terms-of-service" },
      { name: "Developer Privacy Policy", href: "/legal/privacy-policy" },
      {
        name: "Client Terms of Service",
        href: "/legal/client-terms-of-service",
      },
      { name: "Client Privacy Policy", href: "/legal/client-privacy-policy" },
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "https://x.com/AndishiSoftware",
      color: "hover:text-blue-400",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "https://www.instagram.com/andishi.dev/",
      color: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "https://www.linkedin.com/company/andishi/",
      color: "hover:text-blue-500",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "https://www.linkedin.com/company/andishi/",
      color: "hover:text-blue-500",
    },
    {
      name: "Email",
      icon: FaEnvelope,
      href: "mailto:info@andishi.dev",
      color: "hover:text-green-400",
    },
  ];

  return (
    <footer className="relative overflow-hidden mt-10 border-t dark:border-gray-400/40 border-gray-400/40 pt-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 relative z-10 ">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-3xl font-semibold text-gray-900 dark:!text-gray-100 mb-2 monty uppercase">
                  Andishi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                  Connecting exceptional remote developers with innovative
                  companies worldwide. Building the future of tech, one perfect
                  match at a time.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                  <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">
                    Nairobi - Kenya & Remote Worldwide
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                  <FaPhone className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">+254 759 912 373</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                  <FaEnvelope className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">info@andishi.dev</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className={`p-3 rounded-full backdrop-blur-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20`}
                      aria-label={social.name}
                      target="_blank"
                    >
                      <IconComponent className="text-lg" />
                    </Link>
                  );
                })}
              </div>

              <Image
                src="/logo.svg"
                alt="Andishi Logo"
                width={50}
                height={50}
                className="sm:mt-80 mt-0 absolute sm:bottom-40 sm:right-30 top-0 right-10 w-20 h-auto sm:w-22 md:h-auto animate-fade-in"
              />
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-600 dark:!text-gray-400 uppercase">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-700 dark:text-gray-200 text-[15.6px] hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 inline-block transform"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>© 2025 Andishi. Made with</span>
              <FaHeart className="text-red-500 dark:text-red-400 animate-pulse" />
              <span>for developers worldwide</span>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-gray-600 dark:text-gray-500 text-sm">
                Scroll to top
              </span>
              <button
                onClick={scrollToTop}
                className="p-3 rounded-full backdrop-blur-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 hover:scale-110 group"
                aria-label="Scroll to top"
              >
                <FaArrowUp className="text-sm group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional floating particles */}
      <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
    </footer>
  );
}
