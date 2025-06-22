"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaHome,
  FaArrowLeft,
  FaCompass,
  FaQuestionCircle,
  FaRocket,
  FaMoon,
  FaStar,
} from "react-icons/fa";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <section className="min-h-screen py-16 relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-indigo-900/10 flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-cyan-500/6 rounded-full blur-3xl animate-pulse"></div>

        {/* Floating elements for space theme */}
        <div className="absolute top-1/4 left-1/3 text-white/5 text-2xl animate-bounce">
          <FaStar />
        </div>
        <div className="absolute top-3/4 right-1/3 text-white/5 text-xl animate-pulse">
          <FaMoon />
        </div>
        <div
          className="absolute top-1/2 left-1/5 text-white/5 text-3xl animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <FaRocket />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Main Content Card */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-8 py-12 shadow-2xl">
          {/* Icon Section */}
          <div className="mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <FaCompass className="text-4xl text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <FaQuestionCircle className="text-purple-400 text-sm" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-6xl lg:text-8xl font-bold text-white/20 mb-2">
              404
            </h1>
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Page <span className="text-purple-400">Not Found</span>
            </h2>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              Houston, we have a problem! The page you're looking for seems to
              have drifted into deep space. Let's help you navigate back to
              familiar territory.
            </p>

            {/* Helpful suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                <FaSearch className="text-blue-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-400">Check the URL spelling</p>
              </div>
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                <FaHome className="text-purple-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-400">Visit our homepage</p>
              </div>
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                <FaCompass className="text-cyan-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-400">Use navigation menu</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <FaHome className="mr-2" />
              Back to Home
            </Link>

            <button
              onClick={() => router.back()}
              className="cursor-pointer inline-flex items-center px-8 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-4">Popular destinations:</p>
            <div className="flex flex-wrap gap-4 justify-center items-center text-sm">
              <Link
                href="/about-us"
                className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:border-blue-400/30"
              >
                About Us
              </Link>
              <Link
                href="/tech-talent-pool"
                className="text-purple-400 hover:text-purple-300 transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:border-purple-400/30"
              >
                Our Tech Talent Pool
              </Link>
              <Link
                href="/contact-us"
                className="text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:border-cyan-400/30"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Support Information */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2">
              Still lost? We're here to help:
            </p>
            <a
              href="mailto:info@andishi.com"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              info@andishi.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
