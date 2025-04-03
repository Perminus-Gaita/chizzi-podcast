import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { removeMemberFromWorkspace } from "@/services/workspace/members/remove/remove-member-from-workspace";

// endpoint to change workspace member role.
export async function PATCH(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { memberUserId } = await validateRequestBody(request, {
      memberUserId: true
    });

    // Check if user has a current workspace set
    if (!userSession.currentWorkspace?._id) {
      return NextResponse.json(
        { message: "No workspace selected" },
        { status: 400 }
      );
    }

    // Validate newRole is one of the allowed values
    if (!userSession.currentWorkspace.currentUserRole == "admin") {
      return NextResponse.json(
        { message: "Insufficient permissons. Member must be an admin to remove another member" },
        { status: 400 }
      );
    }

    // remove member from workspace
    const result = await removeMemberFromWorkspace(
      memberUserId,
      userSession._id,  // passing the requesting user's ID for permission check
      userSession.currentWorkspace._id
    );

    return NextResponse.json(
      { 
        message: "Member successfully removed from workspace", 
        data: result 
      },
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
