"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { CheckCheck, Loader2 } from "lucide-react";
import { createNotification } from "@/app/store/notificationSlice";
import { useDispatch } from "react-redux";

const VerifyParticipants = ({
  unverifiedParticipants,
  tournamentId,
  setShowVerification,
}) => {
  const router = useRouter();

  const dispatch = useDispatch();
  const [loadingParticipant, setLoadingParticipant] = useState(false);

  const handleVerification = async (participant) => {
    setLoadingParticipant(true);

    try {
      const response = await axios.post("/api/tournament/verify", {
        tournamentId: tournamentId,
        participantId: participant.participantId,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: `${participant.name} verified successfully.`,
          })
        );

        router.refresh(); // Refresh to reflect changes

        setLoadingParticipant(false);
        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: response.data?.message || "Failed to verify participant.",
          })
        );

        setLoadingParticipant(false);
        console.error("Failed to verify participant:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error verifying participant.",
        })
      );

      setLoadingParticipant(false);
      console.error("Error verifying participant:", error);
      return null;
    } finally {
      setLoadingParticipant(false);
      return;
    }
  };

  const rejectVerification = async (participant, reason) => {
    setLoadingParticipant(true);

    try {
      const response = await axios.post("/api/tournament/reject", {
        // New route for rejection
        tournamentId: tournament?._id,
        participantId: participant.participantId,
        reason: reason, // Send the reason for rejection
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: `${participant.name}'s verification rejected.`,
          })
        );

        // Optionally, you can update the UI to reflect the rejection

        router.refresh(); // Refresh to reflect changes

        setLoadingParticipant(false);
        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: response.data?.message || "Failed to reject verification.",
          })
        );

        setLoadingParticipant(false);
        console.error("Failed to reject verification:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error rejecting verification.",
        })
      );

      setLoadingParticipant(false);
      console.error("Error rejecting verification:", error);
      return null;
    } finally {
      setLoadingParticipant(false);
      return;
    }
  };

  return (
    <>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          {" "}
          <CardTitle className="text-lg sm:text-xl">
            Unverified Participants
          </CardTitle>
          {/* {view === "details" && ( */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVerification(false)}
          >
            Back to List
          </Button>
          {/* )} */}
        </div>

        {unverifiedParticipants?.map((participant, index) => (
          <motion.div
            key={participant.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between py-3 border-b border-border/50"
          >
            <div className="flex items-center gap-1 md:gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={participant.profilePicture} />
                <AvatarFallback>
                  {participant.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {participant.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  REF:{" "}
                  <span className="text-md font-bold">
                    {" "}
                    {participant.buyInDetails.referenceNote}
                  </span>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => handleVerification(participant)}
              disabled={loadingParticipant}
            >
              Verify
              {loadingParticipant ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 text-green-500" />
              )}
            </Button>
          </motion.div>
        ))}
      </CardContent>
      {/* <button onClick={() => console.log(unverifiedParticipants)}>Here</button> */}
    </>
  );
};

export default VerifyParticipants;
