"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 animate-pulse" />
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      {mounted && (
        <>
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </>
      )}
    </button>
  );
}

// Compact version for mobile or tight spaces
export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-white/10 border border-white/20 animate-pulse">
        <div className="w-5 h-5" />
      </button>
    );
  }

  const current = resolvedTheme || theme;
  const Icon = current === "dark" ? Moon : Sun;

  return (
    <button
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="px-2 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${current === "dark" ? "light" : "dark"} theme`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
