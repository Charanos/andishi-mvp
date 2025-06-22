import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center py-16 sm:py:0">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/50 to-purple-900/50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-blue-900/30"></div>

      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col-reverse justify-between lg:flex-row items-center h-full">
        {/* Left column: text & CTAs */}
        <div className="w-full lg:w-2/3 text-white">
          {/* Live indicator with glassmorphic design */}
          <div className="flex items-center space-x-3 text-sm w-fit group">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
              </span>
              <span className="text-green-400 font-mediummonty ">Live</span>
            </div>

            <div className="monty px-4 py-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10">
              <span className="text-white font-medium">
                10 teams building now
              </span>
            </div>

            <div className="monty px-4 py-2 rounded-full backdrop-blur-md bg-purple-500/20 border border-purple-400/30">
              <span className="text-purple-300 font-medium">
                48hr special pricing
              </span>
            </div>
          </div>

          {/* Main heading with gradient text */}
          <div className="space-y-2 mb-10 mt-3">
            <h1 className="text-4xl lg:text-6xl font-semibold leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Global Tech Excellence,
              </span>
              <br />
              <span className="bg-gradient-to-r font-semibold from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                On Demand
              </span>
            </h1>

            <div className="flex items-center space-x-3">
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
              <p className="text-lg text-gray-300 font-medium tracking-wide uppercase">
                Connect with vetted developers in 48 hours
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-300 my-6 leading-relaxed max-w-2xl">
            Skip the lengthy recruitment process. Andishi's intelligent talent
            matching platform connects you with expert developers specializing
            in web development, mobile apps, AI/ML, blockchain, and SaaS
            solutions. Our rigorous vetting process ensures you get senior-level
            talent ready to contribute from day one.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row my-6 gap-4 pt-4">
            <Link
              href="/start-project"
              className="group relative px-8 py-4 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center space-x-2 uppercase tracking-wide">
                <span>Share Project Details</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>

            <Link
              href="/tech-talent-pool"
              className="group px-8 py-4 backdrop-blur-md bg-white/5 border-2 border-blue-400/50 text-blue-300 rounded-full font-semibold hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center justify-center space-x-2 uppercase tracking-wide">
                <span>Explore Our Talent Pool</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-8 pt-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-gray-800 flex items-center justify-center text-xs font-semibold text-white"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm">1000+ developers vetted</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm">4.9/5 client satisfaction</span>
            </div>
          </div>
        </div>

        {/* Right column: illustration with glassmorphic frame */}
        <div className="w-full lg:w-1/3 mb-12 lg:mb-0 flex justify-center">
          <div className="relative group">
            {/* Glassmorphic frame */}
            <div className="absolute inset-0 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500"></div>

            {/* Glowing effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

            {/* Image container */}
            <div className="relative p-8">
              <img
                src="/hero-image.jpg"
                alt="Satellite network illustration representing global tech connectivity"
                className="w-full max-w-md transform group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              />

              {/* Floating elements around image */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400/60 rounded-full animate-pulse"></div>
              <div
                className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 left-2 w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute top-3/4 left-1/3 w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse"
        style={{ animationDelay: "3s" }}
      ></div>
    </section>
  );
}
