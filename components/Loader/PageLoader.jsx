"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import KadiLoader from "./KadiLoader";

const PageLoader = () => {
  // const isKadiRoute = window.locatin.pathname.startsWith("/kadi");

  const pathname = usePathname();
  const isKadiRoute = pathname?.startsWith("/kadi");
  const userProfile = useSelector((state) => state.auth.profile);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const getPageName = () => {
    const path = currentPath || "";
    return path.split("/").pop() || "app";
  };
  // console.log("## THE PAGE NAME ###");
  // console.log(pathname);
  // console.log(pageName.toLowerCase().startsWith("kadi"));

  const getLoadingText = () => {
    const pageName = getPageName();

    switch (pageName.toLowerCase()) {
      case "matches":
        return "Retrieving your battles...";
      case "analytics":
        return "Crunching your numbers...";
      case "lobby":
      case "tournaments":
        return "Preparing Kadi Arena...";
      case "settings":
        return "Loading your settings...";
      case "transactions":
        return "Loading transaction history...";
      case "wallet":
        return "Accessing your vault...";
      default:
        if (pageName.toLowerCase() === userProfile?.username?.toLowerCase()) {
          return "Loading your profile...";
        }
        return "Loading application...";
    }
  };

  return (
    <>
      {isKadiRoute ? (
        <KadiLoader />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>{" "}
            <div className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
              {getLoadingText()}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This may take a few seconds
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageLoader;
