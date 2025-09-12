"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaExclamationTriangle,
  FaHome,
  FaArrowLeft,
  FaShieldAlt,
  FaUserSlash,
} from "react-icons/fa";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <section className="min-h-screen py-16 relative overflow-hidden bg-gray-50 dark:bg-transparent flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/30 dark:bg-red-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200/30 dark:bg-orange-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-200/30 dark:bg-yellow-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-red-200/20 dark:bg-red-500/6 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Main Content Card */}
        <div className="backdrop-blur-md bg-white/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-8 py-12 shadow-xl">
          {/* Icon Section */}
          <div className="mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <FaLock className="text-4xl text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 dark:bg-orange-500/30 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-orange-600 dark:text-orange-400 text-sm" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-6xl lg:text-8xl font-semibold text-gray-300 dark:text-white/20 mb-2">
              401
            </h1>
            <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white mb-4">
              Access{" "}
              <span className="text-red-600 dark:text-red-400">Denied</span>
            </h2>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Sorry, you don't have permission to access this resource. You may
              need to log in or contact an administrator for access.
            </p>

            {/* Features/Reasons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="backdrop-blur-sm bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-4">
                <FaUserSlash className="text-red-600 dark:text-red-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Authentication Required
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-4">
                <FaShieldAlt className="text-orange-600 dark:text-orange-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Protected Content
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-4">
                <FaLock className="text-yellow-600 dark:text-yellow-400 text-xl mb-2 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restricted Access
                </p>
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
              Go to Homepage
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-8 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Need help? Contact our support team:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a
                href="mailto:info@andishi.com"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                info@andishi.com
              </a>
              <span className="hidden sm:inline text-gray-400 dark:text-gray-600">
                |
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Monday - Friday: 9:00 AM - 5:00 PM EAT
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
