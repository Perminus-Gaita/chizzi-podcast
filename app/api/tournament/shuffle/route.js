import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TournamentModel, MatchModel } from "@/models/tournament.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully (Tournament Shuffle Seeds)")
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

    const { tournamentId } = await request.json();
    const userId = sessionUser?._id;

    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if the user is the creator of the tournament
    if (tournament.creator.toString() !== userId.toString()) {
      return NextResponse.json(
        { message: "Unauthorized: You are not the creator of this tournament" },
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if the tournament status is not 'in-progress' or 'completed'
    if (
      tournament.status === "in-progress" ||
      tournament.status === "completed"
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot shuffle participants: Tournament is in progress/completed",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch matches for the tournament
    const matches = await MatchModel.find({ tournamentId });

    // Shuffle the participants in the tournament
    const allParticipants = matches.flatMap((match) => match.participants);

    // Shuffle logic
    for (let i = allParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allParticipants[i], allParticipants[j]] = [
        allParticipants[j],
        allParticipants[i],
      ];
    }

    // Update the matches with the shuffled participants
    let index = 0;
    for (const match of matches) {
      match.participants = allParticipants.slice(
        index,
        index + match.participants.length
      );
      index += match.participants.length;
      await match.save(); // Save each match after updating
    }

    return NextResponse.json(
      {
        message: "Participants shuffled successfully.",
        tournament,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error shuffling tournament seeds:", error);

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
