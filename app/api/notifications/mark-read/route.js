import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";
import notificationModel from "@/models/notification.model";
database_connection().then(() =>
  console.log("Connected successfully (marking many as read)")
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

    await notificationModel.updateMany(
      {
        userId: sessionUser._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
