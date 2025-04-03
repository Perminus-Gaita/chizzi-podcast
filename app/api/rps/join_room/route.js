import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import rpsRoomModel from "@/models/rpsroom.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(RPS Join Room)")
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
    const { roomId } = await request.json();

    const room = await rpsRoomModel.findById(roomId);

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (room.players.length >= 2) {
      return NextResponse.json(
        { message: "Room is already full" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (room.players.includes(userId)) {
      return NextResponse.json(
        { message: "You are already a player in this room" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    room.players.push({ user: userId, score: 0, choice: null });

    if (room.players.length === 2) {
      room.gameStatus = "active";
    }

    await room.save();

    return NextResponse.json(
      { message: `You joined ${room?.name} successfully` },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error joining a room:", error);

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
