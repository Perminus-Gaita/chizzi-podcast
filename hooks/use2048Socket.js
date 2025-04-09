import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_URL;

export const use2048Socket = () => {
  const [socket, setSocket] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const userProfile = useSelector((state) => state.auth.profile);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(`${SOCKET_SERVER}/twentyfortyeight`, {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on("connect", () => {
      console.log("Connected to 2048 arena");
      socketInstance.emit("getLeaderboard");
      setConnectionStatus("connected");
    });

    // Leaderboard updates
    socketInstance.on("leaderboardUpdated", (data) => {
      setLeaderboard(data);
    });

    // High-score updates
    socketInstance.on("highScoreUpdated", ({ highScore }) => {
      console.log("New high score:", highScore);
    });

    // Error handling
    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socketInstance.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("leaderboardUpdated", (data) => {
        setLeaderboard(data);
      });
    }
  }, [socket]);

  // Update high score
  const updateHighScore = useCallback(
    (score) => {
      if (socket && userProfile) {
        socket.emit("update2048Player", {
          userId: userProfile.uuid,
          score,
        });
      }
    },
    [socket, userProfile]
  );

  return {
    socket,
    leaderboard,
    setLeaderboard,
    updateHighScore,
    connectionStatus,
  };
};
