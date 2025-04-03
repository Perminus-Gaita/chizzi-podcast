"use client";
import { useState, useEffect, useCallback } from 'react';

export function useThemeSwitcher() {
  const preferDarkQuery = "(prefers-color-scheme:dark)";
  const storageKey = "theme";

  const [mode, setMode] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getUserPreference = () => {
      const userPref = window.localStorage.getItem(storageKey);
      if (userPref) {
        return userPref;
      }
      return window.matchMedia(preferDarkQuery).matches ? "dark" : "light";
    };

    setMode(getUserPreference());
  }, []);

  const toggleTheme = useCallback((theme) => {
    if (!mounted) return;

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem(storageKey, theme);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia(preferDarkQuery);

    const handleChange = () => {
      if (!window.localStorage.getItem(storageKey)) {
        const newMode = mediaQuery.matches ? "dark" : "light";
        setMode(newMode);
        toggleTheme(newMode);
      }
    };

    toggleTheme(mode);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode, mounted, toggleTheme]); // Added toggleTheme to dependencies

  return [mode, setMode, mounted];
}