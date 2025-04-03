import mongoose from "mongoose";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";
import PlanModel from "@/models/payments/plan.model";

export async function POST(request) {
  try {
    // Get user session
    const sessionUser = await getUser(cookies);

    // Check if the session is valid and return error if session not found.
    const checkSession = await checkUserSession(sessionUser);
    if (checkSession) return checkSession;

    // get request body
    const requestBody = await request.json();

    // Get needed datat from request body
    const planIdOrPaystackPlanCode = requestBody.planIdOrPaystackPlanCode;
    // customerEmail, amount, currency,

    // set callback url
    const callbackUrl = `${process.env.MYHOSTNAME}/dashboard/?subscription=success`;

    //get plan by planId or paystackPlanCode
    const planDocument = await getPlanByIdOrPaystackPlanCode(
      planIdOrPaystackPlanCode
    );

    // initialize paystack transaction to subscribe user to a plan
    const initializeTransactionResponse = await initializeTransaction(
      sessionUser?.mainEmail ||
        sessionUser?.google?.email ||
        `${sessionUser.username}@username.wufwuf.io`,
      planDocument.price,
      planDocument.paystackPlanCode,
      planDocument.currency,
      callbackUrl
    );

    return NextResponse.json(
      // redirect to url after subscription
      { authorizationUrl: initializeTransactionResponse.authorizationUrl },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting a notification:", error);
    const errorMessage = error.message;
    return NextResponse.json(
      {
        message:
          errorMessage || "Internal Server Error initializing transactions",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// get plan by planId or paystackPlanCode from database
async function getPlanByIdOrPaystackPlanCode(identifier) {
  try {
    const query = {
      $or: [
        {
          _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null,
        },
        { paystackPlanCode: identifier },
      ],
    };

    const plan = await PlanModel.findOne(query);

    if (!plan) {
      throw new Error("Plan document not found");
    }

    return plan;
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw error;
  }
}

// create transaction document in database
async function createTransaction(transactionData) {
  try {
    // Create and save a new transaction document
    const newTransaction = await TransactionModel.create({
      type: "subscription",
      status: "initiated",
      userId: transactionData.userId,
      workspaceId: transactionData.workspaceId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      planId: transactionData.planId,
    });

    return newTransaction;
  } catch (error) {
    throw error;
  }
}

// https://paystack.com/docs/payments/subscriptions/#adding-plan-code-to-a-transaction
async function initializeTransaction(
  customerEmail,
  amount,
  paystackPlanCode,
  currency,
  callbackUrl
) {
  // set this to a url in next js) {
  const data = {
    email: customerEmail,
    amount: amount,
    plan: paystackPlanCode,
    currency: currency, // user can choose between kes and usd
    callback_url: callbackUrl, // set this to a url in next js
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      data,
      config
    );
    const responseData = response.data;
    return {
      authorizationUrl: responseData.data.authorization_url,
      accessCode: responseData.data.access_code,
      reference: responseData.data.reference,
    };
  } catch (error) {
    throw error;
  }
}
