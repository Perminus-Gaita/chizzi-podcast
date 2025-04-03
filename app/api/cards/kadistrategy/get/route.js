import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import database_connection from "@/services/database";
import StrategyProfileModel from "@/models/strategyprofile.model";
import { AvatarPlayerModel, kadiPlayerModel } from "@/models/kadiplayer.model";

database_connection().then(() =>
  console.log("Connected successfully(Strategy Get)")
);

export async function GET() {
  try {
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }

    const userId = sessionUser._id.toString();

    // Get the avatar player with populated strategy profile in a single query
    const avatarPlayer = await AvatarPlayerModel.findOne({ userId: userId })
      .populate({
        path: "strategyProfileId",
        model: "StrategyProfile",
        select: "name isActive version data performance",
      })
      .select("-seasonHistory");

    if (!avatarPlayer) {
      return NextResponse.json(
        { message: "Avatar player not found" },
        { status: 404 }
      );
    }

    // Construct response with nested strategy
    return NextResponse.json({
      message: "Data retrieved successfully",
      avatarPlayer: {
        _id: avatarPlayer._id,
        rating: avatarPlayer.rating,
        totalGames: avatarPlayer.totalGames,
        rankedWins: avatarPlayer.rankedWins,
        rankingTier: avatarPlayer.rankingTier,
        progression: avatarPlayer.progression,
        skillMetrics: avatarPlayer.skillMetrics,
        strategy: avatarPlayer.strategyProfileId
          ? {
              id: avatarPlayer.strategyProfileId._id,
              name: avatarPlayer.strategyProfileId.name,
              isActive: avatarPlayer.strategyProfileId.isActive,
              version: avatarPlayer.strategyProfileId.version,
              data: avatarPlayer.strategyProfileId.data,
              performance: avatarPlayer.strategyProfileId.performance,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error retrieving avatar player:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
