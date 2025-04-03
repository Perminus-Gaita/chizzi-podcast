// "use client";

// import { useState, useRef, useEffect } from "react";
// import Picker from "@emoji-mart/react";
// import { Smile } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// const EmojiPicker = ({ onEmojiSelect, disabled = false }) => {
//   const [showPicker, setShowPicker] = useState(false);
//   const pickerRef = useRef(null);

//   // Handle clicking outside of picker to close it
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target)) {
//         setShowPicker(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleEmojiSelect = (emoji) => {
//     onEmojiSelect(emoji);
//     setShowPicker(false);
//   };

//   return (
//     <div className="relative" ref={pickerRef}>
//       <Button
//         variant="ghost"
//         size="sm"
//         className={cn(
//           "h-8 w-8 p-0 hover:bg-muted",
//           showPicker && "bg-muted text-primary",
//           disabled && "opacity-50 cursor-not-allowed"
//         )}
//         onClick={() => setShowPicker(!showPicker)}
//         disabled={disabled}
//       >
//         <Smile
//           className={cn(
//             "h-4 w-4",
//             showPicker ? "text-primary" : "text-muted-foreground"
//           )}
//         />
//       </Button>

//       {showPicker && (
//         <div
//           className="absolute bottom-full mb-2 left-0 z-50
//                       shadow-lg rounded-lg border border-border
//                       bg-popover"
//         >
//           <Picker
//             onEmojiSelect={handleEmojiSelect}
//             set="native"
//             showPreview={false}
//             showSkinTones={false}
//             maxFrequentRows={2}
//             theme="light"
//             icons="solid"
//             data={async () => {
//               const response = await fetch(
//                 "https://cdn.jsdelivr.net/npm/@emoji-mart/data"
//               );
//               return response.json();
//             }}
//             // Some common emojis for quick access
//             categories={[
//               "people",
//               "nature",
//               "foods",
//               "activity",
//               "objects",
//               "symbols",
//             ]}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmojiPicker;

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmojiPicker = ({ onEmojiSelect, disabled = false }) => {
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

    if (spaceAbove > spaceBelow) {
      return {
        bottom: window.innerHeight - buttonRect.top + 10,
        left: buttonRect.left,
      };
    }

    return {
      top: buttonRect.bottom + 10,
      left: buttonRect.left,
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
                dynamicWidth={true}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default EmojiPicker;
