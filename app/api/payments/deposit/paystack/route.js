import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";

import TransactionModel from "@/models/payments/transaction.model";
import WalletModel from "@/models/payments/wallet.model";

export async function POST(request) {
  try {
    // Get user session
    const sessionUser = await getUser(cookies);

    // Check if the session is valid and return error if session not found.
    const checkSession = await checkUserSession(sessionUser);
    if (checkSession) return checkSession;

    // get request body
    const requestBodyJson = await request.json();
    const requestBody = {
      transactionBelongsTo: requestBodyJson.transactionBelongsTo, // or workspace
      amount: requestBodyJson.amount,
      currency: requestBodyJson.currency,
      callbackUrl: requestBodyJson.callbackUrl,
    };

    // set workspaceId
    let workspaceId;
    let userIdOrWorkspaceId;
    if (requestBody.transactionBelongsTo == "workspace") {
      workspaceId = sessionUser?.currentWorkspace?._id;
      userIdOrWorkspaceId = workspaceId;
    } else {
      workspaceId = null;
      userIdOrWorkspaceId = sessionUser._id;
    }

    // get user or workspace walletId
    const { walletId } = await getUserOrWorkspaceWalletId(userIdOrWorkspaceId);

    // Get data to create transaction document
    const transactionData = {
      type: "deposit",
      status: "initiated", // update wallet only when status is success, do this in aws
      belongsTo: requestBody.transactionBelongsTo,
      userId: sessionUser._id,
      workspaceId: workspaceId,
      walletId: walletId, // wallet belonging to user or workspace
      amount: requestBody.amount,
      currency: requestBody.currency,
      paymentMethod: "pending",
    };

    // create transaction
    const transactionDocument = await createTransactionDocument(
      transactionData
    );

    // Get data to initiate paystack transaction
    const paystackTransactionData = {
      email:
        sessionUser?.mainEmail ||
        sessionUser?.google?.email ||
        `${sessionUser.username}@username.wufwuf.io`,
      amount: transactionDocument.amount,
      currency: transactionDocument.currency,
      reference: transactionDocument._id,
      callbackUrl: requestBody.callbackUrl,
      channels: ["card", "mobile_money"],
      metadata: {
        paymentType: "deposit",
        userId: sessionUser._id,
        workspaceId: sessionUser?.currentWorkspace?._id,
        walletId: walletId,
        transactionBelongsTo: requestBody.transactionBelongsTo,
      },
    };

    // initialize paystack transaction that creates a sponsorship
    const { authorizationUrl } = await initializeTransaction(
      paystackTransactionData
    );

    return NextResponse.json(
      { authorizationUrl: authorizationUrl },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error initializing sponsorship payment:", error);
    const errorMessage = error.message;
    return NextResponse.json(
      {
        message:
          errorMessage ||
          "Internal Server Error initializing sponsorship payment",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// get user or workspace walletId
async function getUserOrWorkspaceWalletId(userIdOrWorkspaceId) {
  try {
    const wallet = await WalletModel.findOne({
      $or: [
        { userId: userIdOrWorkspaceId },
        { workspaceId: userIdOrWorkspaceId },
      ],
    });
    return {
      walletId: wallet._id,
    };
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw error;
  }
}

// create a sponsorship document
const createTransactionDocument = async (data) => {
  try {
    const newTransactionDocument = new TransactionModel({
      type: data.type,
      status: data.status,
      transactionBelongsTo: data.transactionBelongsTo,
      userId: data.userId,
      workspaceId: data.workspaceId,
      walletId: data.walletId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
    });

    const savedTransactionDocument = await newTransactionDocument.save();
    return savedTransactionDocument;
  } catch (error) {
    console.error("Error creating transaction document:", error);
    throw error;
  }
};

// initialize transaction that creates a sponsorship
async function initializeTransaction(paystackTransactionData) {
  const url = "https://api.paystack.co/transaction/initialize";
  const YOUR_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // Replace with your actual secret key

  const data = {
    email: paystackTransactionData.email,
    amount: paystackTransactionData.amount,
    currency: paystackTransactionData.currency,
    reference: paystackTransactionData.reference,
    callback_url: paystackTransactionData.callbackUrl,
    channels: ["card", "mobile_money"],
    metadata: {
      paymentType: "deposit",
      userId: paystackTransactionData.metadata.userId,
      workspaceId: paystackTransactionData.metadata.workspaceId,
      walletId: paystackTransactionData.metadata.walletId,
      transactionBelongsTo:
        paystackTransactionData.metadata.transactionBelongsTo,
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${YOUR_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = response.data;

    return {
      authorizationUrl: responseData.data.authorization_url,
      accessCode: responseData.data.access_code,
      reference: responseData.data.reference,
    };
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}
