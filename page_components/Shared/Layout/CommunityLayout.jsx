"use client";
import { usePathname } from "next/navigation";

import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";
import { setLeftSidebar } from "@/app/store/pageSlice";
import LeftSideBar from "@/components/Navigation/LeftSideBar";
import CommunityLeftSidebar from "@/components/Navigation/CommunityLeftSidebar";
import MainNavbar from "@/components/Navigation/MainNavbar";
import BottomNavigation from "@/components/Navigation/BottomNavigation";
import { useIsMobile } from "@/hooks/useIsMobile";

const SIDEBAR_WIDTHS = {
  desktop: {
    open: {
      sidebar: "w-60",
      content: "ml-60",
    },
    closed: {
      sidebar: "w-16",
      content: "ml-16",
    },
  },
  tablet: {
    open: {
      sidebar: "w-72",
      content: "ml-0",
    },
    closed: {
      sidebar: "w-0",
      content: "ml-0",
    },
  },
  mobile: {
    open: {
      sidebar: "w-[65%]", // Changed to 60% width
      content: "ml-0",
    },
    closed: {
      sidebar: "w-0",
      content: "ml-0",
    },
  },
};

export default function AppLayout({ children }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const userProfile = useSelector((state) => state.auth.profile);
  const openLeftSidebar = useSelector((state) => state.page.openLeftSidebar);

  const sidebarRef = useRef();

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

  useEffect(() => {
    if (!isMobile && !isTablet) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        handleSidebarClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isTablet]);

  const handleSidebarOpen = () => dispatch(setLeftSidebar(true));
  const handleSidebarClose = () => dispatch(setLeftSidebar(false));

  const getSidebarStyles = () => {
    let deviceType = "desktop";
    if (isMobile) deviceType = "mobile";
    else if (isTablet) deviceType = "tablet";

    const state = openLeftSidebar ? "open" : "closed";
    return SIDEBAR_WIDTHS[deviceType][state];
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <MainNavbar
        handleSidebarClose={handleSidebarClose}
        handleSidebarOpen={handleSidebarOpen}
      />

      <div className="flex relative">
        {/* Add overlay for mobile/tablet when sidebar is open */}
        {openLeftSidebar && (isMobile || isTablet) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={handleSidebarClose}
          />
        )}

        <aside
          ref={sidebarRef}
          className={`
            fixed mt-12 left-0 h-[calc(100vh-49px)] z-30 border-r border-gray-200 dark:border-gray-700
            bg-light dark:bg-dark
            transition-all duration-300 ease-in-out
            transform ${
              !openLeftSidebar && (isMobile || isTablet)
                ? "-translate-x-full"
                : "translate-x-0"
            }
            ${getSidebarStyles().sidebar}
            ${isMobile || isTablet ? "shadow-lg" : ""}
          `}
        >
          {userProfile ? (
            <LeftSideBar onSidebarClose={handleSidebarClose} />
          ) : (
            <CommunityLeftSidebar
              handleSidebarClose={handleSidebarClose}
              showOnlyLobby={true}
            />
          )}
        </aside>

        <main
          className={`
          flex-1 bg-light dark:bg-dark py-20 px-4 
          transition-all duration-300 min-h-screen
          overflow-x-auto
          ${getSidebarStyles().content}
        `}
        >
          {children}
        </main>
      </div>

      {/* <BottomNavigation /> */}
    </div>
  );
}
//