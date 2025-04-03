"use client";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { createNotification } from "@/app/store/notificationSlice";
import { useWalletHandler } from "@/lib/user";

const DeleteRoomModal = ({
  deleteRoomOpen,
  handleCloseDeleteRoom,
  roomsMutate,
  roomToDelete,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const { mutate: walletMutate } = useWalletHandler();

  const deleteRoom = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/cards/delete-room", {
        roomId: roomToDelete,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response?.data.message,
          })
        );

        handleCloseDeleteRoom();
        setLoading(false);
        walletMutate();
        roomsMutate();
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "An error occurred deleting game room",
          })
        );

        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setLoading(false);

      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: error.response.data.message,
        })
      );
    } finally {
      handleCloseDeleteRoom();
      setLoading(false);
    }
  };

  return (
    <Dialog open={deleteRoomOpen} onOpenChange={handleCloseDeleteRoom}>
      <DialogContent
        className="sm:max-w-[425px] bg-gradient-to-br
       from-gray-800 to-gray-900 text-white"
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Permanently delete this game?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col md:flex-row gap-4 md:gap-2">
          <Button
            variant="outline"
            onClick={handleCloseDeleteRoom}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={deleteRoom} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoomModal;
