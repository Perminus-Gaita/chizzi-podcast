import mongoose from "mongoose";
import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";
import walletModel from "@/models/payments/wallet.model";

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("api/user/wallet");

export async function GET(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = sessionUser?._id;

    const wallet = await walletModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: "individual"
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "User Wallet Not Found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = {
      balances: {
        KES: wallet.balances.KES ? wallet.balances.KES.balance : 0,
        USD: wallet.balances.USD ? wallet.balances.USD.balance : 0,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching user wallet details:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
