import { NextResponse } from "next/server";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { sendMessageToUserOrGroup } from "@/services/integrations/telegram/send-message-to-user-or-group";

export async function POST(request) {
  try {
    // Parse and validate the request body
    const { telegramUserOrGroupId, message, reply_markup, link_preview_options } = await validateRequestBody(request, {
      telegramUserOrGroupId: true,
      message: true,
      reply_markup: false, // optional field
      link_preview_options: false // optional field
    });

    // Send message using the service
    const result = await sendMessageToUserOrGroup(
      telegramUserOrGroupId,
      message,
      reply_markup, // Pass the reply_markup directly
      link_preview_options
    );

    return NextResponse.json({
      success: true,
      description: "Message sent successfully",
      result: result
    });

  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error.message.includes('Telegram API Error')) {
      return NextResponse.json(
        { 
          error: 'Telegram API Error', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}

