import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserSession } from "@/services/auth/get-user-session";
import database_connection from "@/services/database";
import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";

// Establish database connection.
database_connection().then(() =>
  console.log("Connected successfully to the database (remove participant)")
);

export async function DELETE(request) {
  try {
    const sessionUser = await getUserSession(cookies, true);

    const userId = sessionUser?._id;

    const { tournamentId, participantId } = await request.json();

    console.log(JSON.stringify({
      tournamentId, participantId
    }, null, 2));

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

    if (
      tournament.status === "in-progress" ||
      tournament.status === "completed"
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot remove participants: Tournament is in progress/completed",
        },
        {
          status: 400,
        }
      );
    }

    // Find all matches in the tournament.
    const matches = await MatchModel.find({ tournamentId });

    let participantRemoved = false;

    for (const match of matches) {
      const initialLength = match.participants.length;

      // Filter out the participant from the match
      match.participants = match.participants.filter(
        (participant) => participant.toString() !== participantId
      );

      // Check if a participant was removed
      if (match.participants.length < initialLength) {
        participantRemoved = true;
        await match.save(); // Save updated match
      }
    }

    if (!participantRemoved) {
      return NextResponse.json(
        { message: "Participant not found in any match" },
        { status: 404 }
      );
    }

    // Remove the participant document itself from the Participant model
    await ParticipantModel.findByIdAndDelete(participantId);

    return NextResponse.json(
      {
        message: "Participant removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing participant from tournament:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
