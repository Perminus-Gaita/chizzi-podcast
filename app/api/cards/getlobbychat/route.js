import ChatModel from "@/models/chat.model";
import { NextResponse } from "next/server";
import database_connection from "@/services/database";
export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully (Fetching Chat Messages)")
);

const chatAggregationPipeline = () => [
  {
    $lookup: {
      from: "users",
      localField: "sender",
      foreignField: "_id",
      as: "senderInfo",
    },
  },
  {
    $unwind: "$senderInfo",
  },
  {
    $project: {
      message: 1,
      createdAt: 1,
      sender: {
        userId: "$senderInfo._id",
        username: "$senderInfo.username",
        profilePicture: "$senderInfo.profilePicture",
      },
    },
  },
  {
    $sort: { createdAt: 1 },
  },
  {
    $limit: 100,
  },
];

export async function GET(request) {
  try {
    const allMessages = await ChatModel.aggregate(chatAggregationPipeline());

    // If no messages exist
    if (!allMessages || allMessages.length === 0) {
      return NextResponse.json(
        { message: "No messages found" },
        { status: 404 }
      );
    }

    // Return the messages in the response
    return NextResponse.json({ messages: allMessages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);

    // Return error response if something goes wrong
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
