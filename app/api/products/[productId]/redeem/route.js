// app/api/products/[productId]/redeem/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import { redeemProduct, updateRedemptionStatus } from "@/services/product/redeem-product";
import database_connection from "@/services/database";

export async function POST(request, props) {
  try {
    await database_connection();
    const userSession = await getUserSession(cookies, true);

    const params = await props.params;
    const { productId } = params;
    
    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const { shippingAddress, phoneNumber } = await request.json();
    if (!shippingAddress || !phoneNumber) {
      return NextResponse.json(
        { message: "Shipping address and phone number are required" },
        { status: 400 }
      );
    }

    const updatedProduct = await redeemProduct(
      productId, 
      userSession._id, 
      { shippingAddress, phoneNumber }
    );

    return NextResponse.json({
      message: "Product redeemed successfully",
      data: updatedProduct
    });

  } catch (error) {
    console.error("Error redeeming product:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(request, props) {
  try {
    await database_connection();
    const userSession = await getUserSession(cookies, true);
    if (!userSession) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { productId } = params;
    
    const { status } = await request.json();
    const validStatuses = ["pending", "processing", "shipped", "delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedProduct = await updateRedemptionStatus(
      productId,
      userSession._id,
      status
    );

    return NextResponse.json({
      message: "Status updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    console.error("Error updating redemption status:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}