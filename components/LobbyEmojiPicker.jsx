"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LobbyEmojiPicker = ({ onEmojiSelect, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    };

    const handleScroll = () => {
      if (showPicker) setShowPicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showPicker]);

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji);
    setShowPicker(false);
  };

  const getPickerPosition = () => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceAbove = buttonRect.top;
    const spaceBelow = window.innerHeight - buttonRect.bottom;

    // Position picker above the textarea on mobile or when space below is limited
    const isMobile = window.innerWidth <= 640;
    const limitedSpaceBelow = spaceBelow < 400;

    if (isMobile || limitedSpaceBelow) {
      return {
        bottom: window.innerHeight - buttonRect.top + 10,
        right: window.innerWidth <= 640 ? 0 : 10,
      };
    }

    // Default position below the textarea
    return {
      top: buttonRect.bottom + 10,
      right: window.innerWidth <= 640 ? 0 : 10,
    };
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 hover:bg-gray-800",
          showPicker && "bg-gray-800",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => setShowPicker(!showPicker)}
        disabled={disabled}
      >
        <Smile
          className={cn(
            "h-4 w-4",
            showPicker ? "text-blue-400" : "text-gray-400"
          )}
        />
      </Button>

      {showPicker &&
        isMounted &&
        createPortal(
          <div
            ref={pickerRef}
            className="fixed z-[9999]"
            style={getPickerPosition()}
          >
            <div className="shadow-lg rounded-lg border border-gray-700 bg-gray-800">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                previewPosition="none"
                searchPosition="none"
                navPosition="bottom"
                perLine={8}
                maxFrequentRows={1}
                icons="outline"
                skinTonePosition="none"
                emojiSize={20}
                emojiButtonSize={28}
                categories={[
                  "frequent",
                  "people",
                  "nature",
                  "foods",
                  "activity",
                ]}
                style={{
                  width: window.innerWidth <= 640 ? "100%" : "352px",
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LobbyEmojiPicker;
