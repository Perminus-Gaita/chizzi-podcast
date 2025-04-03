"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";

import { ArrowRight } from "lucide-react";
import { setCurrentTutorialModule } from "@/app/store/pageSlice";

const TutorialNavBreadCrumbs = ({ paths, currentModule }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const currentModuleRef = useRef(null);

  const [canScroll, setCanScroll] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const checkScroll = () => {
        if (scrollRef.current) {
          const canScrollHorizontally =
            scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
          setCanScroll(canScrollHorizontally);
          setIsAtEnd(
            scrollRef.current.scrollLeft >=
              scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
          );
        }
      };

      // Scroll current module into view
      if (currentModuleRef.current) {
        currentModuleRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }

      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [paths, currentModule]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsAtEnd(
        scrollRef.current.scrollLeft >=
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
      );
    }
  };
  return (
    <div
      style={{
        position: "relative",
        minWidth: "80px",
        width: "100%",
      }}
    >
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 pl-1 pr-4
          touch-pan-x scroll-smooth"
      >
        {paths.map((path, index) => {
          const isCurrentModule = path.module === currentModule;

          return (
            <div
              key={index}
              className="flex items-center flex-shrink-0"
              ref={isCurrentModule ? currentModuleRef : null}
            >
              <button
                type="button"
                onClick={() => {
                  dispatch(setCurrentTutorialModule(path.module));
                }}
                className={`text-sm whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
                  isCurrentModule
                    ? "font-semibold text-primary dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {path.name}
              </button>

              {!isCurrentModule &&
                path.module !== paths[paths.length - 1].module && (
                  <ArrowRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                )}
            </div>
          );
        })}
      </div>

      {canScroll && !isAtEnd && (
        <div
          className="absolute right-0 top-0 h-full w-8 pointer-events-none
    bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
export default TutorialNavBreadCrumbs;
