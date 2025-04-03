import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import TelegramGroup from "@/models/telegram/group.model";

export async function GET(request) {
  try {
    // Get authenticated user
    const user = await getUserSession(cookies, true);

    // Get Telegram user data
    const userTelegramData = user.telegram;
    if (!userTelegramData) {
      return NextResponse.json(
        { error: "Telegram account not connected" },
        { status: 404 }
      );
    }

    // Get groups where this Telegram user added the bot
    const groups = await TelegramGroup.find({ 
      telegramUserId: userTelegramData.userId 
    }).sort({ 
      createdAt: -1  // Sort by newest first
    });

    // Transform groups data to match UI requirements
    const transformedGroups = groups.map(group => ({
      id: group.telegramGroupId,
      name: group.groupName,
      memberCount: group.memberCount,
      type: group.groupType,
      isAdminOnly: group.allMembersAreAdministrators,
      wufwufBotRole: group.wufwufBotRole,
      botPermissions: {
        canInviteViaLink: group?.botPermissions?.canInviteViaLink
      },
      inviteLink: group.primaryInviteLink,
      createdAt: group.createdAt
    }));

    // Return groups data
    return NextResponse.json({
      success: true,
      groups: transformedGroups,
      totalGroups: transformedGroups.length
    });

  } catch (error) {
    console.error("Error fetching Telegram groups:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status }
    );
  }
}
