import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";
import notificationModel from "@/models/notification.model";
database_connection().then(() =>
  console.log("Connected successfully (fetch notifications)")
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

    const userId = sessionUser?._id;

    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(notifications, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);

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
