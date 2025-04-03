// app/api/push/route.js
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { pushSubscriptionService } from "@/services/notification/push/subscription";
import webpush from "web-push";

const vapidDetails = {
  subject: "mailto:gaita@wufwuf.io",
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (!vapidDetails.publicKey || !vapidDetails.privateKey) {
  console.error("VAPID keys are not set in environment variables");
}

webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey,
  vapidDetails.privateKey
);

export async function PUT(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const subscription = await validateRequestBody(request, {
      endpoint: true,
      keys: {
        p256dh: true,
        auth: true,
      },
      expirationTime: false,
    });

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save subscription using the service
    const savedSubscription = await pushSubscriptionService.saveSubscription(
      userSession._id,
      subscription,
      userAgent
    );

    return NextResponse.json(
      {
        message: "Subscription saved successfully",
        data: { subscription: savedSubscription },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { endpoint } = await validateRequestBody(request, {
      endpoint: true,
    });

    // Deactivate subscription using the service
    await pushSubscriptionService.deleteSubscription(userSession._id, endpoint);

    return NextResponse.json(
      {
        message: "Subscription removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing subscription:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { subscription, message } = await validateRequestBody(request, {
      subscription: true,
      message: true,
    });

    const payload = JSON.stringify({
      title: "Wufwuf",
      body: message,
      icon: "public/wufwuf-icon/web-app-manifest-512x512.png",
      url: "/",
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json(
      {
        message: "Notification sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}
