// app/api/user/[username]/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { getUserProfileData } from "@/services/user/get-user-profile-data";
import { editUserProfileData } from "@/services/user/edit-user-profile-data";

// endpoint to get user profile
export async function GET(request, props) {
    const params = await props.params;
    try {
        // Get user session
        const userSession = await getUserSession(cookies, false);
        
        // Get the username from URL params
        const { username } = params;

        if (!username) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        // Get user profile data
        const result = await getUserProfileData(
            username,
            userSession?._id
        );

        console.log({result})

        return NextResponse.json(
            { message: "User profile data", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in GET user profile request:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

// endpoint to edit user profile
export async function PATCH(request, props) {
    const params = await props.params;
    try {
        // Get user session - require authentication
        const userSession = await getUserSession(cookies, true);
        if (!userSession) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
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

        // Get user profile data to check if this user can update this profile
        const profileData = await getUserProfileData(
            username,
            userSession._id
        );

        // Fix: Corrected authorization logic
        if (profileData.sessionUserRoleInWorkspace !== "admin" && 
             profileData.sessionUserRoleInWorkspace !== "editor") {
            return NextResponse.json(
                { message: "You are not authorized to take this action." },
                { status: 403 }
            );
        }

        // Get update data from request body
        const updateData = await request.json();
        if (!updateData || Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { message: "Update data is required" },
                { status: 400 }
            );
        }

        // Update user profile
        const updatedProfile = await editUserProfileData(
            username,
            userSession._id,
            updateData
        );

        return NextResponse.json(
            {
                message: "Profile updated successfully",
                data: updatedProfile
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in PATCH user profile request:', error);
        
        // Handle specific error cases
        if (error.message === 'Username already taken') {
            return NextResponse.json(
                { message: error.message },
                { status: 409 }
            );
        }
        
        if (error.message.includes('validation failed')) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}