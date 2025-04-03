// hooks/useSocketChat.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
// import { toast } from "react-hot-toast";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_URL;

export const useLobbySocket = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [chatsData, setChatsData] = useState({ messages: [] });
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const [currentChallenges, setCurrentChallenges] = useState(new Map());
  const [incomingChallenges, setIncomingChallenges] = useState(new Map());

  const userProfile = useSelector((state) => state.auth.profile);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(`${SOCKET_SERVER}/lobby`, {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on("connect", () => {
      setConnectionStatus("connected");
      socketInstance.emit("joinLobby");
      socketInstance.emit("getChatHistory", { type: "lobby" });
    });

    socketInstance.on("disconnect", () => setConnectionStatus("disconnected"));
    socketInstance.on("connect_error", () => setConnectionStatus("error"));
    socketInstance.on("reconnecting", () => setConnectionStatus("connecting"));

    // Chat message handlers
    socketInstance.on("chatHistory", (data) => {
      setChatsData({ messages: data });
      setChatsLoading(false);
    });

    socketInstance.on("newMessage", (data) => {
      // console.log("### RECEIVED ###");
      // console.log(data);

      setChatsData((prev) => ({
        messages: [...prev.messages, data],
      }));

      // Highlight viral messages (many reactions or replies)
      // if (data.message.reactions?.length > 5 || data.message.replies?.length > 3) {
      //   // toast.success("🔥 Message is trending!");
      //   console.log("🔥 Message is trending!");
      // }
    });

    socketInstance.on(
      "messageReaction",
      ({ messageId, reaction, username }) => {
        setChatsData((prev) => ({
          messages: prev.messages.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), { reaction, username }],
                }
              : msg
          ),
        }));
      }
    );

    // User presence handlers
    socketInstance.on("visitorJoined", ({ count }) => setOnlineUsers(count));
    socketInstance.on("visitorLeft", ({ count }) => setOnlineUsers(count));
    socketInstance.on("userTyping", ({ username }) => {
      setTypingUsers((prev) => new Set([...prev, username]));
    });
    socketInstance.on("userStoppedTyping", ({ username }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    });

    socketInstance.on("gameChallenge", (data) => {
      // Received a challenge from another player
      setIncomingChallenges((prev) => {
        const updated = new Map(prev);
        updated.set(data.challenger._id, {
          challenger: data.challenger,
          timestamp: Date.now(),
        });
        return updated;
      });

      // Auto-expire after 60 seconds
      setTimeout(() => {
        setIncomingChallenges((prev) => {
          const updated = new Map(prev);
          updated.delete(data.challenger._id);
          return updated;
        });
      }, 60000);
    });

    socketInstance.on(
      "challengeAccepted",
      ({ challengerId, accepterId, gameRoomId }) => {
        // Challenge was accepted - redirect to game room
        // window.location.href = `/game/${gameRoomId}`;
        alert("Should join room", gameRoomId);
      }
    );

    socketInstance.on("challengeDeclined", ({ challengerId }) => {
      // Remove from current challenges if we sent it
      setCurrentChallenges((prev) => {
        const updated = new Map(prev);
        updated.delete(challengerId);
        return updated;
      });
    });

    socketInstance.on("challengeExpired", ({ challengerId }) => {
      // Clean up expired challenges
      setCurrentChallenges((prev) => {
        const updated = new Map(prev);
        updated.delete(challengerId);
        return updated;
      });
      setIncomingChallenges((prev) => {
        const updated = new Map(prev);
        updated.delete(challengerId);
        return updated;
      });
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      setChatsError(error.message);
      //   toast.error("Chat error: " + error.message);
      console.log("Chat error: " + error.message);
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("chatHistory");
      socketInstance.off("newMessage");
      socketInstance.off("error");
      socketInstance.disconnect();
    };
  }, []);

  // Send message handler
  const sendLobbyMessage = useCallback(
    async ({ message, user }) => {
      // console.log("## started ...");
      // console.log(message);

      if (!socket || !userProfile || !message.trim()) return;

      try {
        setLoadingChat(true);

        socket.emit("chat", {
          message: message.trim(),
          user,
        });
      } catch (error) {
        console.error("Send message error:", error);
        toast.error("Failed to send message");
      } finally {
        setLoadingChat(false);
      }
    },
    [socket, userProfile]
  );

  const handleMessageDeletion = async ({ messageId, user }) => {
    if (!socket || !userProfile) return;

    try {
      socket.emit("deleteMessage", {
        messageId,
        user,
      });
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error("Failed to delete message");
    }
  };

  // Typing indicator handler
  const handleTyping = useCallback(() => {
    if (!socket || !userProfile) return;

    socket.emit("typing");

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping");
    }, 1000);
  }, [socket, userProfile]);

  // Message reaction handler
  const addReaction = useCallback(
    (messageId, reaction) => {
      if (!socket || !userProfile) return;
      socket.emit("addReaction", { messageId, reaction });
    },
    [socket, userProfile]
  );

  // Reply to message handler
  const replyToMessage = useCallback(
    (messageId, replyContent) => {
      if (!socket || !userProfile) return;
      socket.emit("replyToMessage", { messageId, content: replyContent });
    },
    [socket, userProfile]
  );

  const sendGameChallenge = useCallback(
    ({ targetUser, gameType = "casual" }) => {
      if (!socket || !userProfile) return;

      socket.emit("sendChallenge", {
        challenger: {
          _id: userProfile.uuid,
          username: userProfile.username,
          profilePicture: userProfile.profilePicture,
        },
        targetUser,
        gameType,
        timestamp: Date.now(),
      });
    },
    [socket, userProfile]
  );

  const acceptGameChallenge = useCallback(
    (challengerId) => {
      if (!socket || !userProfile) return;

      socket.emit("acceptChallenge", {
        challengerId,
        accepter: {
          _id: userProfile.uuid,
          username: userProfile.username,
        },
      });
    },
    [socket, userProfile]
  );

  const declineGameChallenge = useCallback(
    (challengerId) => {
      if (!socket || !userProfile) return;

      socket.emit("declineChallenge", { challengerId });
    },
    [socket, userProfile]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("messageDeleted", ({ messageId, deletedAt }) => {
      setChatsData((prev) => ({
        messages: prev.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isDeleted: true,
                deletedAt,
                message: "[Message deleted]",
              }
            : msg
        ),
      }));
    });

    return () => {
      socket.off("messageDeleted");
    };
  }, [socket]);

  return {
    connectionStatus,
    chatsData,
    chatsLoading,
    chatsError,
    loadingChat,
    onlineUsers,
    typingUsers,
    sendLobbyMessage,
    handleMessageDeletion,
    handleTyping,
    addReaction,
    replyToMessage,

    currentChallenges,
    incomingChallenges,
    setCurrentChallenges,
    setIncomingChallenges,
    sendGameChallenge,
    acceptGameChallenge,
    declineGameChallenge,
  };
};
