import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";
import PaymentDetailsModel from "@/models/payments/payment-details.model";

export async function GET(request) {
  try {
    // Get user session
    const sessionUser = await getUser(cookies);

    // Check if the session is valid and return error if session not found.
    const checkSession = await checkUserSession(sessionUser);
    if (checkSession) return checkSession;

    const query = {
      $or: [
        { userId: sessionUser._id },
        { workspaceId: sessionUser.workspaceId }
      ],
      type: "authorization",
      "authorization.signature": { $ne: null } // Ignore documents where signature is null
    };

    // Fetch only the latest document for each signature
    const paymentDetails = await PaymentDetailsModel.aggregate([
      { $match: query },
      {
        $sort: { createdAt: -1 } // Sort by latest createdAt
      },
      {
        $group: {
          _id: "$authorization.signature", // Group by signature
          latestPayment: { $first: "$$ROOT" } // Pick the latest document per signature
        }
      },
      {
        $replaceRoot: { newRoot: "$latestPayment" } // Flatten the structure
      }
    ]);

    return NextResponse.json(
      { paymentDetails },
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error getting payment details:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error getting payment details" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
