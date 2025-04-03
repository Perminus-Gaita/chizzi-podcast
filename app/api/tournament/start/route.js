import mongoose from "mongoose";
import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";
import { TournamentModel, MatchModel } from "@/models/tournament.model";
import cardsRoomModel from "@/models/cardsroom.model";
import { kadiPlayerModel } from "@/models/kadiplayer.model";
import database_connection from "@/services/database";
import { jokerDrawPile, noJokerDrawPile } from "@/utils/cards";

database_connection().then(() =>
  console.log("Connected successfully to the database (tournament start)")
);

export async function POST(request) {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400 }
      );
    }

    const { tournamentId } = await request.json();
    if (!tournamentId) {
      return NextResponse.json(
        { message: "Tournament ID is required" },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.findById(tournamentId).session(
      session
    );
    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.creator.toString() !== sessionUser._id.toString()) {
      return NextResponse.json(
        { message: "Only the creator can start the tournament" },
        { status: 403 }
      );
    }

    // Determine the target match type based on the number of participants
    let targetMatchText = "";
    if (tournament.numberOfParticipants === 4) {
      targetMatchText = "Semi Final";
    } else if (tournament.numberOfParticipants === 8) {
      targetMatchText = "Quarter Final";
    } else if (tournament.numberOfParticipants === 8) {
      targetMatchText = "Quarter Final";
    } else if (
      tournament.numberOfParticipants === 16 ||
      tournament.numberOfParticipants === 32 ||
      tournament.numberOfParticipants === 64 ||
      tournament.numberOfParticipants === 128 ||
      tournament.numberOfParticipants === 256 ||
      tournament.numberOfParticipants === 512
    ) {
      targetMatchText = "Round 1";
    } else {
      return NextResponse.json(
        { message: "Unsupported number of participants" },
        { status: 400 }
      );
    }

    // Get all first round matches
    const matches = await MatchModel.find({
      tournamentId,
      tournamentRoundText: targetMatchText,
    })
      .populate("participants")
      .session(session);

    // console.log("### CREATING MATCHES ###");
    // console.log(matches);
    // console.log(matches[0].participants[0]);

    // Create game rooms for all matches with 2 participants
    for (const match of matches) {
      if (match.participants.length >= 2) {
        const playerRatings = await Promise.all(
          match.participants.map(async (p) => {
            const kadiPlayer = await kadiPlayerModel
              .findOne({ userId: p.userId })
              .session(session);
            return kadiPlayer?.rating || 1500;
          })
        );

        const cardsRoom = await cardsRoomModel.create(
          [
            {
              name: `${tournament.slug}-${match.name.split(" ").join("")}`,
              creator: tournament.creator,
              tournamentId: tournamentId,
              maxPlayers: 2,
              timer: true, // return to true
              pot: tournament.type === "paid" ? tournament.buyIn?.prizePool : 0,
              direction: 1,
              turn: null,
              currentSuit: null,
              desiredSuit: null,
              jumpCounter: 0,
              gameStatus: "waiting",
              isPenalty: false,
              isQuestion: false,
              isKickback: false,
              winner: null,
              players: match.participants.map((p, index) => ({
                player: p.userId,
                playerDeck: [],
                score: 0,
                on: false,
                checkedIn: false,
                initialRating: playerRatings[index],
                specialMoves: {
                  jumpCards: 0,
                  kickbackCards: 0,
                  aceDeclarations: 0,
                  penaltyAvoidances: 0,
                },
                stallingPenalties: 0,
              })),
              drawPile: jokerDrawPile,
              discardPile: [],
              tournamentMultiplier: 1.5, // Higher stakes for tournament games
            },
          ],
          { session }
        );

        // Update match with game room
        match.gameRoom = cardsRoom[0]._id;
        match.state = "IN_PROGRESS";
        await match.save({ session });
      }
    }

    // Update tournament status
    tournament.status = "in-progress";
    tournament.startDate = new Date();
    await tournament.save({ session });

    await session.commitTransaction();
    return NextResponse.json(
      {
        message: "Tournament started successfully",
        tournament: tournament,
      },
      { status: 200 }
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error starting tournament:", error);
    return NextResponse.json(
      { message: "Error starting tournament", error: error.message },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
