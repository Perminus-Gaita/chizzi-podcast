import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import database_connection from "@/services/database";
import { purchaseProductFromTournamentForSponsorship } from "@/services/product/purchase-product-from-tournament-for-sponsorship";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";

export async function POST(request) {
  try {
    await database_connection();
    const userSession = await getUserSession(cookies, true);

    const validatedPurchase = await validateRequestBody(
      request,
      {
        productId: true,
        sponsorshipId: true,
        tournamentId: true,
        price: {
          amount: true,
          currency: true,
        },
      }
    );

    const result = await purchaseProductFromTournamentForSponsorship(
      validatedPurchase,
      userSession
    );

    return NextResponse.json({
      message: "Product purchased from tournament for sponsorship successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error purchasing product from tournament:", error);
    return NextResponse.json(
      { message: error.message || "Error processing purchase" },
      { status: error.statusCode || 500 }
    );
  }
}
