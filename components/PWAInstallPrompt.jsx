"use client";
import React, { useState, useEffect } from "react";
import { X, Download, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installAttempts, setInstallAttempts] = useState(0);

  useEffect(() => {
    // Enhanced installation check
    const isAppInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    // Sophisticated dismissal logic
    const lastDismissalTime = localStorage.getItem("pwaPromptDismissedTime");
    const hasRecentlyDismissed =
      lastDismissalTime &&
      Date.now() - parseInt(lastDismissalTime) < 7 * 24 * 60 * 60 * 1000; // 7 days

    if (!isAppInstalled && !hasRecentlyDismissed) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Delay showing prompt for better engagement
        setTimeout(() => setShowPrompt(true), 2000);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Track installation success
      window.addEventListener("appinstalled", () => {
        localStorage.setItem("appInstalled", "true");
        setShowPrompt(false);
        // You could emit an analytics event here
      });

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallAttempts((prev) => prev + 1);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        // Success state
        localStorage.setItem("appInstalled", "true");
      } else {
        // If dismissed, remember the time
        localStorage.setItem("pwaPromptDismissedTime", Date.now().toString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("Installation failed:", error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwaPromptDismissedTime", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Alert className="relative bg-white shadow-lg border-2 border-blue-100 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="text-blue-600 h-5 w-5" />
          <AlertTitle className="text-lg font-semibold text-blue-900">
            Unlock Desktop Experience
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2 text-gray-600">
          {installAttempts === 0
            ? "Get instant access, offline support, and a smoother experience with our desktop app."
            : "Never miss updates and enjoy a faster, native-like experience on your desktop."}
        </AlertDescription>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            <Download className="h-4 w-4" />
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Not Now
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </Alert>
    </div>
  );
};

export default PWAInstallPrompt;
