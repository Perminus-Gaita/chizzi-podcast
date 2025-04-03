import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUser } from "@/utils/auth/getUser";
import database_connection from "@/services/database";
import { TournamentModel, ParticipantModel } from "@/models/tournament.model";

// Establish database connection
database_connection().then(() =>
  console.log("Connected successfully to the database (verify participant)")
);

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }
    const userId = sessionUser?._id;

    const { tournamentId, participantId } = await request.json();

    if (!tournamentId || !participantId) {
      return NextResponse.json(
        { message: "tournamentId and participantId are required" },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.creator.toString() !== userId.toString()) {
      return NextResponse.json(
        { message: "Unauthorized: You are not the creator of this tournament" },
        { status: 403 }
      );
    }

    // Find the participant
    const participant = await ParticipantModel.findById(participantId);

    if (!participant) {
      return NextResponse.json(
        { message: "Participant not found" },
        { status: 404 }
      );
    }

    if (participant.buyInDetails?.verified) {
      return NextResponse.json(
        { message: "Participant is already verified" },
        { status: 304 }
      );
    }

    // Update the participant's verification status
    participant.buyInDetails.verified = true;
    await participant.save();

    return NextResponse.json(
      {
        message: "Participant verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying participant:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
