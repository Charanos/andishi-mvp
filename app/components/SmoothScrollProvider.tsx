"use client";
import { ReactNode } from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  useSmoothScroll();
  return <>{children}</>;
}
