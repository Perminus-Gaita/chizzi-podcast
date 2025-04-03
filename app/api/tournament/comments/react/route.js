import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import TournamentComment from "@/models/tournament-comment.model";

export async function POST(request, { params }) {
  try {
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    const comment = await TournamentComment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    const userLikedIndex = comment.likes.indexOf(sessionUser._id);

    if (userLikedIndex === -1) {
      // Add like
      comment.likes.push(sessionUser._id);
    } else {
      // Remove like
      comment.likes.splice(userLikedIndex, 1);
    }

    await comment.save();

    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
