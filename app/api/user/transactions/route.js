import mongoose from "mongoose";
import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";
import transactionModel from "@/models/payments/transaction.model";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully(fetching user transaction details)")
);
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

    const transactions = await transactionModel
      .find({
        userId: new mongoose.Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);

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
