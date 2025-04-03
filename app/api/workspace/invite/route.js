import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body"
import { inviteUserToAWorkspace } from "@/services/workspace/invite-user-to-a-workspace";
import { respondToAnInvite } from "@/services/workspace/respond-to-an-invite";
import { getAPopulatedWorkspaceInviteDocument } from "@/services/workspace/get-a-populated-workspace-invite-document";
import { uninviteUserFromWorkspace } from "@/services/workspace/uninvite-user-from-workspace";
export const dynamic = "force-dynamic";

// endpoint to create invite.
export async function POST(request) {
    try {
        // Get user session
        const userSession = await getUserSession(cookies, true);

        // Parse and validate the request body
        const { inviteeId } = await validateRequestBody(request, {
            inviteeId: true
        })

        const result = await inviteUserToAWorkspace(
            userSession.currentWorkspace._id,
            userSession._id,
            inviteeId                      
        )

        return NextResponse.json(
            { message: "New invite created", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in POST request:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

// endpoint to respond to invite.
export async function PATCH(request) {
    try {
        // Get user session
        const userSession = await getUserSession(cookies, true);

        // Parse and validate the request body
        const { inviteId, inviteResponse } = await validateRequestBody(request, {
            inviteId: true,
            inviteResponse: true
        })
        const inviteeId = userSession._id

        const result = await respondToAnInvite(inviteId, inviteResponse, inviteeId)

        return NextResponse.json(
            { message: "New invite created", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PATCH request:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

// endpoint to fetch invite.
export async function GET(request) {
    try {
        // Get user session
        const userSession = await getUserSession(cookies, true);

        // Get the inviteId from URL params
        const { searchParams } = new URL(request.url);
        const inviteId = searchParams.get('inviteId');

        // get invite document poplulated
        const result = await getAPopulatedWorkspaceInviteDocument(
            inviteId, userSession._id
        );

        return NextResponse.json(
            { message: "Invite data, populated", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in GET invite request:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

// endpoint to delete invite (uninvite a user)
export async function DELETE(request) {
    try {
        // Get user session
        const userSession = await getUserSession(cookies, true);

        // Validate user has access to current workspace
        if (!userSession.currentWorkspace) {
            return NextResponse.json(
                { message: "No workspace selected" },
                { status: 400 }
            );
        }

        // Parse and validate the request body
        const { inviteeId } = await validateRequestBody(request, {
            inviteeId: true
        });

        // Validate inviteeId is not the same as the current user
        if (inviteeId === userSession._id.toString()) {
            return NextResponse.json(
                { message: "You cannot uninvite yourself" },
                { status: 400 }
            );
        }

        try {
            const result = await uninviteUserFromWorkspace(
                userSession.currentWorkspace._id,
                userSession._id,
                inviteeId                      
            );

            return NextResponse.json(
                { 
                    message: "Successfully uninvited user",
                    data: result 
                },
                { status: 200 }
            );

        } catch (error) {
            // Handle specific errors from the service
            if (error.message === 'Invite not found') {
                return NextResponse.json(
                    { message: error.message },
                    { status: 404 }
                );
            }
            if (error.message === 'Cannot uninvite user - invite has already been accepted or declined') {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }
            // Re-throw any other errors to be caught by outer catch block
            throw error;
        }

    } catch (error) {
        console.error('Error in DELETE invite request:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred while uninviting user" },
            { status: error.statusCode || 500 }
        );
    }
}

