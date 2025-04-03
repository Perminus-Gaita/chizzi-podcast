import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { searchUsersToInviteToAWorkspaceAggregation } from '@/services/workspace/search-users-to-invite-to-a-workspace';
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Get search term from query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Perform the search
    const users = await searchUsersToInviteToAWorkspaceAggregation(
        query, userSession._id, userSession.currentWorkspaceId
    );

    return NextResponse.json(
      { message: "Users found", data: users },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching for users:', error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}





