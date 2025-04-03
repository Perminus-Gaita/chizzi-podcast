import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";
import notificationModel from "@/models/notification.model";
database_connection().then(() =>
  console.log("Connected successfully (fetch unread notification count)")
);

export async function GET(request) {
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

    const count = await notificationModel.countDocuments({
      userId: sessionUser._id,
      isRead: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return NextResponse.json(
      { message: "Failed to get unread count" },
      { status: 500 }
    );
  }
}
