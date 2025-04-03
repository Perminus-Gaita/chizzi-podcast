import mongoose from "mongoose";
import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";
import { TournamentModel } from "@/models/tournament.model";
import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully - (editing tournament)")
);

export async function PUT(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400 }
      );
    }

    const userId = sessionUser?._id;

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return NextResponse.json(
        { message: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.findOne({
      _id: new mongoose.Types.ObjectId(tournamentId),
      creator: userId,
      status: { $in: ["draft", "setup", "ready", "in-progress"] },
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found or you're not authorized to edit it" },
        { status: 404 }
      );
    }

    const allowedFields = [
      "name",
      "description",
      // "format",
      // "startDate",
      // "maxDuration",
      "autoStart",
      "requireTelegram",
      "prizeDistribution",
      "customBannerImage",
      "customTableBackgroundImage",
      "customCardSkinImage",
      "brandingLogo",
      "sponsorshipDetails",
    ];

    if (body.type === "sponsored" && body.sponsorshipTarget) {
      tournament.sponsorshipDetails = {
        ...tournament.sponsorshipDetails,
        targetAmount: body.sponsorshipTarget,
      };
    }

    // Handle paid tournament case
    if (body.type === "paid" && body.buyIn) {
      // Validate buy-in data
      if (body.buyIn.entryFee < 0 || body.buyIn.entryFee > 20000) {
        return NextResponse.json(
          { message: "Entry fee must be between 0 and 20,000 KSH" },
          { status: 400 }
        );
      }

      // Calculate prize pool based on entry fee and participants
      const prizePool = body.buyIn.entryFee * body.numberOfParticipants;

      tournament.buyIn = {
        entryFee: body.buyIn.entryFee,
        prizePool: prizePool,
      };
    }

    // // Clear buy-in data if tournament type is not paid
    // if (body.type !== "paid") {
    //   tournament.buyIn = undefined;
    // }

    // Update other allowed fields
    allowedFields.forEach((field) => {
      if (body[field] !== undefined && field !== "buyIn") {
        // Skip buyIn as we handled it separately
        tournament[field] = body[field];
      }
    });

    await tournament.save();

    return NextResponse.json(
      { message: "Tournament updated successfully", tournament },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tournament:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
