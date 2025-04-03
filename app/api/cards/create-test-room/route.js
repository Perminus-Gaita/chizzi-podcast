import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import WalletModel from "@/models/payments/wallet.model";
import { kadiPlayerModel } from "@/models/kadiplayer.model";
import database_connection from "@/services/database";
import { shuffle } from "@/services/cards/utils";

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

const noJokerDrawPile = [
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
];

const AI_PLAYERS = {
  AI_1: new mongoose.Types.ObjectId("676112252e2cd5a9df380aab"),
  AI_2: new mongoose.Types.ObjectId("676112252e2cd5a9df380aac"),
  AI_3: new mongoose.Types.ObjectId("676112252e2cd5a9df380aad"),
  AI_4: new mongoose.Types.ObjectId("676112252e2cd5a9df380aae"),
  AI_5: new mongoose.Types.ObjectId("676112252e2cd5a9df380aaf"),
};

// Helper to get AI players array based on max players
async function getAIPlayers(maxPlayers, session) {
  const numAIPlayers = maxPlayers - 1;
  const aiPlayers = [];

  // Get all AI IDs and shuffle them
  const aiIds = Object.values(AI_PLAYERS);
  const shuffled = aiIds.sort(() => 0.5 - Math.random());

  // Take only the number we need
  const selectedAIs = shuffled.slice(0, numAIPlayers);

  for (const aiId of selectedAIs) {
    let aiPlayer = await kadiPlayerModel
      .findOne({ userId: aiId })
      .session(session);

    if (!aiPlayer) {
      aiPlayer = new kadiPlayerModel({
        userId: aiId,
        rating: 1500,
      });
      await aiPlayer.save({ session });
    }

    aiPlayers.push({
      player: aiId,
      playerDeck: [],
      score: 0,
      on: false,
      checkedIn: true,
      initialRating: aiPlayer.rating,
      specialMoves: {
        jumpCards: 0,
        kickbackCards: 0,
        aceDeclarations: 0,
        penaltyAvoidances: 0,
      },
    });
  }

  return aiPlayers;
}

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

    const userId = sessionUser?._id.toString();

    let { roomName, maxPlayers, timer, joker, amount } = await request.json();

    roomName = roomName.replace(/\s+/g, "");
    const amountInLowestDenomination = amount ? amount * 100 : 0;
    const isFreeGame = !amount || amount === 0;

    // Validate input
    if (
      roomName.length < 3 ||
      timer === null ||
      roomName.length > 20 ||
      maxPlayers < 2 ||
      maxPlayers > 4 ||
      (!isFreeGame && amountInLowestDenomination < 1000) // Only check minimum amount for cash games
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "Invalid input parameters" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate room name
    const existingRoom = await cardsRoomModel
      .findOne({ name: roomName })
      .session(session);
    if (existingRoom) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "A room with this name already exists" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Only check wallet balance for paid games
    if (!isFreeGame) {
      // Check if the player has enough balance for buy-in
      const wallet = await WalletModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (!wallet || wallet.balances.KES.balance < amountInLowestDenomination) {
        await session.abortTransaction();
        return NextResponse.json(
          { message: "Insufficient balance for buy-in" },
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    let kadiPlayer = await kadiPlayerModel.findOne({ userId }).session(session);
    if (!kadiPlayer) {
      kadiPlayer = new kadiPlayerModel({ userId, rating: 1500 });
      await kadiPlayer.save({ session });
    }

    const initialRating = kadiPlayer.rating;

    // Create a new room
    const newRoom = new cardsRoomModel({
      name: roomName,
      creator: userId,
      isComputerPlay: true,
      maxPlayers: maxPlayers,
      timer: timer,
      pot: amountInLowestDenomination,
      direction: 1,
      turn: null,
      desiredSuit: null,
      gameStatus: "waiting",
      winner: null,
      drawPile: joker ? jokerDrawPile : noJokerDrawPile,
      discardPile: [],
      players: [
        {
          player: userId,
          playerDeck: [],
          score: 0,
          on: false,
          initialRating: initialRating,
          specialMoves: {
            jumpCards: 0,
            kickbackCards: 0,
            aceDeclarations: 0,
            penaltyAvoidances: 0,
          },
        },
        ...(await getAIPlayers(maxPlayers, session)),
      ],
      gameDuration: 0,
      tournamentMultiplier: 1, // Default to 1 for non-tournament games
      gameScores: new Map(),
      gamePlay: [],
    });

    await newRoom.save({ session });

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Match Created Successfully. Redirecting...",
        roomId: newRoom._id,
        slug: newRoom.name,
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
