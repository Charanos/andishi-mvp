"use client";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
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
  const extendedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize extended particle animation
  useEffect(() => {
    const canvas = extendedCanvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }

    // Function to resize canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      console.log('Canvas resized to:', rect.width, 'x', rect.height);
    };

    // Wait for layout to settle, then initialize
    setTimeout(() => {
      resizeCanvas();
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.log('Canvas has zero dimensions, retrying...');
        setTimeout(resizeCanvas, 100);
      }
    }, 100);
    
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    const particles: any[] = [];

    // Create particles for the background animation - EXACT copy from login page
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(60, 60, 80, ${Math.random() * 0.4 + 0.6})`, // Much darker and more opaque particles for high visibility
      });
    }
    
    console.log('Created', particles.length, 'particles');

    const render = () => {
      if (!canvas.width || !canvas.height) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines - EXACT copy from login page
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(70, 70, 90, ${0.5 * (1 - distance / 100)})`; // Much more visible connecting lines
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles - EXACT copy from login page
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x <= 0 || p.x >= canvas.width) p.speedX *= -1;
        if (p.y <= 0 || p.y >= canvas.height) p.speedY *= -1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // Start rendering after a short delay to ensure canvas is ready
    setTimeout(() => {
      console.log('Starting particle animation');
      render();
    }, 200);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Extended particle canvas covering hero and stats sections - positioned on right side only */}
        <div className="absolute right-0 top-0 pointer-events-none z-10 w-1/2" style={{ height: 'calc(100vh + 400px)' }}>
          <canvas 
            ref={extendedCanvasRef} 
            className="w-full h-full"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10
            }}
          />
        </div>
        
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
      </div>

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
        <ProjectsShowcase isHomepage={true} maxProjects={6} />
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
