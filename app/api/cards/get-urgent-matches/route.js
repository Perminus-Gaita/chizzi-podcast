import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

database_connection()
  .then(() =>
    console.log("Connected successfully(CARDS GET user active games)")
  )
  .catch((err) => console.error("Database connection error:", err));

export async function GET(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }

    const userId = sessionUser._id;

    const activeGamesCount = await cardsRoomModel.countDocuments({
      "players.player": userId,
      gameStatus: "active",
      turn: userId,
      isComputerPlay: false,
    });

    return NextResponse.json(
      { count: activeGamesCount },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching active games count:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
