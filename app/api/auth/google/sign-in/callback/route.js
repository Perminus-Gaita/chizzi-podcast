export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokensAndGetUserInfo } from "@/services/auth/google/exchange-code-for-tokens-and-get-user-info";
import { upsertUserIntoMongoDB } from "@/services/auth/google/upsert-user-into-mongodb";
import { createUserSessionCookieString } from "@/services/auth/create-user-session-cookie-string";

export async function GET(request) {
    try {
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

        // Upsert user into MongoDB with sanitized data
        const upsertedUser = await upsertUserIntoMongoDB({ 
            name: name,
            username: name,
            profilePicture: picture,
            googleUserId,
            googleEmail: email,
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiryDate: tokens.expiry_date
        });

        if (!upsertedUser?._id) {
            throw new Error('Failed to create or update user');
        }

        // Create session cookie
        const userSessionCookieString = await createUserSessionCookieString(upsertedUser._id);
        
        // Construct redirect URL with proper encoding.
        //const redirectUrl = new URL('/lobby', process.env.MYHOSTNAME).toString();
        const redirectUrl = `${process.env.MYHOSTNAME}/lobby`;

        // Create response with secure cookie settings
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set('Set-Cookie', userSessionCookieString);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        
        return response;
    } catch (error) {
        console.error('Error processing Google sign-in callback:', error);
        
        // Redirect to error page with sanitized error message.
        const errorMessage = error.message || 'Authentication failed';
        return NextResponse.redirect(
            `${process.env.MYHOSTNAME}/auth/error?error=${encodeURIComponent(errorMessage)}`
        );
    }
}