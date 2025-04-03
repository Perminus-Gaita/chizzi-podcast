"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState("Good");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimeout;

    const updateStatus = () => {
      const newIsOnline = navigator.onLine;
      setIsOnline(newIsOnline);
      setIsVisible(true);

      if (newIsOnline) {
        hideTimeout = setTimeout(() => setIsVisible(false), 3000);
      }
    };

    const updateConnectionQuality = () => {
      const connection = navigator.connection;
      if (connection) {
        const { effectiveType, downlink } = connection;
        const newQuality =
          effectiveType === "4g" && downlink > 5
            ? "Excellent"
            : effectiveType === "4g" || (effectiveType === "3g" && downlink > 1)
            ? "Good"
            : effectiveType === "3g" ||
              (effectiveType === "2g" && downlink > 0.5)
            ? "Fair"
            : "Poor";

        if (newQuality !== connectionQuality) {
          setConnectionQuality(newQuality);
          setIsVisible(true);
          if (hideTimeout) clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => setIsVisible(false), 3000);
        }
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    if (navigator.connection) {
      navigator.connection.addEventListener("change", updateConnectionQuality);
    }

    updateStatus();
    updateConnectionQuality();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener(
          "change",
          updateConnectionQuality
        );
      }
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [connectionQuality]);

  if (!isVisible && isOnline) return null;

  return (
    <div
      className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50
     flex items-center space-x-1 md:space-x-2 bg-white dark:bg-gray-800 
     p-2 rounded-full shadow-lg transition-opacity duration-300"
    >
      <div
        className={`w-3 h-3 rounded-full ${
          isOnline ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      <span className="text-xs md:text-sm font-medium">
        {isOnline ? connectionQuality : "Offline"}
      </span>
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
    </div>
  );
};

export default NetworkStatus;
