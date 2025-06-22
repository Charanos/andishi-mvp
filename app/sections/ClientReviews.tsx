import React, { useState } from "react";
import {
  FaStar,
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
} from "react-icons/fa";

export default function ClientReviews() {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      name: "Sarah Johnson",
      position: "CTO, TechStart Inc.",
      avatar: "/avatar1.jpg", // Placeholder - you can replace with real images
      rating: 5,
      review:
        "Andishi transformed our hiring process completely. We found an exceptional React developer within 48 hours who has been with us for over a year. The quality of talent and speed of delivery exceeded all our expectations.",
      project: "E-commerce Platform",
    },
    {
      name: "Michael Chen",
      position: "Founder, AI Innovations",
      avatar: "/avatar2.jpg",
      rating: 5,
      review:
        "The AI-powered matching was spot on. We needed a machine learning engineer with very specific expertise, and Andishi delivered exactly what we were looking for. The developer they matched us with became our lead ML engineer.",
      project: "Computer Vision System",
    },
    {
      name: "Emily Rodriguez",
      position: "Product Manager, FinTech Solutions",
      avatar: "/avatar3.jpg",
      rating: 5,
      review:
        "Working with Andishi was seamless from start to finish. Their vetting process is thorough, and the developers they provide are not just technically skilled but also great communicators and team players.",
      project: "Mobile Banking App",
    },
    {
      name: "David Kumar",
      position: "CEO, BlockChain Ventures",
      avatar: "/avatar4.jpg",
      rating: 5,
      review:
        "We needed a blockchain developer for our DeFi project, and Andishi delivered exactly what we needed. The developer had deep expertise in smart contracts and helped us launch our platform ahead of schedule.",
      project: "DeFi Protocol",
    },
  ];

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section id="reviews" className="py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4">
            What Our <span className="text-purple-400">Clients Say</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what industry leaders say
            about their experience with Andishi
          </p>
        </div>

        {/* Review Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentReview * 100}%)` }}
            >
              {reviews.map((review, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center relative">
                    {/* Quote Icon */}
                    <div className="absolute top-6 left-6 text-blue-400/30">
                      <FaQuoteLeft className="text-2xl" />
                    </div>

                    {/* Avatar */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                          <FaUser className="text-gray-400 text-xl" />
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex justify-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <FaStar
                          key={i}
                          className="text-yellow-400 text-lg mx-0.5"
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-gray-300 text-lg leading-relaxed mb-6 italic">
                      "{review.review}"
                    </blockquote>

                    {/* Client Info */}
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold text-lg">
                        {review.name}
                      </h4>
                      <p className="text-purple-300 text-sm">
                        {review.position}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Project: {review.project}
                      </p>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400/20 rounded-full"></div>
                    <div className="absolute top-4 right-8 w-1 h-1 bg-purple-400/20 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <FaChevronLeft className="text-sm" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReview(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentReview === index
                  ? "bg-blue-400 scale-110"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-400">500+</div>
            <div className="text-gray-400">Happy Clients</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-400">4.9/5</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-pink-400">98%</div>
            <div className="text-gray-400">Client Retention</div>
          </div>
        </div>
      </div>
    </section>
  );
}
