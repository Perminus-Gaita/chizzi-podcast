import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserSession } from "@/services/auth/get-user-session";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";
import { handleProductSponsorship } from "@/services/tournament/sponsorship-via-user-managed-payments/handle-product-sponsorship";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully to the database (handle sponsorship)")
);

export async function POST(request) {
  try {
    const sessionUser = await getUserSession(cookies, true);

    // Parse and validate the request body
    const { tournamentId, productId, currency, transactionCode } = await validateRequestBody(request, {
      tournamentId: true,
      productId: true,
      currency: true,
      transactionCode: false // mpesa transaction code
    });

    // handle product sponsorship
    const result = await handleProductSponsorship(
      sessionUser,
      tournamentId,
      productId,
      currency,
      transactionCode
    )

    return NextResponse.json(
      {
        result,
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
