"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";
import { canFinishGame, hasValidMoveAfterPlay } from "@/services/cards/utils";
import { useWalletHandler } from "@/lib/user";
import { isValidMove } from "@/utils/cards";

// Initialize socket outside of component to prevent multiple connections
let socket;

const CONNECTION_STATES = {
  INITIALIZING: "Initializing connection...",
  AUTHENTICATING: "Authenticating your session...",
  CONNECTING: "Connecting to game server...",
  JOINING_ROOM: "Joining game room...",
  SYNCING: "Syncing game state...",
};

export const useKadiSocket = (roomSlug, userProfile, gameRef) => {
  const dispatch = useDispatch();

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  // connection states
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(
    CONNECTION_STATES.INITIALIZING
  );
  const [isConnecting, setIsConnecting] = useState(true);

  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomDataCopy, setRoomDataCopy] = useState(null);
  const [members, setMembers] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const [playerObj, setPlayerObj] = useState(null);
  const [playingCard, setPlayingCard] = useState(null);
  const [shufflingCards, setShufflingCards] = useState(false);
  const [timerData, setTimerData] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [loadingBuyin, setLoadingBuyin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [openSuitModal, setOpenSuitModal] = useState(false);
  const [aceCard, setAceCard] = useState(null);
  const [openGameOverModal, setOpenGameOverModal] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [invalidMove, setInvalidMove] = useState(false);
  const [changedSuit, setChangedSuit] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  const [timerState, setTimerState] = useState({
    startTime: null,
    duration: null,
    playerId: null,
  });

  // REMATCH STATES
  const [rematchOffer, setRematchOffer] = useState(null);
  const [rematchTimer, setRematchTimer] = useState(0);
  const [isLoadingRematch, setIsLoadingRematch] = useState(false);
  const [openEmojisModal, setOpenEmojisModal] = useState(false);

  // DEALING CARDS
  const [dealStage, setDealStage] = useState(null);
  const [isRevealingStarter, setIsRevealingStarter] = useState(false);
  const [starterCard, setStarterCard] = useState(null);

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

  const cardPlace1 = useRef(
    typeof Audio !== "undefined"
      ? new Audio("/cards/audio/cardPlace1.wav")
      : null
  );

  const cardPlace2 = useRef(
    typeof Audio !== "undefined"
      ? new Audio("/cards/audio/cardPlace2.wav")
      : null
  );

  const cardPlace3 = useRef(
    typeof Audio !== "undefined"
      ? new Audio("/cards/audio/cardPlace3.wav")
      : null
  );

  const cardPlace4 = useRef(
    typeof Audio !== "undefined"
      ? new Audio("/cards/audio/cardPlace4.wav")
      : null
  );

  const handleOpenGameOverModal = () => setOpenGameOverModal(true);
  const handleCloseGameOverModal = () => setOpenGameOverModal(false);

  const handleOpenEmojisModal = () => setOpenEmojisModal(true);
  const handleCloseEmojisModal = () => setOpenEmojisModal(false);

  const handleOpenSuitModal = (card) => {
    // If jumpCounter is greater than 0, only "J" cards are valid moves
    if (roomDataCopy[0]?.jumpCounter > 0) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Invalid Move.",
        })
      );

      setPlayingCard(null); // Clear the playing card state

      return;
    }

    if (roomDataCopy[0]?.turn !== userProfile.uuid) {
      // console.log("### WAIT YOU TURN ###");
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Please wait for your turn.",
        })
      );

      setPlayingCard(null);

      return;
    }

    setOpenSuitModal(true);
    setAceCard(card);
  };

  const handleCloseSuitModal = () => setOpenSuitModal(false);

  const onSocketMessage = useCallback(
    (data) => {
      if (data.register === "success") {
        setRoomDataCopy(data.room);

        setIsConnecting(false);

        // handle success message
        // console.log("#### JOINED ROOMS SUCCESS ###");
      }
      //  else if (data.connect === "success") {
      //   setRoomDataCopy(data.room);
      //   setMembers(data.members);

      //   if (data.systemMessage) {
      //     setSystemMessages((oldArray) => [...oldArray, data.systemMessage]);
      //   }
      // }
      else if (data.checkIn === "success") {
        // console.log("### USER CHECKED IN ###");
        // console.log(data);
        setRoomDataCopy(data.room);
      }
      // else if (data.deal === "success") {
      //   console.log("### RUNNNG THE DEAL ###");
      //   console.log(data);

      //   setRoomDataCopy(data.room);
      // }
      else if (
        data.acceptJump === "success" ||
        data.acceptKickback === "success" ||
        data.passTurn === "success"
      ) {
        setRoomDataCopy(data.room);
      } else if (data.play === "success") {
        if (!isMuted) {
          playCardSound.current?.play().catch(console.error);
        }

        gameRef?.current?.playCard(data?.room[0]?.lastGamePlay?.card);

        setTimeout(() => {
          setRoomDataCopy(data.room);
          setPlayingCard(null);
        }, 500);
      } else if (data.draw === "success") {
        if (!isMuted) {
          drawCardSound.current?.play().catch(console.error);
        }

        // gameRef?.current?.drawCard();

        const drawingPlayer = data.room[0].players.find(
          (player) => player.userId === data.room[0].lastGamePlay.player
        );

        if (drawingPlayer) {
          // Update card count with penalty awareness
          const isPenalty =
            data.room[0].lastGamePlay.moveType === "drawPenalty";

          if (isPenalty) {
            const topCard =
              data.room[0].discardPile[data.room[0].discardPile.length - 1];
            const penaltyCards = topCard.startsWith("2")
              ? 2
              : topCard.startsWith("3")
              ? 3
              : topCard === "JOK1" || topCard === "JOK2"
              ? 5
              : 0;

            // Trigger penalty draw animation sequence
            gameRef?.current?.drawCard(true, penaltyCards);
          } else {
            // Regular single card draw
            gameRef?.current?.drawCard(false);
          }

          gameRef?.current?.updateCardCount(
            drawingPlayer.userId,
            drawingPlayer.numCards,
            isPenalty
          );
        }

        const timeoutDuration =
          data.room[0].lastGamePlay.moveType === "drawPenalty"
            ? 1500 // Longer timeout for penalty sequences
            : 500;

        setTimeout(() => {
          setRoomDataCopy(data.room);
        }, timeoutDuration);
      } else if (data.turn === "success") {
        // if (data?.timer) {
        //   // trigger timing state
        // }

        setRoomDataCopy(data.room);
      } else if (data.kadi === "success") {
        setTimeout(() => {
          setRoomDataCopy(data.room);
        }, 3000);
      } else if (data.react === "success") {
        // console.log("reacted here ==>>>");
        // console.log(data);

        setReaction({
          player: data.player,
          src: data.src,
          text: data.text,
        });
        setTimeout(() => setReaction(null), 5000);
      } else if (data.playerObj) {
        // console.log("### NEW PLAYER OBJ ###");
        // console.log(data);

        setPlayerObj(data.playerObj);
      } else if (data.invalidMove) {
        dispatch(
          createNotification({
            open: "true",
            type: "error",
            message: data.invalidMove.message,
          })
        );
        // console.log("##### INVALIDATED MOVE #####");
      }
    },
    [gameRef, dispatch]
  );

  useEffect(() => {
    const initializeSocket = async () => {
      if (!socket && roomSlug && userProfile?.uuid) {
        setConnectionState(CONNECTION_STATES.AUTHENTICATING);

        // Initialize socket connection with the correct namespace
        // First, fetch room info to determine namespace
        const { data: roomData } = await axios.get(
          `/api/cards/get_room?roomSlug=${roomSlug}`
        );

        setConnectionState(CONNECTION_STATES.CONNECTING);

        // Initialize socket connection with the correct namespace
        const namespace = roomData.timer ? "/competitive" : "/casual";

        // console.log(`### CONNECTING -->>> to ${namespace}`);
        // console.log(roomData[0]);
        // console.log(`${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`);

        // Get the cookie from our auth endpoint
        const response = await fetch("/api/cards/socket/session");
        if (!response.ok) {
          throw new Error("Failed to get auth cookie");
        }

        const { sessionId } = await response.json();

        // console.log("### THE sessionID ###");
        // console.log(sessionId);

        setCurrentRoomId(roomData._id);

        setConnectionState(CONNECTION_STATES.JOINING_ROOM);

        socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`, {
          // withCredentials: true,
          auth: {
            sessionId,
            roomId: roomData._id,
            roomSlug,
          },
          transports: ["websocket"],
          autoConnect: true,
        });

        // Connection events
        socket.on("connect", () => {
          setConnectionState(CONNECTION_STATES.SYNCING);

          // console.log("Connected to Socket.IO server");
          dispatch(
            createNotification({
              open: "true",
              type: "success",
              message: "Connection Successful.",
            })
          );

          setIsConnected(true);
          socket.emit("register");
        });

        socket.on("joinRoom", (data) => {
          // console.log("### JOINED ROOM ###");
          // console.log(data);

          dispatch(
            createNotification({
              open: "true",
              type: "success",
              message: data.message,
            })
          );

          setRoomDataCopy(data.room);
        });

        socket.on("dealSequence", (data) => {
          setDealStage(data.stage);

          switch (data.stage) {
            case "shuffleStart":
              shuffleSound.current?.play().catch(console.error);
              // gameRef.current?.startShuffleAnimation();
              // console.log("shuffling ###");

              setShufflingCards(true);
              setTimeout(() => {
                setShufflingCards(false);
              }, 3000);

              break;

            case "cardDealt":
              [cardPlace1, cardPlace2, cardPlace3, cardPlace4][
                Math.floor(Math.random() * 4)
              ].current?.play();

              // console.log("### CARD DEALT ###", data.targetPlayer);

              gameRef.current?.animateCardDeal(
                data.targetPlayer,
                data.round,
                data.playerIndex
              );
              break;

            case "starterReveal":
              // console.log("starter reveal ###", data);
              setStarterCard(data.card);
              setIsRevealingStarter(true);

              cardPlace1.current?.play().catch(console.error);

              setTimeout(() => setIsRevealingStarter(false), 1000);

              break;
          }
        });

        socket.on("gameOver", (data) => {
          // console.log("### GAMING OVER ###");
          // console.log(data);

          setPlayingCard(null); // Clear the playing card state
          setRoomDataCopy(data.room);
          handleOpenGameOverModal();
        });

        // shuffling event
        socket.on("shuffle", () => {
          if (!isMuted) {
            shuffleSound.current?.play().catch(console.error);
          }

          setShufflingCards(true);
          setTimeout(() => {
            setShufflingCards(false);
          }, 3000);
        });

        socket.on("timerUpdate", (data) => {
          if (data.timer) {
            setTimerState(data.timer);

            if (!isMuted) {
              changeTurnSound.current?.play().catch(console.error);
            }

            setRoomDataCopy(data.room);
          }
        });

        // timer event
        socket.on("register", onSocketMessage);
        socket.on("gameStateUpdate", onSocketMessage);
        socket.on("playerUpdate", onSocketMessage);
        socket.on("systemMessage", onSocketMessage);
        socket.on("checkInUpdate", onSocketMessage);

        socket.on("invalidMove", (data) => {
          if (!isMuted) {
            invalidMoveSound.current?.play().catch(console.error);
          }

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
          dispatch(
            createNotification({
              open: "true",
              type: "error",
              message: error.message,
            })
          );

          setPlayingCard(null);
        });

        socket.on(
          "rematchOffered",
          ({
            offerId,
            stakeAmount,
            offeredBy,
            // timeout
          }) => {
            if (offeredBy?.userId !== userProfile?.uuid) {
              dispatch(
                createNotification({
                  open: "true",
                  type: "info",
                  message: `${offeredBy?.username} wants a rematch`,
                })
              );
            }

            // console.log({
            //   offerId,
            //   stakeAmount,
            //   offeredBy,
            //   // timeout
            // });

            setRematchOffer({ offerId, stakeAmount, offeredBy });
            // setRematchTimer(Math.floor(timeout / 1000));
          }
        );

        socket.on("rematchCreated", ({ newRoomId, newRoomName }) => {
          // console.log("### REMATCH ACCEPTED ###");
          setIsLoadingRematch(false);
          window.location.href = `/kadi/play/${newRoomName}`;
        });

        socket.on("rematchDeclined", ({ declinedBy }) => {
          // console.log("### REMATCH DECLINED ###");

          if (declinedBy?.userId !== userProfile?.uuid) {
            dispatch(
              createNotification({
                open: "true",
                type: "info",
                message: `${declinedBy?.username} declined a rematch`,
              })
            );
          }

          setRematchOffer(null);
          setIsLoadingRematch(false);
        });

        socket.on("rematchExpired", () => {
          setRematchOffer(null);
          setIsLoadingRematch(false);
        });

        // messaging
        // Listen for chat messages
        socket.on("chatMessage", (data) => {
          // console.log("### chatted ###");
          // console.log(data);
          // console.log(systemMessages);

          setSystemMessages((oldArray) => [...oldArray, data.chatMessage]);
        });

        // Listen for system messages
        socket.on("systemMessage", (data) => {
          setSystemMessages((oldArray) => [...oldArray, data.systemMessage]);
        });

        // Listen for notification messages
        socket.on("notificationMessage", (data) => {
          dispatch(
            createNotification({
              open: "true",
              type: data.notificationMessage.type,
              message: data.notificationMessage.message,
            })
          );
        });

        socket.on("playerDisconnected", (data) => {
          // Show notification
          if (data.notificationMessage) {
            dispatch(
              createNotification({
                open: "true",
                type: "info",
                message: data.notificationMessage.message,
              })
            );
          }
        });

        // return () => {
        //   if (socket) {
        //     socket.emit("leaveRoom", roomId);
        //     socket.disconnect();
        //     socket = null;
        //   }
        // };
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.emit("leaveRoom", currentRoomId);
        socket.disconnect();
        socket = null;
      }
    };
  }, [currentRoomId, userProfile, onSocketMessage]);

  // REMATCH TIMER
  useEffect(() => {
    let interval;
    if (rematchOffer && rematchTimer > 0) {
      interval = setInterval(() => {
        setRematchTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rematchOffer, rematchTimer]);

  useEffect(() => {
    if (playCardSound.current) {
      playCardSound.current.muted = isMuted;
    }

    if (drawCardSound.current) {
      drawCardSound.current.muted = isMuted;
    }

    if (invalidMoveSound.current) {
      invalidMoveSound.current.muted = isMuted;
    }

    if (shuffleSound.current) {
      shuffleSound.current.muted = isMuted;
    }

    if (changeTurnSound.current) {
      changeTurnSound.current.muted = isMuted;
    }
  }, [isMuted]);

  // Game action handlers
  const handleCheckin = async () => {
    setLoadingCheckIn(true);
    try {
      socket.emit("checkIn");
      setShowCheckinDialog(false);
    } catch (error) {
      console.error("Error during check-in:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "An error occurred while checking in. Please try again.",
        })
      );
      setShowCheckinDialog(true);
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const handleDrawCard = async () => {
    if (!isConnected || !socket) {
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
      socket.emit("draw");
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

  const handleAcceptJump = async () => {
    if (!isConnected || !socket) {
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
      socket.emit("acceptJump");
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

  const handleAcceptKickback = async () => {
    if (!userProfile || !roomDataCopy[0]?._id) {
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
      socket.emit("acceptKickback");
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

  const handlePassTurn = async () => {
    if (!userProfile || !roomDataCopy[0]?._id) {
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
      socket.emit("passTurn");
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

  const handleAcesPlay = async (desiredValue, desiredRankForAS = null) => {
    if (!userProfile || !roomDataCopy[0]?._id) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Missing user profile or room data",
        })
      );
      return;
    }

    // console.log("### desired value ###");
    // console.log(desiredValue);

    try {
      const isSuit = ["S", "H", "D", "C"].includes(desiredValue);

      // console.log("### THE ACE CARD");
      // console.log(aceCard);
      // console.log(desiredRankForAS);

      // Check if it's an AS play
      const isAceOfSpades = aceCard === "AS";

      // socket.emit("play", {
      //   cardPlayed: aceCard,
      //   desiredSuit: isSuit ? desiredValue : undefined,
      //   desiredRank: isSuit ? undefined : desiredValue,
      // });

      socket.emit("play", {
        cardPlayed: aceCard,
        desiredSuit: isSuit ? desiredValue : undefined,
        // For AS, we'll have both suit and rank. For regular aces, only one at a time
        desiredRank: isAceOfSpades
          ? desiredRankForAS
          : isSuit
          ? undefined
          : desiredValue,
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

  const handleReact = async (src, text) => {
    try {
      socket.emit("react", {
        src,
        text,
      });

      // handleCloseEmojisModal();
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to send reaction",
        })
      );
    }
  };

  const handleCardClick = async (card, desiredSuit) => {
    if (playingCard) return;
    setPlayingCard(card);

    setChangedSuit(true);

    setTimeout(() => {
      setChangedSuit(false);
    }, 2000);

    try {
      if (roomDataCopy[0]?.turn !== userProfile?.uuid) {
        dispatch(
          createNotification({
            open: "true",
            type: "error",
            message: "Please wait for your turn.",
          })
        );

        setPlayingCard(null);

        return;
      }

      let topCard =
        roomDataCopy[0]?.discardPile[roomDataCopy[0]?.discardPile.length - 1];

      if (isValidMove(topCard, card, roomDataCopy[0])) {
        // Emit card play event
        socket.emit("play", {
          cardPlayed: card,
          // desiredSuit: desiredSuit,
        });

        setPlayingCard(card);
      } else {
        setInvalidMove(true);
        if (!isMuted) {
          invalidMoveSound.current?.play().catch(console.error);
        }

        setTimeout(() => {
          setInvalidMove(false);
        }, 1000);

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

  const handleJoinRoom = async () => {
    if (!isConnected || !socket) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Not connected to server",
        })
      );
      return;
    }

    if (
      roomDataCopy[0]?.pot > 0 &&
      walletData.balances.KES <= Math.abs(roomDataCopy[0]?.pot)
    ) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Insufficient balance",
        })
      );
      return;
    }

    try {
      setLoadingBuyin(true);
      setIsJoining(true);

      const currentPlayers = roomDataCopy[0]?.players || [];
      if (currentPlayers.length >= roomDataCopy[0]?.maxPlayers) {
        throw new Error("Room is full");
      }

      // Emit join room event
      socket.emit("joinRoom");

      // The actual update will come through the socket events
      // (playerJoined or joinError)
    } catch (error) {
      setLoadingBuyin(false);
      setIsJoining(false);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: error.message || "Failed to join game",
        })
      );
    }
  };

  const handleSetOn = async () => {
    if (!userProfile || !roomDataCopy[0]?._id) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Missing required data to set player on.",
        })
      );
      return;
    }

    if (
      !canFinishGame(
        playerObj.playerDeck,
        roomDataCopy[0].discardPile[roomDataCopy[0].discardPile.length - 1]
      )
    ) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Declare Kadi when you can finsh game!",
        })
      );
      return;
    }

    if (playerObj?.on === true) {
      dispatch(
        createNotification({
          open: "true",
          type: "warning",
          message: "You've already declared Kadi!",
        })
      );
      return;
    }

    if (roomDataCopy[0]?.isQuestion) {
      dispatch(
        createNotification({
          open: "true",
          type: "warning",
          message:
            "Cannot declare Kadi while a question sequence is in progress.",
        })
      );
      return;
    }

    if (roomDataCopy[0]?.turn !== userProfile?.uuid) {
      dispatch(
        createNotification({
          open: "true",
          type: "warning",
          message: "You can only declare Kadi during your turn!",
        })
      );
      return;
    }

    try {
      socket.emit("setPlayerOn");
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

  const handleRematchOffer = async (type) => {
    const currentBalance = walletData.balances.KES;
    const stakeAmount =
      type === "double"
        ? Math.abs(roomDataCopy[0]?.pot) * 2
        : Math.abs(roomDataCopy[0]?.pot);

    if (stakeAmount > 0 && currentBalance < stakeAmount) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: `Insufficient balance. Required: ${
            stakeAmount / 100
          }, Available: ${currentBalance / 100}`,
        })
      );
      return;
    }
    // console.log("want rematch");

    // console.log(walletData);
    // console.log(walletData.balances.KES);
    // console.log(Math.abs(roomDataCopy[0]?.pot));
    // console.log(walletData.balances.KES < Math.abs(roomDataCopy[0]?.pot));

    setIsLoadingRematch(true);

    socket.emit("offerRematch", { type });
  };

  const handleAcceptRematch = () => {
    setIsLoadingRematch(true);
    socket.emit("acceptRematch", {
      offerId: rematchOffer.offerId,
    });
  };

  const handleDeclineRematch = () => {
    socket.emit("declineRematch", {
      offerId: rematchOffer.offerId,
    });
  };

  const handleSendMessage = () => {
    setLoadingChat(true);

    // console.log("sending message now");

    if (!userProfile) {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Please, Login to Chat.",
        })
      );
      setLoadingChat(false);
      return;
    }

    // console.log("here now");

    try {
      // Emit chat message through socket
      socket.emit("chat", {
        message: chatMessage,
      });

      // console.log("done");

      // Clear input after sending
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to send message",
        })
      );
    } finally {
      setLoadingChat(false);
    }
  };

  return {
    //  connection states
    isConnected,
    isConnecting,
    connectionState,

    roomDataCopy,
    playerObj,
    playingCard,
    shufflingCards,
    timerData,
    reaction,
    systemMessages,
    handleCheckin,
    handleCardClick,
    handleJoinRoom,
    loadingBuyin,
    loadingCheckIn,
    setLoadingCheckIn,
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
    aceCard,

    loadingChat,
    handleSendMessage,
    chatMessage,
    setChatMessage,

    setAceCard,
    openGameOverModal,
    setOpenGameOverModal,
    handleOpenGameOverModal,
    handleCloseGameOverModal,

    reaction,
    setReaction,

    openEmojisModal,
    setOpenEmojisModal,
    handleOpenEmojisModal,
    handleCloseEmojisModal,

    timerState,

    invalidMove,

    changedSuit,

    // REMATCH
    rematchOffer,
    isLoadingRematch,
    rematchTimer,
    handleRematchOffer,
    handleAcceptRematch,
    handleDeclineRematch,

    isMuted,
    setIsMuted,

    starterCard,
    isRevealingStarter,
  };
};
