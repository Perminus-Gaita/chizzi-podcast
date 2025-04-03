"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import axios from "axios";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Trophy,
  Home,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Crown,
  Film,
  Play,
  Loader2,
} from "lucide-react";

import { calculateDeckValue } from "@/utils/cards";

import { createNotification } from "@/app/store/notificationSlice";

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

const GameOverModalDemo = ({ openGameOverModal, roomData }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const userProfile = useSelector((state) => state.auth.profile);

  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const winner = sortedPlayers.find(
    (player) => player.userId === roomData?.winner
  );

  const isCurrentUserWinner = winner?.userId === userProfile?.uuid;
  const isCurrentUserLoser =
    !isCurrentUserWinner &&
    sortedPlayers.some((player) => player.userId === userProfile?.uuid);
  const isViewer = !isCurrentUserWinner && !isCurrentUserLoser;

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

  const onNewGame = async () => {
    setLoading(true);

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: `Creating game room...`,
      })
    );

    const randomId = Math.random().toString(36).substring(2, 8);

    try {
      const response = await axios.post("/api/cards/create-test-room", {
        roomName: `table-${randomId}`,
        creator: "674de1dff15bd1881adc0aab",
        maxPlayers: 2,
        timer: false,
        amount: 0,
        joker: true,
      });

      if (response.status === 201) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response?.data.message,
          })
        );

        router.push(`/kadi/table-${randomId}`);

        setLoading(false);
        // console.log("### RESPONDED ###");
        // console.log(response.data);
      }
    } catch (error) {
      console.error("Error creating cards room:", error);
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error creating room.",
        })
      );
      setLoading(false);
    }
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
              id="game-over-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
            >
              <div className="relative p-2 md:p-6 text-white">
                <h2 className="text-xl md:text-xl font-bold text-center">
                  Game Over!
                </h2>

                <div className="mb-2">
                  <div className="flex justify-center items-center space-x-4">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                    <span className="text-md md:text-2xl font-semibold capitalize">
                      {userProfile?.uuid === winner.userId
                        ? "You Win!"
                        : `${winner.username} Wins!`}
                    </span>
                  </div>
                  <p className="text-center text-xs md:text-sm">
                    {getMessageForUser()}
                  </p>
                </div>

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
                                Score: {calculateDeckValue(player.playerDeck)}
                              </p>
                            </div>
                          </div>
                          {player.userId === winner.userId && (
                            <Crown className="h-6 w-6 text-yellow-400" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlayerExpansion(player.userId)}
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

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onNewGame}
                    className={`w-full ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    )}
                    {loading ? "Creating..." : "New Game"}
                  </Button>

                  <Link href={`/lobby`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Return to Lobby
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameOverModalDemo;
