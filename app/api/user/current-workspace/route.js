import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { changeUserCurrentWorkspace } from "@/services/user/change-user-current-workspace";

// endpoint to update user.
export async function PATCH(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { workspaceId } = await validateRequestBody(request, {
      workspaceId: true,
    });

    const result = await changeUserCurrentWorkspace(
      userSession._id,
      workspaceId
    );
    console.log({ result });
    return NextResponse.json(
      {
        message: "User's current workspace changed",
        data: {
          user: result,
          currentWorkspace: result.currentWorkspace,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}
