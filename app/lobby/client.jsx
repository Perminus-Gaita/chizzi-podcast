"use client";
import { Star, Trophy, Gamepad2, Medal, Plus, X, Gem, Tv } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import TournamentsTab from './components/tournaments-tab';
import GamesTab from './components/games-tab';
import RatingsTab from './components/ratings-tab';
import NFTsTab from './components/nfts-tab';
import ShowsTab from './components/shows-tab';
import FloatingCreateButton from './components/floating-create-button';

const TabNavigation = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [selectedTab, setSelectedTab] = useState("featured");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const modalRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for window resize events
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (tab === "games") {
      setSelectedTab("games");
    } else if (tab === "tournaments") {
      setSelectedTab("tournaments");
    } else if (tab === "leaderboard") {
      setSelectedTab("leaderboard");
    } else if (tab === "nfts") {
      setSelectedTab("nfts");
    } else if (tab === "shows") {
      setSelectedTab("shows");
    }
  }, [searchParams]);

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCreateModal]);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    console.log("Opening create modal");
  };

  // Render content based on selected tab
  const renderTabContent = () => {
    switch(selectedTab) {
      case "featured":
        return (
          <div className="p-6 mt-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-lg">This is the "featured" tab. This text is a placeholder that I will later replace with the actual content.</p>
            {/* You can place your Featured component here */}
          </div>
        );
      case "tournaments":
        return (
          <TournamentsTab />
        );
      case "games":
        return (
          <GamesTab />
        );
      case "leaderboard":
        return (
          <RatingsTab />
        );
      case "nfts":
        return (
          <NFTsTab />
        );
      case "shows":
        return (
          <ShowsTab />
        );
      default:
        return (
          <div className="p-6 mt-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-lg">Select a tab to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full gap-10">
        {/* Horizontally scrollable tabs container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedTab("featured")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "featured" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Star className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Featured</span>
          </button>

          <button
            onClick={() => setSelectedTab("tournaments")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "tournaments" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Tournaments</span>
          </button>

          <button
            onClick={() => setSelectedTab("games")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "games" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Games</span>
          </button>

          <button
            onClick={() => setSelectedTab("leaderboard")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "leaderboard" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Medal className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Rankings</span>
          </button>

          <button
            onClick={() => setSelectedTab("nfts")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "nfts" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Gem className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">NFTs</span>
          </button>

          <button
            onClick={() => setSelectedTab("shows")}
            className={`flex items-center shrink-0 gap-1 md:gap-2 px-3 py-2 rounded-md transition-all
              ${selectedTab === "shows" 
                ? "bg-primary text-primary-foreground" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Tv className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Shows</span>
          </button>
        </div>

        <div className="relative shrink-0 hidden md:block">
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create</span>
          </button>
        </div>
      </div>
      
      {/* Tab content section */}
      {renderTabContent()}

      {/* Floating create button for mobile */}
      {isMobile && (
        <FloatingCreateButton 
          handleClick={handleOpenCreateModal}
        />
      )}

      {/* Modal overlay - shared between desktop and mobile */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm mx-4 overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Create New</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2">
              <button 
                className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                onClick={() => {
                  console.log("Create game clicked");
                  setShowCreateModal(false);
                }}
              >
                <Gamepad2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span>Create Game</span>
              </button>
              <button 
                className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                onClick={() => {
                  console.log("Create tournament clicked");
                  setShowCreateModal(false);
                }}
              >
                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Create Tournament</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabNavigation;