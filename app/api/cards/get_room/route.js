import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";

import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(CARDS Create Room)")
);

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomSlug = searchParams.get("roomSlug");

    if (!roomSlug) {
      return NextResponse.json(
        { message: "Room slug is required" },
        { status: 400 }
      );
    }

    const room = await cardsRoomModel.findOne({ name: roomSlug }).lean();

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error("Error fetching cards room data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
