import { useRouter } from "next/navigation";
import axios from "axios";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

export const useGame = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const userProfile = useSelector((state) => state.auth.profile);

  const handleQuickMatch = async () => {
    setLoading(true);

    if (!userProfile) {
      dispatch(
        createNotification({
          open: true,
          type: "info",
          message: "Please sign in to create a match",
        })
      );

      setLoading(false);

      return;
    }

    const roomName = `table-${Math.random().toString(36).substring(2, 8)}`;

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: `Creating game room...`,
      })
    );

    try {
      const response = await axios.post("/api/cards/create-test-room", {
        roomName: roomName,
        creator: userProfile?.uuid,
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

        router.push(`/kadi/${response.data.slug}`);

        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating cards room:", error);
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Something went wrong",
        })
      );
      setLoading(false);
    }
  };

  return { loading, handleQuickMatch };
};
