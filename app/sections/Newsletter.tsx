import React, { useState } from "react";
import {
  FaBell,
  FaEnvelope,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1500);
  };

  const benefits = [
    "Weekly insights on remote hiring trends",
    "Exclusive developer talent reports",
    "Early access to new features",
    "Industry best practices and tips",
  ];

  if (isSubscribed) {
    return (
      <section id="newsletter" className="py-32 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-12">
            <div className="text-green-400 mb-6">
              <FaCheckCircle className="text-6xl mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Thanks for Subscribing!
            </h2>
            <p className="text-gray-300 text-lg">
              You'll receive our latest insights and updates in your inbox soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="newsletter" className="py-16 mt-16 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="relative overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12 text-center">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-8 left-8 text-6xl text-blue-400">
              <FaEnvelope />
            </div>
            <div className="absolute bottom-8 right-8 text-4xl text-purple-400">
              <FaBell />
            </div>
          </div>

          <div className="relative z-10">
            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
                Stay Updated with{" "}
                <span className="text-purple-400">Andishi</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Get the latest insights on remote hiring, developer trends, and
                platform updates delivered straight to your inbox
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Subscription Form */}
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-purple-400/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-6 w-1 h-1 bg-pink-400/20 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    </section>
  );
}
