import axios from 'axios';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";
import WalletModel from "@/models/payments/wallet.model";
import TransactionModel from "@/models/payments/transaction.model";

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
      paystackRecipientCode: requestBodyJson.paystackRecipientCode,
      transactionBelongsTo: requestBodyJson.transactionBelongsTo, // or workspace
      amount: requestBodyJson.amount,
      currency: requestBodyJson.currency
    };

    // set workspaceId
    let workspaceId;
    let userIdOrWorkspaceId;
    if(requestBody.transactionBelongsTo == "workspace"){
      workspaceId = sessionUser?.currentWorkspace?._id;;
      userIdOrWorkspaceId = workspaceId
    } else {
      workspaceId = null;
      userIdOrWorkspaceId = sessionUser._id
    }

    // get user or workspace walletId
    const { walletId } =  await getUserOrWorkspaceWalletId(userIdOrWorkspaceId);

    // Get data to create transaction document
    const withdrawTransactionData = {
      type: "withdraw",
      paystackRecipientCode: requestBody.paystackRecipientCode,
      status: "initiated", // update wallet only when status is success, do this in aws
      transactionBelongsTo: requestBody.transactionBelongsTo,
      userId: sessionUser._id,
      workspaceId: workspaceId,
      walletId: walletId,// wallet belonging to user or workspace
      amount: requestBody.amount,
      currency: requestBody.currency,
      paymentMethod: "pending"
    };

    console.log({withdrawTransactionData})

    // create transaction document for withdrawal
    const transactionDocument =  await createTransactionDocument(withdrawTransactionData);

    // initialize paystack transaction that creates a sponsorship
    const paystackTransferResults = await makePaystackTransfer(
      transactionDocument.amount, // amount
      transactionDocument.currency, // currency
      transactionDocument._id, // reference
      transactionDocument.paystackRecipientCode, // recipient
      "reason" // reason
    )

    return NextResponse.json(
      { paystackTransferResults: paystackTransferResults },
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // console.error("Error initializing paystack withdrawal payment:", error);
    const errorMessage = error.message
    return NextResponse.json(
      { message: errorMessage || "Internal Server Error initializing paystack withdrawal" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// get user or workspace walletId
async function getUserOrWorkspaceWalletId(userIdOrWorkspaceId){
  try {
    const wallet = await WalletModel.findOne({
      $or: [
        { userId: userIdOrWorkspaceId },
        { workspaceId: userIdOrWorkspaceId }
      ]
    });
    return {
      walletId: wallet._id
    };
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
}

// create a transaction document document
const createTransactionDocument = async (data) => {
  try {
    const newTransaction = new TransactionModel({
      type: data.type,
      paystackRecipientCode: data.paystackRecipientCode,
      status: data.status,
      transactionBelongsTo: data.transactionBelongsTo,
      userId: data.userId,
      workspaceId: data.workspaceId,
      walletId: data.walletId,
      amount: data.amount,
      currency: data.currency,
      // paymentMethod: data.paymentMethod
    });
  
    const savedTransaction = await newTransaction.save();
    return savedTransaction;
  } catch (error) {
    console.error('Error creating withdraw transaction document:', error);
    throw error;
  }
};


// initialize paystack transfer
async function makePaystackTransfer(amount, currency, reference, recipient, reason){
  console.log({amount, reference: reference.toString(), recipient, reason});
  const url = "https://api.paystack.co/transfer";
  const YOUR_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const data = {
    source: 'balance',
    amount: amount,
    currency: currency,//"KES",
    reference: reference.toString(),
    recipient: recipient,
    reason: reason,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${YOUR_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data;

    return responseData
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}


