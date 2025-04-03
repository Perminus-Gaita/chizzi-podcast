"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

const CONNECTION_STATES = {
  INITIALIZING: "Initializing connection...",
  AUTHENTICATING: "Authenticating your session...",
  CONNECTING: "Connecting to game server...",
  JOINING_ROOMS: "Joining game rooms...",
  SYNCING: "Syncing match data...",
};

// Initialize socket outside of component to prevent multiple connections
// let socket;

export const useMatchesSocket = () => {
  const dispatch = useDispatch();

  const socketRef = useRef(null);
  const eventHandlersRef = useRef({
    handleOffline: () => setIsOffline(true),
    handleOnline: () => setIsOffline(false),
  });

  const userProfile = useSelector((state) => state.auth.profile);

  const [isConnected, setIsConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionState, setConnectionState] = useState(
    CONNECTION_STATES.INITIALIZING
  );
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);
  const [openSuitModal, setOpenSuitModal] = useState(false);
  const [aceCard, setAceCard] = useState(null);
  const [playingCard, setPlayingCard] = useState(null);

  const [playingMove, setPlayingMove] = useState(false);

  // game sounds
  // Add sound references
  const invalidMoveSound = useRef(
    typeof Audio !== "undefined" ? new Audio("/cards/audio/error.wav") : null
  );
  const playCardSound = useRef(
    typeof Audio !== "undefined"
      ? new Audio(
          `/cards/audio/cardPlace${Math.floor(Math.random() * 4) + 1}.wav`
        )
      : null
  );
  const drawCardSound = useRef(
    typeof Audio !== "undefined" ? new Audio("/cards/audio/draw.wav") : null
  );
  const shuffleSound = useRef(
    typeof Audio !== "undefined" ? new Audio("/cards/audio/shuffle.wav") : null
  );
  const changeTurnSound = useRef(
    typeof Audio !== "undefined" ? new Audio("/cards/audio/cuckoo.wav") : null
  );

  const handleOpenSuitModal = (card, matchId) => {
    setOpenSuitModal(true);
    setAceCard(card);
  };

  const handleCloseSuitModal = () => setOpenSuitModal(false);

  // KADI GAME PLAY FUNCTIONS
  const handleDrawCard = async (isPenalty = false, roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    drawCardSound.current?.play().catch(console.error);

    if (!isConnected || !socketRef.current) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Not connected to server",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("draw", {
        isPenalty,
        matchId: roomId,
      });
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: isPenalty
            ? "Failed to draw penalty cards"
            : "Failed to draw card",
        })
      );
    }
  };

  const handleAcceptJump = async (roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    changeTurnSound.current?.play().catch(console.error);

    if (!isConnected || !socketRef.current) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Not connected to server",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("acceptJump", {
        matchId: roomId,
      });
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to accept jump",
        })
      );
    }
  };

  const handleAcceptKickback = async (roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    changeTurnSound.current?.play().catch(console.error);

    if (!userProfile) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Missing user profile or room data",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("acceptKickback", {
        matchId: roomId,
      });
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to accept kickback",
        })
      );
    }
  };

  const handlePassTurn = async (roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    changeTurnSound.current?.play().catch(console.error);

    if (!userProfile) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Missing user profile or room data",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("passTurn", {
        matchId: roomId,
      });
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to pass turn",
        })
      );
    }
  };

  const handleAcesPlay = async (isPenalty, desiredSuit, roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    changeTurnSound.current?.play().catch(console.error);

    if (!userProfile) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Missing user profile or room data",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("play", {
        cardPlayed: aceCard,
        desiredSuit: isPenalty ? undefined : desiredSuit,
        matchId: roomId,
      });
      setAceCard(null);
      handleCloseSuitModal();
    } catch (error) {
      // console.log(error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to play Aces card",
        })
      );
    }
  };

  const isValidMove = (topCard, playedCard, currentRoomData) => {
    // Extract the rank and suit of the top card and the played card
    const topCardRank = topCard.slice(0, -1);
    const topCardSuit = topCard.slice(-1);
    const playedCardRank = playedCard.slice(0, -1);
    const playedCardSuit = playedCard.slice(-1);

    // If the top card is "JOK1/2", any card is a valid move
    if (topCard === "JOK1" || topCard === "JOK2") {
      return true;
    }

    // If in kickback state, only "K" cards are valid moves
    if (currentRoomData?.isKickback) {
      return playedCardRank === "K";
    }

    // If jumpCounter is greater than 0, only "J" cards are valid moves
    if (currentRoomData?.jumpCounter > 0) {
      return playedCardRank === "J";
    }

    // Allow Aces and Jokers to be played at any time
    if (
      playedCardRank === "A" ||
      playedCard === "JOK1" ||
      playedCard === "JOK2"
    ) {
      return true;
    }

    // Allow desired rank after aces play
    if (currentRoomData?.desiredSuit) {
      // console.log("## HERE NOW ###");
      // console.log(topCardRank);
      // console.log(playedCardRank);
      // console.log(currentRoomData?.desiredSuit);
      if (
        topCardRank === "A" &&
        playedCardSuit === currentRoomData?.desiredSuit
      ) {
        return true;
      }
    }

    // Check if the played card matches the suit or rank of the top card
    if (topCardSuit === playedCardSuit || topCardRank === playedCardRank) {
      return true;
    }

    return false;
  };

  const validateCardPlay = (matchGameState) => {
    if (matchGameState?.turn !== userProfile?.uuid) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Please wait for your turn.",
        })
      );

      setPlayingCard(null);

      return false;
    }

    if (isValidMove(topCard, card, matchGameState)) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Invalid Move.",
        })
      );

      return false;
    }
    return true;
  };

  const handleCardClick = async (card, roomId) => {
    if (playingCard) return;
    setPlayingCard(card);

    playCardSound.current?.play().catch(console.error);

    // console.log("reached here...");

    try {
      // if (matchGameState?.turn !== userProfile?.uuid) {
      //   dispatch(
      //     createNotification({
      //       open: "true",
      //       type: "error",
      //       message: "Please wait for your turn.",
      //     })
      //   );

      //   setPlayingCard(null);

      //   return;
      // }

      if (isValidMove(matchGameState.topCard, card)) {
        // Emit card play event

        socketRef.current.emit("play", {
          cardPlayed: card,
          matchId: roomId,
          // desiredSuit: desiredSuit,
        });

        // console.log("### Emitter ");
        // console.log(socketRef.current);
        // console.log(card);
        // console.log(roomId);

        setPlayingCard(card);
      } else {
        dispatch(
          createNotification({
            open: "true",
            type: "error",
            message: "Invalid Move.",
          })
        );
        setPlayingCard(null);
      }
    } catch (error) {
      console.error("Error playing card:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "An error occurred while playing the card.",
        })
      );
    }
  };

  const handleSetPlayerOn = async (roomId) => {
    if (playingMove) return;
    setPlayingMove(true);
    changeTurnSound.current?.play().catch(console.error);

    if (!userProfile) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Missing required data to set player on.",
        })
      );
      return;
    }

    try {
      socketRef.current.emit("setPlayerOn", {
        matchId: roomId,
      });
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to set player on",
        })
      );
    }
  };
  // END KADI GAMEPLAY FUNCTIONS

  useEffect(() => {
    if (!userProfile?.uuid) return;

    let mounted = true;

    const initializeSocket = async () => {
      try {
        if (!socketRef.current) {
          setConnectionState(CONNECTION_STATES.AUTHENTICATING);
          const response = await axios.get("/api/cards/socket/session");
          const { sessionId } = response.data;

          setConnectionState(CONNECTION_STATES.CONNECTING);

          socketRef.current = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL}/matches`,
            {
              auth: { sessionId, namespace: "matches" },
              transports: ["websocket", "polling"],
              autoConnect: true,
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              timeout: 20000,
              withCredentials: true,
            }
          );

          // socket = socketRef.current; // Update global reference.
        }

        const socket = socketRef.current;

        // socket.on("connect", () => {
        //   if (!mounted) return;
        //   setIsConnected(true);
        //   setConnectionState(CONNECTION_STATES.JOINING_ROOMS);
        //   currentSocket.emit("subscribeToMatches");
        // });

        socket.on("connect", () => {
          if (!mounted) return;
          setIsConnected(true);
          setConnectionState(CONNECTION_STATES.JOINING_ROOMS);
          socket.emit("subscribeToMatches");
        });

        // Handle initial matches data
        socket.on("matches:initial", (data) => {
          if (!mounted) return;

          // Categorize matches based on turn and game status
          const categorizedMatches = {
            urgent: data.matches.filter(
              (match) =>
                match.gameStatus === "active" && match.turn === userProfile.uuid
            ),
            active: data.matches.filter(
              (match) =>
                match.gameStatus === "active" && match.turn !== userProfile.uuid
            ),
            scheduled: data.matches.filter(
              (match) => match.gameStatus === "waiting"
            ),
          };

          setMatches(categorizedMatches);
          setConnectionState(CONNECTION_STATES.SYNCING);

          if (categorizedMatches.urgent.length > 0) {
            dispatch(
              createNotification({
                open: true,
                type: "info",
                message: `You have ${categorizedMatches.urgent.length} urgent ${
                  categorizedMatches.urgent.length === 1 ? "match" : "matches"
                } waiting!`,
              })
            );
          }
        });

        // Handle individual match updates
        socket.on("match:update", (data) => {
          setPlayingCard(null);
          setPlayingMove(false);
          setMatches((prev) => {
            if (!prev) return prev;

            const getPriorityScore = (match) => {
              let score = 0;
              if (
                match.gameStatus === "active" &&
                match.turn === userProfile.uuid
              )
                score += 100000;
              else if (match.gameStatus === "active") score += 50000;
              else if (match.gameStatus === "waiting") score += 30000;

              if (match.timer) score += 20000;
              if (match.tournamentId) score += 15000;
              if (match.pot > 0) score += 10000;

              return score;
            };

            const sortMatches = (matches) =>
              matches.sort((a, b) => {
                const scoreDiff = getPriorityScore(b) - getPriorityScore(a);
                return (
                  scoreDiff || new Date(b.createdAt) - new Date(a.createdAt)
                );
              });

            const newMatch = { ...data.match, _id: data.matchId };
            const updated = {
              urgent: sortMatches([
                ...prev.urgent.filter((m) => m._id !== data.matchId),
                ...(newMatch.gameStatus === "active" &&
                newMatch.turn === userProfile.uuid
                  ? [newMatch]
                  : []),
              ]),
              active: sortMatches([
                ...prev.active.filter((m) => m._id !== data.matchId),
                ...(newMatch.gameStatus === "active" &&
                newMatch.turn !== userProfile.uuid
                  ? [newMatch]
                  : []),
              ]),
              scheduled: sortMatches([
                ...prev.scheduled.filter((m) => m._id !== data.matchId),
                ...(newMatch.gameStatus === "waiting" ? [newMatch] : []),
              ]),
            };

            return updated;
          });
        });

        // Handle player online status
        socket.on("player:online", (data) => {
          if (!mounted) return;
          // Update player online status in matches
        });

        socket.on("invalidMove", (data) => {
          invalidMoveSound.current?.play().catch(console.error);

          dispatch(
            createNotification({
              open: "true",
              type: "error",
              message: data.message,
            })
          );

          setPlayingCard(null);
        });

        socket.on("error", (error) => {
          if (!mounted) return;
          setError(error.message);
          dispatch(
            createNotification({
              open: true,
              type: "error",
              message: error.message,
            })
          );
        });

        socket.on("disconnect", () => {
          if (!mounted) return;
          setIsConnected(false);
          dispatch(
            createNotification({
              open: true,
              type: "error",
              message: "Connection lost. Reconnecting...",
            })
          );
        });

        // Handle offline state
        // window.addEventListener("offline", () => {
        //   if (!mounted) return;
        //   setIsOffline(true);
        // });

        // window.addEventListener("online", () => {
        //   if (!mounted) return;
        //   setIsOffline(false);
        //   currentSocket.connect();
        // });

        window.addEventListener(
          "offline",
          eventHandlersRef.current.handleOffline
        );
        window.addEventListener(
          "online",
          eventHandlersRef.current.handleOnline
        );

        // setSocket(newSocket);

        return () => {
          mounted = false;

          // Only clean up listeners, don't disconnect
          window.removeEventListener(
            "offline",
            eventHandlersRef.current.handleOffline
          );
          window.removeEventListener(
            "online",
            eventHandlersRef.current.handleOnline
          );

          // Clean up socket events without disconnecting
          if (socketRef.current) {
            socket.off("connect");
            socket.off("matches:initial");
            socket.off("match:update");
            socket.off("player:online");
            socket.off("invalidMove");
            socket.off("error");
            socket.off("disconnect");
          }
        };
      } catch (error) {
        if (!mounted) return;
        setError(error.message);
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Failed to connect to match server",
          })
        );
      }
    };

    initializeSocket();
  }, [userProfile]);

  const reconnect = () => {
    if (socket) {
      setError(null);
      currentSocket.connect();
    }
  };

  return {
    isConnected,
    connectionState,
    isOffline,
    matches,
    error,
    reconnect,

    playingCard,
    playingMove,

    // KADI HANDLERS
    handleDrawCard,
    handleAcceptJump,
    handleAcceptKickback,
    handlePassTurn,
    handleSetPlayerOn,
    handleCardClick,
    handleAcesPlay,

    openSuitModal,
    setOpenSuitModal,
    handleOpenSuitModal,
    handleCloseSuitModal,
  };
};
