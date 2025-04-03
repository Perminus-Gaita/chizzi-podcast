"use client";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { setLeftSidebar } from "../app/store/pageSlice";
import GiveawaysHeader from "./Navigation/GiveawaysHeader";
import BlogPageHeader from "./Navigation/BlogPageHeader";
import MainNavbar from "./Navigation/MainNavbar";
import OnboardingPageHeader from "./Navigation/OnboardingPageHeader";

const Navbar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const sidebarRef = useRef(null);

  const handleSidebarOpen = () => {
    dispatch(setLeftSidebar(true));

    if (sidebarRef.current) {
      sidebarRef.current.classList.add("open");
    }
  };

  const handleSidebarClose = () => {
    dispatch(setLeftSidebar(false));

    if (sidebarRef.current) {
      sidebarRef.current.classList.remove("open");
    }
  };

  const appPathnames = [
    "/dashboard",
    "/analytics",
    "/notifications",
    "/create",
    "/calendar",
    "/library",
    "/posts",
    "/tournaments",
    "/connect",
    "/workflows",
    "/trash",
  ];

  const SEOPages = ["/privacy-policy", "/terms-of-service", "/plans"];

  return (
    <nav>
      {(pathname.startsWith("/blog") || SEOPages.includes(pathname)) && (
        <BlogPageHeader />
      )}

      {(pathname.startsWith("/giveaways") || pathname.startsWith("/rps")) && (
        <GiveawaysHeader />
      )}
      {pathname.startsWith("/onboarding/") && <OnboardingPageHeader />}
    </nav>
  );
};

export default Navbar;
