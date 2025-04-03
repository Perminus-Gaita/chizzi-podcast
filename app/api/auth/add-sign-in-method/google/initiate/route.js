import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await getUserSession(cookies, true);
        
        // Create OAuth2 client
        const googleRedirectUri = `${process.env.MYHOSTNAME}/api/auth/google/sign-in/callback`;
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            googleRedirectUri
        );

        // Generate secure random state
        const state = randomBytes(32).toString('hex');

        // Store state in a secure cookie with expiration
        const cookieStore = await cookies();
        cookieStore.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        // Generate auth URL with state parameter
        const redirectUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            state: state,
            prompt: 'consent', // Ensures refresh token is always provided
            include_granted_scopes: true
        });
        
        if (!redirectUrl) {
            return NextResponse.json(
                { message: 'No redirect URL generated' }, 
                { status: 500 }
            );
        }

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('Error initiating Google auth:', error);
        // Clear oauth state cookie in case of error
        const cookieStore = await cookies();
        cookieStore.delete('oauth_state');
        
        return NextResponse.json(
            { message: "Error initiating Google auth" },
            { status: 500 }
        );
    }
}