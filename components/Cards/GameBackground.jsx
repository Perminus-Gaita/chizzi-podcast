"use client";
"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Confetti from "react-confetti";

import { usePathname } from "next/navigation";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

import { Trophy, LogOut, Clock, Settings } from "lucide-react";

import {
  useTheme,
  useMediaQuery,
  Drawer,
  CircularProgress,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

import { canFinishGame, hasValidMoveAfterPlay } from "@/services/cards/utils";

import { useToast } from "@/components/hooks/use-toast";

import WaitingPlayer from "@/page_components/Cards/WaitingPlayer";
import JoiningPlayer from "@/page_components/Cards/JoiningPlayer";
import PlayPanel from "@/page_components/Cards/PlayPanel";
import ChatContainer from "@/page_components/Cards/ChatContainer";
import PlayerDeck from "@/page_components/Cards/PlayerDeck";

import GameOverModalDemo from "@/page_components/Cards/GameOverModalDemo";

import SuitModal from "@/page_components/Cards/SuitModal";
import SettingsModal from "@/page_components/Cards/SettingsModal";

import CheckIn from "@/page_components/Cards/CheckIn";
import NetworkStatus from "@/page_components/Cards/NetworkStatus";
import CenterTable from "@/page_components/Cards/CenterTable";
import KadiGameRoomLoader from "@/page_components/Cards/KadiGameRoomLoader";
import GameDirection from "@/page_components/Cards/GameDirection";
import { useKadiAISocket } from "@/hooks/useKadiAISocket";
import { useIsMobile } from "@/hooks/useIsMobile";

const EnhancedGameBackground = ({
  children,
  isSmallScreen,
  containerRef,
  customTableBackgroundImage,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden shadow-2xl"
      // style={{ height: "550px" }}
      style={{ height: "85vh", minHeight: "400px", maxHeight: "800px" }}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1a1b2e] via-[#2d2e4a] to-[#1a1b2e] transition-opacity duration-500"
        style={{
          opacity: 0.5,
        }}
      />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          // backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundImage: `url(${
            customTableBackgroundImage ||
            "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
          })`,
          backgroundSize: "contain",
        }}
      />

      {/* Ambient light effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
            mousePosition.y * 100
          }%, rgba(99, 102, 241, 0.15), transparent 50%)`,
          transition: "background 0.3s ease",
        }}
      />

      {/* Card suits floating animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["♠", "♥", "♦", "♣"].map((suit, index) => (
          <div
            key={suit}
            className="absolute text-white/5 animate-float"
            style={{
              fontSize: isSmallScreen ? "40px" : "60px",
              left: `${25 + index * 20}%`,
              animationDelay: `${index * 0.5}s`,
              top: "-20px",
            }}
          >
            {suit}
          </div>
        ))}
      </div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full h-full">{children}</div>

      {/* Table edge highlight */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />
    </div>
  );
};

export default EnhancedGameBackground;
