"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

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
import EmojisModal from "@/page_components/Cards/EmojisModal";
import GameOverModal from "@/page_components/Cards/GameOverModal";
import SuitModal from "@/page_components/Cards/SuitModal";
import SettingsModal from "@/page_components/Cards/SettingsModal";

import CheckIn from "@/page_components/Cards/CheckIn";
import NetworkStatus from "@/page_components/Cards/NetworkStatus";
import CenterTable from "@/page_components/Cards/CenterTable";
import KadiGameRoomLoader from "@/page_components/Cards/KadiGameRoomLoader";
import GameDirection from "@/page_components/Cards/GameDirection";
import { useKadiSocket } from "@/hooks/useKadiSocket";
import { useIsMobile } from "@/hooks/useIsMobile";

const CustomGameAnimation = dynamic(
  () => import("@/page_components/Cards/gameAnimation"),
  { ssr: false } // Disable server-side rendering for this component
);

const WatcherGameAnimation = dynamic(
  () => import("@/page_components/Cards/watcherAnimation"),
  { ssr: false } // Disable server-side rendering for this component
);

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

// Add required keyframes animation
const styles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(450px) rotate(180deg); }
    100% { transform: translateY(900px) rotate(360deg); opacity: 0; }
  }

  .animate-float {
    animation: float 15s linear infinite;
  }
`;

const CardsTable = ({ roomSlug }) => {
  const gameRef = useRef(null);
  const chatContainerRef = useRef(null);
  const containerRef = useRef(null);

  const isMobile = useIsMobile();

  const pathname = usePathname();

  const { toast } = useToast();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const userProfile = useSelector((state) => state.auth.profile);

  const [game, setGame] = useState(null);

  const {
    isConnected,
    isConnecting,
    connectionState,

    roomDataCopy,
    playerObj,
    playingCard,
    shufflingCards,
    handleCheckin,
    handleCardClick,
    loadingBuyin,
    handleJoinRoom,
    loadingCheckIn,
    showCheckinDialog,
    setShowCheckinDialog,
    handleDrawCard,
    handleAcceptJump,
    handleAcceptKickback,
    handlePassTurn,
    handleReact,
    handleSetOn,
    openSuitModal,
    setOpenSuitModal,
    handleOpenSuitModal,
    handleCloseSuitModal,
    handleAcesPlay,

    reaction,
    setReaction,

    // messaging state, handlers
    loadingChat,
    chatMessage,
    systemMessages,

    setChatMessage,
    handleSendMessage,

    aceCard,
    setAceCard,
    openGameOverModal,
    handleOpenGameOverModal,
    handleCloseGameOverModal,

    openEmojisModal,
    setOpenEmojisModal,
    handleOpenEmojisModal,
    handleCloseEmojisModal,

    timerState,

    invalidMove,

    sessionCookie,

    // REMATCH
    rematchOffer,
    isLoadingRematch,
    rematchTimer,
    handleRematchOffer,
    handleAcceptRematch,
    handleDeclineRematch,

    isMuted,
    setIsMuted,

    changedSuit,

    starterCard,
    isRevealingStarter,
  } = useKadiSocket(roomSlug, userProfile, gameRef);

  const [chatOpen, setChatOpen] = useState(false);

  const [members, setMembers] = useState([]);

  const [counter, setCounter] = useState(0);

  const [secondsLeft, setSecondsLeft] = useState(20);
  const [loadingMessage, setLoadingMessage] = useState(
    "Connecting to server..."
  );

  const [openMobileChat, setOpenMobileChat] = useState(false);

  const [copied, setCopied] = useState(false);

  const [currentGame, setCurrentGame] = useState(null);

  const [waitingMessage, setWaitingMessage] = useState("");

  const [timerData, setTimerData] = useState(null);

  const [dropTarget, setDropTarget] = useState(null);

  const [time, setTime] = useState(new Date());

  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  const handleOpenSettingsModal = () => setOpenSettingsModal(true);
  const handleCloseSettingsModal = () => setOpenSettingsModal(false);

  const positions = useMemo(
    () => ({
      cardWidth: gameRef?.current?.width,
      cardHeight: gameRef?.current?.height,
      center: {
        x: gameRef?.current?.width / 2,
        y: gameRef?.current?.height / 2,
      },
      players: {
        bottom: {
          x: gameRef?.current?.width / 2,
          y: gameRef?.current?.height - (isSmallScreen ? 30 : 50),
        },
        top: {
          x: gameRef?.current?.width / 2,
          y: isSmallScreen ? 20 : 50,
        },
        left: {
          x: isSmallScreen ? 20 : 50,
          y: gameRef?.current?.height / 2,
        },
        right: {
          x: gameRef?.current?.width - (isSmallScreen ? 20 : 50),
          y: gameRef?.current?.height / 2,
        },
      },
      // Table area dimensions
      table: {
        width: isSmallScreen ? 200 : 400,
        height: 180,
      },
    }),
    // [gameRef?.current, isSmallScreen, mqttConnectUrl, counter]
    [gameRef?.current, isSmallScreen, counter]
  );

  const toggleMobileChat = (newOpen) => () => {
    setOpenMobileChat(newOpen);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(`https://www.wufwuf.io${pathname}`);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Invite link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [systemMessages]);

  if (isConnecting) {
    return (
      <KadiGameRoomLoader
        connectionState={connectionState}
        roomName={roomSlug}
      />
    );
  }

  return (
    <>
      {userProfile && (
        <>
          <EmojisModal
            openEmojisModal={openEmojisModal}
            handleCloseEmojisModal={handleCloseEmojisModal}
            react={handleReact}
          />
          <div
            className="bg-customPrimary w-full h-screen overflow-hidden relative
          flex flex-col justify-center items-center"
          >
            {roomDataCopy &&
              roomDataCopy[0]?.players.length ===
                roomDataCopy[0]?.maxPlayers && (
                <>
                  {/* Exit Button */}
                  <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center gap-1 md:gap-2">
                    <Link href="/lobby" passHref>
                      <button
                        className="group relative bg-gradient-to-br from-red-500/90 to-red-600/90 
              hover:from-red-600/90 hover:to-red-700/90
              w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg 
              transition-all duration-300 ease-out
              hover:shadow-red-500/25 hover:shadow-xl active:scale-95"
                      >
                        <LogOut
                          className="w-4 h-4 sm:w-5 sm:h-5 text-white absolute 
              top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      </button>
                    </Link>

                    <button
                      onClick={handleOpenSettingsModal}
                      className="relative bg-gradient-to-br from-slate-700/90 to-slate-800/90 
            hover:from-slate-600/90 hover:to-slate-700/90
            w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg 
            transition-all duration-300 ease-out
            hover:shadow-slate-500/25 hover:shadow-xl active:scale-95"
                    >
                      <Settings
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white absolute 
              top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    </button>
                  </div>

                  <div
                    className="absolute top-2 md:top-4 right-2 md:right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm 
      rounded-full shadow-lg border border-slate-700/50"
                  >
                    <Clock
                      size={16}
                      className="hidden md:block text-slate-400"
                    />
                    <time className="font-mono text-xs md:text-sm text-slate-200 tabular-nums">
                      {time.toLocaleTimeString([], { hour12: false })}
                    </time>
                  </div>

                  {/* Pot Display */}
                  {Math.abs(roomDataCopy[0]?.pot) > 0 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-28 sm:w-40">
                      <div
                        className="relative px-3 sm:px-6 py-2 bg-gradient-to-b 
                        from-[#2a2f4c]/95 to-[#1a1f3c]/95 backdrop-blur-sm rounded-b-xl 
                        border border-white/10 shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />

                          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />

                          <span className="block text-white/80 text-xs">
                            Pot
                          </span>
                        </div>

                        <div className="text-center">
                          <span
                            className="block font-bold bg-gradient-to-r from-emerald-400 
                          to-green-500 bg-clip-text text-transparent text-xs sm:text-sm"
                          >
                            KES {(roomDataCopy[0]?.pot / 100).toLocaleString()}
                          </span>
                        </div>

                        <div
                          className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r 
                        from-transparent via-white/20 to-transparent"
                        />
                        <div
                          className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r 
                        from-transparent via-emerald-500/20 to-transparent blur-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* internet connection */}
                  <NetworkStatus />
                </>
              )}
            {roomDataCopy && ( // not connected obj not available
              <div className="relative w-full max-w-6xl">
                {roomDataCopy[0].players.length ===
                roomDataCopy[0].maxPlayers ? (
                  <>
                    {roomDataCopy[0]?.players.some(
                      (player) => player.userId === userProfile?.uuid
                    ) ? (
                      <>
                        {/* PLAYER */}
                        <div className="flex justify-center relative">
                          <CheckIn
                            loadingCheckIn={loadingCheckIn}
                            roomData={roomDataCopy[0]}
                            handleCheckin={handleCheckin}
                            waitingMessage={waitingMessage}
                            showCheckinDialog={showCheckinDialog}
                            setShowCheckinDialog={setShowCheckinDialog}
                          />

                          <div
                            className="flex flex-col items-center justify-center gap-4"
                            style={{
                              transition: "all .3s ease-in",
                            }}
                          >
                            <style>{styles}</style>
                            <EnhancedGameBackground
                              isSmallScreen={isSmallScreen}
                              containerRef={containerRef}
                              customTableBackgroundImage={
                                roomDataCopy[0]?.tournamentDetails
                                  ?.customTableBackgroundImage
                              }
                            >
                              <div
                                className={`absolute rounded-xl
                                transition-all duration-200 ${
                                  dropTarget
                                    ? "ring-4 ring-green-500 bg-green-500/10"
                                    : ""
                                }`}
                                id="table-drop-target"
                                style={{
                                  left: "50%",
                                  top: "45%",
                                  transform: "translate(-50%, -50%)",
                                  // width: isSmallScreen ? "200px" : "400px",
                                  // height: "180px",
                                  width: isSmallScreen ? "150px" : "400px",
                                  height: "180px",

                                  // zIndex: 10,
                                  background: "rgba(34, 40, 64, 0.6)",
                                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  borderColor: dropTarget
                                    ? "rgba(34, 200, 100, 1)"
                                    : "rgba(34, 40, 64, 1)",
                                  zIndex: 1,
                                }}
                              >
                                <GameDirection
                                  direction={roomDataCopy[0]?.direction}
                                  isKickback={roomDataCopy[0]?.isKickback}
                                  isMobile={isMobile}
                                />

                                <CenterTable
                                  isSmallScreen={isSmallScreen}
                                  cardWidth={gameRef?.current?.cardWidth}
                                  cardHeight={gameRef?.current?.cardHeight}
                                  canDraw={
                                    roomDataCopy[0]?.jumpCounter === 0 &&
                                    !roomDataCopy[0]?.isKickback &&
                                    roomDataCopy[0]?.turn ===
                                      userProfile?.uuid &&
                                    (roomDataCopy[0]?.isQuestion ||
                                      (roomDataCopy[0]?.lastGamePlay?.player ===
                                        userProfile.uuid &&
                                        roomDataCopy[0]?.lastGamePlay?.card &&
                                        roomDataCopy[0]?.lastGamePlay?.card.slice(
                                          0,
                                          -1
                                        ) === "K") ||
                                      (roomDataCopy[0]?.lastGamePlay?.player ===
                                        userProfile.uuid &&
                                        roomDataCopy[0]?.lastGamePlay?.card &&
                                        roomDataCopy[0]?.lastGamePlay?.card.slice(
                                          0,
                                          -1
                                        ) === "J") ||
                                      roomDataCopy[0]?.lastGamePlay?.player !==
                                        userProfile.uuid)
                                  }
                                  roomData={roomDataCopy[0]}
                                  playerObj={playerObj}
                                  setOn={handleSetOn}
                                  isShuffling={shufflingCards}
                                  handleDrawCard={handleDrawCard}
                                  handleAcceptJump={handleAcceptJump}
                                  handleAcceptKickback={handleAcceptKickback}
                                  handlePassTurn={handlePassTurn}
                                  starterCard={starterCard}
                                  isRevealingStarter={isRevealingStarter}
                                  changedSuit={changedSuit}
                                />
                              </div>

                              <CustomGameAnimation
                                gameRef={gameRef}
                                game={game}
                                setGame={setGame}
                                roomDataCopy={roomDataCopy}
                                playerObj={playerObj}
                                members={members}
                                counter={counter}
                                setCounter={setCounter}
                                reaction={reaction}
                                isSmallScreen={isSmallScreen}
                                containerRef={containerRef}
                                setCurrentGame={setCurrentGame}
                                timerData={timerData}
                                timerState={timerState}
                                handleCardClick={handleCardClick}
                                handleOpenSuitModal={handleOpenSuitModal}
                              />

                              <PlayPanel
                                roomDataCopy={roomDataCopy}
                                playerObj={playerObj}
                                handleOpenEmojisModal={handleOpenEmojisModal}
                                chatOpen={chatOpen}
                                setChatOpen={setChatOpen}
                                isSmallScreen={isSmallScreen}
                                toggleMobileChat={toggleMobileChat}
                                react={handleReact}
                              />

                              <div
                                className="flex justify-center items-center p-1 w-full"
                                style={{
                                  position: "absolute",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  bottom: "40px", // 20% of bottom player's y position
                                  width: Math.min(
                                    positions.table.width * 1.5,
                                    positions.cardWidth * 0.95
                                  ), // 1.5x table width or 80% of canvas width
                                  zIndex: 11,
                                }}
                              >
                                {/* DND DECK */}
                                <PlayerDeck
                                  playerObj={playerObj}
                                  handleCardClick={handleCardClick}
                                  handleOpenSuitModal={handleOpenSuitModal}
                                  roomData={roomDataCopy[0]}
                                  isSmallScreen={isMobile}
                                  positions={positions}
                                  dropTarget={dropTarget}
                                  setDropTarget={setDropTarget}
                                  loading={playingCard !== null} // Pass loading state
                                  invalidMove={invalidMove}
                                />
                              </div>
                              {/* </div> */}
                            </EnhancedGameBackground>
                          </div>

                          {!isSmallScreen && chatOpen && (
                            <div
                              style={{
                                transition: "transform 0.3s ease-in-out",
                                transform: chatOpen
                                  ? "translateX(0)"
                                  : "translateX(300px)",
                              }}
                            >
                              <ChatContainer
                                chatOpen={chatOpen}
                                setChatOpen={setChatOpen}
                                isSmallScreen={isSmallScreen}
                                systemMessages={systemMessages}
                                chatMessage={chatMessage}
                                setChatMessage={setChatMessage}
                                sendMessage={handleSendMessage}
                                toggleMobileChat={toggleMobileChat}
                                chatContainerRef={chatContainerRef}
                                loadingChat={loadingChat}
                              />
                            </div>
                          )}

                          {isSmallScreen && (
                            <Drawer
                              open={openMobileChat}
                              onClose={toggleMobileChat(false)}
                              PaperProps={{
                                style: {
                                  backgroundColor: "transparent",
                                  width: "100%",
                                  height: "100vh",
                                  overflow: "hidden",
                                  display: "flex",
                                  justify: "center",
                                },
                              }}
                            >
                              <ChatContainer
                                chatOpen={chatOpen}
                                setChatOpen={setChatOpen}
                                isSmallScreen={isSmallScreen}
                                systemMessages={systemMessages}
                                chatMessage={chatMessage}
                                setChatMessage={setChatMessage}
                                sendMessage={handleSendMessage}
                                toggleMobileChat={toggleMobileChat}
                                chatContainerRef={chatContainerRef}
                                loadingChat={loadingChat}
                                containerRef={containerRef}
                                setCurrentGame={setCurrentGame}
                              />
                            </Drawer>
                          )}
                        </div>

                        {roomDataCopy[0].gameStatus === "gameover" && (
                          <>
                            <GameOverModal
                              openGameOverModal={openGameOverModal}
                              // handleCloseGameOverModal={
                              //   handleCloseGameOverModal
                              // }
                              roomData={roomDataCopy[0]}
                              handleRematchOffer={handleRematchOffer}
                              handleAcceptRematch={handleAcceptRematch}
                              handleDeclineRematch={handleDeclineRematch}
                              isLoadingRematch={isLoadingRematch}
                              rematchOffer={rematchOffer}
                              rematchTimer={rematchTimer}
                            />

                            {openGameOverModal &&
                              roomDataCopy[0]?.winner === userProfile?.uuid && (
                                <Confetti
                                  width={window.innerWidth} // Set to window width
                                  height={window.innerHeight} // Set to window height
                                  recycle={false} // Optional: stops confetti after one burst
                                  numberOfPieces={100} // Optional: more confetti pieces
                                  style={{
                                    // Ensure it covers everything
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    zIndex: 9999,
                                    pointerEvents: "none", // Allow clicking through confetti
                                  }}
                                />
                              )}
                          </>
                        )}

                        <SuitModal
                          handleAces={handleAcesPlay}
                          openSuitModal={openSuitModal}
                          handleCloseSuitModal={handleCloseSuitModal}
                          desiredSuit={roomDataCopy[0]?.desiredSuit}
                          isAceOfSpades={aceCard === "AS"}
                          isSecondAcePlay={Boolean(
                            roomDataCopy[0]?.turn === userProfile?.uuid &&
                              roomDataCopy[0]?.lastGamePlay?.player ===
                                userProfile.uuid &&
                              roomDataCopy[0]?.discardPile[
                                roomDataCopy[0]?.discardPile.length - 1
                              ].slice(0, -1) === "A" &&
                              // Check if it's NOT countering penalties
                              !(
                                roomDataCopy[0]?.secondLastGamePlay?.card?.startsWith(
                                  "2"
                                ) ||
                                roomDataCopy[0]?.secondLastGamePlay?.card?.startsWith(
                                  "3"
                                ) ||
                                roomDataCopy[0]?.secondLastGamePlay?.card ===
                                  "JOK1" ||
                                roomDataCopy[0]?.secondLastGamePlay?.card ===
                                  "JOK2"
                              ) &&
                              // Handle both game start and mid-game scenarios
                              // Case 1: Game just started (no second last move)
                              ((!roomDataCopy[0]?.secondLastGamePlay?.player &&
                                roomDataCopy[0]?.discardPile.length === 2 &&
                                roomDataCopy[0]?.lastGamePlay?.player ===
                                  userProfile?.uuid) ||
                                // Case 2: Mid-game second Ace (second last move exists and was by same player)
                                (roomDataCopy[0]?.secondLastGamePlay?.player ===
                                  userProfile?.uuid &&
                                  !(
                                    roomDataCopy[0]?.desiredSuit &&
                                    roomDataCopy[0]?.secondLastGamePlay
                                      ?.player !== userProfile?.uuid
                                  )))
                          )}
                        />

                        <SettingsModal
                          isMuted={isMuted}
                          setIsMuted={setIsMuted}
                          openSettingsModal={openSettingsModal}
                          handleCloseSettingsModal={handleCloseSettingsModal}
                        />
                      </>
                    ) : (
                      <>
                        {/* NON-PLAYER */}
                        <div className="flex justify-center relative">
                          <div
                            className="flex flex-col items-center justify-center gap-4"
                            style={{
                              transition: "all .3s ease-in",
                              marginRight:
                                !isSmallScreen && chatOpen && "-300px",
                            }}
                          >
                            <style>{styles}</style>
                            <EnhancedGameBackground
                              isSmallScreen={isSmallScreen}
                              containerRef={containerRef}
                            >
                              <WatcherGameAnimation
                                gameRef={gameRef}
                                game={game}
                                setGame={setGame}
                                roomDataCopy={roomDataCopy}
                                playerObj={playerObj}
                                members={members}
                                counter={counter}
                                setCounter={setCounter}
                                reaction={reaction}
                                isSmallScreen={isSmallScreen}
                                containerRef={containerRef}
                                setCurrentGame={setCurrentGame}
                              />

                              <div
                                className="absolute flex items-center gap-3"
                                style={{
                                  top:
                                    positions?.center?.y -
                                    positions?.table?.height * 0.6,
                                  left: gameRef?.current?.centerX,
                                  transform: "translateX(-50%)",
                                  zIndex: 11,
                                }}
                              >
                                <div className="flex items-center justify-center h-10 px-3 rounded-l-lg bg-opacity-80 bg-[#222840]">
                                  {roomDataCopy[0]?.currentSuit === "S" && (
                                    <img
                                      src="/cards/spade.png"
                                      className="w-6 h-6"
                                      alt="spades"
                                    />
                                  )}
                                  {roomDataCopy[0]?.currentSuit === "C" && (
                                    <img
                                      src="/cards/club.png"
                                      className="w-6 h-6"
                                      alt="clubs"
                                    />
                                  )}
                                  {roomDataCopy[0]?.currentSuit === "D" && (
                                    <img
                                      src="/cards/diamond.png"
                                      className="w-6 h-6"
                                      alt="diamonds"
                                    />
                                  )}
                                  {roomDataCopy[0]?.currentSuit === "H" && (
                                    <img
                                      src="/cards/heart.png"
                                      className="w-6 h-6"
                                      alt="hearts"
                                    />
                                  )}
                                  {roomDataCopy[0]?.currentSuit === "FREE" && (
                                    <span className="text-xs text-white font-semibold">
                                      FREE
                                    </span>
                                  )}
                                </div>
                              </div>

                              {shufflingCards && (
                                <div
                                  style={{
                                    position: "absolute",
                                    left:
                                      gameRef?.current?.centerX -
                                      gameRef?.current?.cardWidth * 0.65,
                                    top: gameRef?.current?.centerY,
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 11,
                                    width: gameRef?.current?.cardWidth,
                                    height: gameRef?.current?.cardHeight,
                                  }}
                                >
                                  {[...Array(5)].map((_, index) => (
                                    <div
                                      key={index}
                                      className="shufflingCard"
                                      style={{
                                        backgroundImage:
                                          "url('/cards/backred.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                      }}
                                    ></div>
                                  ))}
                                </div>
                              )}

                              <div
                                className="absolute bottom-0 right-0 flex 
                                  justify-between items-start z-30"
                              >
                                {isSmallScreen ? (
                                  <button onClick={toggleMobileChat(true)}>
                                    <img
                                      src={`/cards/chatbubble_1.png`}
                                      width={isSmallScreen ? "40" : "50"}
                                      height={isSmallScreen ? "40" : "50"}
                                      alt="chat"
                                    />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setChatOpen(!chatOpen)}
                                  >
                                    {" "}
                                    <img
                                      src={`/cards/chatbubble_1.png`}
                                      width={isSmallScreen ? "40" : "50"}
                                      height={isSmallScreen ? "40" : "50"}
                                      alt="chat"
                                    />
                                  </button>
                                )}
                              </div>

                              {/* cards center table */}
                              <div
                                className="rounded-xl"
                                style={{
                                  position: "absolute",
                                  left: "50%",
                                  top: "50%",
                                  transform: "translate(-50%, -50%)",
                                  width: isSmallScreen ? "200px" : "400px",
                                  height: "180px",
                                  background: "rgba(34, 40, 64, 0.6)",
                                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
                                  border: "1px solid rgba(34, 40, 64, 1)",
                                }}
                              />
                            </EnhancedGameBackground>
                          </div>

                          {!isSmallScreen && (
                            <ChatContainer
                              chatOpen={chatOpen}
                              setChatOpen={setChatOpen}
                              isSmallScreen={isSmallScreen}
                              systemMessages={systemMessages}
                              chatMessage={chatMessage}
                              setChatMessage={setChatMessage}
                              sendMessage={handleSendMessage}
                              toggleMobileChat={toggleMobileChat}
                              chatContainerRef={chatContainerRef}
                              loadingChat={loadingChat}
                            />
                          )}

                          {isSmallScreen && (
                            <Drawer
                              open={openMobileChat}
                              onClose={toggleMobileChat(false)}
                              PaperProps={{
                                style: {
                                  backgroundColor: "transparent",
                                  width: "100%",
                                  height: "100vh",
                                  overflow: "hidden",
                                  display: "flex",
                                  justify: "center",
                                },
                              }}
                            >
                              <ChatContainer
                                chatOpen={chatOpen}
                                setChatOpen={setChatOpen}
                                isSmallScreen={isSmallScreen}
                                systemMessages={systemMessages}
                                chatMessage={chatMessage}
                                setChatMessage={setChatMessage}
                                sendMessage={handleSendMessage}
                                toggleMobileChat={toggleMobileChat}
                                chatContainerRef={chatContainerRef}
                                loadingChat={loadingChat}
                              />
                            </Drawer>
                          )}
                        </div>

                        {roomDataCopy[0].gameStatus === "gameover" && (
                          <GameOverModal
                            openGameOverModal={openGameOverModal}
                            // handleCloseGameOverModal={handleCloseGameOverModal}
                            roomData={roomDataCopy[0]}
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  // room not full
                  <>
                    {!roomDataCopy[0]?.players.some(
                      (player) => player.userId === userProfile?.uuid
                    ) ? (
                      <>
                        <JoiningPlayer
                          roomDataCopy={roomDataCopy}
                          loadingBuyin={loadingBuyin}
                          handleJoinRoom={handleJoinRoom}
                        />
                      </>
                    ) : (
                      <>
                        <WaitingPlayer
                          roomDataCopy={roomDataCopy}
                          pathname={pathname}
                          copied={copied}
                          handleCopyClick={handleCopyClick}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            {/* : (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#131633] to-[#222840] text-white w-full">
                <div className="relative">
                  <CircularProgress
                    size={80}
                    thickness={4}
                    sx={{ color: "#00b8ff" }}
                    variant="determinate"
                    value={((20 - secondsLeft) / 20) * 100}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{secondsLeft}</span>
                  </div>
                </div>

                <h1 className="mt-8 text-2xl md:text-4xl font-bold text-center">
                  Joining <span className="text-[#00b8ff]">{roomName}</span>
                </h1>

                <p className="mt-4 text-lg text-[#9f9f9f] animate-pulse">
                  {loadingMessage}
                </p>

                <div className="mt-12 flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-[#00b8ff] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* <button onClick={() => console.log(roomDataCopy)}>ROOM DATA</button> */}
          {/* <button onClick={() => console.log(gameRef.current)}>EVEN</button> */}
          {/* <button onClick={() => handleOpenGameOverModal()}>Tested</button> */}
          {/* <button onClick={() => console.log(roomDataCopy)}>ROOM DATA</button>
            <br />
            <br />
            <button onClick={() => setCounter(counter + 1)}>RESETa</button>
            <br />

            <button onClick={() => console.log(gameRef.current)}>EVEN</button> */}
          {/* <button
                      onClick={() => {
                        console.log(roomDataCopy[0]);
                        // console.log(members);
                        // console.log(playerObj);
                        console.log(systemMessages);

                        console.log(reaction);
                      }}
                    >
                      LOGGER
                    </button> */}
          {/* <button onClick={() => registerRoom()}>RESii99iET</button>
           */}

          {/* <h1>URL: {mqttConnectUrl}</h1> */}
          {/* <div className="absolute bottom-0 flex items-center gap-4 w-full bg-red-500 text-white">
              <button onClick={() => console.log(playerObj)}>PLAYER OBJ</button>
              <button onClick={() => console.log(roomDataCopy)}>
                DATA COPY
              </button>

                          
              
              <button
                onClick={() => {
                  gameRef.current.playCard();
                }}
              >
                PLAY CARD
              </button>

              <button
                onClick={() => {
                  gameRef.current.drawCard();
                }}
              >
                DRAW CARD
              </button>  
              <button onClick={() => console.log(gameRef.current)}>
                GAME OBJ
              </button>
             
              <button onClick={() => setCounter(counter + 1)}>RESETa</button>
              <button onClick={() => setCounter(currentGame)}>JKJKJK</button>

              <button
                onClick={() => {
                  setReaction({
                    player: "66b077ff50cb7b39868753ff",
                    src: "/cards/emojis/emoji1.webp",
                    text: "Not so fast!",
                  });
                }}
              >
                P1 REACTION
              </button>

              <button onClick={() => console.log(positions)}>POSITIONS</button> 
            </div> */}
          {/* <div className="absolute bottom-0 flex items-center gap-4 w-full bg-red-500 text-white">
            <button onClick={() => console.log(playerObj)}>PLAYER OBJ</button>
            <button onClick={() => console.log(roomDataCopy)}>DATA COPY</button>
          </div> */}
          {/* <button onClick={() => console.log(gameRef.current)}>GAME OBJ</button>
          <br />
          <button
            onClick={() => {
              gameRef.current.drawCard("66b796ccc18c8e15519af3e6");
            }}
          >
            DRAW CARD
          </button> */}
        </>
      )}
    </>
  );
};

export default CardsTable;
