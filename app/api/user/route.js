import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body"
import { inviteUserToAWorkspace } from "@/services/workspace/invite-user-to-a-workspace";
import { respondToAnInvite } from "@/services/workspace/respond-to-an-invite";
import { getAPopulatedWorkspaceInviteDocument } from "@/services/workspace/get-a-populated-workspace-invite-document";

export const dynamic = "force-dynamic";

// endpoint to update user.
export async function PATCH(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { inviteId, inviteResponse } = await validateRequestBody(request, {
      name: false,
      username: false,
      profilePicture: false,
      currentWorkspaceId: false
    })
    const inviteeId = userSession._id

    const result = await respondToAnInvite(inviteId, inviteResponse, inviteeId)

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



