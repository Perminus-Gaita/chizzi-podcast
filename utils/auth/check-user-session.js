import { NextResponse } from "next/server";

export async function checkUserSession(sessionUser) {
    if (!sessionUser) {
        return NextResponse.json(
            { message: "No User Session Available" },
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
    return null; // Return null if the session is valid
}
