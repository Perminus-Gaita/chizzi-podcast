import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session"
import aws4 from 'aws4';

const AWS_IOT_ENDPOINT =
  process.env.ENVIRONMENT === "development"
    ? process.env.AWS_IOT_ENDPOINT_DEVELOPMENT
    : process.env.ENVIRONMENT === "staging"
    ? process.env.AWS_IOT_ENDPOINT_DEVELOPMENT
    : process.env.AWS_IOT_ENDPOINT_PRODUCTION;

export async function GET(request) {
    try{
        const userSession = await getUserSession(cookies, true);
        const userId = userSession._id;
        // Generate a unique client ID
        const clientId = `user-${userId}-${Date.now()}`;

        const opts = {
            host: AWS_IOT_ENDPOINT,
            service: 'iotdevicegateway',
            signQuery: true,
            method: 'GET',
            path: '/mqtt',
            query: { 'client_id': clientId },  // Add client_id to the query
            headers: {
                'Host': AWS_IOT_ENDPOINT
            }
        };

        const credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };

        const signedRequest = aws4.sign(opts, credentials);

        const requestUrl = `wss://${signedRequest.host}${signedRequest.path}`;

        return NextResponse.json(
            { webSocketsUrl: requestUrl },
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch(error){
        console.error("Error generating signed WebSocket URL:", error);
        return NextResponse.json(
            { message: "Internal Server Error (WebSocket URL generation)" },
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

