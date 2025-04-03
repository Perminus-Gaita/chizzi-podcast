export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verifyTelegramAuthData } from "@/services/auth/telegram/verify-telegram-auth-data";
import { addTelegramSignInToAccount } from "@/services/auth/telegram/add-telegram-sign-in-method-to-account";
import { getUserSession } from "@/services/auth/get-user-session";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        // Get the current user session
        const sessionUser = await getUserSession(cookies, true);

        // Parse the request body
        const requestBody = await request.json();

        // Verify the Telegram authentication data
        const verifiedData = await verifyTelegramAuthData(requestBody);

        // Add Telegram sign-in method to the user account
        const telegramData = {
            userId: verifiedData.id,
            firstName: verifiedData.first_name,
            lastName: verifiedData.last_name || '', // Fallback to empty string if missing
            username: verifiedData.username || null, // Fallback to null if missing
            profilePicture: verifiedData.photo_url || null, // Fallback to null if missing
            authorizationDate: verifiedData.auth_date
        };

        const updatedUser = await addTelegramSignInToAccount(sessionUser._id, telegramData);

        // Return the Telegram details
        return NextResponse.json(
            {
                success: true,
                telegram: updatedUser.telegram
            },
            { status: 200 }
        );
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

export async function GET(request) {
    try {
        // Get the current user session
        const sessionUser = await getUserSession(cookies, true);

        // Extract query parameters from the URL
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        
        // Verify the Telegram authentication data
        const verifiedData = await verifyTelegramAuthData(params);

        // Add Telegram sign-in method to the user account
        const telegramData = {
            userId: verifiedData.id,
            firstName: verifiedData.first_name,
            lastName: verifiedData.last_name || '', // Fallback to empty string if missing
            username: verifiedData.username || null, // Fallback to null if missing
            profilePicture: verifiedData.photo_url || null, // Fallback to null if missing
            authorizationDate: verifiedData.auth_date
        };

        await addTelegramSignInToAccount(sessionUser._id, telegramData);

        // Redirect to settings page
        // Extract the host from the request headers to handle ngrok properly
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        return NextResponse.redirect(`${protocol}://${host}/settings?tab=accountSettings&section=SignInMethods`);
    } catch (error) {
        console.error("Error in Telegram callback (GET):", error);

        // For errors, still redirect to settings but append an error parameter
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        return NextResponse.redirect(`${protocol}://${host}/settings?tab=accountSettings&section=SignInMethods&error=telegram_auth_failed`);
    }
}