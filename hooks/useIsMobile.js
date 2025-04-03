import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");

      const handleMediaQueryChange = (e) => {
        setIsMobile(e.matches);
      };

      // Set initial value
      setIsMobile(mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener("change", handleMediaQueryChange);

      // Cleanup
      return () =>
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }
  }, []);

  return isMobile;
};
