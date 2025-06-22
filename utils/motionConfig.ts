import { MotionConfig } from 'framer-motion';

// Wrap your app with this for better performance
export const motionConfig = {
  transition: { duration: 0.3 },
  // Reduce motion for users who prefer it
  reducedMotion: "user",
};