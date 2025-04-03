// app/api/products/create-for-tournament/route.js
export const maxDuration = 60; // This function can run for a maximum of 60 seconds
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { createProductsForTournament } from "@/services/product/create-product-for-tournament";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";

export async function POST(request) {
  console.log("API endpoint hit");
  
  try {    
    const userSession = await getUserSession(cookies, true);
    console.log("User session retrieved");

    console.log("About to validate request body");
    const validatedProducts = await validateRequestBody(
      request,
      {
        name: true,
        groupName: true,
        tournamentId: true,
        image: {
          name: false,
          type: false,
          content: false,
        },
        description: false,
        type: true,
        price: {
          amount: true,
          currency: true,
        },
        tierId: false,
      },
      {
        isArray: true,
        minItems: 1,
        maxItems: 1000,
      }
    );
    console.log("Validation successful");

    // Check image size if present (5MB limit)
    if (validatedProducts[0]?.image?.content) {
      const base64Content = validatedProducts[0].image.content;
      const sizeInBytes = (base64Content.length * 3) / 4; // Approximate size in bytes
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        return NextResponse.json(
          { message: "Image size exceeds 5MB limit" },
          { status: 400 }
        );
      }
    }

    const result = await createProductsForTournament(
      validatedProducts,
      userSession
    );
    console.log("Products created successfully");

    return NextResponse.json({
      message: "Tournament products created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating products for tournament:", error);
    return NextResponse.json(
      { message: error.message || "Error creating products" },
      { status: error.statusCode || 500 }
    );
  }
}