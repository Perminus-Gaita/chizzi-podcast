"use client";
import { useEffect } from "react";
import BottomNavigation from "@/components/Navigation/BottomNavigation";

export default function AppLayout({ children }) {
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <div className="flex relative">
        <main
          className="
          flex-1 bg-light dark:bg-dark py-20 px-4 
          transition-all duration-300 min-h-screen
          overflow-x-auto"
        >
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
