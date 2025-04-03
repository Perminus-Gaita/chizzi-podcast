import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import TelegramUserToAddToTournament from "@/models/telegram/user-to-add-to-tournament.model";

export async function POST(request) {
  try {
    // Get authenticated user
    const user = await getUserSession(cookies, true);

    // Check if user has Telegram connected
    if (!user.telegram) {
      return NextResponse.json(
        { error: "Telegram account not connected" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { telegramGroupId, tournamentId } = body;

    // Validate required fields
    if (!telegramGroupId || !tournamentId) {
      return NextResponse.json(
        { error: "Telegram group ID and tournament ID are required" },
        { status: 400 }
      );
    }

    // Create new document
    const telegramUserToAdd = await TelegramUserToAddToTournament.create({
      userId: user._id, // MongoDB ObjectId of the user
      telegramUserId: user.telegram.userId, // Telegram user ID from the user object
      telegramGroupId,
      tournamentId
    });

    return NextResponse.json({
      success: true,
      data: telegramUserToAdd
    });

  } catch (error) {
    console.error("Error creating TelegramUserToAddToTournament:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status }
    );
  }
}