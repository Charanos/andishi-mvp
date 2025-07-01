"use client";
import { motion } from "framer-motion";
import BlogsSection from "./blogs/page";
import Services from "./sections/Services";
import HowItWorks from "./sections/HowWeDoIt";
import Newsletter from "./sections/Newsletter";
import WhyAndishi from "./sections/WhyAndishi";
import StatsSection from "./sections/MiniStats";
import HeroSection from "./sections/HeroSection";
import ClientReviews from "./sections/ClientReviews";
import ProjectsShowcase from "./sections/ProjectsShowcase";
import ClientDashboardSection from "./sections/ClientDashboardDisplay";
import DevDashboardSection from "./sections/DevDashboardDisplay";
import LatestInsights from "./sections/LatestInsights";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
} as const;

export default function HomePage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.8, ease: "easeOut" },
        }}
      >
        <HeroSection />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <StatsSection />
      </motion.div>

      {/* Add proper IDs for smooth scrolling */}
      <motion.div
        id="why"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <WhyAndishi />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <HowItWorks />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <DevDashboardSection />
      </motion.div>

      <motion.div
        id="services"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Services />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ClientDashboardSection />
      </motion.div>

      <motion.div
        id="projects"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ProjectsShowcase />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ClientReviews />
      </motion.div>

      <motion.div
        id="blogs"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <LatestInsights />
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Newsletter />
      </motion.div>
    </motion.main>
  );
}
