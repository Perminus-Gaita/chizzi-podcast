import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { getNotificationsByUserId } from "@/services/notification/get-notifications-to-display-by-user-id";


export async function GET(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // get users notifications using service
    const notifications = await getNotificationsByUserId(userSession._id);

    return NextResponse.json(notifications, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching notifications", error);
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

