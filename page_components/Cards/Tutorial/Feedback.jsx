"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";

const Feedback = ({ message, onClose, autoHide = true, duration = 2000 }) => {
  const isMobile = useIsMobile();

  const positionStyles = isMobile
    ? {
        // On mobile, position at bottom above player's hand
        position: "fixed", // Change to fixed to ensure it stays in viewport
        bottom: "130px",
        left: "16px", // Add padding from sides
        right: "16px", // Add padding from sides
        width: "auto", // Let width be determined by left/right padding
        transform: "none", // Remove transform since we're using left/right
        maxWidth: "100%", // Allow full width on mobile
        margin: "0 auto",
      }
    : {
        // Desktop position (top-right)
        position: "absolute",
        top: "24px",
        right: "16px",
        maxWidth: "320px",
      };

  useEffect(() => {
    let timer;
    if (autoHide) {
      timer = setTimeout(onClose, duration);
    }
    return () => clearTimeout(timer);
  }, [autoHide, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 20 : 0, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? 20 : 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 backdrop-blur-sm
              border border-gray-200 dark:border-gray-700
              shadow-lg dark:shadow-black/20
              rounded-xl p-2 md:p-4 z-50"
      style={positionStyles}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-gray-900 dark:text-white">Tip</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 text-gray-500 dark:text-gray-400
                   hover:bg-gray-100 dark:hover:bg-gray-700
                   rounded-full flex items-center justify-center"
        >
          <X />
        </Button>
      </div>
    </motion.div>
  );
};

export default Feedback;
