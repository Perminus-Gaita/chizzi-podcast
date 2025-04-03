import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  UserCheck,
  Loader2,
  Wifi,
  Clock,
  Info,
  DollarSign,
} from "lucide-react";

const Checkin = ({
  roomData,
  handleCheckin,
  showCheckinDialog,
  setShowCheckinDialog,
  loadingCheckIn,
}) => {
  const userProfile = useSelector((state) => state.auth.profile);

  const playerObj = roomData?.players?.find(
    (p) => p.userId === userProfile?.uuid
  );
  const allCheckedIn = roomData?.players?.every((p) => p.checkedIn);

  const checkedInCount = roomData.players.filter(
    (player) => player.checkedIn
  ).length;

  // Calculate waiting message based on checked in players from response
  const remainingPlayers = roomData.maxPlayers - checkedInCount;

  useEffect(() => {
    if (
      // roomData?.timer &&
      roomData?.gameStatus === "waiting" &&
      !playerObj?.checkedIn
    ) {
      setShowCheckinDialog(true);
    }
  }, [roomData, playerObj]);

  if (!playerObj?.checkedIn) {
    return (
      <AlertDialog open={showCheckinDialog}>
        <AlertDialogContent className="w-[95%] max-w-md mx-auto bg-[#222840] border border-white/10 rounded-xl">
          <AlertDialogHeader>
            {roomData?.tournamentId ? (
              <AlertDialogTitle className="text-xl text-white mb-4">
                Tournament Match Ready Check
              </AlertDialogTitle>
            ) : (
              <AlertDialogTitle className="flex items-center gap-2 text-md sm:text-xl text-white">
                {roomData?.pot > 0 ? (
                  <DollarSign className="w-5 h-5 text-green-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-400" />
                )}
                Game Ready Check
              </AlertDialogTitle>
            )}

            <Badge
              variant={roomData?.timer ? "default" : "secondary"}
              className="mb-2"
            >
              {roomData?.tournamentId ? (
                <>Casual Mode • No Timer</>
              ) : (
                <>
                  {roomData?.timer
                    ? "Competitive Mode • 30s Turns"
                    : "Casual Mode • No Timer"}
                </>
              )}
            </Badge>

            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="space-y-2 bg-black/20 p-4 rounded-lg text-white">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-sm">
                      Stable internet connection required
                    </span>
                  </div>

                  {roomData?.timer && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">
                        30-second turn timer active
                      </span>
                    </div>
                  )}

                  {!roomData?.tournamentId && roomData?.pot > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">
                        Buy-in: KES {roomData?.pot / 100 / roomData?.maxPlayers}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Stay active during gameplay</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>

            {!roomData?.pot && (
              <Alert variant="info" className="bg-blue-500/10 text-blue-500">
                <Info className="w-4 h-4" />
                <AlertTitle>Practice Mode</AlertTitle>
                <AlertDescription className="text-xs">
                  Perfect for learning! No stakes involved.
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleCheckin}
              disabled={loadingCheckIn}
              className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white transition-all ${
                loadingCheckIn ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loadingCheckIn ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <UserCheck className="w-5 h-5 mr-2" />
              )}
              {loadingCheckIn ? "Checking in..." : "I'm Ready"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (playerObj?.checkedIn && !allCheckedIn) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
        <Alert className="bg-[#222840]/95 border-white/10 max-w-md w-full">
          <AlertDescription className="text-white flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Waiting for {remainingPlayers} more player
                {remainingPlayers !== 1 ? "s" : ""}
              </span>
            </div>
            {/* <Badge
              variant={roomData?.pot > 0 ? "default" : "secondary"}
              className="ml-0 sm:ml-2"
            >
              {roomData?.timer ? "Speed" : "Relaxed"}{" "} */}

            {roomData?.tournamentId ? (
              <Badge variant="outline" className="bg-black/20 text-white">
                {roomData?.timer ? "Speed" : "Relaxed"} {roomData.name} •
                Tournament Match
              </Badge>
            ) : (
              <Badge
                variant={roomData?.pot > 0 ? "default" : "secondary"}
                className="ml-0 sm:ml-2"
              >
                {roomData?.timer ? "Speed" : "Relaxed"}{" "}
                {roomData?.pot > 0 ? "• Competitive" : "• Practice"}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default Checkin;
