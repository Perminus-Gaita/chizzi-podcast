import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import avatarRoomModel from "@/models/avatarroom.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(CARDS Create Room)")
);

const jokerDrawPile = [
  "2H",
  "3H",
  "4H",
  "5H",
  "6H",
  "7H",
  "8H",
  "9H",
  "10H",
  "JH",
  "QH",
  "KH",
  "AH", // Hearts
  "2D",
  "3D",
  "4D",
  "5D",
  "6D",
  "7D",
  "8D",
  "9D",
  "10D",
  "JD",
  "QD",
  "KD",
  "AD", // Diamonds
  "2S",
  "3S",
  "4S",
  "5S",
  "6S",
  "7S",
  "8S",
  "9S",
  "10S",
  "JS",
  "QS",
  "KS",
  // "AS", // Spades
  "2C",
  "3C",
  "4C",
  "5C",
  "6C",
  "7C",
  "8C",
  "9C",
  "10C",
  "JC",
  "QC",
  "KC",
  "AC", // Clubs
  "JOK1",
  "JOK2", // Two Jokers
];

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = sessionUser?._id;

    let { roomName, avatarPlayerId } = await request.json();

    roomName = roomName.replace(/\s+/g, "");

    // Validate input
    if (roomName.length < 3 || roomName.length > 20) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "Invalid input parameters" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate room name
    const existingRoom = await avatarRoomModel
      .findOne({ name: roomName })
      .session(session);
    if (existingRoom) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "A room with this name already exists" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new room
    const newRoom = new avatarRoomModel({
      name: roomName,
      creator: sessionUser?._id,
      maxPlayers: 2,
      timer: null,
      pot: 0,
      direction: 1,
      turn: null,
      desiredSuit: null,
      gameStatus: "waiting",
      winner: null,
      drawPile: jokerDrawPile,
      discardPile: [],
      players: [
        {
          player: userId,
          playerDeck: [],
          score: 0,
          on: false,
          initialRating: 1500,
          specialMoves: {
            jumpCards: 0,
            kickbackCards: 0,
            aceDeclarations: 0,
            penaltyAvoidances: 0,
          },
        },
        {
          player: avatarPlayerId,
          playerDeck: [],
          score: 0,
          on: false,
          initialRating: 1500,
          specialMoves: {
            jumpCards: 0,
            kickbackCards: 0,
            aceDeclarations: 0,
            penaltyAvoidances: 0,
          },
        },
      ],
      gameDuration: 0,
      tournamentMultiplier: 1, // Default to 1 for non-tournament games
      gameScores: new Map(),
      gamePlay: [],
    });
    await newRoom.save({ session });

    // If we've reached this point without errors, commit the transaction
    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Cards Table Created Successfully",
        roomId: newRoom._id,
      },
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    console.error("Error creating a room:", error);

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // End the session
    session.endSession();
  }
}
