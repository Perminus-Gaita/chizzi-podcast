import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";
import PaystackTransferRecipientModel from "@/models/payments/paystack-transfer-recipient.model";

export async function GET(request) {
  try {
    // Get and validate user session
    const sessionUser = await getUser(cookies);
    const checkSession = await checkUserSession(sessionUser);
    if (checkSession) return checkSession;

    // Build query based on user context
    const query = {
      $or: [
        { userId: sessionUser._id },
        { workspaceId: sessionUser?.currentWorkspace?._id }
      ],
      active: true,
      isDeleted: false
    };

    // Get recipients for the user
    const recipients = await PaystackTransferRecipientModel.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .select({
        paystackRecipientCode: 1,
        belongsTo: 1,
        type: 1,
        currency: 1,
        name: 1,
        'details.accountNumber': 1,
        'details.accountName': 1,
        'details.bankCode': 1,
        'details.bankName': 1
      });

    return NextResponse.json({
      recipients
    }, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching transfer recipients:", error);
    return NextResponse.json({
      message: error.message || "Internal Server Error fetching transfer recipients"
    }, {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}