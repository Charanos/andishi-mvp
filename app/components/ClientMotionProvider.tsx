"use client";
import { ReactNode, useEffect } from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

interface ClientMotionProviderProps {
  children: ReactNode;
}

export default function ClientMotionProvider({
  children,
}: ClientMotionProviderProps) {
  useSmoothScroll();

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      // Close any open mobile menus
      document.body.style.overflow = "unset";
    };

    // Listen for route changes
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return <>{children}</>;
}
