import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserSession } from "@/services/auth/get-user-session";
import database_connection from "@/services/database";
import sponsorshipModel from "@/models/payments/sponsorship.model";
import { TournamentModel } from "@/models/tournament.model";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";

database_connection().then(() =>
  console.log("Connected successfully to the database (handle sponsorship)")
);

export async function POST(request) {
  try {
    const sessionUser = await getUserSession(cookies, true);
    const userId = sessionUser?._id;

    // Parse and validate the request body
    const { tournamentId, productId, currency, transactionCode } = await validateRequestBody(request, {
      tournamentId: true,
      message: true,
      currency: true,
      transactionCode: true // mpesa transaction code
    });

    const newSponsorship = new sponsorshipModel({
      // Create a new instance
      status: "initiated",
      paymentMethod: "mpesa", // Or your payment method
      amount: amount,
      sponsorId: userId,
      currency: "KES",
      message: transactionId,
      tournamentId: tournamentId,
    });

    const savedSponsorship = await newSponsorship.save(); // Save the new document

    return NextResponse.json(
      {
        savedSponsorship,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling sponsorship:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
