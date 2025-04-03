import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import TournamentComment from "@/models/tournament-comment.model";
import { TournamentModel } from "@/models/tournament.model";

export async function DELETE(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { commentId } = await request.json();

    // Find the comment
    const comment = await TournamentComment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user owns the comment
    const isCommentOwner =
      comment.userId.toString() === sessionUser._id.toString();

    // If not comment owner, check if user is tournament creator
    if (!isCommentOwner) {
      const tournament = await TournamentModel.findById(comment.tournamentId);
      const isTournamentCreator =
        tournament?.creatorId.toString() === sessionUser._id.toString();

      if (!isTournamentCreator) {
        return NextResponse.json(
          { message: "Unauthorized to delete this comment" },
          { status: 403 }
        );
      }
    }

    // Check if comment has replies
    const hasReplies = await TournamentComment.exists({ parentId: commentId });

    if (hasReplies) {
      // If has replies, update text to "[deleted]" instead of removing
      await TournamentComment.findByIdAndUpdate(commentId, {
        text: "[deleted]",
        updatedAt: new Date(),
      });
    } else {
      // If no replies, fully delete the comment
      await TournamentComment.findByIdAndDelete(commentId);
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
