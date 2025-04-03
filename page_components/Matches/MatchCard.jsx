import Link from "next/link";
import axios from "axios";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  ArrowLeftRight,
  AlertCircle,
  Loader2,
  PlayCircle,
  Eye,
  EyeOff,
  Share2,
  Timer,
} from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { createNotification } from "@/app/store/notificationSlice";
import { canFinishGame } from "@/services/cards/utils";
import { useMatchesSocket } from "@/hooks/useMatchesSocket";
import SuitModal from "@/page_components/Cards/SuitModal";

const CardPreview = ({
  card,
  isSelectable,
  isSelected,
  backColor,
  className,
  handleCardClick,
  isPenalty,
  handleOpenSuitModal,
  loading,
  matchId,
  turn,
  jumpCounter,
  userId,
  topCard,
  hideCards,
}) => {
  const dispatch = useDispatch();

  return (
    <motion.div
      whileHover={isSelectable ? { y: -8 } : {}}
      animate={isSelected ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
      onClick={() => {
        if (turn !== userId) {
          dispatch(
            createNotification({
              open: "true",
              type: "error",
              message: "Please wait for your turn.",
            })
          );
          return;
        }
        if (card.slice(0, -1) === "A") {
          if (isPenalty) {
            handleCardClick(card, matchId, {
              turn: turn,
              topCard: topCard,
            });
          } else {
            if (jumpCounter > 0) {
              dispatch(
                createNotification({
                  open: "true",
                  type: "error",
                  message: "Please wait for your turn.",
                })
              );
              return;
            }
            handleOpenSuitModal(card, matchId);
          }
        } else {
          // console.log("clicking a card here");
          handleCardClick(card, matchId);
        }
      }}
      disabled={loading}
      className={cn(
        "relative select-none",
        "transition-all duration-200 ease-out",
        !loading ? "cursor-pointer" : "cursor-not-allowed opacity-70",
        className
      )}
    >
      {/* Card Container */}
      <div className="relative aspect-[2.5/3.5] w-[45px] xs:w-[52px] sm:w-[64px] md:w-[72px]">
        <img
          src={hideCards ? `/cards/back${backColor}.png` : `/cards/${card}.png`}
          alt={hideCards ? "Hidden Card" : card}
          className={cn(
            "absolute inset-0 w-full h-full object-contain rounded-lg",
            "transition-all duration-200 ease-out",
            "shadow-sm hover:shadow-md",
            "bg-white/5 border border-border/50",
            isSelected && "ring-2 ring-primary shadow-lg"
          )}
        />
        {/* Valid Move Indicator 
        {isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 
                rounded-full ring-2 ring-background flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}

        {/* Selection Highlight 
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-lg ring-2 ring-primary"
          />
        )}
          */}
      </div>
    </motion.div>
  );
};

const PlayerStatus = ({ player, isTurn }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 ${
        isTurn ? "bg-primary/10 dark:bg-primary/20" : "bg-muted/20"
      } 
        rounded-lg p-1.5`}
    >
      <div className="relative w-8 h-8 rounded-full">
        <Avatar className="w-8 h-8">
          <AvatarImage src={player?.profilePicture} />
          <AvatarFallback>{player?.username?.[0]}</AvatarFallback>
        </Avatar>
        {player?.on && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full 
        bg-[#78d64b] border-2 border-background dark:border-gray-800"
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{player?.username}</p>
          {isTurn && (
            <Badge variant="secondary" className="h-5 animate-pulse">
              Turn
            </Badge>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>{player?.numCards} cards</span>
        </div>
      </div>
    </motion.div>
  );
};

const MatchCard = ({ match }) => {
  const AI_PLAYER = "676112252e2cd5a9df380aad";
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.profile);

  const {
    playingCard,
    playingMove,

    handleDrawCard,
    handleAcceptJump,
    handleAcceptKickback,
    handlePassTurn,
    handleSetOn,
    handleCardClick,
    handleAcesPlay,
    openSuitModal,
    handleOpenSuitModal,
    handleCloseSuitModal,
  } = useMatchesSocket();

  let type = "game";

  const { playerObj } = match;

  const {
    currentSuit,
    topCard,
    turn,
    direction,
    isKickback,
    isPenalty,
    isQuestion,
    jumpCounter,
    lastGamePlay,
    desiredSuit,
    players,
  } = match;

  const [hideCards, setHideCards] = useState(false);
  const [backColor] = useState(
    ["red", "green", "blue"][Math.floor(Math.random() * 3)]
  );

  const [selectedCard, setSelectedCard] = useState(null);

  const isUrgent = match.turn === userProfile?.uuid;
  const canPlay = match.turn === userProfile?.uuid;

  const isValidMove = (topCard, playedCard) => {
    // Extract card components
    const topCardRank = topCard.slice(0, -1);
    const topCardSuit = topCard.slice(-1);
    const playedCardRank = playedCard.slice(0, -1);
    const playedCardSuit = playedCard.slice(-1);

    // CASE 1: If game is in penalty state
    if (isPenalty) {
      // Only allow penalty cards (2, 3, JOK) or Ace to cancel
      if (playedCardRank === "A") return true;
      if (playedCard === "JOK1" || playedCard === "JOK2") return true;
      if (playedCardRank === "2" || playedCardRank === "3") {
        // Must match suit or rank of penalty card
        return topCardSuit === playedCardSuit || topCardRank === playedCardRank;
      }
      return false; // Any other card is invalid during penalty
    }

    // CASE 2: If top card is Joker, any card is valid
    if (topCard === "JOK1" || topCard === "JOK2") return true;

    // CASE 3: If there are pending jumps
    if (jumpCounter > 0) return playedCardRank === "J";

    // CASE 4: Jokers and Aces can always be played (except during penalty)
    if (
      playedCard === "JOK1" ||
      playedCard === "JOK2" ||
      playedCardRank === "A"
    ) {
      return true;
    }

    // CASE 5: After Ace play with desired suit
    if (desiredSuit && topCardRank === "A") {
      return playedCardSuit === desiredSuit;
    }

    // CASE 6: Question state requires matching answer
    if (isQuestion) {
      // Handle question-answer matching logic
      // Add specific rules for question-answer pairs
      return true; // Placeholder - implement actual logic
    }

    // CASE 7: Default case - match suit or rank
    return topCardSuit === playedCardSuit || topCardRank === playedCardRank;
  };

  // AI INTEGRATION

  // const executeAITurn = async (roomId) => {
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     const aiResponse = await axios.post("/api/cards/play1", {
  //       action: "play",
  //       data: {
  //         userId: AI_PLAYER,
  //         roomId: roomId,
  //       },
  //     });

  //     if (aiResponse.status === 200) {
  //       // console.log("### THE AI MOVE ###");
  //       // console.log(aiResponse.data);
  //       console.log("mutating matches");
  //       matchesMutate();

  //       if (aiResponse.data.room.gameStatus === "gameover") {
  //         // handleOpenGameOverModal();
  //         alert("### GAME OVER ###");
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error executing AI turn:", err);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Error during AI turn",
  //       })
  //     );
  //   }
  // };

  // const handleDrawCard = async () => {
  //   if (!userProfile) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "info",
  //         message: "Please, Login to Play.",
  //       })
  //     );
  //     return;
  //   }

  //   setLoadingPlay(true);

  //   try {
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "draw",
  //       data: {
  //         roomId: match.id,
  //         isPenalty: isPenalty ? true : false,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // dispatch(
  //       //   createNotification({
  //       //     open: "true",
  //       //     type: "success",
  //       //     message: "Card drawn successfully!",
  //       //   })
  //       // );
  //       // console.log("Card drawn successfully", response.data);

  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();

  //       setLoadingPlay(false);

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to draw card.",
  //         })
  //       );

  //       setLoadingPlay(false);
  //     }
  //   } catch (err) {
  //     setLoadingPlay(false);
  //     console.error("Error drawing card:", err);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "An error occurred while drawing the card.",
  //       })
  //     );
  //   }
  // };

  // const handleAcceptJump = async () => {
  //   try {
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "acceptJump",
  //       data: {
  //         roomId: match.id,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // Optionally handle success if needed
  //       // console.log("Successfully accepted the jump:", response.data);
  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to accept the jump.",
  //         })
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error accepting jump:", error);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "An error occurred while accepting the jump.",
  //       })
  //     );
  //   }
  // };

  // const handleAcceptKickback = async () => {
  //   if (!userProfile || !match.id) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "info",
  //         message: "Missing user profile or room data.",
  //       })
  //     );
  //     return;
  //   }

  //   // console.log("### accepting kickback ###");

  //   try {
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "acceptKickback",
  //       data: {
  //         roomId: match.id,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // dispatch(
  //       //   createNotification({
  //       //     open: "true",
  //       //     type: "success",
  //       //     message: "Kickback accepted successfully!",
  //       //   })
  //       // );
  //       // console.log("Kickback accepted successfully", response.data);
  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to accept kickback.",
  //         })
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error accepting kickback:", error);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "An error occurred while accepting kickback.",
  //       })
  //     );
  //   }
  // };

  // const handlePassTurn = async () => {
  //   if (!userProfile) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "info",
  //         message: "Please, Login to Play.",
  //       })
  //     );
  //     return;
  //   }

  //   if (!match.id) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "warning",
  //         message: "Room ID is not available.",
  //       })
  //     );
  //     return;
  //   }

  //   // console.log("### passing turn ###");

  //   try {
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "passTurn",
  //       data: {
  //         roomId: match.id,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // dispatch(
  //       //   createNotification({
  //       //     open: "true",
  //       //     type: "success",
  //       //     message: "Turn passed successfully!",
  //       //   })
  //       // );

  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();
  //       // console.log("Turn passed successfully", response.data);

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to pass the turn.",
  //         })
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error passing turn:", error);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "An error occurred while passing the turn.",
  //       })
  //     );
  //   }
  // };

  // const handleAcesPlay = async (desiredSuit) => {
  //   setPlayingCard(aceCard);

  //   handleCloseSuitModal();

  //   if (!userProfile || !match.id) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Missing user profile or room data",
  //       })
  //     );
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "play",
  //       data: {
  //         userId: userProfile?.uuid,
  //         roomId: match.id,
  //         cardPlayed: aceCard,
  //         desiredSuit: desiredSuit,
  //       },
  //     });

  //     // setRoomDataCopy(optimisticState);
  //     if (response.status === 200) {
  //       // Handle success
  //       // console.log("Successfully played card", response.data);
  //       setAceCard(null);

  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();
  //       // console.log("Played Aces successfully", response.data);

  //       setPlayingCard(null);

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }

  //       // dispatch(
  //       //   createNotification({
  //       //     open: "true",
  //       //     type: "success",
  //       //     message: "Card played successfully!",
  //       //   })
  //       // );
  //     } else {
  //       // Handle failure
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to play aces.",
  //         })
  //       );
  //     }
  //   } catch (error) {
  //     // console.log(error);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Failed to play Aces card",
  //       })
  //     );
  //   }
  // };

  // const handleSetOn = async () => {
  //   if (!userProfile || !match.id) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "info",
  //         message: "Missing required data to set player on.",
  //       })
  //     );
  //     return;
  //   }

  //   setLoadingPlay(true);

  //   try {
  //     // console.log("setting player on...");
  //     const response = await axios.post("/api/cards/play1", {
  //       action: "setOn",
  //       data: {
  //         roomId: match.id,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // setCurrentRoomData(response.data.room);
  //       matchesMutate();

  //       setLoadingPlay(false);

  //       // console.log("Kadi set on successfully", response.data);

  //       if (response.data.room.turn === AI_PLAYER) {
  //         await executeAITurn(match.id);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Failed to set Kadi",
  //         })
  //       );

  //       setLoadingPlay(false);
  //     }
  //     // // Optimistic update
  //     // const optimisticState = structuredClone(roomDataCopy);
  //     // const playerIndex = optimisticState[0].players.findIndex(
  //     //   p => p.player === userProfile?.uuid
  //     // );
  //     // if (playerIndex !== -1) {
  //     //   optimisticState[0].players[playerIndex].on = true;
  //     // }
  //     // setRoomDataCopy(optimisticState);
  //   } catch (error) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Failed to set player on",
  //       })
  //     );

  //     setLoadingPlay(false);
  //   } finally {
  //     setLoadingPlay(false);
  //   }
  // };

  // const handleOpenSuitModal = (card) => {
  //   // If jumpCounter is greater than 0, only "J" cards are valid moves
  //   if (jumpCounter > 0) {
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Invalid Move.",
  //       })
  //     );

  //     setPlayingCard(null); // Clear the playing card state

  //     return;
  //   }

  //   if (turn !== userProfile.uuid) {
  //     // console.log("### WAIT YOU TURN ###");
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "Please wait for your turn.",
  //       })
  //     );

  //     setPlayingCard(null);

  //     return;
  //   }

  //   setOpenSuitModal(true);
  //   setAceCard(card);
  // };

  // const handleCloseSuitModal = () => setOpenSuitModal(false);

  // const handleCardClick = async (card) => {
  //   if (playingCard) return;
  //   setPlayingCard(card);

  //   try {
  //     if (turn !== userProfile?.uuid) {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Please wait for your turn.",
  //         })
  //       );
  //       return;
  //     }

  //     // let topCard =
  //     //   currentRoomData?.discardPile[currentRoomData?.discardPile.length - 1];

  //     // console.log("## top card ###");
  //     // console.log(topCard);
  //     // console.log(card);

  //     // Check if the move is valid
  //     if (isValidMove(topCard, card)) {
  //       const response = await axios.post("/api/cards/play1", {
  //         action: "play",
  //         data: {
  //           userId: userProfile?.uuid,
  //           roomId: match.id,
  //           cardPlayed: card,
  //         },
  //       });

  //       if (response.status === 200) {
  //         // Handle successful response if needed
  //         // console.log("Move successfully processed", response.data);

  //         // setCurrentRoomData(response.data.room);
  //         matchesMutate();

  //         setPlayingCard(null);

  //         if (response.data.room.turn === AI_PLAYER) {
  //           await executeAITurn(match.id);
  //         }

  //         if (response.data.room.gameStatus === "gameover") {
  //           // handleOpenGameOverModal();
  //           alert("### GAME OVER ###");
  //         }
  //       } else {
  //         dispatch(
  //           createNotification({
  //             open: "true",
  //             type: "error",
  //             message: "Failed to play the card.",
  //           })
  //         );

  //         setPlayingCard(null);
  //       }
  //     } else {
  //       dispatch(
  //         createNotification({
  //           open: "true",
  //           type: "error",
  //           message: "Invalid Move.",
  //         })
  //       );

  //       setPlayingCard(null);
  //     }
  //   } catch (err) {
  //     console.error("Error playing card");
  //     console.error(err);
  //     dispatch(
  //       createNotification({
  //         open: "true",
  //         type: "error",
  //         message: "An error occurred while playing the card.",
  //       })
  //     );
  //   }
  // };

  return (
    <>
      <SuitModal
        handleAces={handleAcesPlay}
        openSuitModal={openSuitModal}
        handleCloseSuitModal={handleCloseSuitModal}
        isPenalty={isPenalty}
        desiredSuit={desiredSuit}
        matchId={match._id}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden dark:bg-gray-800">
          {/* privacy */}
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setHideCards(!hideCards)}
            >
              {hideCards ? (
                <>
                  <EyeOff className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Urgency Indicator */}
          {isUrgent && (
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
          )}

          <CardContent className="p-3 space-y-3">
            {/* Header - Game Context */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={type === "tournament" ? "default" : "secondary"}
                >
                  {type === "tournament" && <Trophy className="w-3 h-3 mr-1" />}
                  {match.name}
                </Badge>
                {/* {timer && (
              <Badge variant="destructive" className="flex items-center">
                <Timer className="w-3 h-3 mr-1" />
                30s
              </Badge>
            )} */}
              </div>
              <div className="flex items-center gap-2">
                {isQuestion && <Badge variant="secondary">Q</Badge>}

                {isKickback && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    Kickback
                  </Badge>
                )}

                {isPenalty && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Penalty
                  </Badge>
                )}
              </div>
            </div>

            {/* Game State Row */}
            <div className="flex items-center gap-3 bg-muted/30 dark:bg-muted/10 rounded-lg p-2 border border-border dark:border-gray-800">
              {/* Top Card */}
              <div className="relative">
                <img
                  src={`/cards/${topCard}.png`}
                  alt={topCard}
                  className="w-12 h-16 rounded-md shadow-sm border border-border dark:border-gray-800"
                  draggable={false}
                />
                {isQuestion && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center p-0
          bg-primary text-primary-foreground border border-background dark:border-gray-800"
                  >
                    Q
                  </Badge>
                )}
              </div>

              {/* Game Info */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="text-center border-r border-border dark:border-gray-600">
                  <p className="text-xs text-muted-foreground">Suit</p>
                  <p
                    className={`text-xl ${
                      currentSuit === "H" || currentSuit === "D"
                        ? "text-red-500 dark:text-red-400"
                        : "text-foreground dark:text-gray-200"
                    }`}
                  >
                    {currentSuit === "H"
                      ? "♥"
                      : currentSuit === "D"
                      ? "♦"
                      : currentSuit === "C"
                      ? "♣"
                      : "♠"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Direction</p>
                  <motion.p
                    className="text-xl text-foreground dark:text-gray-200"
                    animate={{
                      x: direction === 1 ? [0, 4, 0] : [0, -4, 0],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {direction === 1 ? "→" : "←"}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 gap-2">
              {players
                .filter((player) => player.userId !== userProfile?.uuid)
                .map((opponent) => (
                  <PlayerStatus
                    key={opponent.userId}
                    player={opponent}
                    isTurn={turn === opponent.userId}
                    isMainPlayer={false}
                  />
                ))}
            </div>

            {/* Player's Hand +  Quick Play Area - Only shown when it's their turn */}
            {canPlay && (
              <div className="relative">
                {/* Gradient Fade Effect for Scroll Indication */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10" />

                {/* Scrollable Card Container */}
                <div className="overflow-x-auto scrollbar-hide px-2 py-3 flex flex-col gap-2">
                  <div className="flex gap-1 xs:gap-2 sm:gap-3 min-w-min">
                    {playerObj?.playerDeck?.map((card) => (
                      <CardPreview
                        key={card}
                        card={card}
                        isPenalty={isPenalty}
                        isSelectable={canPlay}
                        isSelected={selectedCard === card}
                        handleCardClick={handleCardClick}
                        handleOpenSuitModal={handleOpenSuitModal}
                        loading={playingCard !== null}
                        matchId={match._id}
                        turn={turn}
                        jumpCounter={jumpCounter}
                        userId={userProfile?.uuid}
                        topCard={topCard}
                        hideCards={hideCards}
                        backColor={backColor}
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {turn === userProfile?.uuid &&
                      lastGamePlay?.player !== userProfile?.uuid &&
                      isKickback && (
                        <Button
                          onClick={() => handleAcceptKickback(match._id)}
                          variant="default"
                          className="flex-1"
                          disabled={playingMove}
                        >
                          {playingMove ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <> Accept Kickback</>
                          )}
                        </Button>
                      )}

                    {turn === userProfile?.uuid &&
                      jumpCounter > 0 &&
                      lastGamePlay?.player !== userProfile.uuid && (
                        <Button
                          onClick={() => handleAcceptJump(match._id)}
                          variant="default"
                          className="flex-1"
                          disabled={playingMove}
                        >
                          {playingMove ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <> Accept Jump</>
                          )}
                        </Button>
                      )}

                    {!isQuestion &&
                      turn === userProfile?.uuid &&
                      lastGamePlay?.player === userProfile.uuid && (
                        <Button
                          onClick={() => handlePassTurn(match._id)}
                          variant="default"
                          className="flex-1"
                          disabled={playingMove}
                        >
                          {playingMove ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <> Pass Turn</>
                          )}
                        </Button>
                      )}

                    {playerObj && (
                      <Button
                        onClick={() => handleSetOn(match._id)}
                        disabled={
                          playerObj?.on === true ||
                          canFinishGame(playerObj?.playerDeck, topCard) ===
                            false ||
                          isQuestion ||
                          turn !== userProfile?.uuid
                        }
                        variant="default"
                        className={`transition-all transform
            active:scale-95 disabled:opacity-50`}
                        style={{
                          background: playerObj?.on
                            ? "#78d64b"
                            : playerObj?.on === true ||
                              canFinishGame(playerObj?.playerDeck, topCard) ===
                                false ||
                              isQuestion ||
                              turn !== userProfile?.uuid
                            ? "rgba(250, 202, 0, 0.5)"
                            : "#faca00",
                          cursor:
                            playerObj?.on === true ||
                            canFinishGame(playerObj?.playerDeck, topCard) ===
                              false ||
                            isQuestion ||
                            turn !== userProfile?.uuid
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {playingMove ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>{playerObj?.on ? "ON" : "Kadi?"}</>
                        )}
                      </Button>
                    )}

                    {jumpCounter === 0 &&
                      !isKickback &&
                      turn === userProfile?.uuid &&
                      (isQuestion ||
                        (lastGamePlay?.player === userProfile.uuid &&
                          lastGamePlay?.card &&
                          lastGamePlay?.card.slice(0, -1) === "K") ||
                        (lastGamePlay?.player === userProfile.uuid &&
                          lastGamePlay?.card &&
                          lastGamePlay?.card.slice(0, -1) === "J") ||
                        lastGamePlay?.player !== userProfile.uuid) && (
                        <Button
                          variant="outline"
                          disabled={playingCard}
                          onClick={() => {
                            isPenalty
                              ? handleDrawCard(true, match._id)
                              : handleDrawCard(false, match._id);
                          }}
                          className="flex items-center gap-2"
                        >
                          {playingCard ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {isPenalty
                                ? "Draw Penalty"
                                : turn === userProfile?.uuid &&
                                  (isQuestion || isPenalty)
                                ? "Pick Answer"
                                : "Pick Card"}
                            </>
                          )}
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Link href={`/kadi/${match.name}`}>
                <Button
                  variant={isUrgent ? "default" : "secondary"}
                  className="flex-1"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isUrgent ? "Play Full Mode" : "Open Game"}
                </Button>
              </Link>
              {match.type === "tournament" && (
                <Button variant="outline">
                  <Trophy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>

          {/* <button onClick={() => console.log(match)}>THIS MATCH</button> */}
        </Card>
      </motion.div>
    </>
  );
};

export default MatchCard;
