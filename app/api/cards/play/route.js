import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";

import {
  registerRoom,
  joinRoom,
  drawPenalty,
  dealCards,
  drawCard,
  playHand,
  setPlayerOn,
  acceptJump,
  acceptKickback,
  passTurn,
  react,
  sendMessageToRoom,
  playerCheckin,
} from "@/services/cards/gameActions";

database_connection().then(() =>
  console.log("Connected successfully to MongoDB (Play Cards)")
);

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = sessionUser?._id;

    console.log("### THE SESSSION USER ###");
    console.log(sessionUser);

    const { action, data } = await request.json();

    if (!action || !data) {
      return NextResponse.json(
        { message: "Invalid request payload" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // let responseMessage = {};

    switch (action) {
      case "playerCheckin":
        console.log("### Player Checking In ###");

        if (data.roomId) {
          await playerCheckin(data.roomId, userId.toString());
        }
        break;
      case "register":
        console.log("### REGISTERING PLAYER... ###");

        if (data.roomId) {
          await registerRoom(
            data.roomId,
            sessionUser.username,
            userId.toString()
          );
        }
        break;
      case "join":
        console.log("### JOIN ROOM ###");

        await joinRoom(data.roomId, userId.toString());
        break;
      case "deal":
        console.log("### DEAL CARDS ###");

        await dealCards(data.roomId);
        break;
      case "draw":
        if (data.isPenalty) {
          console.log("### DRAWING PENALTY CARDS ###");

          await drawPenalty(data.roomId, userId.toString());
        } else {
          console.log("### DRAWING CARDS ###");

          await drawCard(data.roomId, userId.toString());
        }
        break;
      case "play":
        console.log("### PLAYING CARDS ###");

        if (data.roomId) {
          await playHand(
            data.roomId,
            userId.toString(),
            data.cardPlayed,
            data.desiredSuit
          );
        }
        break;
      case "setOn":
        console.log("### Setting PLAYER ON... ###");

        if (data.roomId) {
          await setPlayerOn(data.roomId, userId.toString());
        }
        break;
      case "acceptJump":
        console.log("### Jumpng player ###");
        console.log(userId.toString());

        if (data.roomId) {
          await acceptJump(data.roomId, userId.toString());
        }
        break;
      case "acceptKickback":
        console.log("### Accepting Kickback ###");

        if (data.roomId) {
          await acceptKickback(data.roomId, userId.toString());
        }
        break;
      case "passTurn":
        console.log("### Passing turn to Next Player ###");

        if (data.roomId) {
          await passTurn(data.roomId, userId.toString());
        }
        break;
      case "react":
        console.log("### reacting ###");

        if (data.roomId && data.src && data.text) {
          await react(data.roomId, userId.toString(), data.src, data.text);
        }
        break;
      case "chat":
        console.log("### chatting ###");

        if (data.roomId && data.username && data.message) {
          await sendMessageToRoom(data.roomId, data.username, data.message);
        }
        break;

      default:
        return res.status(400).json({
          message: "Unknown action",
        });
    }

    return NextResponse.json(
      {
        message: "Action processed successfully",
        // data: responseMessage,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing game action:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
