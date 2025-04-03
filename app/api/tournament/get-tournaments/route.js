import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TournamentModel } from "@/models/tournament.model";
import { tournamentStructures } from "@/utils/tournaments";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully (get user tournaments)")
);

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = sessionUser?._id;

    const userTournaments = await TournamentModel.aggregate([
      {
        $match: { creator: userId },
      },
      {
        $lookup: {
          from: "matches",
          localField: "_id",
          foreignField: "tournamentId",
          as: "matches",
        },
      },
      {
        $addFields: {
          currentParticipants: {
            $sum: {
              $map: {
                input: "$matches",
                as: "match",
                in: { $size: { $ifNull: ["$$match.participants", []] } },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          game: 1,
          format: 1,
          startDate: 1,
          status: 1,
          type: 1,
          currentParticipants: 1,
          sponsorshipDetails: 1,
          prizePool: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({ tournaments: userTournaments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching tournaments" },
      { status: 500 }
    );
  }
}
