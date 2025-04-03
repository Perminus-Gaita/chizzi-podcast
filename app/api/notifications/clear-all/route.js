import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import notificationModel from "@/models/notification.model";//

// Connect to database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("notifications/clear-all");

export async function DELETE(request) {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await notificationModel.deleteMany(
      { userId: sessionUser._id },
      { session }
    );

    await session.commitTransaction();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (session) await session.abortTransaction();
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    if (session) await session.endSession();
  }
}
