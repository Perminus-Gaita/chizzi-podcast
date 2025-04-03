// app/api/user/[username]/route.js
export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { getWorkspaceMembersByUsername } from "@/services/workspace/members/get-workspace-members-by-username";

// endpoint to get user profile
export async function GET(request, props) {
    const params = await props.params;
    try {
        // Get user session
        const userSession = await getUserSession(cookies, false);
        // if no user session return an empty array
        if(!userSession){
            return NextResponse.json(
                { message: "Array of members of this workspace", data: [] },
                { status: 200 }
            );
        }
        
        // Get the username from URL params
        const { username } = params;

        if (!username) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        // Get user profile data
        const result = await getWorkspaceMembersByUsername(
            username,
            userSession?._id
        );

        return NextResponse.json(
            { message: "Array of members of this workspace", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error getting an Array of members of this workspace:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}
