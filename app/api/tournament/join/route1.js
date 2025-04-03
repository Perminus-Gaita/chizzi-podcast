"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { joinTournament } from "@/services/tournament/join-a-tournament";

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }

    const { tournamentId, playerName } = await request.json();

    if (!tournamentId || !playerName) {
      return NextResponse.json(
        { message: "tournamentId and playerName are required" },
        { status: 400 }
      );
    }

    const result = await joinTournament(
      sessionUser._id.toString(),
      tournamentId,
      playerName
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: error.message ? 400 : 500 }
    );
  }
}
