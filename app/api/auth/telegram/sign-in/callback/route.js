export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verifyTelegramAuthData } from "@/services/auth/telegram/verify-telegram-auth-data";
import { upsertTelegramUserIntoMongoDB } from "@/services/auth/telegram/upsert-telegram-user-into-mongodb";
import { createUserSessionCookieString } from "@/services/auth/create-user-session-cookie-string";

export async function POST(request) {
  try {
    // Parse the request body
    const requestBody = await request.json();

    // Verify the Telegram authentication data
    const verifiedData = await verifyTelegramAuthData(requestBody);

    // Upsert the user into MongoDB
    const user = await upsertTelegramUserIntoMongoDB({
      userId: verifiedData.id,
      firstName: verifiedData.first_name,
      lastName: verifiedData.last_name || '', // Fallback to empty string if missing
      username: verifiedData.username || null, // Fallback to null if missing
      profilePicture: verifiedData.photo_url || null, // Fallback to null if missing
      authorizationDate: verifiedData.auth_date,
    });

    // Create session cookie
    const userSessionCookieString = await createUserSessionCookieString(user._id);

    // Construct redirect URL
    const redirectUrl = `${process.env.MYHOSTNAME}/lobby`;

    // Return a JSON response with the redirect URL and cookie
    const response = NextResponse.json(
      { redirectUrl },
      { status: 200 }
    );
    response.headers.set('Set-Cookie', userSessionCookieString);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    console.error("Error in Telegram callback:", error);

    // Determine the status code based on the error
    const status = error.statusCode || 500;

    // Return an error response
    return NextResponse.json(
      { error: error.message },
      { status }
    );
  }
}