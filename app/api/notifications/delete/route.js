import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import mongoose from "mongoose";

import notificationModel from "@/models/notification.model";

export const dynamic = "force-dynamic";

// Connect to database outside of the functions
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("notifications/delete");

export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("notificationId");

    // Check if the notification exists
    const existingNotification = await notificationModel.findById(
      notificationId
    );

    if (!existingNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await notificationModel.deleteOne({
      _id: new mongoose.Types.ObjectId(notificationId),
    });

    return NextResponse({
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting a notification:", error);

    return NextResponse.json(
      { message: "Internal Server Error (deleting notifications)" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
