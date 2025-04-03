import { NextResponse } from "next/server";
import rpsRoomModel from "@/models/rpsroom.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(RPS GET rooms)")
);

export async function GET(request) {
  try {
    const rooms = await rpsRoomModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "players.user",
          foreignField: "_id",
          as: "players",
        },
      },
      {
        $project: {
          name: 1,
          gameStatus: 1,
          createdAt: 1,
          "players._id": 1,
          "players.username": 1,
          "players.profilePicture": 1,
        },
      },
    ]);

    if (rooms.length === 0) {
      return NextResponse.json(
        { message: "No rooms found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json(rooms, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);

    return NextResponse.json(
      { message: "Internal Server Error(get rooms)" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
