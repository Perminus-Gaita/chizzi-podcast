import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import rpsRoomModel from "@/models/rpsroom.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(RPS Create Room)")
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

    const { roomName } = await request.json();

    // Create a new room with the creator as player 1
    const newRoom = new rpsRoomModel({
      name: roomName,
      players: [{ user: userId, score: 0, choice: null }], // Store userId as an ObjectId
      gameStatus: "waiting",
    });
    await newRoom.save();

    return NextResponse.json(
      { message: "Room created successfully", roomId: newRoom._id },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating a room:", error);

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
