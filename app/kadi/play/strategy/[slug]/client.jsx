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

import GameOverModal from "@/page_components/Cards/GameOverModal";

import SuitModal from "@/page_components/Cards/SuitModal";
import SettingsModal from "@/page_components/Cards/SettingsModal";

import CheckIn from "@/page_components/Cards/CheckIn";
import NetworkStatus from "@/page_components/Cards/NetworkStatus";
import CenterTable from "@/page_components/Cards/CenterTable";
import KadiGameRoomLoader from "@/page_components/Cards/KadiGameRoomLoader";
import GameDirection from "@/page_components/Cards/GameDirection";

import GameBackground from "@/components/Cards/GameBackground";

import { useKadiStrategyAISocket } from "@/hooks/useKadiStrategyAISocket";
import { useIsMobile } from "@/hooks/useIsMobile";

const CustomGameAnimation = dynamic(
  () => import("@/page_components/Cards/gameAnimation"),
  { ssr: false } // Disable server-side rendering for this component
);

const WatcherGameAnimation = dynamic(
  () => import("@/page_components/Cards/watcherAnimation"),
  { ssr: false } // Disable server-side rendering for this component
);

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

// const KadiStrategyTable = ({ roomSlug }) => {
//   const gameRef = useRef(null);
//   const chatContainerRef = useRef(null);
//   const containerRef = useRef(null);

//   const pathname = usePathname();

//   const isMobile = useIsMobile();

//   const { toast } = useToast();

//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

//   const userProfile = useSelector((state) => state.auth.profile);

//   const [game, setGame] = useState(null);

//   const {
//     isConnected,
//     isConnecting,
//     connectionState,

//     roomDataCopy,
//     playerObj,
//     playingCard,
//     shufflingCards,
//     handleCheckin,
//     handleCardClick,
//     loadingBuyin,
//     handleJoinRoom,
//     loadingCheckIn,
//     showCheckinDialog,
//     setShowCheckinDialog,
//     handleDrawCard,
//     handleAcceptJump,
//     handleAcceptKickback,
//     handlePassTurn,
//     handleReact,

//     handleSetOn,
//     openSuitModal,
//     setOpenSuitModal,
//     handleOpenSuitModal,
//     handleAcesPlay,

//     reaction,
//     setReaction,

//     // messaging state, handlers
//     loadingChat,
//     chatMessage,
//     systemMessages,

//     setChatMessage,
//     handleSendMessage,

//     invalidMove,

//     aceCard,
//     setAceCard,
//     openGameOverModal,
//     handleOpenGameOverModal,
//     handleCloseGameOverModal,

//     isMuted,
//     setIsMuted,

//     changedSuit,
//   } = useKadiStrategyAISocket(roomSlug, userProfile, gameRef);

//   const [chatOpen, setChatOpen] = useState(false);

//   const [members, setMembers] = useState([]);

//   const [counter, setCounter] = useState(0);

//   const [secondsLeft, setSecondsLeft] = useState(20);
//   const [loadingMessage, setLoadingMessage] = useState(
//     "Connecting to server..."
//   );

//   const [openMobileChat, setOpenMobileChat] = useState(false);

//   const [copied, setCopied] = useState(false);

//   const [currentGame, setCurrentGame] = useState(null);

//   const [waitingMessage, setWaitingMessage] = useState("");

//   const [timerData, setTimerData] = useState(null);

//   const [dropTarget, setDropTarget] = useState(null);

//   const [time, setTime] = useState(new Date());

//   const [openSettingsModal, setOpenSettingsModal] = useState(false);

//   const handleOpenSettingsModal = () => setOpenSettingsModal(true);
//   const handleCloseSettingsModal = () => setOpenSettingsModal(false);

//   const positions = useMemo(
//     () => ({
//       cardWidth: gameRef?.current?.width,
//       cardHeight: gameRef?.current?.height,
//       center: {
//         x: gameRef?.current?.width / 2,
//         y: gameRef?.current?.height / 2,
//       },
//       players: {
//         bottom: {
//           x: gameRef?.current?.width / 2,
//           y: gameRef?.current?.height - (isSmallScreen ? 30 : 50),
//         },
//         top: {
//           x: gameRef?.current?.width / 2,
//           y: isSmallScreen ? 20 : 50,
//         },
//         left: {
//           x: isSmallScreen ? 20 : 50,
//           y: gameRef?.current?.height / 2,
//         },
//         right: {
//           x: gameRef?.current?.width - (isSmallScreen ? 20 : 50),
//           y: gameRef?.current?.height / 2,
//         },
//       },
//       // Table area dimensions
//       table: {
//         width: isSmallScreen ? 200 : 400,
//         height: 180,
//       },
//     }),
//     // [gameRef?.current, isSmallScreen, mqttConnectUrl, counter]
//     [gameRef?.current, isSmallScreen, counter]
//   );

//   const toggleMobileChat = (newOpen) => () => {
//     setOpenMobileChat(newOpen);
//   };

//   const handleCopyClick = () => {
//     navigator.clipboard.writeText(`https://www.wufwuf.io${pathname}`);
//     setCopied(true);
//     toast({
//       title: "Copied!",
//       description: "Invite link has been copied to clipboard.",
//     });
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleCloseSuitModal = () => setOpenSuitModal(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // open gameover modal if game is over
//   useEffect(() => {
//     if (roomDataCopy && roomDataCopy?.gameStatus === "gameover") {
//       const handleClick = () => {
//         handleOpenGameOverModal();
//       };

//       document.addEventListener("click", handleClick);

//       // Cleanup event listener on component unmount or when gameStatus changes
//       return () => {
//         document.removeEventListener("click", handleClick);
//       };
//     }
//   }, [roomDataCopy]);

//   // scroll to bottom on message
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop =
//         chatContainerRef.current.scrollHeight;
//     }
//   }, [systemMessages]);

//   if (isConnecting) {
//     return (
//       <KadiGameRoomLoader
//         connectionState={connectionState}
//         roomName={roomDataCopy?.roomName}
//       />
//     );
//   }

//   return (
//     <>
//       {userProfile && (
//         <>
//           <div
//             className="bg-customPrimary w-full h-screen overflow-hidden relative
//           flex flex-col justify-center items-center"
//           >
//             {roomDataCopy &&
//               roomDataCopy?.players.length ===
//                 roomDataCopy?.maxPlayers && (
//                 <>
//                   <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 space-x-2">
//                     <Link href="/lobby" passHref>
//                       <button
//                         className="group relative bg-gradient-to-br from-red-500/90 to-red-600/90
//               hover:from-red-600/90 hover:to-red-700/90
//               w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg
//               transition-all duration-300 ease-out
//               hover:shadow-red-500/25 hover:shadow-xl active:scale-95"
//                       >
//                         <LogOut
//                           className="w-4 h-4 sm:w-5 sm:h-5 text-white absolute
//               top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                         />
//                       </button>
//                     </Link>

//                     <button
//                       onClick={handleOpenSettingsModal}
//                       className="relative bg-gradient-to-br from-slate-700/90 to-slate-800/90
//             hover:from-slate-600/90 hover:to-slate-700/90
//             w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg
//             transition-all duration-300 ease-out
//             hover:shadow-slate-500/25 hover:shadow-xl active:scale-95"
//                     >
//                       <Settings
//                         className="w-4 h-4 sm:w-5 sm:h-5 text-white absolute
//               top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                       />
//                     </button>
//                   </div>

//                   <div
//                     className="absolute top-2 md:top-4 right-2 md:right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm
//       rounded-full shadow-lg border border-slate-700/50"
//                   >
//                     <Clock
//                       size={16}
//                       className="hidden md:block text-slate-400"
//                     />
//                     <time className="font-mono text-xs md:text-sm text-slate-200 tabular-nums">
//                       {time.toLocaleTimeString([], { hour12: false })}
//                     </time>
//                   </div>

//                   <NetworkStatus />
//                 </>
//               )}
//             {roomDataCopy && (
//               <div className="relative w-full max-w-6xl">
//                 {roomDataCopy.players.length ===
//                 roomDataCopy.maxPlayers ? (
//                   <>
//                     {roomDataCopy?.players.some(
//                       (player) => player.userId === userProfile?.uuid
//                     ) ? (
//                       <>
//                         <div className="flex justify-center relative">
//                           <CheckIn
//                             loadingCheckIn={loadingCheckIn}
//                             roomData={roomDataCopy}
//                             handleCheckin={handleCheckin}
//                             waitingMessage={waitingMessage}
//                             showCheckinDialog={showCheckinDialog}
//                             setShowCheckinDialog={setShowCheckinDialog}
//                           />

//                           <div
//                             className="flex flex-col items-center justify-center gap-4"
//                             style={{
//                               transition: "all .3s ease-in",
//                             }}
//                           >
//                             <style>{styles}</style>
//                             <GameBackground
//                               isSmallScreen={isSmallScreen}
//                               containerRef={containerRef}
//                               customTableBackgroundImage={
//                                 roomDataCopy?.tournamentDetails
//                                   ?.customTableBackgroundImage
//                               }
//                             >
//                               <CustomGameAnimation
//                                 gameRef={gameRef}
//                                 game={game}
//                                 setGame={setGame}
//                                 roomDataCopy={roomDataCopy}
//                                 playerObj={playerObj}
//                                 members={members}
//                                 counter={counter}
//                                 setCounter={setCounter}
//                                 reaction={reaction}
//                                 isSmallScreen={isSmallScreen}
//                                 containerRef={containerRef}
//                                 setCurrentGame={setCurrentGame}
//                                 timerData={timerData}
//                                 handleCardClick={handleCardClick}
//                                 handleOpenSuitModal={handleOpenSuitModal}
//                               />

//                               <div
//                                 className={`absolute rounded-xl z-100
//                                 transition-all duration-200 ${
//                                   dropTarget
//                                     ? "ring-4 ring-green-500 bg-green-500/10"
//                                     : ""
//                                 }`}
//                                 id="table-drop-target"
//                                 style={{
//                                   left: "50%",
//                                   top: "45%",
//                                   transform: "translate(-50%, -50%)",
//                                   // width: isSmallScreen ? "200px" : "400px",
//                                   // height: "180px",
//                                   width: isSmallScreen ? "150px" : "400px",
//                                   height: "180px",

//                                   // zIndex: 10,
//                                   background: "rgba(34, 40, 64, 0.6)",
//                                   boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
//                                   borderWidth: "1px",
//                                   borderStyle: "solid",
//                                   borderColor: dropTarget
//                                     ? "rgba(34, 200, 100, 1)"
//                                     : "rgba(34, 40, 64, 1)",
//                                   zIndex: 11,
//                                 }}
//                               >
//                                 <GameDirection
//                                   direction={roomDataCopy?.direction}
//                                   isKickback={roomDataCopy?.isKickback}
//                                   isMobile={isMobile}
//                                 />

//                                 <CenterTable
//                                   isSmallScreen={isSmallScreen}
//                                   // handleDrawCard={() => {
//                                   //   roomDataCopy?.isPenalty
//                                   //     ? drawPenaltyCards()
//                                   //     : drawCard();
//                                   // }}
//                                   cardWidth={gameRef?.current?.cardWidth}
//                                   cardHeight={gameRef?.current?.cardHeight}
//                                   canDraw={
//                                     roomDataCopy?.jumpCounter === 0 &&
//                                     !roomDataCopy?.isKickback &&
//                                     roomDataCopy?.turn ===
//                                       userProfile?.uuid &&
//                                     (roomDataCopy?.isQuestion ||
//                                       (roomDataCopy?.lastGamePlay?.player ===
//                                         userProfile.uuid &&
//                                         roomDataCopy?.lastGamePlay?.card &&
//                                         roomDataCopy?.lastGamePlay?.card.slice(
//                                           0,
//                                           -1
//                                         ) === "K") ||
//                                       (roomDataCopy?.lastGamePlay?.player ===
//                                         userProfile.uuid &&
//                                         roomDataCopy?.lastGamePlay?.card &&
//                                         roomDataCopy?.lastGamePlay?.card.slice(
//                                           0,
//                                           -1
//                                         ) === "J") ||
//                                       roomDataCopy?.lastGamePlay?.player !==
//                                         userProfile.uuid)
//                                   }
//                                   roomData={roomDataCopy}
//                                   playerObj={playerObj}
//                                   setOn={handleSetOn}
//                                   isShuffling={shufflingCards}
//                                   handleDrawCard={handleDrawCard}
//                                   handleAcceptJump={handleAcceptJump}
//                                   handleAcceptKickback={handleAcceptKickback}
//                                   handlePassTurn={handlePassTurn}
//                                   changedSuit={changedSuit}
//                                 />
//                               </div>

//                               <div
//                                 className="flex justify-center items-center p-1 w-full"
//                                 style={{
//                                   position: "absolute",
//                                   left: "50%",
//                                   transform: "translateX(-50%)",
//                                   bottom: "40px",
//                                   width: Math.min(
//                                     positions.table.width * 1.5,
//                                     positions.cardWidth * 0.95
//                                   ), // 1.5x table width or 80% of canvas width
//                                   zIndex: 11,
//                                 }}
//                               >
//                                 <PlayerDeck
//                                   playerObj={playerObj}
//                                   handleCardClick={handleCardClick}
//                                   handleOpenSuitModal={handleOpenSuitModal}
//                                   roomData={roomDataCopy}
//                                   isSmallScreen={isMobile}
//                                   positions={positions}
//                                   dropTarget={dropTarget}
//                                   setDropTarget={setDropTarget}
//                                   loading={playingCard !== null} // Pass loading state
//                                   invalidMove={invalidMove}
//                                 />
//                               </div>
//                             </GameBackground>
//                           </div>

//                           {!isSmallScreen && chatOpen && (
//                             <div
//                               style={{
//                                 transition: "transform 0.3s ease-in-out",
//                                 transform: chatOpen
//                                   ? "translateX(0)"
//                                   : "translateX(300px)",
//                               }}
//                             >
//                               <ChatContainer
//                                 chatOpen={chatOpen}
//                                 setChatOpen={setChatOpen}
//                                 isSmallScreen={isSmallScreen}
//                                 systemMessages={systemMessages}
//                                 chatMessage={chatMessage}
//                                 setChatMessage={setChatMessage}
//                                 sendMessage={handleSendMessage}
//                                 toggleMobileChat={toggleMobileChat}
//                                 chatContainerRef={chatContainerRef}
//                                 loadingChat={loadingChat}
//                               />
//                             </div>
//                           )}

//                           {isSmallScreen && (
//                             <Drawer
//                               open={openMobileChat}
//                               onClose={toggleMobileChat(false)}
//                               PaperProps={{
//                                 style: {
//                                   backgroundColor: "transparent",
//                                   width: "100%",
//                                   height: "100vh",
//                                   overflow: "hidden",
//                                   display: "flex",
//                                   justify: "center",
//                                 },
//                               }}
//                             >
//                               <ChatContainer
//                                 chatOpen={chatOpen}
//                                 setChatOpen={setChatOpen}
//                                 isSmallScreen={isSmallScreen}
//                                 systemMessages={systemMessages}
//                                 chatMessage={chatMessage}
//                                 setChatMessage={setChatMessage}
//                                 sendMessage={handleSendMessage}
//                                 toggleMobileChat={toggleMobileChat}
//                                 chatContainerRef={chatContainerRef}
//                                 loadingChat={loadingChat}
//                                 containerRef={containerRef}
//                                 setCurrentGame={setCurrentGame}
//                               />
//                             </Drawer>
//                           )}
//                         </div>

//                         {roomDataCopy.gameStatus === "gameover" && (
//                           <>
//                             <GameOverModalDemo
//                               openGameOverModal={openGameOverModal}
//                               // handleCloseGameOverModal={
//                               //   handleCloseGameOverModal
//                               // }
//                               roomData={roomDataCopy}
//                             />

//                             {openGameOverModal &&
//                               roomDataCopy?.winner === userProfile?.uuid && (
//                                 <Confetti
//                                   width={window.innerWidth} // Set to window width
//                                   height={window.innerHeight} // Set to window height
//                                   recycle={false} // Optional: stops confetti after one burst
//                                   numberOfPieces={100} // Optional: more confetti pieces
//                                   style={{
//                                     // Ensure it covers everything
//                                     position: "fixed",
//                                     top: 0,
//                                     left: 0,
//                                     zIndex: 9999,
//                                     pointerEvents: "none", // Allow clicking through confetti
//                                   }}
//                                 />
//                               )}
//                           </>
//                         )}

//                         <SuitModal
//                           handleAces={handleAcesPlay}
//                           openSuitModal={openSuitModal}
//                           handleCloseSuitModal={handleCloseSuitModal}
//                         />

//                         <SettingsModal
//                           isMuted={isMuted}
//                           setIsMuted={setIsMuted}
//                           openSettingsModal={openSettingsModal}
//                           handleCloseSettingsModal={handleCloseSettingsModal}
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <div className="flex justify-center relative">
//                           <div
//                             className="flex flex-col items-center justify-center gap-4"
//                             style={{
//                               transition: "all .3s ease-in",
//                               marginRight:
//                                 !isSmallScreen && chatOpen && "-300px",
//                             }}
//                           >
//                             <style>{styles}</style>
//                             <GameBackground
//                               isSmallScreen={isSmallScreen}
//                               containerRef={containerRef}
//                             >
//                               <WatcherGameAnimation
//                                 gameRef={gameRef}
//                                 game={game}
//                                 setGame={setGame}
//                                 roomDataCopy={roomDataCopy}
//                                 playerObj={playerObj}
//                                 members={members}
//                                 counter={counter}
//                                 setCounter={setCounter}
//                                 reaction={reaction}
//                                 isSmallScreen={isSmallScreen}
//                                 containerRef={containerRef}
//                                 setCurrentGame={setCurrentGame}
//                               />

//                               <div
//                                 className="absolute flex items-center gap-3"
//                                 style={{
//                                   top:
//                                     positions?.center?.y -
//                                     positions?.table?.height * 0.6,
//                                   left: gameRef?.current?.centerX,
//                                   transform: "translateX(-50%)",
//                                   zIndex: 11,
//                                 }}
//                               >
//                                 <div className="flex items-center justify-center h-10 px-3 rounded-l-lg bg-opacity-80 bg-[#222840]">
//                                   {roomDataCopy?.currentSuit === "S" && (
//                                     <img
//                                       src="/cards/spade.png"
//                                       className="w-6 h-6"
//                                       alt="spades"
//                                     />
//                                   )}
//                                   {roomDataCopy?.currentSuit === "C" && (
//                                     <img
//                                       src="/cards/club.png"
//                                       className="w-6 h-6"
//                                       alt="clubs"
//                                     />
//                                   )}
//                                   {roomDataCopy?.currentSuit === "D" && (
//                                     <img
//                                       src="/cards/diamond.png"
//                                       className="w-6 h-6"
//                                       alt="diamonds"
//                                     />
//                                   )}
//                                   {roomDataCopy?.currentSuit === "H" && (
//                                     <img
//                                       src="/cards/heart.png"
//                                       className="w-6 h-6"
//                                       alt="hearts"
//                                     />
//                                   )}
//                                   {roomDataCopy?.currentSuit === "FREE" && (
//                                     <span className="text-xs text-white font-semibold">
//                                       FREE
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>

//                               {shufflingCards && (
//                                 <div
//                                   style={{
//                                     position: "absolute",
//                                     left:
//                                       gameRef?.current?.centerX -
//                                       gameRef?.current?.cardWidth * 0.65,
//                                     top: gameRef?.current?.centerY,
//                                     transform: "translate(-50%, -50%)",
//                                     zIndex: 11,
//                                     width: gameRef?.current?.cardWidth,
//                                     height: gameRef?.current?.cardHeight,
//                                   }}
//                                 >
//                                   {[...Array(5)].map((_, index) => (
//                                     <div
//                                       key={index}
//                                       className="shufflingCard"
//                                       style={{
//                                         backgroundImage:
//                                           "url('/cards/backred.png')",
//                                         backgroundSize: "100% 100%",
//                                         backgroundPosition: "center",
//                                         backgroundRepeat: "no-repeat",
//                                       }}
//                                     ></div>
//                                   ))}
//                                 </div>
//                               )}

//                               <div
//                                 className="absolute bottom-0 right-0 flex
//                                   justify-between items-start z-30"
//                               >
//                                 {isSmallScreen ? (
//                                   <button onClick={toggleMobileChat(true)}>
//                                     <img
//                                       src={`/cards/chatbubble_1.png`}
//                                       width={isSmallScreen ? "40" : "50"}
//                                       height={isSmallScreen ? "40" : "50"}
//                                       alt="chat"
//                                     />
//                                   </button>
//                                 ) : (
//                                   <button
//                                     onClick={() => setChatOpen(!chatOpen)}
//                                   >
//                                     {" "}
//                                     <img
//                                       src={`/cards/chatbubble_1.png`}
//                                       width={isSmallScreen ? "40" : "50"}
//                                       height={isSmallScreen ? "40" : "50"}
//                                       alt="chat"
//                                     />
//                                   </button>
//                                 )}
//                               </div>

//                               <div
//                                 className="rounded-xl"
//                                 style={{
//                                   position: "absolute",
//                                   left: "50%",
//                                   top: "50%",
//                                   transform: "translate(-50%, -50%)",
//                                   width: isSmallScreen ? "200px" : "400px",
//                                   height: "180px",
//                                   background: "rgba(34, 40, 64, 0.6)",
//                                   boxShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
//                                   border: "1px solid rgba(34, 40, 64, 1)",
//                                 }}
//                               />
//                             </GameBackground>
//                           </div>

//                           {!isSmallScreen && (
//                             <ChatContainer
//                               chatOpen={chatOpen}
//                               setChatOpen={setChatOpen}
//                               isSmallScreen={isSmallScreen}
//                               systemMessages={systemMessages}
//                               chatMessage={chatMessage}
//                               setChatMessage={setChatMessage}
//                               sendMessage={handleSendMessage}
//                               toggleMobileChat={toggleMobileChat}
//                               chatContainerRef={chatContainerRef}
//                               loadingChat={loadingChat}
//                             />
//                           )}

//                           {isSmallScreen && (
//                             <Drawer
//                               open={openMobileChat}
//                               onClose={toggleMobileChat(false)}
//                               PaperProps={{
//                                 style: {
//                                   backgroundColor: "transparent",
//                                   width: "100%",
//                                   height: "100vh",
//                                   overflow: "hidden",
//                                   display: "flex",
//                                   justify: "center",
//                                 },
//                               }}
//                             >
//                               <ChatContainer
//                                 chatOpen={chatOpen}
//                                 setChatOpen={setChatOpen}
//                                 isSmallScreen={isSmallScreen}
//                                 systemMessages={systemMessages}
//                                 chatMessage={chatMessage}
//                                 setChatMessage={setChatMessage}
//                                 sendMessage={handleSendMessage}
//                                 toggleMobileChat={toggleMobileChat}
//                                 chatContainerRef={chatContainerRef}
//                                 loadingChat={loadingChat}
//                               />
//                             </Drawer>
//                           )}
//                         </div>

//                         {roomDataCopy.gameStatus === "gameover" && (
//                           <GameOverModalDemo
//                             openGameOverModal={openGameOverModal}
//                             // handleCloseGameOverModal={handleCloseGameOverModal}
//                             roomData={roomDataCopy}
//                           />
//                         )}
//                       </>
//                     )}
//                   </>
//                 ) : (
//                   // room not full
//                   <>
//                     {!roomDataCopy?.players.some(
//                       (player) => player.userId === userProfile?.uuid
//                     ) ? (
//                       <>
//                         <JoiningPlayer
//                           roomDataCopy={roomDataCopy}
//                           loadingBuyin={loadingBuyin}
//                           handleJoinRoom={handleJoinRoom}
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <WaitingPlayer
//                           roomDataCopy={roomDataCopy}
//                           pathname={pathname}
//                           copied={copied}
//                           handleCopyClick={handleCopyClick}
//                         />
//                       </>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//           <h1>HERE</h1>
//           <button onClick={() => console.log(roomDataCopy)}>METAL</button>
//         </>
//       )}
//     </>
//   );
// };

const KadiStrategyTable = ({ roomSlug }) => {
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

    invalidMove,

    isMuted,
    setIsMuted,

    changedSuit,

    starterCard,
    isRevealingStarter,
  } = useKadiStrategyAISocket(roomSlug, userProfile, gameRef);

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

  // scroll to bottom on message
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

                  <NetworkStatus />
                </>
              )}
            <div className="relative w-full max-w-6xl">
              {roomDataCopy &&
                roomDataCopy[0].players.length ===
                  roomDataCopy[0].maxPlayers && (
                  <>
                    {roomDataCopy[0]?.players.some(
                      (player) => player.userId === userProfile?.uuid
                    ) && (
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
                            <GameBackground
                              isSmallScreen={isSmallScreen}
                              containerRef={containerRef}
                              customTableBackgroundImage={
                                roomDataCopy[0]?.tournamentDetails
                                  ?.customTableBackgroundImage
                              }
                            >
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
                                handleCardClick={handleCardClick}
                                handleOpenSuitModal={handleOpenSuitModal}
                              />

                              <div
                                className={`absolute rounded-xl z-100
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
                                  zIndex: 11,
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

                              <PlayPanel
                                roomDataCopy={roomDataCopy}
                                playerObj={playerObj}
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
                                <PlayerDeck
                                  playerObj={playerObj}
                                  handleCardClick={handleCardClick}
                                  handleOpenSuitModal={handleOpenSuitModal}
                                  roomData={roomDataCopy[0]}
                                  isSmallScreen={isMobile}
                                  positions={positions}
                                  dropTarget={dropTarget}
                                  setDropTarget={setDropTarget}
                                  loading={playingCard !== null}
                                  invalidMove={invalidMove}
                                />
                              </div>
                            </GameBackground>
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
                    )}
                  </>
                )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default KadiStrategyTable;
