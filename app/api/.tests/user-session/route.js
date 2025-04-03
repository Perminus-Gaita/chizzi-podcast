import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session"

export async function GET(request) {
    try{
        const userSessionData = await getUserSession(cookies, true);
        return NextResponse.json( 
            { userSessionData },
            { status: 200 }
        );
    } catch(error){
        return NextResponse.json( 
            { message: error.message || "Error, Hello from the other side!" }, 
            { status: error.statusCode || 500 }
        );
    }
}
