export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokensAndGetUserInfo } from "@/services/auth/google/exchange-code-for-tokens-and-get-user-info";
import { addGoogleSignInToAccount } from "@/services/auth/google/add-google-sign-in-method-to-account";
import { getUserSession } from "@/services/auth/get-user-session";

export async function GET(request) {
    try {
        // Get the current user session
        const sessionUser = await getUserSession(cookies, true);

        // Validate the request URL
        if (!request?.url) {
            throw new Error('Invalid request URL');
        }

        // Get URL parameters
        const urlObject = new URL(request.url);
        const code = urlObject.searchParams.get('code');
        const returnedState = urlObject.searchParams.get('state');
        const error = urlObject.searchParams.get('error');

        // Get and verify stored state from cookie
        const cookieStore = await cookies();
        const storedState = cookieStore.get('oauth_state')?.value;

        // Clear the state cookie immediately to prevent replay attacks
        cookieStore.delete('oauth_state');

        // Handle OAuth errors returned by Google
        if (error) {
            console.error('Google OAuth error:', error);
            const errorDescription = urlObject.searchParams.get('error_description');
            return NextResponse.redirect(
                `${process.env.MYHOSTNAME}/auth/error?error=${encodeURIComponent(errorDescription || error)}`
            );
        }

        // Validate state parameter
        if (!returnedState || !storedState || returnedState !== storedState) {
            console.error('State parameter validation failed');
            return NextResponse.redirect(
                `${process.env.MYHOSTNAME}/auth/error?error=${encodeURIComponent('Invalid authentication state')}`
            );
        }

        // Validate authorization code
        if (!code) {
            return NextResponse.redirect(
                `${process.env.MYHOSTNAME}/auth/error?error=${encodeURIComponent('Authorization code is missing')}`
            );
        }

        // Exchange code for tokens and get user info
        const { name, picture, id: googleUserId, email, tokens } = await exchangeCodeForTokensAndGetUserInfo(code);

        if (!email || !googleUserId) {
            throw new Error('Required user information missing from Google response');
        }

        // Add Google sign-in method to the user account
        const googleData = {
            userId: googleUserId,
            email: email,
            profilePicture: picture,
            accessToken: tokens.access_token,
            accessTokenExpiryDate: tokens.expiry_date,
            refreshToken: tokens.refresh_token
        };

        await addGoogleSignInToAccount(sessionUser._id, googleData);

        // Redirect to the lobby or another appropriate page
        const redirectUrl = `${process.env.MYHOSTNAME}/lobby`;
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('Error processing Google sign-in callback:', error);
        
        // Redirect to error page with sanitized error message.
        const errorMessage = error.message || 'Authentication failed';
        return NextResponse.redirect(
            `${process.env.MYHOSTNAME}/auth/error?error=${encodeURIComponent(errorMessage)}`
        );
    }
}