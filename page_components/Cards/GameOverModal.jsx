"use client";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Trophy,
  Home,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Crown,
  Coins,
  TrendingUp,
} from "lucide-react";

import { calculateDeckValue } from "@/utils/cards";
import { useWalletHandler } from "@/lib/user";

const getWinnersFinishingCards = (roomData) => {
  // Ensure the game is over and last10Moves exists and is an array
  if (
    roomData?.gameStatus !== "gameover" ||
    !Array.isArray(roomData?.last10Moves)
  ) {
    return [];
  }

  const winnerId = roomData.winner;
  const last10Moves = roomData.last10Moves;

  const winnersFinishingCards = [];
  let foundOpponentMove = false;

  // Iterate over the last10Moves array in reverse order
  for (let i = last10Moves.length - 1; i >= 0; i--) {
    const move = last10Moves[i];

    if (move.player !== winnerId) {
      foundOpponentMove = true;
      break;
    }

    winnersFinishingCards.push(move.card);
  }

  // Reverse the order of the collected moves to maintain the correct order of play
  return winnersFinishingCards.reverse();
};

const WinAmountDisplay = ({ amount, onComplete }) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 20;
    const stepValue = amount / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      if (currentStep < steps) {
        setDisplayAmount((prev) => Math.min(amount, prev + stepValue));
        currentStep++;
      } else {
        clearInterval(timer);
        // Add a small delay before triggering onComplete
        setTimeout(() => {
          onComplete?.();
        }, 300); // Give animation time to finish
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [amount, onComplete]);

  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.3, opacity: 0 }}
      className="relative flex items-center justify-center py-4"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(52, 211, 153, 0)",
            "0 0 20px 10px rgba(52, 211, 153, 0.3)",
            "0 0 0 0 rgba(52, 211, 153, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/90 to-green-600/90 shadow-lg border border-white/10"
      >
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xs text-emerald-100/80 font-medium uppercase tracking-wider">
            You Won
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">+</span>
            <span className="text-3xl font-bold text-white tabular-nums">
              {Math.floor(displayAmount).toLocaleString()}
            </span>
            <span className="text-lg font-semibold text-emerald-100/90">
              KES
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GameOverModal = ({
  openGameOverModal,
  // handleCloseGameOverModal,
  roomData,
  handleRematchOffer,
  handleAcceptRematch,
  handleDeclineRematch,
  isLoadingRematch,
  rematchOffer,
  rematchTimer,
}) => {
  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [showWinAnimation, setShowWinAnimation] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const winner = useMemo(
    () =>
      roomData?.players?.find((player) => player.userId === roomData?.winner),
    [roomData]
  );

  const pot = Math.abs(roomData?.pot || 0);

  const sortedPlayers = useMemo(() => {
    if (!Array.isArray(roomData?.players)) return [];
    return [...roomData.players].sort((a, b) => {
      const aDeckValue = Array.isArray(a.playerDeck)
        ? calculateDeckValue(a.playerDeck)
        : Infinity;
      const bDeckValue = Array.isArray(b.playerDeck)
        ? calculateDeckValue(b.playerDeck)
        : Infinity;
      return aDeckValue - bDeckValue;
    });
  }, [roomData?.players]);

  // const winner = sortedPlayers.find(
  //   (player) => player.userId === roomData?.winner
  // );

  const isCurrentUserWinner = winner?.userId === userProfile?.uuid;
  const isCurrentUserLoser =
    !isCurrentUserWinner &&
    sortedPlayers.some((player) => player.userId === userProfile?.uuid);
  const isViewer = !isCurrentUserWinner && !isCurrentUserLoser;

  useEffect(() => {
    if (openGameOverModal) {
      setShowWinAnimation(true);
      setShowContent(false);
      setAnimationComplete(false);
    }
  }, [openGameOverModal]);

  const handleWinAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
    // Use timeout to ensure smooth transition
    setTimeout(() => {
      setShowWinAnimation(false);
      setShowContent(true);
    }, 200);
  }, []);

  const shouldShowContent = useMemo(() => {
    // Show content immediately if:
    // 1. Not current user's win
    // 2. No pot (no win animation needed)
    // 3. Animation is complete
    return !isCurrentUserWinner || pot === 0 || showContent;
  }, [isCurrentUserWinner, pot, showContent]);

  const togglePlayerExpansion = (playerId) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  const renderPlayerCards = (player) => {
    const cards = player.playerDeck;

    return (
      <ScrollArea className="w-full rounded-md border">
        <div className="h-[100px]">
          <div className="flex gap-2 p-4">
            {player.userId === roomData.winner ? (
              <>
                {getWinnersFinishingCards(roomData)?.map((card, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={`/cards/${card}.png`}
                      alt={`Card ${card}`}
                      className="w-12 h-16 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ))}
              </>
            ) : (
              <>
                {cards?.map((card, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={`/cards/${card}.png`}
                      alt={`Card ${card}`}
                      className="w-12 h-16 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };

  const getMessageForUser = () => {
    if (isCurrentUserWinner) return "Congratulations! You've mastered Kadi!";
    if (isCurrentUserLoser)
      return "Good game! Keep practicing and you'll improve!";
    return "What an exciting match! Ready to play your own game?";
  };

  const renderRematchOptions = () => {
    const originalPot = Math.abs(roomData?.pot || 0);
    const userBalance = walletData?.balances?.KES || 0;

    if (originalPot === 0) {
      return (
        <Button
          variant="default"
          onClick={() => handleRematchOffer()}
          disabled={isLoadingRematch}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Rematch
        </Button>
      );
    }

    return (
      <div className="space-y-3 p-2 sm:p-4">
        <div className="flex justify-between items-center px-1 sm:px-2">
          <span className="text-xs sm:text-sm text-white/80">Your Balance</span>
          <div className="flex items-center text-xs sm:text-sm font-medium">
            <Coins className="h-3 w-3 mr-1 text-yellow-400" />
            <span className="text-yellow-400">{userBalance / 100}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="default"
            onClick={() => handleRematchOffer("same")}
            disabled={isLoadingRematch || userBalance < originalPot}
            className={`w-full min-h-[44px] ${
              userBalance < originalPot
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <div className="flex items-center justify-between w-full px-2 sm:px-3">
              <div className="flex items-center">
                <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Run it Back</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <Coins className="h-3 w-3 mr-1" />
                <span>{originalPot / 100}</span>
              </div>
            </div>
          </Button>

          <Button
            variant="default"
            onClick={() => handleRematchOffer("double")}
            disabled={isLoadingRematch || userBalance < originalPot * 2}
            className={`w-full min-h-[44px] ${
              userBalance < originalPot * 2
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <div className="flex items-center justify-between w-full px-2 sm:px-3">
              <div className="flex items-center">
                <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Double or Nothing!</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <Coins className="h-3 w-3 mr-1" />
                <span>{(originalPot * 2) / 100}</span>
              </div>
            </div>
          </Button>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-white/60 px-2">
          {userBalance < originalPot
            ? "Insufficient balance for rematch"
            : "Stake will be deducted from your balance"}
        </p>
      </div>
    );
  };

  const renderRematchResponse = () => {
    if (!rematchOffer) return null;

    const isPaidGame = Math.abs(roomData?.pot) > 0;
    const isDoubleStakes =
      Math.abs(rematchOffer.stakeAmount) > Math.abs(roomData?.pot);
    const userBalance = walletData?.balances?.KES || 0;
    const hasEnoughBalance =
      !isPaidGame || userBalance >= Math.abs(rematchOffer.stakeAmount);

    return (
      <div className="space-y-3">
        {isPaidGame && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs sm:text-sm text-white/80">
              Your Balance
            </span>
            <div className="flex items-center text-xs sm:text-sm font-medium">
              <Coins className="h-3 w-3 mr-1 text-yellow-400" />
              <span className="text-yellow-400">{userBalance / 100}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="font-medium text-sm sm:text-base">Rematch Offered</p>
          {isPaidGame ? (
            <p className="text-xs sm:text-sm text-white/80">
              {isDoubleStakes ? "Double Stakes" : "Same Stakes"} -
              <span className="ml-1">
                <Coins className="inline h-3 w-3 mx-1" />
                {isDoubleStakes
                  ? Math.abs(roomData?.pot * 2) / 100
                  : Math.abs(roomData?.pot) / 100}
              </span>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-white/80">Friendly Game</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleAcceptRematch}
            disabled={isLoadingRematch || !hasEnoughBalance}
            className={`w-full min-h-[44px] ${
              !hasEnoughBalance && isPaidGame
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            onClick={handleDeclineRematch}
            disabled={isLoadingRematch}
            className="w-full min-h-[44px]"
          >
            Decline
          </Button>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-white/60">
          {!hasEnoughBalance && isPaidGame
            ? "Insufficient balance to accept rematch"
            : `${rematchTimer}s to respond`}
        </p>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {openGameOverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
            >
              <div className="relative p-2 md:p-6 text-white">
                <h2 className="text-xl md:text-xl font-bold text-center mb-4">
                  Game Over!
                </h2>

                {isCurrentUserWinner && showWinAnimation && pot > 0 && (
                  <WinAmountDisplay
                    amount={pot / 100}
                    onComplete={handleWinAnimationComplete}
                  />
                )}

                <AnimatePresence>
                  {shouldShowContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {roomData?.tournamentId ? (
                        <div className="text-center space-y-2 mb-4">
                          <h2 className="text-xl md:text-2xl font-bold">
                            {roomData.tournamentMatchData.name}
                          </h2>
                          <div className="flex justify-center items-center space-x-3">
                            <Trophy className="h-6 w-6 text-yellow-400" />
                            <span className="text-lg font-semibold">
                              {roomData.tournamentDetails.status === "completed"
                                ? userProfile?.uuid === winner.userId
                                  ? "Tournament Champion!"
                                  : `${winner.name} Wins Tournament!`
                                : userProfile?.uuid === winner.userId
                                ? "You Advance!"
                                : `${winner.name} Advances!`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-2">
                          <div className="flex justify-center items-center space-x-4">
                            <Trophy className="h-8 w-8 text-yellow-400" />
                            <span className="text-md md:text-2xl font-semibold capitalize">
                              {userProfile?.uuid === winner.userId
                                ? "You Win!"
                                : `${winner.name} Wins!`}
                            </span>
                          </div>
                          <p className="text-center text-xs md:text-sm">
                            {getMessageForUser()}
                          </p>
                        </div>
                      )}

                      <ScrollArea className="h-[40vh] mb-2">
                        <div className="py-4 space-y-4 space-x-2 flex flex-col items-center">
                          {sortedPlayers.map((player, index) => (
                            <motion.div
                              key={player.userId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`w-11/12 bg-indigo-800 bg-opacity-50 rounded-lg p-2 md:p-4 ${
                                player.userId === winner.userId
                                  ? "ring-2 ring-yellow-400"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full
                             bg-indigo-700 flex items-center justify-center text-lg md:text-xl font-bold"
                                  >
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{player.name}</p>
                                    <p className="text-sm text-gray-300">
                                      @{player.username}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      Score:{" "}
                                      {calculateDeckValue(player.playerDeck)}
                                    </p>
                                  </div>
                                </div>
                                {player.userId === winner.userId && (
                                  <Crown className="h-6 w-6 text-yellow-400" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    togglePlayerExpansion(player.userId)
                                  }
                                >
                                  {expandedPlayer === player.userId ? (
                                    <ChevronUp />
                                  ) : (
                                    <ChevronDown />
                                  )}
                                </Button>
                              </div>
                              {expandedPlayer === player.userId && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4"
                                >
                                  {renderPlayerCards(player)}
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      {roomData?.tournamentId ? (
                        <div className="space-y-2">
                          <div className="text-center text-sm text-gray-300 mb-2">
                            {roomData.tournamentMatchData.nextMatchId
                              ? "Next Round Starting Soon"
                              : "Tournament Final Complete"}
                          </div>

                          <Link
                            href={`/${roomData.tournamentDetails.creatorUsername}/${roomData.tournamentDetails.slug}`}
                            className="flex-1"
                          >
                            <Button variant="default" className="w-full">
                              Return to Tournament
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {!roomData?.tournamentId && (
                            // <>
                            //   {!rematchOffer ? (
                            //     <Button
                            //       variant="default"
                            //       onClick={() => handleRematchOffer(roomData.pot)}
                            //       disabled={isLoadingRematch || roomData.tournamentId}
                            //       className="w-full"
                            //     >
                            //       {isLoadingRematch ? (
                            //         "Waiting for response..."
                            //       ) : (
                            //         <>
                            //           <RotateCcw className="mr-2 h-4 w-4" />
                            //           {Math.abs(roomData.pot) > 0
                            //             ? "Rematch (Double or Nothing)"
                            //             : "Rematch"}
                            //         </>
                            //       )}
                            //     </Button>
                            //   ) : rematchOffer.offeredBy === userProfile.uuid ? (
                            //     <div className="text-center text-white">
                            //       <p>Waiting for opponent...</p>
                            //       <p>{rematchTimer}s</p>
                            //     </div>
                            //   ) : (
                            //     <div className="space-y-2">
                            //       <p className="text-center text-white mb-2">
                            //         Rematch offered{" "}
                            //         {rematchOffer.amount > 0
                            //           ? `(${rematchOffer.amount} coins)`
                            //           : ""}
                            //       </p>
                            //       <div className="flex gap-2">
                            //         <Button
                            //           variant="default"
                            //           onClick={handleAcceptRematch}
                            //           disabled={isLoadingRematch}
                            //           className="w-full"
                            //         >
                            //           Accept
                            //         </Button>
                            //         <Button
                            //           variant="outline"
                            //           onClick={handleDeclineRematch}
                            //           disabled={isLoadingRematch}
                            //           className="w-full"
                            //         >
                            //           Decline
                            //         </Button>
                            //       </div>
                            //       <p className="text-center text-sm text-white/60">
                            //         {rematchTimer}s to respond
                            //       </p>
                            //     </div>
                            //   )}
                            // </>

                            <>
                              {rematchOffer
                                ? renderRematchResponse()
                                : renderRematchOptions()}
                            </>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/arena")}
                            className="w-full"
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Return to Arena
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* <button onClick={() => console.log(roomData)}>HAPPY</button> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameOverModal;
