// app/api/socket-auth/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  // Get the raw cookie value
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }

  return NextResponse.json({
    sessionId: sessionId,
  });
}
