"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Trophy,
  Users,
  Clock,
  Loader2,
  Info,
  Sparkles,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useWalletHandler } from "@/lib/user";
import { createNotification } from "@/app/store/notificationSlice";

const JoiningPlayer = ({ roomDataCopy, loadingBuyin, handleJoinRoom }) => {
  const dispatch = useDispatch();

  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  const [loading, setLoading] = useState(false);
  const requiredAmount = roomDataCopy[0].pot / 100;
  const hasInsufficientBalance = walletData.balances.KES < requiredAmount;

  const makeMpesaDeposit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Make API request to initialize transaction
      const response = await axios.post("/api/payments/deposit/paystack", {
        amount: Number(requiredAmount) * 100,
        currency: "KES",
        transactionBelongsTo: userProfile?.type,
        callbackUrl: `${window.location.origin}/wallet`,
      });

      if (!response.data.authorizationUrl) {
        throw new Error("No authorization URL received");
      }

      // console.log("RESPONSE");
      // console.log(response);

      // Redirect to payment page
      window.location.href = response.data.authorizationUrl;
    } catch (error) {
      console.error("Deposit error:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: error.response?.data?.message || "Failed to process deposit",
        })
      );

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <Users className="h-6 w-6" />
              Waiting for Opponent{" "}
              {roomDataCopy[0]?.maxPlayers - roomDataCopy[0].players.length >
                1 && "s"}
            </CardTitle>
            <Badge
              variant={roomDataCopy[0].pot > 0 ? "default" : "secondary"}
              className="text-xs md:text-md"
            >
              {roomDataCopy[0].pot > 0 ? (
                <DollarSign className="h-4 w-4 mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {roomDataCopy[0].pot > 0 ? "Competitive" : "Practice"}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs md:text-md">
            {roomDataCopy[0].timer && <Clock className="h-3 w-3" />}
            {roomDataCopy[0].timer ? "30s Timed" : "Casual"} • Max{" "}
            {roomDataCopy[0].maxPlayers} players
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {roomDataCopy[0].pot > 0 ? (
            <div className="flex items-center justify-between p-4 bg-card border rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                    Current Pot
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    KES {roomDataCopy[0].pot / 100}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4 mr-1 text-blue-500" />
                    Winner Takes
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    KES{" "}
                    {(roomDataCopy[0].pot * roomDataCopy[0].maxPlayers) / 100}
                  </p>
                </div>
              </div>
              {/* <Button variant="outline" size="sm" className="hidden sm:flex">
                <Info className="h-4 w-4 mr-1" />
                Prize Info
              </Button> */}
            </div>
          ) : (
            <Alert className="text-sm sm:text-base">
              <Info className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertTitle className="text-sm sm:text-base font-medium">
                Practice Mode
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                Learn and enjoy kadi without stakes. Perfect for beginners!
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              Seated Players
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: roomDataCopy[0].maxPlayers }).map(
                (_, index) => (
                  <Card
                    key={index}
                    className={`flex flex-col items-center p-4 ${
                      index >= roomDataCopy[0].players.length
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <Avatar className="h-16 w-16 mb-2">
                      {roomDataCopy[0].players[index] ? (
                        <AvatarImage
                          src={
                            roomDataCopy[0].players[index].profilePicture ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${roomDataCopy[0].players[index].username}`
                          }
                          alt={roomDataCopy[0].players[index].username}
                        />
                      ) : (
                        <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                    {roomDataCopy[0].players[index] ? (
                      <p className="text-center space-y-1 w-full">
                        <span className="text-sm md:text-md font-medium block truncate capitalize">
                          {roomDataCopy[0].players[index].name}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground truncate block">
                          @{roomDataCopy[0].players[index].username}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm md:text-md text-center truncate w-full">
                        Empty Seat
                      </p>
                    )}
                  </Card>
                )
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {hasInsufficientBalance ? (
              <div className="w-full space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Insufficient Balance</AlertTitle>
                  <AlertDescription>
                    You need KES {requiredAmount} to join this game. Current
                    balance: KES {walletData.balances.KES}
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={(e) => makeMpesaDeposit(e)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <>
                        {" "}
                        <Plus className="mr-2 h-4 w-4" />
                        Deposit KES{" "}
                        {(requiredAmount - walletData.balances.KES).toFixed(2)}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => (window.location.href = "/lobby")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Lobby
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                disabled={loadingBuyin}
                onClick={handleJoinRoom}
                className={`w-full sm:w-auto ${
                  loadingBuyin ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loadingBuyin ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <>
                    {roomDataCopy[0].pot > 0 ? (
                      <DollarSign className="mr-2 h-4 w-4" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                  </>
                )}

                {roomDataCopy[0].pot > 0 ? (
                  <>
                    {loadingBuyin
                      ? "processing..."
                      : `Buy In - KES
              ${roomDataCopy[0].pot / 100 / roomDataCopy[0].players.length}`}
                  </>
                ) : (
                  <>{loadingBuyin ? "joining..." : `Join Practice Game`}</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoiningPlayer;
