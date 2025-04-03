// app/api/integrations/telegram/webhook/set-url/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const host = request.headers.get('host');
    const WEBHOOK_URL = `https://${host}/api/integrations/telegram/webhook/handler`;
    const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!BOT_TOKEN || !WEBHOOK_URL || !WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message', 'my_chat_member']
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.ok) {
      throw new Error(response.data.description || 'Failed to set webhook');
    }

    return NextResponse.json({
      success: true,
      description: "Webhook set successfully",
      result: {
        ...response.data.result,
        url: WEBHOOK_URL
      }
    });

  } catch (error) {
    console.error("Error setting webhook:", error);
    return NextResponse.json(
      { 
        error: error.response?.data?.description || error.message || "Failed to set webhook",
        details: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Missing BOT_TOKEN environment variable' },
        { status: 500 }
      );
    }

    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );

    if (!response.data.ok) {
      throw new Error(response.data.description || 'Failed to get webhook info');
    }

    return NextResponse.json({
      success: true,
      result: response.data.result
    });

  } catch (error) {
    console.error("Error getting webhook info:", error);
    return NextResponse.json(
      { error: error.response?.data?.description || error.message || "Failed to get webhook info" },
      { status: error.response?.status || 500 }
    );
  }
}