import mongoose from "mongoose";
import database_connection from "@/services/database";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import commentModel from "@/models/comment.model";

database_connection().then(() =>
  console.log("Connected successfully (commenting)")
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

    const userId = sessionUser?._id;

    const { text, entryId } = await request.json();

    const GIVEAWAY_ID = "65e06a4d4536497b97f94b4c";

    const newComment = {
      text,
      giveawayId: new mongoose.Types.ObjectId(GIVEAWAY_ID),
      entryId: new mongoose.Types.ObjectId(entryId),
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
    };

    const response = await commentModel.create(newComment);

    return NextResponse.json(response, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching an entry:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
