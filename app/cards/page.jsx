"use client";
import axios from "axios";
import { useState } from "react";

import { useDispatch } from "react-redux";

import {
  Timer,
  Clock,
  Loader2,
  DollarSign,
  Sparkles,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createNotification } from "@/app/store/notificationSlice";

const PlayCard = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const initialFormData = {
    roomName: "",
    maxPlayers: 2,
    timer: null,
    joker: true,
    isDemo: false,
    amount: null,
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleRoomNameChange = (e) => {
    // Only allow alphanumeric characters and simple special characters
    const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, "");
    setFormData((prev) => ({
      ...prev,
      roomName: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate common fields
    if (
      // !formData.maxPlayers ||
      // formData.timer === null ||
      !formData.roomName ||
      formData.roomName.length < 2 ||
      formData.roomName.length > 15
    ) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Invalid room details.",
        })
      );
      setLoading(false);
      return;
    }

    // Validate competitive game requirements
    // if (!formData.isDemo) {
    //   if (
    //     walletData?.balance < 10 ||
    //     !formData.amount ||
    //     formData.amount < 10
    //   ) {
    //     dispatch(
    //       createNotification({
    //         open: true,
    //         type: "error",
    //         message: "Insufficient balance or invalid buy-in amount.",
    //       })
    //     );
    //     setLoading(false);
    //     return;
    //   }
    // }

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: `Creating ${
          formData.isDemo ? "practice" : "competitive"
        } room...`,
      })
    );

    try {
      const response = await axios.post("/api/cards/create-test-room", {
        roomName: formData.roomName,
        creator: "674de1dff15bd1881adc0aab",
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

        setFormData(initialFormData);
        setLoading(false);
        console.log("### RESPONDED ###");
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error creating cards room:", error);
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error creating room.",
        })
      );
      setFormData(initialFormData);
      setLoading(false);
    }
  };
  return (
    <div
      className="bg-customPrimary w-full h-full"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] 
      bg-light dark:bg-dark"
      >
        <section>
          <h4 className="text-xl md:text-2xl font-bold">Create New Game</h4>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 pr-2 sm:pr-6"
        >
          <div className="space-y-2">
            <Label htmlFor="roomName">Table Name</Label>
            <Input
              id="roomName"
              placeholder="Enter table name (letters, numbers, hyphens only)"
              value={formData.roomName}
              onChange={handleRoomNameChange}
              maxLength={15}
              required
            />
            <p className="text-xs md:text-sm text-muted-foreground">
              2-15 characters, URL: wufwuf.io/kadi/play/
              {formData.roomName || "your-table-name"}
            </p>
          </div>

          {/* <div className="space-y-2">
            <Label>Max Players</Label>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4].map((number) => (
                <Button
                  key={number}
                  type="button"
                  variant={
                    formData.maxPlayers === number ? "default" : "outline"
                  }
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      maxPlayers: number,
                    }))
                  }
                >
                  {number} Players
                </Button>
              ))}
            </div>
          </div> */}

          <div className="space-y-2 pt-4">
            {formData.isDemo ? (
              <p className="text-sm text-muted-foreground">
                Learn Kadi no-pressure!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Ready to start playing? Create game now!
              </p>
            )}

            <Button
              type="submit"
              className={`w-full ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}

              {loading
                ? "Creating..."
                : `Create ${formData.isDemo ? "Practice" : ""} Game`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayCard;
