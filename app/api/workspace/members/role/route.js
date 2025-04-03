import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { changeWorkspaceMemberRole } from "@/services/workspace/change-workspace-member-role";

// endpoint to change workspace member role.
export async function PATCH(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { memberUserId, newRole } = await validateRequestBody(request, {
      memberUserId: true,
      newRole: true
    });

    // Validate newRole is one of the allowed values
    if (!['admin', 'editor', 'viewer'].includes(newRole)) {
      return NextResponse.json(
        { message: "Invalid role specified. Must be 'admin', 'editor', or 'viewer'" },
        { status: 400 }
      );
    }

    // Check if user has a current workspace set
    if (!userSession.currentWorkspace?._id) {
      return NextResponse.json(
        { message: "No workspace selected" },
        { status: 400 }
      );
    }

    const result = await changeWorkspaceMemberRole(
      newRole,
      memberUserId,
      userSession.currentWorkspace._id,
      userSession._id  // passing the requesting user's ID for permission check
    );

    return NextResponse.json(
      { 
        message: "Member role updated successfully", 
        data: result 
      },
      { status: 200 }
    );
  } catch (error) {
      console.error('Error in PATCH request:', error);
      
    // Handle specific error cases
    if (error.message.includes('workspace must have at least one admin')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('Only workspace admins can change member roles')) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      );
    }

    if (error.message.includes('Workspace creator\'s admin role')) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}
