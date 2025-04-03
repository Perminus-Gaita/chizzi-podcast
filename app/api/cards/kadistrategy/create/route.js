import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import database_connection from "@/services/database";
import { AvatarPlayerModel, kadiPlayerModel } from "@/models/kadiplayer.model";
import StrategyProfileModel from "@/models/strategyprofile.model";
import { StrategyProfile } from "@/services/cards/strategy/StrategyProfile";

database_connection().then(() =>
  console.log("Connected successfully(Strategy Create)")
);

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get authenticated user
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }

    const userId = sessionUser._id.toString();

    // Get request body
    const {
      name,
      archetype = "balanced", // Changed from template to archetype to match UI
    } = await request.json();

    // Validate input
    if (!name || name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { message: "Invalid avatar name" },
        { status: 400 }
      );
    }

    // validate archetype
    if (!StrategyProfile.templates[archetype]) {
      return NextResponse.json(
        { message: "Invalid archetype selected" },
        { status: 400 }
      );
    }

    // Create base strategy from archetype
    const baseStrategy = new StrategyProfile(
      new mongoose.Types.ObjectId(),
      name,
      userId,
      archetype // Using archetype as template
    );

    // Create new strategy document
    const newStrategy = new StrategyProfileModel({
      userId,
      name,
      isActive: true, // Always active for new avatar
      version: 1,
      data: {
        weights: baseStrategy.weights,
        traits: baseStrategy.traits,
        phaseAdjustments: baseStrategy.phaseAdjustments,
        cardPriorities: baseStrategy.cardPriorities,
        situationalRules: baseStrategy.situationalRules,
        learnedPatterns: baseStrategy.learnedPatterns,
      },
      performance: {
        gamesPlayed: 0,
        wins: 0,
        avgMoveTime: 0,
        specialMoves: {
          jumpCards: 0,
          kickbackCards: 0,
          aceDeclarations: 0,
          penaltyAvoidances: 0,
        },
      },
    });

    // link player with strategy
    const newAvatarPlayer = new AvatarPlayerModel({
      userId: sessionUser._id,
      strategyProfileId: newStrategy._id,
    });

    await newStrategy.save({ session });
    await newAvatarPlayer.save({ session });

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Avatar created successfully",
        kadiPlayer: {
          id: newAvatarPlayer._id,
          name: name,
          rating: newAvatarPlayer.rating,
          rankingTier: newAvatarPlayer.rankingTier,
        },
        strategy: {
          id: newStrategy._id,
          name: newStrategy.name,
          archetype: archetype,
          isActive: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating strategy:", error);

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
