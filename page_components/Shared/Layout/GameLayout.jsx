"use client";
import { useRef, useState, useEffect } from "react";

import ProtectedAppLayout from "@/components/Auth/ProtectedAppLayout";

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
    <ProtectedAppLayout>
      <div style={{ width: "100%", height: "100%" }}>
        <main
          className={`
            flex-1 bg-light dark:bg-dark
            transition-all duration-300 min-h-screen
            overflow-x-auto
          `}
        >
          {children}
        </main>
      </div>
    </ProtectedAppLayout>
  );
}
