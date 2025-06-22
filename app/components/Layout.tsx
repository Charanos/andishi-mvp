import { ReactNode } from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  useSmoothScroll();

  return <div className="min-h-screen">{children}</div>;
};
