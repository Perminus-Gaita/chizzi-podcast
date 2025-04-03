import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import { challengePlayer } from "@/services/notification/notifications";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully (challenge player)")
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

    const { telegramUserId, challengerName, opponentName } =
      await request.json();

    await challengePlayer({ telegramUserId, challengerName, opponentName });

    return NextResponse.json(
      { message: "Challenge sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending challenge:", error);
    return NextResponse.json(
      { message: "Failed to send challenge." },
      { status: 500 }
    );
  }
}
