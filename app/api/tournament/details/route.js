import { NextResponse } from "next/server";
import { ParticipantModel, MatchModel } from "@/models/tournament.model";

import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

// Connect to the database
database_connection().then(() =>
  console.log("Connected successfully (fetching tournament details)")
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");

  try {
    // Fetch all matches for the tournament
    const matches = await MatchModel.find({ tournamentId }).populate(
      "participants"
    );

    // Extract participants from all matches
    const participants = matches.flatMap((match) => match.participants);

    // Optionally, remove duplicates (if necessary)
    const uniqueParticipants = Array.from(
      new Set(participants.map((p) => p._id))
    ).map((id) => participants.find((p) => p._id === id));

    if (!uniqueParticipants.length) {
      return NextResponse.json(
        { message: "No participants found for this tournament" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { participants: uniqueParticipants },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching participants:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
