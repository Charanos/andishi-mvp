"use client";

import { FaArrowUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 },
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 },
          }}
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
