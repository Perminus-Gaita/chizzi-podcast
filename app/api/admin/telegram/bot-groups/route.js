// app/api/integrations/telegram/bot-groups/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First get all updates to collect chat IDs
    const updatesResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChats`
    );
    
    if (!updatesResponse.ok) {
      throw new Error('Failed to fetch chats');
    }

    const data = await updatesResponse.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Failed to get chats');
    }

    return NextResponse.json({
      success: true,
      groups: data.result
    });

  } catch (error) {
    console.error("Error fetching bot groups:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bot groups" },
      { status: 500 }
    );
  }
}

