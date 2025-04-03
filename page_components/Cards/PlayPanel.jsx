// "use client";

// const PlayPanel = ({ handleOpenEmojisModal, isSmallScreen }) => {
//   return (
//     <div
//       className="rounded-lg flex items-center justify-around"
//       style={{
//         boxShadow: "rgba(17, 17, 26, 0.5) 0px 0px 16px",
//         width: isSmallScreen ? "100px" : "130px",
//       }}
//     >
//       <button
//         onClick={() => {
//           handleOpenEmojisModal();
//         }}
//       >
//         <img
//           src={`/cards/reactimage_1.png`}
//           width={isSmallScreen ? "40" : "50"}
//           height={isSmallScreen ? "40" : "50"}
//           alt="react"
//         />
//       </button>
//     </div>
//   );
// };

// export default PlayPanel;

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

const emojis = [
  {
    text: "Not so fast!",
    image: "/cards/emojis/emoji1.webp",
  },
  {
    text: "Oh wow!",
    image: "/cards/emojis/emoji2.webp",
  },
  {
    text: "Oof, that's rough",
    image: "/cards/emojis/emoji3.webp",
  },
  {
    text: "Pretty please?",
    image: "/cards/emojis/emoji4.webp",
  },
  {
    text: "You're joking...",
    image: "/cards/emojis/emoji5.webp",
  },
  {
    text: "Interesting move!",
    image: "/cards/emojis/emoji6.webp",
  },
  {
    text: "Huh? What happened?",
    image: "/cards/emojis/emoji7.webp",
  },
  {
    text: "Jackpot! Ka-ching!",
    image: "/cards/emojis/emoji8.webp",
  },
  {
    text: "I'm on fire!",
    image: "/cards/emojis/emoji9.webp",
  },
  {
    text: "I'm f-freezing!",
    image: "/cards/emojis/emoji10.webp",
  },
  {
    text: "Phew, that was close!",
    image: "/cards/emojis/emoji11.webp",
  },
  {
    text: "Oh please, have mercy!",
    image: "/cards/emojis/emoji12.webp",
  },
  {
    text: "Holy Shit!",
    image: "/cards/emojis/emoji13.webp",
  },
  {
    text: "Seriously?",
    image: "/cards/emojis/emoji14.webp",
  },
  {
    text: "Nice one!",
    image: "/cards/emojis/emoji15.webp",
  },
  {
    text: "Aw, come on!",
    image: "/cards/emojis/emoji16.webp",
  },
  {
    text: "Pretty please?",
    image: "/cards/emojis/emoji17.webp",
  },
  {
    text: "Mmm, Nice move!",
    image: "/cards/emojis/emoji18.webp",
  },
  {
    text: "Oops, my bad!",
    image: "/cards/emojis/emoji19.webp",
  },
  {
    text: "Zzz... Wake me when it's my turn.",
    image: "/cards/emojis/emoji20.webp",
  },
  {
    text: "Not a chance!",
    image: "/cards/emojis/emoji21.webp",
  },
  {
    text: "Oh no, I'm doomed!",
    image: "/cards/emojis/emoji22.webp",
  },
  {
    text: "Ha ha, too funny!",
    image: "/cards/emojis/emoji23.webp",
  },
  {
    text: "Shh, I've got a secret...",
    image: "/cards/emojis/emoji24.webp",
  },
  {
    text: "Hey, listen up!",
    image: "/cards/emojis/emoji25.webp",
  },
  {
    text: "Whatever...",
    image: "/cards/emojis/emoji26.webp",
  },
  {
    text: "Grrr... I'm fuming!",
    image: "/cards/emojis/emoji27.webp",
  },
  {
    text: "Not cool!",
    image: "/cards/emojis/emoji28.webp",
  },
];

const PlayPanel = ({ react }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef(null);

  // Calculate item dimensions
  const centerItemSize = isMobile ? 48 : 58;
  const sideItemSize = isMobile ? 32 : 42;
  const itemSpacing = isMobile ? 8 : 10;

  const totalHeight = centerItemSize + sideItemSize * 2 + itemSpacing * 2;

  const handleScroll = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const itemHeight = sideItemSize + itemSpacing;
    const scrollPosition = container.scrollTop;
    const newIndex = Math.round(scrollPosition / itemHeight);

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleClick = (emoji, index) => {
    if (index === activeIndex) {
      react(emoji.image, emoji.text);
      // console.log("reaction", emoji.image, emoji.text);
    }
  };

  return (
    <motion.div
      // className="absolute bottom-0 right-2 z-50 overflow-x-hidden"
      className="fixed bottom-0 right-2 z-50" // Changed absolute to fixed
      style={{
        height: `${totalHeight}px`,
        width: `${centerItemSize}px`, // Explicitly set width
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        className="overflow-y-scroll scrollbar-none"
        style={{
          width: "100%",
          height: "100%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "::-webkit-scrollbar": {
            // Webkit browsers
            display: "none",
          },
        }}
        onScroll={handleScroll}
      >
        <div
          className="flex flex-col items-center py-4"
          style={{
            paddingTop: `${sideItemSize}px`,
            paddingBottom: `${totalHeight - centerItemSize}px`,
            minHeight: "100%",
          }}
        >
          {emojis.map((emoji, index) => {
            const isCenter = index === activeIndex;
            const scale = isCenter ? 1 : 0.7;
            const opacity = isCenter ? 1 : 0.6;

            return (
              <motion.div
                key={index}
                className="flex-shrink-0 relative cursor-pointer"
                style={{
                  width: "100%", // Use percentage
                  height: `${sideItemSize}px`,
                  marginBottom: `${itemSpacing}px`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                animate={{
                  scale,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                onClick={() => handleClick(emoji, index)}
              >
                <div
                  className={`relative ${isCenter ? "z-10" : "z-0"}`}
                  style={{
                    width: isCenter ? centerItemSize : sideItemSize,
                    height: isCenter ? centerItemSize : sideItemSize,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Image
                    src={emoji.image}
                    alt={emoji.text}
                    fill
                    sizes={`${isCenter ? centerItemSize : sideItemSize}px`}
                    className="object-contain rounded-lg"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default PlayPanel;
