import { NextResponse } from "next/server";
import { sendMessageToUserOrGroup } from "@/services/integrations/telegram/send-message-to-user-or-group";

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.telegramUserOrGroupId || !body.message) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: 'Both userId and message are required' 
        },
        { status: 400 }
      );
    }

    // Send message using the service
    const result = await sendMessageToUserOrGroup(body.telegramUserOrGroupId, body.message);

    // Return success response
    return NextResponse.json({
      success: true,
      description: "Message sent successfully",
      result: result
    });

  } catch (error) {
    console.error("Error sending message:", error);
    
    // Handle different types of errors
    if (error.message.includes('Telegram API Error')) {
      return NextResponse.json(
        { 
          error: 'Telegram API Error', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}