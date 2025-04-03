import axios from 'axios';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { checkUserSession } from "@/utils/auth/check-user-session";

import PaystackTransferRecipientModel from "@/models/payments/paystack-transfer-recipient.model";

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
      // first 3 are required for all types
      type: requestBodyJson.type,
      name: requestBodyJson.name,
      belongsTo: requestBodyJson.belongsTo,
      accountNumber: requestBodyJson.accountNumber,
      bankCode: requestBodyJson.bankCode,
      currency: requestBodyJson.currency,
      email: requestBodyJson.email,
      authorizationCode: requestBodyJson.authorizationCode
    };

    let transferRecipientData;
    if(requestBody.type == "authorization"){
      transferRecipientData = {
        type: requestBody.type,
        name: requestBody.name,
        email: requestBody.email,
        authorization_code: requestBody.authorizationCode
      }
    } else 
    if(requestBody.type == "mobile_money"){
      transferRecipientData = {
        type: requestBody.type,
        name: requestBody.name,
        account_number: requestBody.accountNumber,
        bank_code: requestBody.bankCode,
        currency: requestBody.currency,
      }
    } else {
      throw new Error("Ivalid type passed in request object.")
    }

    // set workspaceId
    let workspaceId;
    if(requestBody.transactionBelongsTo == "workspace"){
      workspaceId = sessionUser?.currentWorkspace?._id;
    } else {
      workspaceId = null;
    }

    // create transfer recipient in paystak
    const paystackTransferRecipient = await createTransferRecipient(transferRecipientData);

    // create paystack transer recipient data 
    const paystackTransferRecipientData = {
      paystackRecipientCode: paystackTransferRecipient.data.recipient_code,
      belongsTo: requestBody.belongsTo,
      userId: sessionUser._id,
      workspaceId: workspaceId,
      active: paystackTransferRecipient.data.active,
      domain: paystackTransferRecipient.data.domain,
      currency: paystackTransferRecipient.data.currency,
      name: paystackTransferRecipient.data.name,
      type: paystackTransferRecipient.data.type,
      isDeleted: paystackTransferRecipient.data.isDeleted || paystackTransferRecipient.data.is_deleted,
      details: {
        authorizationCode: paystackTransferRecipient.data.details.authorization_code,
        accountNumber: paystackTransferRecipient.data.details?.account_number,
        accountName: paystackTransferRecipient.data.name,
        bankCode: paystackTransferRecipient.data.details?.bank_code,
        bankName: paystackTransferRecipient.data.details?.bank_name
      }
    }

    // create paystack transfer recipient document in mongodb
    const paystackTransferRecipientDocument = await updateOrInsertPaystackTransferRecipientDocument(
      paystackTransferRecipientData
    )

    return NextResponse.json(
      { paystackTransferRecipientDocument },
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error creating transfer recipient:", error);
    const errorMessage = error.message
    return NextResponse.json(
      { message: errorMessage || "Internal Server Error creating transfer recipient" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// create transter recipient in paystack
const createTransferRecipient = async (data) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transferrecipient',
      data,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

// create a paystack Transfer Recipient document
const updateOrInsertPaystackTransferRecipientDocument = async (data) => {
  try {
    const filter = { paystackRecipientCode: data.paystackRecipientCode };
    const update = {
      $set: {
        belongsTo: data.belongsTo,
        userId: data.userId,
        workspaceId: data.workspaceId,
        active: data.active,
        domain: data.domain,
        currency: data.currency,
        name: data.name,
        type: data.type,
        isDeleted: data.isDeleted,
        details: {
          authorizationCode: data.details?.authorizationCode,
          accountNumber: data.details?.accountNumber,
          accountName: data.details?.accountName,
          bankCode: data.details?.bankCode,
          bankName: data.details?.bankName,
        }
      }
    };
    const options = { 
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    };

    const updatedDocument = await PaystackTransferRecipientModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    return updatedDocument;
  } catch (error) {
    console.error('Error updating or inserting transfer recipient:', error);
    throw error;
  }
};

