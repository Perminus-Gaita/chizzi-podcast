import mongoose from "mongoose";
import { NextResponse } from "next/server";
import TournamentComment from "@/models/tournament-comment.model";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    if (!tournamentId) {
      return NextResponse.json(
        { message: "Tournament ID is required" },
        { status: 400 }
      );
    }

    let sortQuery = {};
    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "mostLiked":
        sortQuery = { "likes.length": -1, createdAt: -1 };
        break;
      default: // latest
        sortQuery = { createdAt: -1 };
    }

    // Recursive population for nested replies
    const populateReplies = {
      path: "replies",
      populate: [
        {
          path: "userId",
          select: "username profilePicture name",
        },
        {
          path: "replies",
          populate: {
            path: "userId",
            select: "username profilePicture name",
          },
        },
      ],
      options: { sort: { createdAt: 1 } },
    };

    const comments = await TournamentComment.find({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      parentId: null,
    })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "username profilePicture name")
      .populate(populateReplies)
      .lean();

    const total = await TournamentComment.countDocuments({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      parentId: null,
    });

    return NextResponse.json({
      comments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    console.error("Error fetching tournament comments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
