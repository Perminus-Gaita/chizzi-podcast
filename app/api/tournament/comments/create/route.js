import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import TournamentComment from "@/models/tournament-comment.model";
import { TournamentModel } from "@/models/tournament.model";

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { tournamentId, text, parentId, isPinned } = await request.json();

    // Verify tournament exists and user has permission
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if comment is being pinned and user is tournament creator
    if (
      isPinned &&
      tournament.creatorId.toString() !== sessionUser._id.toString()
    ) {
      return NextResponse.json(
        { message: "Only tournament creator can pin comments" },
        { status: 403 }
      );
    }

    const newComment = {
      text,
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      userId: new mongoose.Types.ObjectId(sessionUser._id),
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      isPinned,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const comment = await TournamentComment.create(newComment);

    // Populate user details
    const populatedComment = await TournamentComment.findById(comment._id)
      .populate("userId", "username profilePicture")
      .lean();

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
