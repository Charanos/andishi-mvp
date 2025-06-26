"use client";

import Image from "next/image";
import React from "react";
import {
  FaHeart,
  FaPhone,
  FaGithub,
  FaTwitter,
  FaArrowUp,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Team", href: "#team" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
    services: [
      { name: "Web Development", href: "#web-dev" },
      { name: "Mobile Development", href: "#mobile-dev" },
      { name: "AI/ML Solutions", href: "#ai-ml" },
      { name: "Blockchain/Web3", href: "#blockchain" },
    ],
    resources: [
      { name: "Blog", href: "/feaured-blog" },
      { name: "Case Studies", href: "#case-studies" },
      { name: "Developer Guide", href: "#guide" },
      { name: "API Documentation", href: "#docs" },
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
      name: "Email",
      icon: FaEnvelope,
      href: "mailto:info@andishi.dev",
      color: "hover:text-green-400",
    },
  ];

  return (
    <footer className="relative overflow-hidden mt-16">
      {/* Ambient background effects */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 ">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-3xl font-bold !text-gray-100 mb-2 monty uppercase">
                  Andishi
                </h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Connecting exceptional remote developers with innovative
                  companies worldwide. Building the future of tech, one perfect
                  match at a time.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-200 transition-colors duration-300">
                  <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">
                    Nairobi - Kenya & Remote Worldwide
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-200 transition-colors duration-300">
                  <FaPhone className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">+254 748 825157</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-200 transition-colors duration-300">
                  <FaEnvelope className="text-blue-600 flex-shrink-0" />
                  <span className="text-md">info@andishi.dev</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`p-3 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:border-white/20`}
                      aria-label={social.name}
                    >
                      <IconComponent className="text-lg" />
                    </a>
                  );
                })}
              </div>

              <Image
                src="./logo.svg"
                alt="Andishi Logo"
                width={50}
                height={50}
                className="sm:mt-80 mt-0 absolute sm:bottom-40 sm:right-30 top-0 right-10 w-20 h-auto sm:w-22 md:h-auto animate-fade-in"
              />
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-semibold !text-gray-400 uppercase">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-200 text-[15.6px] hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 inline-block transform"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© 2025 Andishi. Made with</span>
              <FaHeart className="text-red-400 animate-pulse" />
              <span>for developers worldwide</span>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-gray-500 text-sm">Scroll to top</span>
              <button
                onClick={scrollToTop}
                className="p-3 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110 group"
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
