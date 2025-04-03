import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getUserSession } from "@/services/auth/get-user-session";

export async function GET(request) {
  try {
    // Get user session
    const authenticatedUser = await getUserSession(cookies, true);

    return NextResponse.json(authenticatedUser, { status: 200 });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Unexpected error fetching user session:", error },
      { status: 500 }
    );
  }
}
